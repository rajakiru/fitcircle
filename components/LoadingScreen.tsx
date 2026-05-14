import { B_COLORS, B_FONT } from '@/lib/colors';

export default function LoadingScreen() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: B_COLORS.bg, gap: 16,
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke={B_COLORS.greenSoft} strokeWidth="4" />
        <circle cx="24" cy="24" r="20" stroke={B_COLORS.green} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 20 * 0.25} ${2 * Math.PI * 20 * 0.75}`}
          style={{ animation: 'spin 1s linear infinite', transformOrigin: '24px 24px' }}
        />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>Loading…</span>
    </div>
  );
}
