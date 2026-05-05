import { B_COLORS, B_FONT } from '@/lib/colors';

type Tab = 'today' | 'feed' | 'stats';

function TodayIcon({ on }: { on: boolean }) {
  const c = on ? B_COLORS.green : B_COLORS.inkSoft;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="4" y="6" width="18" height="16" rx="3" stroke={c} strokeWidth="1.6" />
      <path d="M9 4v4M17 4v4M4 11h18" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 16l2 2 4-4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeedIcon({ on }: { on: boolean }) {
  const c = on ? B_COLORS.green : B_COLORS.inkSoft;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="10" r="4" stroke={c} strokeWidth="1.6" />
      <path d="M5 21c1-3.6 4-6 8-6s7 2.4 8 6" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StatsIcon({ on }: { on: boolean }) {
  const c = on ? B_COLORS.green : B_COLORS.inkSoft;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M4 18l5-5 4 3 7-8" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="8" r="1.6" fill={c} />
    </svg>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'feed', label: 'Circle' },
  { id: 'stats', label: 'Trends' },
];

export default function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{
      height: 84,
      background: 'rgba(249,249,251,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: `0.5px solid ${B_COLORS.hairline}`,
      display: 'flex',
      justifyContent: 'space-around',
      paddingTop: 8,
      flexShrink: 0,
    }}>
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '4px 10px',
            flex: 1,
            color: active === t.id ? B_COLORS.green : B_COLORS.inkSoft,
          }}
        >
          {t.id === 'today' && <TodayIcon on={active === t.id} />}
          {t.id === 'feed'  && <FeedIcon  on={active === t.id} />}
          {t.id === 'stats' && <StatsIcon on={active === t.id} />}
          <span style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}
