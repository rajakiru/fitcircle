import { B_COLORS } from '@/lib/colors';

type RingStat = { g: string; d: number; t: number; pct: number };

const RING_COLORS = ['#FF2D55', B_COLORS.lime, B_COLORS.green];
const RING_SIZES = [86, 64, 42];

export default function TripleRing({ stats }: { stats: RingStat[] }) {
  return (
    <svg width="98" height="98" viewBox="0 0 98 98">
      {RING_SIZES.map((s, i) => {
        const r = s / 2;
        const circumference = 2 * Math.PI * r;
        return (
          <g key={i}>
            <circle
              cx="49" cy="49" r={r}
              stroke={RING_COLORS[i]} strokeOpacity="0.18"
              strokeWidth="7" fill="none"
            />
            <circle
              cx="49" cy="49" r={r}
              stroke={RING_COLORS[i]} strokeWidth="7" fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - (stats[i]?.pct ?? 0))}
              transform="rotate(-90 49 49)"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </g>
        );
      })}
    </svg>
  );
}
