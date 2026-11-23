import { Flame, Snowflake, Lock } from 'lucide-react';
import { INTENSITY, type Intensity } from '@/lib/app-state';

export function IntensityMeter({ level, puffs }: { level: Intensity; puffs?: number }) {
  return (
    <div data-testid="meter-intensity">
      <div className="flex gap-1.5" role="meter" aria-valuemin={1} aria-valuemax={3} aria-valuenow={level} aria-label={`شدة الرغبة: ${INTENSITY[level].label}`}>
        {([1, 2, 3] as Intensity[]).map((i) => (
          <span key={i} className="h-3 flex-1 rounded-full transition-all duration-500" style={{ background: i <= level ? INTENSITY[level].color : 'hsl(var(--muted))' }} />
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-sm font-bold">
        <span style={{ color: INTENSITY[level].color }}>{INTENSITY[level].label}</span>
        {puffs !== undefined && <span className="text-muted-foreground">{puffs} نفخة خلال دقيقة</span>}
      </div>
    </div>
  );
}

export type DayState = 'active' | 'frozen' | 'locked' | 'before';
export function DayIcon({ state, size = 16 }: { state: DayState; size?: number }) {
  if (state === 'active') return <Flame size={size} className="text-fire" fill="currentColor" aria-hidden />;
  if (state === 'frozen') return <Snowflake size={size} className="text-sky-600" aria-hidden />;
  if (state === 'locked') return <Lock size={size} className="text-muted-foreground/60" aria-hidden />;
  return null;
}
