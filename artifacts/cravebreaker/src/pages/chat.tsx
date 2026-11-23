import { useEffect, useRef, useState } from 'react';
import { Send, ShieldCheck, RotateCcw } from 'lucide-react';
import { useGetNaseemReply } from '@workspace/api-client-react';
import { Naseem } from '@/components/Naseem';
import { localNaseemReply } from '@/lib/naseem-local';

interface Msg { role: 'me' | 'naseem'; text: string; failed?: boolean }
const SUGGEST = ['جاي عبالي سيجارة هلق', 'بعد القهوة بتصعب علي', 'كيف أشتت حالي؟'];

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'naseem', text: 'يا هلا! أنا نسيم. احكيلي شو صاير معك، وخلّينا ناخذ نفس سوا.' }]);
  const [text, setText] = useState('');
  const reply = useGetNaseemReply();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, reply.isPending]);

  const send = async (m: string) => {
    const message = m.trim().slice(0, 500); if (!message || reply.isPending) return;
    setText(''); setMsgs((x) => [...x, { role: 'me', text: message }]);
    try { const r = await reply.mutateAsync({ data: { message } }); setMsgs((x) => [...x, { role: 'naseem', text: r.reply }]); }
    catch { setMsgs((x) => [...x, { role: 'naseem', text: localNaseemReply(message) }]); }
  };
  const lastMine = [...msgs].reverse().find((m) => m.role === 'me')?.text;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-13rem)] md:h-[calc(100dvh-10rem)]">
      <div className="flex items-center gap-3 mb-3"><Naseem mood={reply.isPending ? 'inhale' : 'idle'} size={56} /><div><h1 className="text-2xl font-black">احكي مع نسيم</h1><p className="text-xs text-muted-foreground">تشجيع قصير، مش نصيحة طبية.</p></div></div>
      <p className="flex gap-2 text-xs rounded-2xl bg-secondary text-secondary-foreground p-3 mb-3"><ShieldCheck size={16} className="shrink-0" />نص المحادثة يُرسل لخدمة ذكاء اصطناعي لتوليد الرد. لا تشارك اسمك الكامل أو معلومات شخصية أو صحية.</p>
      <div className="flex-1 overflow-auto space-y-3 p-1" aria-live="polite" data-testid="list-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'me' ? 'justify-start' : 'justify-end'}`}>
            <div className={`rise max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-7 ${m.role === 'me' ? 'bg-primary text-primary-foreground rounded-br-md' : m.failed ? 'bg-accent text-accent-foreground rounded-bl-md' : 'card-soft rounded-bl-md'}`}>
              {m.text}
              {m.failed && lastMine && <button className="flex items-center gap-1 mt-1 font-bold underline" onClick={() => { setMsgs((x) => x.slice(0, -2)); send(lastMine); }} data-testid="button-retry"><RotateCcw size={13} />إعادة المحاولة</button>}
            </div>
          </div>
        ))}
        {reply.isPending && <div className="flex justify-end"><div className="card-soft rounded-3xl px-4 py-3 flex gap-1" aria-label="نسيم بيكتب">{[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}</div></div>}
        <div ref={end} />
      </div>
      <div className="flex gap-2 overflow-x-auto py-2">{SUGGEST.map((s) => <button key={s} onClick={() => send(s)} disabled={reply.isPending} className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs font-bold hover:bg-secondary" data-testid={`button-suggest-${s.length}`}>{s}</button>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea value={text} maxLength={500} rows={1} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text); } }}
            placeholder="اكتب لنسيم…" aria-label="رسالتك" className="w-full resize-none rounded-3xl border-2 border-input bg-card px-4 py-3 pe-14 focus:outline-none focus:border-primary" data-testid="input-message" />
          <span className="absolute left-4 bottom-3.5 text-[10px] text-muted-foreground tabular-nums">{text.length}/500</span>
        </div>
        <button type="submit" disabled={!text.trim() || reply.isPending} className="btn btn-primary size-12 p-0" aria-label="إرسال" data-testid="button-send"><Send size={18} className="-scale-x-100" /></button>
      </form>
    </div>
  );
}
