import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Wind, MapPin, Bandage, MessageCircle, SlidersHorizontal, X, Cpu, RotateCcw, Database, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/app-state';

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p role="note" data-testid="text-disclaimer" className={`text-center text-[11px] leading-5 font-semibold text-muted-foreground ${className}`}>
      نموذج أولي للعرض · لا يغني عن استشارة الطبيب أو الصيدلاني
    </p>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); ref.current?.focus();
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[hsl(205_45%_12%/.45)] p-3" onClick={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="card-soft rise w-full max-w-lg max-h-[90dvh] overflow-auto p-5 outline-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" data-testid="button-close-modal" className="rounded-full p-2 hover:bg-muted"><X size={18} /></button>
        </div>
        {children}
        <Disclaimer className="mt-5 pt-3 border-t" />
      </div>
    </div>
  );
}

const NAV = [
  { href: '/', label: 'رحلتي', icon: Home },
  { href: '/breathe', label: 'تنفّس', icon: Wind },
  { href: '/support', label: 'الدعم', icon: MapPin },
  { href: '/patch', label: 'اللصقة', icon: Bandage },
  { href: '/chat', label: 'نسيم', icon: MessageCircle },
];

export function Shell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const [demoOpen, setDemoOpen] = useState(false);
  const taps = useRef<number[]>([]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'd') setDemoOpen(true); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  const logoTap = () => {
    const now = Date.now(); taps.current = [...taps.current.filter((t) => now - t < 800), now];
    if (taps.current.length >= 3) { taps.current = []; setDemoOpen(true); }
  };
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[hsl(var(--background)/.75)] border-b border-border/60">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-16">
          <button onClick={logoTap} className="flex items-center gap-2" aria-label="CraveBreaker" data-testid="button-logo">
            <span className="grid place-items-center size-9 rounded-2xl bg-primary text-primary-foreground"><Wind size={18} /></span>
            <span className="text-start leading-tight"><span className="block font-black">CraveBreaker</span><span className="block text-[11px] text-muted-foreground font-semibold">خذ نفس، واكسر الرغبة</span></span>
          </button>
          <nav className="hidden md:flex gap-1" aria-label="التنقل الرئيسي">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} data-testid={`link-nav-${n.href.slice(1) || 'home'}`}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors ${loc === n.href ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                <n.icon size={16} />{n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 pt-5 pb-28 md:pb-10">{children}</main>
      <footer className="mx-auto max-w-5xl w-full px-4 pb-24 md:pb-6 flex items-center justify-center gap-2">
        <Disclaimer />
        <button onClick={() => setDemoOpen(true)} aria-label="لوحة العرض والمعايرة (مخفية)" data-testid="button-open-demo" className="opacity-30 hover:opacity-100 focus:opacity-100 rounded-full p-1.5"><SlidersHorizontal size={14} /></button>
      </footer>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-[hsl(var(--card)/.92)] backdrop-blur-md pb-[env(safe-area-inset-bottom)]" aria-label="التنقل الرئيسي">
        <div className="grid grid-cols-5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} data-testid={`link-tab-${n.href.slice(1) || 'home'}`}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${loc === n.href ? 'text-primary' : 'text-muted-foreground'}`}>
              <n.icon size={20} strokeWidth={loc === n.href ? 2.6 : 2} />{n.label}
            </Link>
          ))}
        </div>
      </nav>
      <DemoPanel open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

function DemoPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { threshold, setThreshold, debounceMs, setDebounce, device, loadDemo, resetAll, handlePuff } = useApp();
  const [confirm, setConfirm] = useState(false);
  return (
    <Modal open={open} onClose={() => { setConfirm(false); onClose(); }} title="لوحة العرض والمعايرة">
      <div className="space-y-5 text-sm">
        <label className="block">
          <span className="font-bold">عتبة النفخة: {threshold.toFixed(2)} hPa</span>
          <input type="range" min={-1.5} max={-0.1} step={0.05} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" data-testid="input-threshold" />
          <span className="text-muted-foreground text-xs">تُحتسب النفخة عند هبوط الضغط تحت العتبة، وتُعاد التهيئة عند التعافي. الافتراضي ‎-0.35‎.</span>
        </label>
        <label className="block">
          <span className="font-bold">فترة منع التكرار: {debounceMs} ms</span>
          <input type="range" min={0} max={3000} step={100} value={debounceMs} onChange={(e) => setDebounce(Number(e.target.value))} className="w-full" data-testid="input-debounce" />
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={() => setThreshold(-0.35)} data-testid="button-threshold-default"><RotateCcw size={15} />الافتراضي</button>
          <button className="btn btn-ghost" disabled={!device.recalibrate} onClick={() => device.recalibrate?.()} data-testid="button-recalibrate"><Cpu size={15} />إعادة معايرة الجهاز</button>
          <button className="btn btn-ghost" onClick={handlePuff} data-testid="button-demo-puff">محاكاة نفخة</button>
        </div>
        {device.sample && <p className="font-mono text-xs" dir="ltr">Δ {device.sample.delta.toFixed(2)} hPa · base {device.sample.baseline.toFixed(1)}</p>}
        <div className="rounded-2xl bg-accent p-3 space-y-2">
          <button className="btn btn-ghost w-full" onClick={loadDemo} data-testid="button-load-demo"><Database size={15} />تحميل بيانات تجريبية (للعرض فقط)</button>
          {!confirm
            ? <button className="btn w-full text-destructive" onClick={() => setConfirm(true)} data-testid="button-reset"><Trash2 size={15} />مسح كل البيانات المحلية</button>
            : <div className="flex gap-2 items-center"><span className="font-bold flex-1">متأكد؟ لا يمكن التراجع.</span>
                <button className="btn bg-destructive text-destructive-foreground" onClick={() => { setConfirm(false); onClose(); resetAll(); }} data-testid="button-confirm-reset">نعم، امسح</button>
                <button className="btn btn-ghost" onClick={() => setConfirm(false)} data-testid="button-cancel-reset">إلغاء</button></div>}
        </div>
        <p className="text-xs text-muted-foreground">اختصار: Alt+Shift+D أو اضغط الشعار ثلاث مرات.</p>
      </div>
    </Modal>
  );
}
