import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Bell, Cpu, Flame, Coins, Wind, Usb, Unplug, Info, Activity, X } from 'lucide-react';
import { Naseem } from '@/components/Naseem';
import { DayIcon, IntensityMeter, type DayState } from '@/components/bits';
import { dayKey, parseDay, useApp, useStats } from '@/lib/app-state';

const WEEK = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
const STATE_LABEL: Record<DayState, string> = { active: 'نشِط', frozen: 'متجمّد', locked: 'مقفل', before: '' };

export default function HomePage() {
  const { profile, handlePuff, device, puffFlash } = useApp();
  const st = useStats();
  const [notif, setNotif] = useState(false);
  const flashing = Date.now() - puffFlash < 1500;

  const cal = useMemo(() => {
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
    const first = new Date(y, m, 1); const lead = (first.getDay() + 1) % 7;
    const n = new Date(y, m + 1, 0).getDate(); const start = profile ? parseDay(profile.start) : now;
    const cells: ({ d: number; key: string; state: DayState } | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= n; d++) {
      const date = new Date(y, m, d); const key = dayKey(date);
      const state: DayState = st.days.has(key) ? 'active' : key > st.today ? 'locked' : date < start ? 'before' : 'frozen';
      cells.push({ d, key, state });
    }
    return { cells, title: now.toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' }) };
  }, [profile, st.days, st.today]);

  return (
    <div className="space-y-5">
      {notif && (
        <div role="status" className="rise fixed top-20 inset-x-3 z-40 mx-auto max-w-sm card-soft p-4 flex gap-3 items-start" data-testid="notification-preview">
          <span className="grid place-items-center size-10 shrink-0 rounded-xl bg-fire text-white"><Flame size={20} /></span>
          <div className="flex-1 text-sm"><p className="font-extrabold">CraveBreaker · إنجاز اليوم</p>
            <p>{st.todayCount ? `كسرت الرغبة ${st.todayCount} مرة اليوم، وسلسلتك ${st.streak} يوم. كفّي هيك!` : `لسا ما في جلسة اليوم يا ${profile?.name}. نفَس واحد بيفرق.`}</p>
            <p className="text-[11px] text-muted-foreground mt-1">معاينة داخل التطبيق فقط</p></div>
          <button onClick={() => setNotif(false)} aria-label="إغلاق" data-testid="button-close-notification"><X size={16} /></button>
        </div>
      )}
      <section className="relative overflow-hidden rounded-[2rem] p-6 md:p-8 text-primary-foreground bg-[linear-gradient(135deg,#0284C7,#0EA5E9_55%,#38BDF8)]">
        <div className="absolute -left-10 -bottom-16 size-56 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="flex-1">
            <p className="font-bold opacity-90">رحلتك نحو الحرية{profile?.demo && ' · بيانات تجريبية'}</p>
            <h1 className="text-4xl md:text-5xl font-black mt-1" data-testid="text-day">اليوم {st.dayN}</h1>
            <p className="mt-1 font-semibold opacity-95">بدون تدخين منذ البداية، يا {profile?.name}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              <Link href="/breathe" className="btn bg-white text-[#0369A1]" data-testid="link-start-breathe"><Wind size={18} />جلسة تنفّس</Link>
              <button onClick={() => setNotif(true)} className="btn bg-white/15" data-testid="button-preview-notification"><Bell size={18} />معاينة إشعار اليوم</button>
            </div>
          </div>
          <Naseem mood="greet" size={130} className="shrink-0 hidden sm:block" />
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, v: st.streak, l: 'أيام متتالية', c: 'text-fire', id: 'streak' },
          { icon: Activity, v: st.total, l: 'جلسة مكتملة', c: 'text-primary', id: 'sessions' },
          { icon: Coins, v: st.saved.toFixed(2), l: 'دينار وفّرت', c: 'text-mint', id: 'saved' },
        ].map((s) => (
          <div key={s.id} className="card-soft p-4">
            <s.icon className={s.c} size={20} />
            <p className="text-2xl md:text-3xl font-black mt-2" data-testid={`stat-${s.id}`}>{s.v}</p>
            <p className="text-xs font-bold text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-5">
        <section className="card-soft p-5 md:col-span-3">
          <div className="flex items-baseline justify-between"><h2 className="text-xl font-black">أيام الحماس</h2><span className="text-sm font-bold text-muted-foreground">{cal.title}</span></div>
          <div className="grid grid-cols-7 gap-1.5 mt-4 text-center">
            {WEEK.map((w) => <span key={w} className="text-[10px] font-bold text-muted-foreground">{w}</span>)}
            {cal.cells.map((c, i) => c ? (
              <div key={c.key} title={STATE_LABEL[c.state]} aria-label={`${c.d}: ${STATE_LABEL[c.state] || 'قبل البداية'}`} data-testid={`day-${c.key}`}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-bold ${c.state === 'active' ? 'bg-accent' : c.state === 'frozen' ? 'bg-ice/50' : 'bg-muted/60'} ${c.key === st.today ? 'ring-2 ring-primary' : ''}`}>
                <span className={c.state === 'locked' || c.state === 'before' ? 'text-muted-foreground/70' : ''}>{c.d}</span>
                <DayIcon state={c.state} size={13} />
              </div>
            ) : <span key={`e${i}`} />)}
          </div>
          <div className="flex gap-4 mt-4 text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1"><DayIcon state="active" size={13} />جلسة مكتملة</span>
            <span className="flex items-center gap-1"><DayIcon state="frozen" size={13} />بلا جلسة</span>
            <span className="flex items-center gap-1"><DayIcon state="locked" size={13} />قادم</span>
          </div>
        </section>

        <div className="md:col-span-2 space-y-5">
          <section className="card-soft p-5">
            <h2 className="font-black">آخر شدة رغبة</h2>
            {st.latest ? <div className="mt-3"><IntensityMeter level={st.latest.intensity} puffs={st.latest.puffs} />
              <p className="text-xs text-muted-foreground mt-2">{new Date(st.latest.ts).toLocaleString('ar-JO', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</p></div>
              : <p className="text-sm text-muted-foreground mt-2">لسا ما في قياس. أول نفخة بتبيّن الشدة.</p>}
          </section>
          <section className="card-soft p-5" data-testid="card-device">
            <div className="flex items-center gap-2"><Cpu size={18} className="text-primary" /><h2 className="font-black flex-1">جهاز النفخ</h2>
              <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${device.status === 'connected' ? 'bg-mint/15 text-mint' : 'bg-muted text-muted-foreground'}`} data-testid="status-device">
                {{ connected: 'متصل', connecting: 'جارٍ الاتصال…', idle: 'غير متصل', error: 'خطأ', unsupported: 'غير مدعوم بالمتصفح' }[device.status]}
              </span></div>
            <p className="text-xs text-muted-foreground mt-2 flex gap-1.5"><Info size={14} className="shrink-0 mt-0.5" />القطعة تستخدم هواء الغرفة العادي فقط، بلا دخان ولا نيكوتين. خذ سحبة هادية عبرها: الحساس يرصد نزول الضغط وبيبدأ الجلسة تلقائياً. ازفر برّا القطعة.</p>
            {device.error && <p className="text-xs text-destructive mt-2">{device.error}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={handlePuff} className={`btn btn-fire flex-1 ${flashing ? 'scale-95' : ''}`} data-testid="button-simulate-puff"><Wind size={17} />محاكاة سحبة</button>
              {device.status === 'connected'
                ? <button onClick={device.disconnect} className="btn btn-ghost" data-testid="button-disconnect"><Unplug size={16} />فصل</button>
                : <button onClick={device.connect} disabled={device.status === 'unsupported' || device.status === 'connecting'} className="btn btn-ghost" data-testid="button-connect"><Usb size={16} />وصّل الجهاز</button>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
