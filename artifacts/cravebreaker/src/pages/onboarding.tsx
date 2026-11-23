import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Naseem } from '@/components/Naseem';
import { Disclaimer } from '@/components/Shell';
import { dayKey, useApp } from '@/lib/app-state';

export default function Onboarding() {
  const { setProfile, loadDemo } = useApp();
  const [splash, setSplash] = useState(true);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [cigs, setCigs] = useState('');
  const [price, setPrice] = useState('');
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1100); return () => clearTimeout(t); }, []);

  if (splash) return (
    <div className="min-h-[100dvh] w-full relative grid place-items-center bg-[linear-gradient(160deg,hsl(199_95%_88%),hsl(38_60%_97%)_55%,hsl(16_95%_92%))]">
    <button className="grid place-items-center" onClick={() => setSplash(false)} data-testid="screen-splash" aria-label="متابعة إلى الترحيب">
      <div className="text-center rise">
        <Naseem mood="greet" size={190} className="mx-auto" />
        <h1 className="mt-4 text-4xl font-black text-[hsl(201_90%_24%)]">CraveBreaker</h1>
        <p className="mt-2 text-xl font-bold">خذ نفس، واكسر الرغبة</p>
        <p className="text-sm text-muted-foreground" dir="ltr">Take a breath, break the crave</p>
      </div>
    </button>
    <footer className="absolute inset-x-0 bottom-5 px-4"><Disclaimer /></footer>
    </div>
  );

  const valid = [name.trim().length > 0, Number(cigs) > 0 && Number(cigs) <= 100, Number(price) > 0 && Number(price) < 50][step];
  const next = () => {
    if (step < 2) return setStep(step + 1);
    setProfile({ name: name.trim(), cigs: Number(cigs), price: Number(price), start: dayKey() });
  };
  const q = [
    { t: 'أهلين! أنا نسيم. شو اسمك؟', h: 'بس عشان أناديك فيه. بيضل على جهازك.', el: <input autoFocus value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="اسمك" className="field" data-testid="input-name" /> },
    { t: `يا هلا ${name || ''}، كم سيجارة باليوم تقريباً؟`, h: 'رقم تقريبي، مش امتحان.', el: <input autoFocus inputMode="numeric" type="number" min={1} max={100} value={cigs} onChange={(e) => setCigs(e.target.value)} placeholder="مثلاً 15" className="field" data-testid="input-cigs" /> },
    { t: 'وكم سعر العلبة بالدينار؟', h: 'لنحسب كم وفّرت (العلبة = ٢٠ سيجارة).', el: <div className="relative"><input autoFocus inputMode="decimal" type="number" step="0.05" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2.75" className="field" data-testid="input-price" /><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">JOD</span></div> },
  ][step];

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 py-6 max-w-md mx-auto">
      <style>{`.field{width:100%;border-radius:1.1rem;border:2px solid hsl(var(--input));background:hsl(var(--card));padding:1rem 1.1rem;font-size:1.25rem;font-weight:700}.field:focus{outline:none;border-color:hsl(var(--primary))}`}</style>
      <div className="flex gap-1.5" aria-label={`الخطوة ${step + 1} من 3`}>
        {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />)}
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6" key={step}>
        <Naseem mood="greet" size={120} className="mx-auto" />
        <div className="rise text-center">
          <h1 className="text-2xl font-black">{q.t}</h1>
          <p className="text-muted-foreground mt-1">{q.h}</p>
        </div>
        <form className="rise" onSubmit={(e) => { e.preventDefault(); if (valid) next(); }}>
          {q.el}
          <div className="flex gap-2 mt-5">
            {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)} data-testid="button-back"><ArrowRight size={18} />رجوع</button>}
            <button type="submit" disabled={!valid} className="btn btn-primary flex-1" data-testid="button-next">{step < 2 ? 'التالي' : 'يلا نبلّش'}<ArrowLeft size={18} /></button>
          </div>
        </form>
      </div>
      <button className="btn text-sm text-muted-foreground underline underline-offset-4" onClick={loadDemo} data-testid="button-skip-demo"><Sparkles size={15} />تخطَّ وجرّب ببيانات تجريبية (للعرض فقط)</button>
      <Disclaimer className="mt-3" />
    </div>
  );
}
