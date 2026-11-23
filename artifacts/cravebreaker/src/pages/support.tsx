import { useState } from 'react';
import { MapPin, ExternalLink, Hospital, Pill, ShieldAlert, CheckCircle2, Users, Heart } from 'lucide-react';
import { regions, khccClinic, ministryDirectory } from '../clinics';
import { Modal } from '@/components/Shell';

type YN = boolean | null;
const PEERS = [
  { n: 'ر. من الزرقاء', t: 'أسبوعين بدون! الجهاز صار عادة بدل السيجارة بعد الأكل.', d: 'قبل ساعة' },
  { n: 'م. من إربد', t: 'أول يوم كان صعب، بس الزفير الطويل بيفرق والله.', d: 'قبل ٣ ساعات' },
  { n: 'ل. من عمّان', t: 'وفّرت حق عشوة محترمة هالأسبوع. كمّلوا يا جماعة.', d: 'أمس' },
];

export default function SupportPage() {
  const [rid, setRid] = useState(regions[0]?.id ?? '');
  const region = regions.find((r) => r.id === rid) ?? regions[0];
  const [open, setOpen] = useState(false);
  const mapsPharm = region ? `https://www.google.com/maps/search/${encodeURIComponent('صيدلية ' + region.label + ' الأردن')}` : '#';

  return (
    <div className="space-y-5">
      <header><h1 className="text-3xl font-black">مش لحالك</h1><p className="text-muted-foreground">عيادات الإقلاع، الصيدلية الأقرب، وناس ماشيين نفس الطريق.</p></header>
      <section className="card-soft p-5">
        <h2 className="font-black flex items-center gap-2"><MapPin size={18} className="text-primary" />منطقتك</h2>
        <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label="المنطقة">
          {regions.map((r) => (
            <button key={r.id} role="radio" aria-checked={r.id === rid} onClick={() => setRid(r.id)} data-testid={`button-region-${r.id}`}
              className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors ${r.id === rid ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-secondary'}`}>{r.label}</button>
          ))}
        </div>
      </section>
      <div className="grid md:grid-cols-2 gap-5">
        {region && <Clinic title="أقرب عيادة مدرجة" c={region.clinic} />}
        <Clinic title="مركز الحسين للسرطان" c={khccClinic} />
      </div>
      <section className="card-soft p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <Hospital className="text-mint shrink-0" />
        <p className="flex-1 text-sm"><b>شبكة عيادات وزارة الصحة المجانية للإقلاع عن التدخين.</b> النموذج الأولي يذكر ٢٣ عيادة؛ للمعلومات المحدثة راجع الدليل الرسمي.</p>
        <a href={ministryDirectory} target="_blank" rel="noreferrer" className="btn btn-ghost" data-testid="link-ministry">الدليل الرسمي<ExternalLink size={15} /></a>
      </section>
      <section className="rounded-[1.75rem] p-5 bg-[linear-gradient(135deg,hsl(16_95%_93%),hsl(42_95%_90%))]">
        <div className="flex items-start gap-3"><Pill className="text-fire shrink-0" />
          <div className="flex-1"><h2 className="font-black">اطلب واستلم من الصيدلية (عرض تجريبي)</h2>
            <p className="text-sm mt-1">نبحث على الخريطة عن صيدليات في {region?.label}. الجهاز ولصقات النيكوتين فقط بعد تقييم الصيدلاني واستشارة صيدلاني أو طبيب. لا يوجد مخزون أو شراكة حقيقية.</p></div></div>
        <div className="flex flex-wrap gap-2 mt-4">
          <a href={mapsPharm} target="_blank" rel="noreferrer" className="btn btn-ghost bg-card" data-testid="link-maps-pharmacy"><MapPin size={16} />صيدليات قريبة على الخريطة</a>
          <button className="btn btn-fire" onClick={() => setOpen(true)} data-testid="button-open-collect">ابدأ الطلب التجريبي</button>
        </div>
      </section>
      <section className="card-soft p-5">
        <h2 className="font-black flex items-center gap-2"><Users size={18} className="text-primary" />تشجيع من ناس زيّك <span className="text-[11px] font-bold rounded-full bg-sun/25 px-2 py-0.5">منشورات تجريبية للعرض</span></h2>
        <ul className="mt-3 space-y-3">
          {PEERS.map((p, i) => (
            <PeerItem key={i} i={i} {...p} />
          ))}
        </ul>
      </section>
      <CollectFlow open={open} onClose={() => setOpen(false)} regionLabel={region?.label ?? ''} />
    </div>
  );
}

function PeerItem({ n, t, d, i }: { n: string; t: string; d: string; i: number }) {
  const [liked, setLiked] = useState(false);
  return (
    <li className="flex gap-3">
      <span className="grid place-items-center size-10 shrink-0 rounded-full bg-secondary font-black text-secondary-foreground">{n[0]}</span>
      <div className="flex-1"><p className="text-sm"><b>{n}</b> <span className="text-muted-foreground text-xs">· {d}</span></p><p className="text-sm">{t}</p></div>
      <button onClick={() => setLiked(!liked)} aria-pressed={liked} aria-label="تشجيع" data-testid={`button-cheer-${i}`} className={`p-2 rounded-full transition-colors ${liked ? 'text-berry' : 'text-muted-foreground'}`}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></button>
    </li>
  );
}

function Clinic({ title, c }: { title: string; c: { name: string; address: string; mapUrl: string } }) {
  return (
    <section className="card-soft p-5">
      <p className="text-xs font-bold text-primary">{title}</p>
      <h3 className="font-black text-lg mt-1">{c.name}</h3>
      <p className="text-sm text-muted-foreground">{c.address}</p>
      <a href={c.mapUrl} target="_blank" rel="noreferrer" className="btn btn-ghost mt-3 text-sm" data-testid="link-clinic-map"><MapPin size={15} />افتح الخريطة</a>
    </section>
  );
}

function YesNo({ label, v, set, id }: { label: string; v: YN; set: (b: boolean) => void; id: string }) {
  return (
    <fieldset className="flex items-center justify-between gap-3 py-2">
      <legend className="sr-only">{label}</legend><span className="text-sm font-semibold">{label}</span>
      <div className="flex gap-1">
        {[true, false].map((b) => (
          <button key={String(b)} type="button" aria-pressed={v === b} onClick={() => set(b)} data-testid={`button-${id}-${b ? 'yes' : 'no'}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold border ${v === b ? (b ? 'bg-fire text-white border-fire' : 'bg-primary text-primary-foreground border-primary') : 'bg-card'}`}>{b ? 'نعم' : 'لا'}</button>
        ))}
      </div>
    </fieldset>
  );
}

function CollectFlow({ open, onClose, regionLabel }: { open: boolean; onClose: () => void; regionLabel: string }) {
  const [adult, setAdult] = useState(false);
  const [preg, setPreg] = useState<YN>(null); const [heart, setHeart] = useState<YN>(null); const [meds, setMeds] = useState<YN>(null);
  const [agree, setAgree] = useState(false); const [done, setDone] = useState(false);
  const flagged = preg || heart || meds;
  const ready = adult && preg !== null && heart !== null && meds !== null && agree;
  const close = () => { setDone(false); onClose(); };
  return (
    <Modal open={open} onClose={close} title="اطلب واستلم · عرض تجريبي">
      {done ? (
        <div className="text-center space-y-3">
          <CheckCircle2 size={48} className="mx-auto text-mint" />
          <p className="font-black text-xl">رمز تجريبي: <span dir="ltr" data-testid="text-booking-code">#CB-2026</span></p>
          <p className="text-sm text-muted-foreground">هذا عرض فقط. لم يتم أي حجز حقيقي. اختر صيدلية من الخريطة في {regionLabel} واطلب تقييم الصيدلاني قبل أي منتج.</p>
          <button className="btn btn-primary" onClick={close} data-testid="button-done">تمام</button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">الجهاز ولصقات النيكوتين تُصرف فقط بعد تقييم الصيدلاني واستشارة صيدلاني أو طبيب. لا نقترح أي جرعات.</p>
          <label className="flex gap-2 items-center font-semibold text-sm"><input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="size-5 accent-[#0284C7]" data-testid="checkbox-adult" />أؤكد أن عمري ١٨ سنة أو أكثر</label>
          <div className="rounded-2xl bg-muted/60 px-3 divide-y">
            <YesNo id="pregnancy" label="حمل أو رضاعة؟" v={preg} set={setPreg} />
            <YesNo id="heart" label="أمراض قلب؟" v={heart} set={setHeart} />
            <YesNo id="meds" label="أدوية مزمنة؟" v={meds} set={setMeds} />
          </div>
          {flagged && <div role="alert" className="flex gap-2 rounded-2xl bg-accent p-3 text-sm text-accent-foreground"><ShieldAlert className="shrink-0" size={18} />بناءً على إجاباتك، لازم تراجع طبيب أو عيادة إقلاع قبل أي منتج. الصيدلاني ممكن يحوّلك.</div>}
          <label className="flex gap-2 items-start font-semibold text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="size-5 mt-0.5 accent-[#0284C7]" data-testid="checkbox-consult" />أوافق على استشارة الصيدلاني أو الطبيب قبل الاستلام</label>
          <button className="btn btn-primary w-full" disabled={!ready} onClick={() => setDone(true)} data-testid="button-confirm-collect">تأكيد الطلب التجريبي</button>
        </div>
      )}
    </Modal>
  );
}
