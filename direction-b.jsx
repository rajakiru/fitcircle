// Direction B — Clean Minimal
// Palette: White/grey, Apple Health-inspired, dense data, restrained
// Vibe: precise, calm, data-forward, neutral

const B_COLORS = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  ink: '#000000',
  ink2: '#3C3C43',
  inkSoft: 'rgba(60,60,67,0.6)',
  inkFaint: 'rgba(60,60,67,0.3)',
  hairline: 'rgba(60,60,67,0.12)',
  green: '#0F4C3A',
  greenSoft: '#E8F0EC',
  lime: '#A8C926',
  blue: '#007AFF',
  red: '#FF3B30',
};

const B_FONT = '-apple-system, "SF Pro Text", "SF Pro", system-ui, sans-serif';
const B_FONT_DISPLAY = '-apple-system, "SF Pro Display", system-ui, sans-serif';

function BTabBar({ active, onChange }) {
  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'feed',  label: 'Circle' },
    { id: 'stats', label: 'Trends' },
  ];
  const Icon = ({ id, on }) => {
    const c = on ? B_COLORS.green : B_COLORS.inkSoft;
    if (id === 'today') return <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="4" y="6" width="18" height="16" rx="3" stroke={c} strokeWidth="1.6"/><path d="M9 4v4M17 4v4M4 11h18" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><path d="M10 16l2 2 4-4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    if (id === 'feed')  return <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="10" r="4" stroke={c} strokeWidth="1.6"/><path d="M5 21c1-3.6 4-6 8-6s7 2.4 8 6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>;
    return <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 18l5-5 4 3 7-8" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="20" cy="8" r="1.6" fill={c}/></svg>;
  };
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 84,
      background: 'rgba(249,249,251,0.92)', backdropFilter: 'blur(20px)',
      borderTop: `0.5px solid ${B_COLORS.hairline}`,
      display: 'flex', justifyContent: 'space-around', paddingTop: 8, zIndex: 30,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '4px 10px', flex: 1, color: active === t.id ? B_COLORS.green : B_COLORS.inkSoft,
        }}>
          <Icon id={t.id} on={active === t.id} />
          <span style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function BTodayScreen({ checked, toggle, showNudge }) {
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / CHECKLIST_ITEMS.length) * 100);

  // Three rings: nutrition, body, rhythm
  const groups = ['nutrition', 'body', 'rhythm'];
  const ringStats = groups.map(g => {
    const items = CHECKLIST_ITEMS.filter(i => i.group === g);
    const d = items.filter(i => checked[i.id]).length;
    return { g, d, t: items.length, pct: d / items.length };
  });

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '60px 20px 8px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>SUNDAY, MAY 4</div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>Today</div>
      </div>

      {/* hero rings card */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: B_FONT, fontSize: 17, fontWeight: 600, color: B_COLORS.green }}>Activity</span>
            <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft, letterSpacing: -0.08 }}>{done} of {CHECKLIST_ITEMS.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <BTripleRing stats={ringStats} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ringStats.map((r, i) => (
                <div key={r.g}>
                  <div style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft, letterSpacing: -0.06, textTransform: 'uppercase', fontWeight: 600 }}>{r.g}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: ['#FF2D55','#A8C926','#0F4C3A'][i], letterSpacing: -0.5 }}>{r.d}</span>
                    <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>/{r.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* nudge / reminder */}
      {showNudge && (
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: B_COLORS.card, borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderLeft: `3px solid ${B_COLORS.blue}`,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E5F1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink }}>Hydration reminder</div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 2, letterSpacing: -0.06 }}>0.6L to go before evening</div>
            </div>
            <span style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkFaint }}>4:12 PM</span>
          </div>
        </div>
      )}

      {/* fasting */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08 }}>Intermittent fasting</div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 28, fontWeight: 600, color: B_COLORS.ink, letterSpacing: -0.5 }}>14h 08m</div>
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

      {/* checklist sections */}
      {[
        { key: 'nutrition', title: 'Nutrition' },
        { key: 'rhythm', title: 'Rhythm' },
        { key: 'body', title: 'Movement' },
        { key: 'mind', title: 'Mind' },
      ].map(sec => {
        const items = CHECKLIST_ITEMS.filter(i => i.group === sec.key);
        return (
          <div key={sec.key} style={{ padding: '20px 16px 0' }}>
            <div style={{
              fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
              padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{sec.title}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{items.filter(i => checked[i.id]).length}/{items.length}</span>
            </div>
            <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
              {items.map((it, i) => (
                <button key={it.id} onClick={() => toggle(it.id)} style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: i === items.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 12,
                    background: checked[it.id] ? B_COLORS.green : 'transparent',
                    border: checked[it.id] ? 'none' : `1.5px solid ${B_COLORS.inkFaint}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}>
                    {checked[it.id] && <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l3.5 3.5L12 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ flex: 1, fontFamily: B_FONT, fontSize: 16, color: B_COLORS.ink, letterSpacing: -0.4 }}>{it.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* meals card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08 }}>Meals</div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: 12, display: 'flex', gap: 8 }}>
          {[
            { m: 'Breakfast', filled: true, time: '8:14 AM' },
            { m: 'Lunch', filled: false, time: '—' },
            { m: 'Dinner', filled: false, time: '—' },
          ].map((m, i) => (
            <div key={m.m} style={{
              flex: 1, aspectRatio: '1/1.05', borderRadius: 10, position: 'relative', overflow: 'hidden',
              background: m.filled ? 'linear-gradient(135deg, #f7d4b8 0%, #e8a87c 50%, #c9806d 100%)' : B_COLORS.bg,
              border: m.filled ? 'none' : `1px dashed ${B_COLORS.inkFaint}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 10,
            }}>
              {!m.filled && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: B_COLORS.inkFaint, fontSize: 22, fontWeight: 200 }}>+</div>
              )}
              <div>
                <div style={{ fontFamily: B_FONT, fontSize: 11, fontWeight: 600, color: m.filled ? '#fff' : B_COLORS.inkSoft }}>{m.m}</div>
                <div style={{ fontFamily: B_FONT, fontSize: 10, color: m.filled ? 'rgba(255,255,255,0.8)' : B_COLORS.inkFaint, marginTop: 1 }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BTripleRing({ stats }) {
  const colors = ['#FF2D55', B_COLORS.lime, B_COLORS.green];
  const sizes = [86, 64, 42];
  return (
    <svg width="98" height="98" viewBox="0 0 98 98">
      {sizes.map((s, i) => {
        const r = s / 2;
        const c = 2 * Math.PI * r;
        return (
          <g key={i}>
            <circle cx="49" cy="49" r={r} stroke={colors[i]} strokeOpacity="0.18" strokeWidth="7" fill="none"/>
            <circle cx="49" cy="49" r={r} stroke={colors[i]} strokeWidth="7" fill="none"
              strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - stats[i].pct)}
              transform="rotate(-90 49 49)" style={{ transition: 'stroke-dashoffset 0.4s' }}/>
          </g>
        );
      })}
    </svg>
  );
}

function BFeedScreen({ reactions, addReaction }) {
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '60px 20px 8px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>YOUR CIRCLE · 6</div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>Circle</div>
      </div>

      {/* Today's progress strip */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.ink, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
            <span>Today's progress</span>
            <span style={{ color: B_COLORS.inkSoft, fontWeight: 400 }}>5 of 6 logged</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {GROUP.map(m => (
              <div key={m.id} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto' }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }}>
                    <circle cx="20" cy="20" r="17" stroke={B_COLORS.hairline} strokeWidth="3" fill="none"/>
                    <circle cx="20" cy="20" r="17" stroke={B_COLORS.green} strokeWidth="3" fill="none"
                      strokeLinecap="round" strokeDasharray={2 * Math.PI * 17}
                      strokeDashoffset={2 * Math.PI * 17 * (1 - m.donePct/100)}
                      transform="rotate(-90 20 20)"/>
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 4, borderRadius: 16, background: m.tint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: B_FONT, fontSize: 11, fontWeight: 700, color: B_COLORS.ink,
                  }}>{m.initials}</div>
                </div>
                <div style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft, marginTop: 6 }}>{m.name.length > 6 ? m.name.slice(0, 5) : m.name}</div>
                <div style={{ fontFamily: B_FONT, fontSize: 11, fontWeight: 600, color: B_COLORS.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{m.donePct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* feed list */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08 }}>Recent</div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
          {FEED.map((p, i) => (
            <BPostRow key={p.id} post={p} isLast={i === FEED.length - 1}
              myReactions={reactions[p.id] || []}
              onReact={(r) => addReaction(p.id, r)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BPostRow({ post, isLast, myReactions, onReact }) {
  const m = GROUP.find(g => g.id === post.who);
  return (
    <div style={{
      padding: '14px 16px', borderBottom: isLast ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 14, background: m.tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: B_FONT, fontSize: 11, fontWeight: 700, color: B_COLORS.ink,
        }}>{m.initials}</div>
        <span style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink, letterSpacing: -0.2 }}>{m.name}</span>
        <span style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft }}>·</span>
        <span style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft }}>{post.when}</span>
        <div style={{ flex: 1 }} />
        {post.kind === 'meal' && <span style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 700, color: B_COLORS.inkSoft, letterSpacing: 0.6 }}>{post.label}</span>}
      </div>

      {post.kind === 'meal' && (
        <div style={{ height: 180, borderRadius: 10, background: post.bg, marginBottom: 10, position: 'relative' }}>
          <div style={{
            position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 8, padding: '4px 9px',
            fontFamily: B_FONT, fontSize: 11, fontWeight: 600,
          }}>✓ {post.doneToday}/14</div>
        </div>
      )}
      {post.kind === 'streak' && (
        <div style={{
          height: 90, borderRadius: 10, background: B_COLORS.greenSoft, marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 48, fontWeight: 700, color: B_COLORS.green, letterSpacing: -1 }}>{post.streak}</div>
          <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.green, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>day<br/>streak</div>
        </div>
      )}
      {post.kind === 'weigh' && (
        <div style={{
          height: 70, borderRadius: 10, background: B_COLORS.bg, marginBottom: 10,
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Weight</div>
            <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.4 }}>{post.weight} <span style={{ fontSize: 12, color: B_COLORS.inkSoft, fontWeight: 500 }}>kg</span></div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 8, background: B_COLORS.greenSoft,
            fontFamily: B_FONT, fontSize: 12, fontWeight: 700, color: B_COLORS.green,
          }}>{post.delta} kg this week</div>
        </div>
      )}

      <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.ink, lineHeight: 1.4, letterSpacing: -0.2, marginBottom: 10 }}>{post.caption}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {['🔥', '👏', '💚'].map(r => {
          const on = myReactions.includes(r);
          const count = (post.reactions[r] || 0) + (on ? 1 : 0);
          return (
            <button key={r} onClick={() => onReact(r)} style={{
              background: on ? B_COLORS.greenSoft : B_COLORS.bg, border: 'none',
              borderRadius: 8, padding: '5px 9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: B_FONT, fontSize: 12, fontWeight: 600,
              color: on ? B_COLORS.green : B_COLORS.ink2,
            }}>
              <span>{r}</span>{count > 0 && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BTrendsScreen() {
  const weights = WEIGHT_TRACK.map(w => w.kg);
  const wmin = Math.min(...weights) - 0.3, wmax = Math.max(...weights) + 0.3;
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '60px 20px 8px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>LAST 8 WEEKS</div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>Trends</div>
      </div>

      {/* weight card */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.green, letterSpacing: -0.08 }}>Weight</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>71.2</span>
                <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>kg</span>
              </div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 4 }}>Apr 27 · last 8 weeks</div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: 8, background: B_COLORS.greenSoft,
              fontFamily: B_FONT, fontSize: 12, fontWeight: 700, color: B_COLORS.green,
            }}>−1.9 kg</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <BLine data={WEIGHT_TRACK} field="kg" min={wmin} max={wmax} color={B_COLORS.green} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {WEIGHT_TRACK.filter((_, i) => i % 2 === 0).map(w => (
              <span key={w.w} style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft }}>{w.w}</span>
            ))}
          </div>
        </div>
      </div>

      {/* waist */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: '#A8C926', letterSpacing: -0.08 }}>Waist</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>84</span>
                <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>cm</span>
              </div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: 8, background: '#F0F4DC',
              fontFamily: B_FONT, fontSize: 12, fontWeight: 700, color: '#5A6E1A',
            }}>−3 cm</div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {WEIGHT_TRACK.map((w, i) => (
              <div key={w.w} style={{
                flex: 1, height: `${((w.waist - 83) / 5) * 100}%`,
                background: i === WEIGHT_TRACK.length - 1 ? '#A8C926' : 'rgba(168,201,38,0.4)',
                borderRadius: 3,
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* week heatmap */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08 }}>Habits this week</div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {WEEK_HISTORY.map((d, i) => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 600, color: B_COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{d.done}</span>
                <div style={{
                  width: '100%', height: `${(d.done / 14) * 80}%`,
                  background: i === 6 ? B_COLORS.green : 'rgba(15,76,58,0.55)',
                  borderRadius: 4,
                }}/>
                <span style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* leaderboard */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08 }}>Circle streaks</div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
          {[...GROUP].sort((a, b) => b.streak - a.streak).map((m, i, arr) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
              borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
            }}>
              <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft, fontWeight: 600, fontVariantNumeric: 'tabular-nums', width: 16 }}>{i + 1}</span>
              <div style={{
                width: 28, height: 28, borderRadius: 14, background: m.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: B_FONT, fontSize: 11, fontWeight: 700, color: B_COLORS.ink,
              }}>{m.initials}</div>
              <span style={{ flex: 1, fontFamily: B_FONT, fontSize: 15, color: B_COLORS.ink, fontWeight: m.id === 'me' ? 600 : 400, letterSpacing: -0.3 }}>{m.name}{m.id === 'me' && <span style={{ color: B_COLORS.inkSoft, fontWeight: 400 }}> (you)</span>}</span>
              <span style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 700, color: B_COLORS.green, fontVariantNumeric: 'tabular-nums' }}>{m.streak}</span>
              <span style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft }}>days</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BLine({ data, field, min, max, color }) {
  const W = 320, H = 80, pad = 4;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - pad * 2));
  const ys = data.map(d => H - pad - ((d[field] - min) / (max - min)) * (H - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <path d={`${path} L ${xs[xs.length-1]} ${H} L ${xs[0]} ${H} Z`} fill={color} fillOpacity="0.1"/>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4" fill={color}/>
    </svg>
  );
}

function FitCircleB() {
  const [tab, setTab] = React.useState('today');
  const [checked, setChecked] = React.useState({
    metab: true, protein: true, nuts: false, veg: true, fruit: true,
    nosugar: false, water: false, meals3: true, dinner8: true, if: true,
    sleep: true, exercise: false, steps: true, nophone: false,
  });
  const [reactions, setReactions] = React.useState({});
  const [showNudge, setShowNudge] = React.useState(true);
  const toggle = (id) => setChecked(c => ({ ...c, [id]: !c[id] }));
  const addReaction = (postId, r) => setReactions(rx => {
    const cur = rx[postId] || [];
    return { ...rx, [postId]: cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r] };
  });
  return (
    <div style={{ height: '100%', background: B_COLORS.bg, position: 'relative' }}>
      {tab === 'today' && <BTodayScreen checked={checked} toggle={toggle} showNudge={showNudge} />}
      {tab === 'feed'  && <BFeedScreen reactions={reactions} addReaction={addReaction} />}
      {tab === 'stats' && <BTrendsScreen />}
      <BTabBar active={tab} onChange={setTab} />
    </div>
  );
}

Object.assign(window, { FitCircleB });
