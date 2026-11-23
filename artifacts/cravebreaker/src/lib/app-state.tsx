import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { connectPressureSerial, serialSupported } from '../device';

export type Intensity = 1 | 2 | 3;
export interface Profile { name: string; cigs: number; price: number; start: string; demo?: boolean }
export interface SessionRec { id: string; ts: number; day: string; intensity: Intensity; puffs: number; melted: boolean }
export interface PatchRec { applied: boolean | null; smoked: boolean | null }
interface Persisted { profile: Profile | null; sessions: SessionRec[]; threshold: number; debounceMs: number; patch: Record<string, PatchRec> }
export interface ActiveSession { startedAt: number; puffs: number }
export type DeviceStatus = 'unsupported' | 'idle' | 'connecting' | 'connected' | 'error';
export interface Sample { pressure: number; delta: number; baseline: number }

const KEY = 'cravebreaker.v1';
const WINDOW_MS = 60_000;
export const SESSION_MS = 30_000;

export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDay = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const clampIntensity = (n: number): Intensity => (n >= 3 ? 3 : n === 2 ? 2 : 1);

export const INTENSITY = {
  1: { label: 'خفيفة', color: 'hsl(var(--mint))', soft: 'hsl(152 62% 92%)' },
  2: { label: 'متوسطة', color: 'hsl(var(--sun))', soft: 'hsl(46 95% 90%)' },
  3: { label: 'قوية', color: 'hsl(var(--berry))', soft: 'hsl(352 85% 93%)' },
} as const;

const empty: Persisted = { profile: null, sessions: [], threshold: -0.35, debounceMs: 800, patch: {} };
function load(): Persisted {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...empty, ...JSON.parse(raw) } : empty; } catch { return empty; }
}

