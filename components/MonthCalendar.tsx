import { B_COLORS, B_FONT } from '@/lib/colors';
import { todayISO } from '@/lib/storage';

type Props = {
  year: number;
  month: number; // 1-indexed
  completion: Record<string, number>; // "YYYY-MM-DD" → 0–1
  onDayTap: (date: string) => void;
};

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const R  = 14;
const C  = 2 * Math.PI * R;
const SF = '-apple-system, "SF Pro Text", system-ui, sans-serif';

function arcColor(frac: number): string {
  if (frac <= 0)   return B_COLORS.red;
  if (frac < 0.4)  return '#FF9500';
  if (frac < 0.7)  return B_COLORS.lime;
  if (frac < 0.9)  return '#34C759';
  return B_COLORS.green;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function MonthCalendar({ year, month, completion, onDayTap }: Props) {
  const today        = todayISO();
  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstDow     = new Date(year, month - 1, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DOW_LABELS.map((l, i) => (
          <div key={i} style={{
            textAlign: 'center', fontFamily: B_FONT, fontSize: 10,
            fontWeight: 600, color: B_COLORS.inkFaint, paddingBottom: 4,
          }}>
            {l}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} style={{ aspectRatio: '1' }} />;

          const dateStr  = `${year}-${pad(month)}-${pad(day)}`;
          const isFuture = dateStr > today;
          const isToday  = dateStr === today;
          const frac     = completion[dateStr];
          const hasData  = frac !== undefined;

          const trackColor  = isToday ? B_COLORS.green : B_COLORS.hairline;
          const centerFill  = isToday ? B_COLORS.greenSoft : 'none';
          const numColor    = isFuture
            ? B_COLORS.inkFaint
            : isToday
              ? B_COLORS.green
              : B_COLORS.ink;

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onDayTap(dateStr)}
              disabled={isFuture}
              style={{
                aspectRatio: '1', background: 'none', border: 'none',
                cursor: isFuture ? 'default' : 'pointer', padding: 0,
              }}
            >
              <svg viewBox="0 0 32 32" width="100%" height="100%">
                {/* Today centre fill */}
                {isToday && <circle cx="16" cy="16" r={R - 1} fill={centerFill} />}
                {/* Track ring */}
                {!isFuture && (
                  <circle cx="16" cy="16" r={R}
                    stroke={trackColor} strokeWidth="2" fill="none" />
                )}
                {/* Progress arc */}
                {hasData && !isFuture && (
                  <circle cx="16" cy="16" r={R}
                    stroke={arcColor(frac)}
                    strokeWidth={frac >= 0.9 ? 3 : 2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - frac)}
                    transform="rotate(-90 16 16)"
                  />
                )}
                {/* Day number */}
                <text
                  x="16" y="20"
                  textAnchor="middle"
                  fontFamily={SF}
                  fontSize={isToday ? '11' : '10.5'}
                  fontWeight={isToday ? '700' : '500'}
                  fill={numColor}
                >
                  {day}
                </text>
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
