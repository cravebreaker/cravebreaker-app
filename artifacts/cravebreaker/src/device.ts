type SerialPort = {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  setSignals?(options: { dataTerminalReady: boolean; requestToSend: boolean }): Promise<void>;
  close(): Promise<void>;
};

type SerialNavigator = Navigator & { serial?: { requestPort(): Promise<SerialPort> } };
type PressureSample = { pressure: number; delta: number; baseline: number };

const serialApi = () => (navigator as SerialNavigator).serial;
export const serialSupported = () => Boolean(serialApi());

// Matches the reference firmware: 115200 baud and newline-delimited JSON readings in hPa.
export async function connectPressureSerial(
  onSample: (sample: PressureSample) => void,
  onDisconnect: () => void,
) {
  const serial = serialApi();
  if (!serial) throw new Error("متصفحك ما بدعم الاتصال بالقطعة عبر USB. جرّب المحاكاة أو افتح التطبيق في Chrome أو Edge على الكمبيوتر.");
  const port = await serial.requestPort();
  await port.open({ baudRate: 115200 });
  // The reference board uses DTR and RTS for its bootloader.
  try { await port.setSignals?.({ dataTerminalReady: false, requestToSend: false }); } catch { /* not all adapters expose these signals */ }
  const reader = port.readable?.getReader();
  if (!reader) {
    await port.close();
    throw new Error("تعذّرت قراءة بيانات القطعة.");
  }
  let closing = false;
  let lastReading = Date.now();
  let ignoreUntil = 0;
  const watchdog = window.setInterval(() => {
    if (Date.now() - lastReading > 12000) void disconnect();
  }, 1000);
  const decoder = new TextDecoder();
  let buffer = "";

  const reading = (line: string) => {
    let value: unknown;
    try { value = JSON.parse(line); } catch { return; }
    if (!value || typeof value !== "object") return;
    const { event, p, base, delta } = value as Record<string, unknown>;
    if (event !== "reading" || typeof p !== "number" || typeof base !== "number" ||
        typeof delta !== "number" || ![p, base, delta].every(Number.isFinite)) return;
    lastReading = Date.now();
    if (Date.now() >= ignoreUntil) onSample({ pressure: p, baseline: base, delta });
  };
  const loop = (async () => {
    try {
      while (!closing) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = (buffer + decoder.decode(value, { stream: true })).split("\n");
        buffer = lines.pop() ?? "";
        if (buffer.length > 4096) buffer = "";
        for (const line of lines) if (line.length <= 4096) reading(line.trim());
      }
    } finally {
      reader.releaseLock();
    }
  })();

  let closePromise: Promise<void> | undefined;
  function disconnect() {
    if (closePromise) return closePromise;
    closing = true;
    window.clearInterval(watchdog);
    closePromise = (async () => {
      try { await reader?.cancel(); } catch { /* already unplugged */ }
      try { await loop; } catch { /* read stopped */ }
      try { await port.close(); } catch { /* already closed */ }
      onDisconnect();
    })();
    return closePromise;
  }
  void loop.then(() => { void disconnect(); }, () => { void disconnect(); });

  async function calibrate() {
    if (closing) return;
    const writer = port.writable?.getWriter();
    if (!writer) throw new Error("تعذّر إرسال أمر المعايرة.");
    try {
      ignoreUntil = Date.now() + 2500;
      await writer.write(new TextEncoder().encode("CAL\n"));
    } finally {
      writer.releaseLock();
    }
  }
  return { disconnect, recalibrate: () => { void calibrate().catch(() => { void disconnect(); }); } };
}