interface Ctx extends Persisted {
  setProfile: (p: Profile) => void;
  setThreshold: (n: number) => void;
  setDebounce: (n: number) => void;
  setPatch: (day: string, rec: PatchRec) => void;
  active: ActiveSession | null;
  puffFlash: number;
  handlePuff: () => void;
  startManual: () => void;
  completeSession: () => SessionRec | null;
  cancelSession: () => void;
  loadDemo: () => void;
  resetAll: () => void;
  device: { status: DeviceStatus; sample: Sample | null; error: string | null; connect: () => Promise<void>; disconnect: () => Promise<void>; recalibrate: (() => void) | null };
}
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => { const c = useContext(AppCtx); if (!c) throw new Error('no ctx'); return c; };

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [puffFlash, setPuffFlash] = useState(0);
  const [, navigate] = useLocation();
  const activeRef = useRef(active); activeRef.current = active;
  const windowRef = useRef<{ start: number; count: number; sessionId: string | null } | null>(null);
  const navRef = useRef(navigate); navRef.current = navigate;

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  const handlePuff = useCallback(() => {
    const now = Date.now();
    let w = windowRef.current;
    if (!w || now - w.start > WINDOW_MS) w = { start: now, count: 0, sessionId: null };
    w.count += 1; windowRef.current = w;
    setPuffFlash(now);
    const count = w.count;
    if (activeRef.current) {
      setActive((a) => (a ? { ...a, puffs: count } : a));
    } else if (w.sessionId) {
      const id = w.sessionId;
      setState((s) => ({ ...s, sessions: s.sessions.map((r) => (r.id === id ? { ...r, puffs: count, intensity: clampIntensity(count) } : r)) }));
    } else {
      setActive({ startedAt: now, puffs: count });
      navRef.current('/breathe');
    }
  }, []);

  const startManual = useCallback(() => {
    if (activeRef.current) return;
    windowRef.current = null;
    handlePuff();
  }, [handlePuff]);

  const completeSession = useCallback((): SessionRec | null => {
    const a = activeRef.current; if (!a) return null;
    const today = dayKey();
    const out: SessionRec = { id: `s${Date.now()}`, ts: Date.now(), day: today, puffs: a.puffs, intensity: clampIntensity(a.puffs), melted: !state.sessions.some((r) => r.day === today) };
    setState((s) => ({ ...s, sessions: [...s.sessions, out] }));
    if (windowRef.current && Date.now() - windowRef.current.start <= WINDOW_MS) windowRef.current.sessionId = out.id;
    setActive(null);
    return out;
  }, [state.sessions]);

  const cancelSession = useCallback(() => { setActive(null); windowRef.current = null; }, []);

  const loadDemo = useCallback(() => {
    const today = new Date();
    const start = new Date(today); start.setDate(today.getDate() - 11);
    const sessions: SessionRec[] = [];
    const pattern = [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1];
    pattern.forEach((on, i) => {
      if (!on) return;
      const d = new Date(start); d.setDate(start.getDate() + i); d.setHours(10 + (i % 8), 17);
      const n = 1 + (i % 3);
      for (let k = 0; k < n; k++) sessions.push({ id: `demo${i}-${k}`, ts: d.getTime() + k * 3_600_000, day: dayKey(d), puffs: ((i + k) % 3) + 1, intensity: clampIntensity(((i + k) % 3) + 1), melted: k === 0 });
    });
    setState((s) => ({ ...s, profile: { name: s.profile?.name || 'سلمى', cigs: s.profile?.cigs || 18, price: s.profile?.price || 2.75, start: dayKey(start), demo: true }, sessions }));
  }, []);

  const resetAll = useCallback(() => { localStorage.removeItem(KEY); setState(empty); setActive(null); windowRef.current = null; navRef.current('/'); }, []);

  // device
  const supported = typeof window !== 'undefined' && (() => { try { return serialSupported(); } catch { return false; } })();
  const [devStatus, setDevStatus] = useState<DeviceStatus>(supported ? 'idle' : 'unsupported');
  const [sample, setSample] = useState<Sample | null>(null);
  const [devError, setDevError] = useState<string | null>(null);
  const connRef = useRef<{ disconnect: () => Promise<void>; recalibrate: () => void } | null>(null);
  const armedRef = useRef(true);
  const lastPuffRef = useRef(0);
  const cfgRef = useRef({ threshold: state.threshold, debounce: state.debounceMs });
  cfgRef.current = { threshold: state.threshold, debounce: state.debounceMs };
  const lastSampleUi = useRef(0);

  const onSample = useCallback((s: Sample) => {
    const { threshold, debounce } = cfgRef.current;
    if (armedRef.current && s.delta <= threshold) {
      armedRef.current = false;
      const now = Date.now();
      if (now - lastPuffRef.current >= debounce) { lastPuffRef.current = now; handlePuff(); }
    } else if (!armedRef.current && s.delta > threshold / 2) {
      armedRef.current = true;
    }
    const now = Date.now();
    if (now - lastSampleUi.current > 120) { lastSampleUi.current = now; setSample(s); }
  }, [handlePuff]);

  const connect = useCallback(async () => {
    setDevStatus('connecting'); setDevError(null);
    try {
      connRef.current = await connectPressureSerial(onSample, () => { connRef.current = null; setDevStatus('idle'); setSample(null); });
      armedRef.current = true;
      setDevStatus('connected');
    } catch (e) {
      setDevStatus('error'); setDevError(e instanceof Error ? e.message : 'تعذّر الاتصال');
    }
  }, [onSample]);
  const disconnect = useCallback(async () => { await connRef.current?.disconnect(); connRef.current = null; setDevStatus('idle'); setSample(null); }, []);

  const value = useMemo<Ctx>(() => ({
    ...state,
    setProfile: (p) => setState((s) => ({ ...s, profile: p })),
    setThreshold: (n) => setState((s) => ({ ...s, threshold: n })),
    setDebounce: (n) => setState((s) => ({ ...s, debounceMs: n })),
    setPatch: (day, rec) => setState((s) => ({ ...s, patch: { ...s.patch, [day]: rec } })),
    active, puffFlash, handlePuff, startManual, completeSession, cancelSession, loadDemo, resetAll,
    device: { status: devStatus, sample, error: devError, connect, disconnect, recalibrate: devStatus === 'connected' ? () => connRef.current?.recalibrate() : null },
  }), [state, active, puffFlash, handlePuff, startManual, completeSession, cancelSession, loadDemo, resetAll, devStatus, sample, devError, connect, disconnect]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useStats() {
  const { profile, sessions } = useApp();
  return useMemo(() => {
    const today = dayKey();
    const days = new Set(sessions.map((s) => s.day));
    const start = profile ? parseDay(profile.start) : new Date();
    const t0 = parseDay(today);
    const dayN = Math.max(1, Math.round((t0.getTime() - start.getTime()) / 86_400_000) + 1);
    let streak = 0; const d = new Date(t0);
    if (!days.has(today)) d.setDate(d.getDate() - 1);
    while (days.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }
    const saved = profile ? (sessions.length * profile.price) / 20 : 0;
    const latest = sessions.length ? [...sessions].sort((a, b) => b.ts - a.ts)[0] : null;
    return { today, days, dayN, streak, saved, latest, total: sessions.length, todayCount: sessions.filter((s) => s.day === today).length };
  }, [profile, sessions]);
}
