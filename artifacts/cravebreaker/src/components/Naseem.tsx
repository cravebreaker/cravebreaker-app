import { motion, useReducedMotion } from 'framer-motion';

export type NaseemMood = 'greet' | 'idle' | 'inhale' | 'exhale' | 'cheer';

export function Naseem({ mood = 'idle', size = 160, className = '' }: { mood?: NaseemMood; size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const body = reduce
    ? {}
    : mood === 'inhale' ? { scale: 1.12, y: -4 }
    : mood === 'exhale' ? { scale: 0.94, y: 2 }
    : mood === 'cheer' ? { y: [0, -18, 0, -10, 0], rotate: [0, -4, 4, 0] }
    : mood === 'greet' ? { rotate: [0, -3, 3, 0], y: [0, -3, 0] }
    : { y: [0, -3, 0] };
  const trans = mood === 'inhale' ? { duration: 4, ease: 'easeInOut' as const }
    : mood === 'exhale' ? { duration: 6, ease: 'easeInOut' as const }
    : mood === 'cheer' ? { duration: 1.1, repeat: Infinity, repeatDelay: 0.4 }
    : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const };
  const wave = !reduce && (mood === 'greet' || mood === 'cheer');

  return (
    <motion.svg viewBox="0 0 200 210" width={size} height={size * 1.05} className={className} role="img" aria-label="نسيم، الطائر المرافق"
      animate={body} transition={trans} style={{ originX: 0.5, originY: 0.9 }}>
      <defs>
        <radialGradient id="nb" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC" /><stop offset="60%" stopColor="#0EA5E9" /><stop offset="100%" stopColor="#0284C7" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="200" rx="52" ry="6" fill="#0284C7" opacity=".12" />
      {/* leaf tuft */}
      <g transform="translate(100 34)">
        <path d="M0 0 C-6 -20 -24 -26 -30 -22 C-26 -10 -14 -2 0 0Z" fill="#22A06B" />
        <path d="M0 0 C4 -22 20 -32 28 -28 C24 -14 12 -4 0 0Z" fill="#34C27E" />
        <path d="M0 0 C-14 -14 -22 -14 -28 -22" stroke="#157A4F" strokeWidth="1.5" fill="none" opacity=".5" />
      </g>
      {/* feet */}
      <g fill="#F97316">
        <path d="M78 178 l-8 16 h8 l3 -6 l3 6 h8 l-6 -16z" />
        <path d="M114 178 l-8 16 h8 l3 -6 l3 6 h8 l-6 -16z" />
      </g>
      <circle cx="100" cy="108" r="76" fill="url(#nb)" />
      <ellipse cx="100" cy="138" rx="46" ry="38" fill="#E0F2FE" opacity=".9" />
      {/* wings */}
      <motion.path d="M28 112 C10 118 12 146 34 150 C40 136 40 122 28 112Z" fill="#0369A1"
        animate={wave ? { rotate: [0, -22, 0, -22, 0] } : {}} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.8 }} style={{ originX: 1, originY: 0 }} />
      <path d="M172 112 C190 118 188 146 166 150 C160 136 160 122 172 112Z" fill="#0369A1" />
      {/* eyes */}
      {[72, 128].map((x) => (
        <g key={x}>
          <circle cx={x} cy="92" r="20" fill="#FFFBF5" />
          <motion.g animate={reduce ? {} : { scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} style={{ originY: '92px' }}>
            <circle cx={x + 2} cy="94" r="11" fill="#0C2A3E" />
            <circle cx={x + 6} cy="89" r="4" fill="#fff" />
            <circle cx={x - 2} cy="99" r="2" fill="#fff" opacity=".7" />
          </motion.g>
        </g>
      ))}
      {/* cheeks */}
      <ellipse cx="54" cy="120" rx="11" ry="7" fill="#F9A8D4" opacity=".85" />
      <ellipse cx="146" cy="120" rx="11" ry="7" fill="#F9A8D4" opacity=".85" />
      {/* beak */}
      {mood === 'exhale' || mood === 'cheer'
        ? <g><path d="M88 114 Q100 108 112 114 Q100 120 88 114Z" fill="#FB923C" /><ellipse cx="100" cy="124" rx="7" ry="6" fill="#C2410C" /><path d="M90 128 Q100 136 110 128 Q100 132 90 128Z" fill="#F97316" /></g>
        : <path d="M88 114 Q100 106 112 114 Q100 130 88 114Z" fill="#F97316" />}
    </motion.svg>
  );
}
