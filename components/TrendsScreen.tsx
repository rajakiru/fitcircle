import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { GROUP, WEIGHT_TRACK, WEEK_HISTORY } from '@/lib/data';
import LineChart from './LineChart';

export default function TrendsScreen() {
  const weights = WEIGHT_TRACK.map(w => w.kg);
  const wMin = Math.min(...weights) - 0.3;
  const wMax = Math.max(...weights) + 0.3;

  const sortedGroup = [...GROUP].sort((a, b) => b.streak - a.streak);

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 8px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>
          LAST 8 WEEKS
        </div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>
          Trends
        </div>
      </div>

      {/* Weight card */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.green, letterSpacing: -0.08 }}>
                Weight
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>
                  71.2
                </span>
                <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>kg</span>
              </div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 4 }}>
                Apr 27 · last 8 weeks
              </div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: 8, background: B_COLORS.greenSoft,
              fontFamily: B_FONT, fontSize: 12, fontWeight: 700, color: B_COLORS.green,
            }}>
              −1.9 kg
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <LineChart data={WEIGHT_TRACK} field="kg" min={wMin} max={wMax} color={B_COLORS.green} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {WEIGHT_TRACK.filter((_, i) => i % 2 === 0).map(w => (
              <span key={w.w} style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft }}>{w.w}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Waist card */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: '#A8C926', letterSpacing: -0.08 }}>
                Waist
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>
                  84
                </span>
                <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>cm</span>
              </div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: 8, background: '#F0F4DC',
              fontFamily: B_FONT, fontSize: 12, fontWeight: 700, color: '#5A6E1A',
            }}>
              −3 cm
            </div>
          </div>
          {/* Waist bar chart */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {WEIGHT_TRACK.map((w, i) => (
              <div
                key={w.w}
                style={{
                  flex: 1,
                  height: `${((w.waist - 83) / 5) * 60}px`,
                  background: i === WEIGHT_TRACK.length - 1 ? '#A8C926' : 'rgba(168,201,38,0.4)',
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Habits this week */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
          padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
        }}>
          Habits this week
        </div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {WEEK_HISTORY.map((d, i) => {
              const isToday = i === WEEK_HISTORY.length - 1;
              const barH = Math.round((d.done / 14) * 64);
              return (
                <div key={`${d.day}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 600, color: B_COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>
                    {d.done}
                  </span>
                  <div style={{
                    width: '100%',
                    height: `${barH}px`,
                    background: isToday ? B_COLORS.green : 'rgba(15,76,58,0.45)',
                    borderRadius: 4,
                  }} />
                  <span style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Circle streaks leaderboard */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
          padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
        }}>
          Circle streaks
        </div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
          {sortedGroup.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
              borderBottom: i === sortedGroup.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
            }}>
              <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft, fontWeight: 600, fontVariantNumeric: 'tabular-nums', width: 16 }}>
                {i + 1}
              </span>
              <div style={{
                width: 28, height: 28, borderRadius: 14, background: m.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: B_FONT, fontSize: 11, fontWeight: 700, color: B_COLORS.ink,
              }}>
                {m.initials}
              </div>
              <span style={{
                flex: 1, fontFamily: B_FONT, fontSize: 15, color: B_COLORS.ink,
                fontWeight: m.id === 'me' ? 600 : 400, letterSpacing: -0.3,
              }}>
                {m.name}
                {m.id === 'me' && <span style={{ color: B_COLORS.inkSoft, fontWeight: 400 }}> (you)</span>}
              </span>
              <span style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 700, color: B_COLORS.green, fontVariantNumeric: 'tabular-nums' }}>
                {m.streak}
              </span>
              <span style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft }}>days</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
