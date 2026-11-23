import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { Wind, X, Flame, Snowflake, Clock, Droplets, Puzzle, RotateCcw, Home } from 'lucide-react';
import { Naseem, type NaseemMood } from '@/components/Naseem';
import { IntensityMeter } from '@/components/bits';
import { SESSION_MS, clampIntensity, useApp, useStats, type SessionRec } from '@/lib/app-state';

const D4 = [
  { icon: Clock, t: 'تأجيل', d: 'أجّل الرغبة ١٠ دقايق. غالباً بتخف لحالها.' },
  { icon: Wind, t: 'تنفس عميق', d: 'شهيق من الأنف، وزفير طويل بطيء من الفم.' },
  { icon: Droplets, t: 'شرب الماء', d: 'كاسة مي باردة، شوي شوي.' },
  { icon: Puzzle, t: 'تشتيت الانتباه', d: 'امشِ شوي، احكي مع حدا، أو العب لعبة قصيرة.' },
];

export default function BreathePage() {
  const { active, startManual, handlePuff, completeSession, cancelSession } = useApp();
  const st = useStats();
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<SessionRec | null>(null);
  const doneRef = useRef(false);
  const completeRef = useRef(completeSession); completeRef.current = completeSession;

  useEffect(() => {
    if (!active) return; doneRef.current = false;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [active]);

  const elapsed = active ? Math.max(0, Math.min(SESSION_MS, now - active.startedAt)) : 0;
  useEffect(() => {
    if (active && elapsed >= SESSION_MS && !doneRef.current) { doneRef.current = true; setResult(completeRef.current()); }
  }, [active, elapsed]);

  // live result after completion (puffs in same window update the latest record)
  const liveResult = result ? (st.latest && st.latest.id === result.id ? { ...result, ...st.latest, melted: result.melted } : result) : null;

  if (liveResult && !active) return <Result r={liveResult} onAgain={() => { setResult(null); startManual(); }} onPuff={handlePuff} />;

  if (!active) return (
    <div className="max-w-md mx-auto text-center pt-6 space-y-5">
      <Naseem mood="greet" size={170} className="mx-auto" />
      <h1 className="text-3xl font-black">جاي عبالك سيجارة؟</h1>
      <p className="text-muted-foreground">خذ سحبة هادية من هواء الغرفة عبر القطعة أو ابدأ بالمحاكاة. ٣٠ ثانية مع نسيم: شهيق من الأنف ٤ ثواني، وزفير بطيء من الفم ٦ ثواني، ثلاث مرات. الزفير يكون برّا القطعة.</p>
      <button className="btn btn-primary text-lg px-8 py-4" onClick={startManual} data-testid="button-start-session"><Wind />ابدأ (سحبة تجريبية)</button>
    </div>
  );

  const cycle = elapsed % 10_000; const inhale = cycle < 4000;
  const phaseLeft = Math.ceil(((inhale ? 4000 : 10_000) - cycle) / 1000);
  const round = Math.min(3, Math.floor(elapsed / 10_000) + 1);
  const mood: NaseemMood = inhale ? 'inhale' : 'exhale';
  const progress = elapsed / SESSION_MS;
  const level = clampIntensity(active.puffs);

  return (
    <div className="max-w-md mx-auto text-center space-y-5" aria-live="polite">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-muted-foreground">الجولة {round} من 3</span>
        <span className="font-black text-lg tabular-nums" data-testid="text-timer">{Math.ceil((SESSION_MS - elapsed) / 1000)} ث</span>
      </div>
      <BreathOrb inhale={inhale} key={`${round}-${inhale}`}>
        <Naseem mood={mood} size={150} key={`${round}-${mood}`} />
      </BreathOrb>
      <div>
        <h1 className="text-3xl font-black" data-testid="text-phase">{inhale ? 'شهيق من الأنف' : 'زفير بطيء من الفم'}</h1>
        <p className="text-muted-foreground font-semibold">{inhale ? 'عبّي صدرك بهدوء…' : 'برّا الجهاز، طوّل الزفير…'} <span className="tabular-nums">{phaseLeft}</span></p>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary origin-right transition-transform duration-200" style={{ transform: `scaleX(${progress})` }} /></div>
      <div className="card-soft p-4 text-start"><IntensityMeter level={level} puffs={active.puffs} /></div>
      <div className="flex gap-2">
        <button className="btn btn-fire flex-1" onClick={handlePuff} data-testid="button-add-puff"><Wind size={17} />نفخة إضافية (محاكاة)</button>
        <button className="btn btn-ghost" onClick={cancelSession} data-testid="button-cancel-session"><X size={17} />إلغاء بلا احتساب</button>
      </div>
    </div>
  );
}

function BreathOrb({ inhale, children }: { inhale: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto size-72 grid place-items-center">
      <motion.div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(199_95%_85%),hsl(199_90%_92%/.3)_70%)]"
        initial={{ scale: inhale ? 0.7 : 1 }} animate={reduce ? {} : { scale: inhale ? 1 : 0.7 }} transition={{ duration: inhale ? 4 : 6, ease: 'easeInOut' }} />
      <motion.div className="absolute inset-8 rounded-full border-2 border-primary/30"
        initial={{ scale: inhale ? 0.8 : 1.05 }} animate={reduce ? {} : { scale: inhale ? 1.05 : 0.8 }} transition={{ duration: inhale ? 4 : 6, ease: 'easeInOut' }} />
      <div className="relative">{children}</div>
    </div>
  );
}

