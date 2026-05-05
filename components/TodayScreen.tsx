import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { CHECKLIST_ITEMS } from '@/lib/data';
import TripleRing from './TripleRing';

type Checked = Record<string, boolean>;

type Props = {
  checked: Checked;
  toggle: (id: string) => void;
  showNudge: boolean;
};

const RING_GROUPS = ['nutrition', 'body', 'rhythm'] as const;
const RING_COLORS = ['#FF2D55', B_COLORS.lime, B_COLORS.green];

const SECTIONS = [
  { key: 'nutrition', title: 'Nutrition' },
  { key: 'rhythm',    title: 'Rhythm'    },
  { key: 'body',      title: 'Movement'  },
  { key: 'mind',      title: 'Mind'      },
] as const;

export default function TodayScreen({ checked, toggle, showNudge }: Props) {
  const done = Object.values(checked).filter(Boolean).length;

  const ringStats = RING_GROUPS.map(g => {
    const items = CHECKLIST_ITEMS.filter(i => i.group === g);
    const d = items.filter(i => checked[i.id]).length;
    return { g, d, t: items.length, pct: d / items.length };
  });

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 8px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>
          SUNDAY, MAY 4
        </div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>
          Today
        </div>
      </div>

      {/* Activity rings card */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: B_FONT, fontSize: 17, fontWeight: 600, color: B_COLORS.green }}>Activity</span>
            <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft, letterSpacing: -0.08 }}>
              {done} of {CHECKLIST_ITEMS.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <TripleRing stats={ringStats} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ringStats.map((r, i) => (
                <div key={r.g}>
                  <div style={{
                    fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft,
                    letterSpacing: -0.06, textTransform: 'uppercase', fontWeight: 600,
                  }}>{r.g}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: RING_COLORS[i], letterSpacing: -0.5 }}>{r.d}</span>
                    <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>/{r.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nudge card */}
      {showNudge && (
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: B_COLORS.card, borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderLeft: `3px solid ${B_COLORS.blue}`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#E5F1FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>💧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink }}>Hydration reminder</div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 2, letterSpacing: -0.06 }}>
                0.6L to go before evening
              </div>
            </div>
            <span style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkFaint }}>4:12 PM</span>
          </div>
        </div>
      )}

      {/* IF fasting card */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
          padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
        }}>
          Intermittent fasting
        </div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 28, fontWeight: 600, color: B_COLORS.ink, letterSpacing: -0.5 }}>
                14h 08m
              </div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 2 }}>of 16h fasting window</div>
            </div>
            <span style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.green }}>88%</span>
          </div>
          <div style={{ height: 6, background: B_COLORS.bg, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '88%', background: B_COLORS.green, borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft }}>Last meal 7:42 PM</span>
            <span style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft }}>Break 11:42 AM</span>
          </div>
        </div>
      </div>

      {/* Checklist sections */}
      {SECTIONS.map(sec => {
        const items = CHECKLIST_ITEMS.filter(i => i.group === sec.key);
        const sectionDone = items.filter(i => checked[i.id]).length;
        return (
          <div key={sec.key} style={{ padding: '20px 16px 0' }}>
            <div style={{
              fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
              padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{sec.title}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{sectionDone}/{items.length}</span>
            </div>
            <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
              {items.map((it, i) => (
                <button
                  key={it.id}
                  onClick={() => toggle(it.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: i === items.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                    background: checked[it.id] ? B_COLORS.green : 'transparent',
                    border: checked[it.id] ? 'none' : `1.5px solid ${B_COLORS.inkFaint}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {checked[it.id] && (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path d="M1 5l3.5 3.5L12 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ flex: 1, fontFamily: B_FONT, fontSize: 16, color: B_COLORS.ink, letterSpacing: -0.4 }}>
                    {it.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Meals card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{
          fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
          padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
        }}>
          Meals
        </div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: 12, display: 'flex', gap: 8 }}>
          {[
            { m: 'Breakfast', filled: true,  time: '8:14 AM' },
            { m: 'Lunch',     filled: false, time: '—' },
            { m: 'Dinner',    filled: false, time: '—' },
          ].map(meal => (
            <div
              key={meal.m}
              style={{
                flex: 1, aspectRatio: '1 / 1.05', borderRadius: 10, position: 'relative', overflow: 'hidden',
                background: meal.filled
                  ? 'linear-gradient(135deg, #f7d4b8 0%, #e8a87c 50%, #c9806d 100%)'
                  : B_COLORS.bg,
                border: meal.filled ? 'none' : `1px dashed ${B_COLORS.inkFaint}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 10,
                cursor: 'pointer',
              }}
            >
              {!meal.filled && (
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: B_COLORS.inkFaint, fontSize: 22, fontWeight: 200,
                }}>+</div>
              )}
              <div>
                <div style={{ fontFamily: B_FONT, fontSize: 11, fontWeight: 600, color: meal.filled ? '#fff' : B_COLORS.inkSoft }}>
                  {meal.m}
                </div>
                <div style={{ fontFamily: B_FONT, fontSize: 10, color: meal.filled ? 'rgba(255,255,255,0.8)' : B_COLORS.inkFaint, marginTop: 1 }}>
                  {meal.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
