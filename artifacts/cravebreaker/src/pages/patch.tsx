import { Bandage, PhoneCall, CheckCircle2, Snowflake } from 'lucide-react';
import { dayKey, parseDay, useApp, type PatchRec } from '@/lib/app-state';

export default function PatchPage() {
  const { patch, setPatch } = useApp();
  const today = dayKey();
  const rec: PatchRec = patch[today] ?? { applied: null, smoked: null };
  const history = Object.entries(patch).filter(([d]) => d !== today).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10);
  const Btn = ({ on, label, onClick, id }: { on: boolean; label: string; onClick: () => void; id: string }) => (
    <button aria-pressed={on} onClick={onClick} data-testid={id} className={`btn flex-1 border-2 ${on ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>{label}</button>
  );
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <header><h1 className="text-3xl font-black">متابعة اللصقة اليومية</h1><p className="text-muted-foreground">تسجيل بسيط يبقى على جهازك فقط. إذا ما بتستخدم لصقة، تجاهل هالصفحة.</p></header>
      <section className="card-soft p-5 space-y-4">
        <div className="flex items-center gap-2"><Bandage className="text-fire" /><h2 className="font-black">هل استخدمت اللصقة اليوم؟</h2></div>
        <div className="flex gap-2">
          <Btn id="button-applied-yes" on={rec.applied === true} label="نعم" onClick={() => setPatch(today, { applied: true, smoked: rec.smoked })} />
          <Btn id="button-applied-no" on={rec.applied === false} label="لا" onClick={() => setPatch(today, { applied: false, smoked: null })} />
        </div>
        {rec.applied && (
          <div className="rise space-y-3 pt-2 border-t">
            <h3 className="font-black">بعد ما حطيت اللصقة، دخّنت أو استخدمت السيجارة الإلكترونية؟</h3>
            <div className="flex gap-2">
              <Btn id="button-smoked-yes" on={rec.smoked === true} label="نعم" onClick={() => setPatch(today, { applied: true, smoked: true })} />
              <Btn id="button-smoked-no" on={rec.smoked === false} label="لا" onClick={() => setPatch(today, { applied: true, smoked: false })} />
            </div>
            {rec.smoked === true && <div role="alert" className="flex gap-3 rounded-2xl bg-accent p-4 text-accent-foreground"><PhoneCall className="shrink-0" /><p className="text-sm font-semibold">تواصل مع الصيدلاني أو طبيبك واحكيله. هو اللي بيقرر الخطوة الجاية. ولا تلوم حالك، المهم إنك صريح.</p></div>}
            {rec.smoked === false && <p className="flex gap-2 text-mint font-bold text-sm"><CheckCircle2 size={18} />ممتاز! يوم نظيف.</p>}
          </div>
        )}
        {rec.applied === false && <p className="text-sm text-muted-foreground">تمام، انسجّل. إذا عندك سؤال عن اللصقة اسأل الصيدلاني.</p>}
      </section>
      <section className="card-soft p-5">
        <h2 className="font-black mb-3">السجل</h2>
        {history.length === 0 ? <p className="text-sm text-muted-foreground flex gap-2"><Snowflake size={16} />لا يوجد سجل سابق بعد.</p> : (
          <ul className="divide-y text-sm">{history.map(([d, r]) => (
            <li key={d} className="py-2 flex justify-between" data-testid={`row-patch-${d}`}><span>{parseDay(d).toLocaleDateString('ar-JO', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span className="font-bold">{r.applied ? 'لصقة' : 'بدون لصقة'}{r.smoked ? ' · تدخين (تواصل مع الصيدلاني)' : ''}</span></li>
          ))}</ul>
        )}
      </section>
    </div>
  );
}