function Result({ r, onAgain, onPuff }: { r: SessionRec; onAgain: () => void; onPuff: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="text-center rise">
        <Naseem mood="cheer" size={150} className="mx-auto" />
        <h1 className="text-4xl font-black mt-2" data-testid="text-well-done">أحسنت!</h1>
        <p className="text-muted-foreground font-semibold">٣٠ ثانية وكسرت الرغبة. هاي جلسة محسوبة إلك.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-soft p-5"><h2 className="font-black mb-3">شدة الرغبة</h2><IntensityMeter level={r.intensity} puffs={r.puffs} />
          <button className="btn btn-ghost w-full mt-4 text-sm" onClick={onPuff} data-testid="button-result-puff"><Wind size={15} />نفخة أخرى خلال الدقيقة (محاكاة)</button></div>
        <div className="card-soft p-5 grid place-items-center text-center" data-testid="card-day-status">
          {r.melted ? (
            <div className="relative h-24 w-24">
              <motion.div className="absolute inset-0 grid place-items-center text-sky-500" initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: reduce ? 1 : 0.4, y: reduce ? 0 : 20 }} transition={{ duration: 1.4, delay: 0.4 }}><Snowflake size={64} /></motion.div>
              <motion.div className="absolute inset-0 grid place-items-center text-fire" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 1.4, type: 'spring' }}><Flame size={70} fill="currentColor" /></motion.div>
            </div>
          ) : <Flame size={64} className="text-fire" fill="currentColor" />}
          <p className="font-black mt-2">{r.melted ? 'ذاب الجليد وصار نار! يوم اليوم صار نشِط' : 'يومك نشِط أصلاً، والنار لسا شاعلة'}</p>
        </div>
      </div>
      <div className="card-soft p-5">
        <h2 className="font-black mb-3">الخطوات الأربع (4Ds)</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {D4.map((d, i) => (
            <div key={d.t} className="flex gap-3 rounded-2xl bg-muted/60 p-3 rise" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="grid place-items-center size-10 shrink-0 rounded-xl bg-primary/10 text-primary"><d.icon size={20} /></span>
              <div><p className="font-extrabold">{d.t}</p><p className="text-sm text-muted-foreground">{d.d}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <button className="btn btn-primary" onClick={onAgain} data-testid="button-again"><RotateCcw size={17} />جلسة ثانية</button>
        <Link href="/" className="btn btn-ghost" data-testid="link-home"><Home size={17} />الرئيسية</Link>
      </div>
    </div>
  );
}
