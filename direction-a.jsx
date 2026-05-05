// Direction A — Organic Warm
// Palette: Forest green canvas (#0F4C3A), cream paper (#F5EFE3), lime accent (#D4F564)
// Vibe: journal-like, calm, rounded organic, friendly

const A_COLORS = {
  bg: '#F5EFE3',          // warm cream
  paper: '#FBF7EE',
  ink: '#1A2B1F',
  inkSoft: 'rgba(26, 43, 31, 0.6)',
  inkFaint: 'rgba(26, 43, 31, 0.35)',
  forest: '#0F4C3A',
  forestDeep: '#08321F',
  lime: '#D4F564',
  limeShade: '#B8DC4A',
  rose: '#E8B4B8',
  warn: '#C97D4F',
  hairline: 'rgba(26, 43, 31, 0.08)',
};

const A_FONTS = {
  display: '"Fraunces", "Cormorant Garamond", Georgia, serif',
  body: '"Inter Tight", "Inter", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// ─── tab bar ───────────────────────────────────────────
function ATabBar({ active, onChange }) {
  const tabs = [
    { id: 'today', label: 'Today',  icon: 'check' },
    { id: 'feed',  label: 'Circle', icon: 'people' },
    { id: 'stats', label: 'Track',  icon: 'chart' },
  ];
  const Icon = ({ k, active }) => {
    const c = active ? A_COLORS.forest : A_COLORS.inkSoft;
    if (k === 'check') return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke={c} strokeWidth={active ? 2 : 1.6}/>
        <path d="M7.5 11.2l2.6 2.4 4.4-5.2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
    if (k === 'people') return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8" cy="8.5" r="3" stroke={c} strokeWidth={active ? 2 : 1.6}/>
        <circle cx="15" cy="9.5" r="2.4" stroke={c} strokeWidth={active ? 2 : 1.6}/>
        <path d="M3 17c.5-2.5 2.6-4 5-4s4.5 1.5 5 4" stroke={c} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" fill="none"/>
        <path d="M13 16c.5-1.8 2-3 4-3" stroke={c} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" fill="none"/>
      </svg>
    );
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 18V8M9 18V4M15 18v-7" stroke={c} strokeWidth={active ? 2 : 1.6} strokeLinecap="round"/>
      </svg>
    );
  };
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 92,
      background: A_COLORS.paper, borderTop: `1px solid ${A_COLORS.hairline}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 14, zIndex: 30,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          padding: '4px 16px',
          color: active === t.id ? A_COLORS.forest : A_COLORS.inkSoft,
          fontFamily: A_FONTS.body, fontSize: 11, fontWeight: 500,
          letterSpacing: 0.3, textTransform: 'uppercase',
        }}>
          <Icon k={t.icon} active={active === t.id} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Today screen ──────────────────────────────────────
function ATodayScreen({ checked, toggle, showNudge }) {
  const total = CHECKLIST_ITEMS.length + 1; // +1 for fasting hours treated as one
  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneCount / CHECKLIST_ITEMS.length) * 100);

  // Group items by section
  const sections = [
    { key: 'nutrition', title: 'Nourish', items: CHECKLIST_ITEMS.filter(i => i.group === 'nutrition') },
    { key: 'rhythm',    title: 'Rhythm',  items: CHECKLIST_ITEMS.filter(i => i.group === 'rhythm') },
    { key: 'body',      title: 'Move',    items: CHECKLIST_ITEMS.filter(i => i.group === 'body') },
    { key: 'mind',      title: 'Quiet',   items: CHECKLIST_ITEMS.filter(i => i.group === 'mind') },
  ];

  return (
    <div style={{ paddingBottom: 110, position: 'relative' }}>
      {/* greeting band */}
      <div style={{
        padding: '70px 28px 32px', background: A_COLORS.paper,
      }}>
        <div style={{
          fontFamily: A_FONTS.body, fontSize: 12, letterSpacing: 1.4,
          textTransform: 'uppercase', color: A_COLORS.inkSoft, marginBottom: 8,
        }}>Sunday · May 4</div>
        <div style={{
          fontFamily: A_FONTS.display, fontSize: 32, fontWeight: 400,
          color: A_COLORS.ink, lineHeight: 1.1, fontStyle: 'italic',
        }}>Good evening,<br/>Maya.</div>

        {/* progress orb */}
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 18 }}>
          <ARing pct={pct} size={88} />
          <div>
            <div style={{ fontFamily: A_FONTS.display, fontSize: 26, color: A_COLORS.ink, lineHeight: 1 }}>
              {doneCount}<span style={{ color: A_COLORS.inkFaint }}> / {CHECKLIST_ITEMS.length}</span>
            </div>
            <div style={{ fontFamily: A_FONTS.body, fontSize: 13, color: A_COLORS.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
              {pct < 50 ? 'A gentle start. The day is yours.' :
               pct < 80 ? 'You\'re moving with care. Keep going.' :
               'Beautiful. Almost a full circle.'}
            </div>
          </div>
        </div>

        <AStreakChip streak={12} />
      </div>

      {/* nudge card (toggleable) */}
      {showNudge && (
        <div style={{ padding: '0 20px', marginTop: -8, marginBottom: 8 }}>
          <div style={{
            background: A_COLORS.forest, color: A_COLORS.bg,
            borderRadius: 22, padding: '16px 18px 18px',
            display: 'flex', gap: 14, alignItems: 'flex-start',
            boxShadow: '0 8px 24px rgba(15,76,58,0.18)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 18, background: A_COLORS.lime,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 18,
            }}>💧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: A_FONTS.body, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Water break</div>
              <div style={{ fontFamily: A_FONTS.body, fontSize: 13, opacity: 0.78, lineHeight: 1.4 }}>
                0.6L to go before evening — small sips count.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* sections */}
      <div style={{ padding: '20px 20px 0' }}>
        {sections.map(sec => (
          <div key={sec.key} style={{ marginBottom: 22 }}>
            <div style={{
              fontFamily: A_FONTS.body, fontSize: 11, letterSpacing: 1.6,
              textTransform: 'uppercase', color: A_COLORS.inkSoft,
              padding: '0 8px 10px', display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{sec.title}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {sec.items.filter(i => checked[i.id]).length} / {sec.items.length}
              </span>
            </div>
            <div style={{
              background: A_COLORS.paper, borderRadius: 24, overflow: 'hidden',
              border: `1px solid ${A_COLORS.hairline}`,
            }}>
              {sec.items.map((it, i) => (
                <ARow key={it.id} item={it} checked={!!checked[it.id]}
                  onClick={() => toggle(it.id)}
                  isLast={i === sec.items.length - 1} />
              ))}
            </div>
          </div>
        ))}

        {/* IF window special card */}
        <div style={{
          background: A_COLORS.forest, color: A_COLORS.bg,
          borderRadius: 24, padding: '20px 22px', marginBottom: 22,
        }}>
          <div style={{
            fontFamily: A_FONTS.body, fontSize: 11, letterSpacing: 1.6,
            textTransform: 'uppercase', opacity: 0.6, marginBottom: 8,
          }}>Fasting window</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: A_FONTS.display, fontSize: 38, fontStyle: 'italic' }}>14:08</span>
            <span style={{ fontFamily: A_FONTS.body, fontSize: 13, opacity: 0.7 }}>of 16h</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '88%', background: A_COLORS.lime, borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: A_FONTS.body, fontSize: 12, opacity: 0.7 }}>
            <span>last meal · 7:42 PM</span>
            <span>break at · 11:42 AM</span>
          </div>
        </div>

        {/* meal photos quick add */}
        <div style={{
          background: A_COLORS.paper, borderRadius: 24, padding: 20,
          border: `1px solid ${A_COLORS.hairline}`, marginBottom: 12,
        }}>
          <div style={{
            fontFamily: A_FONTS.body, fontSize: 11, letterSpacing: 1.6,
            textTransform: 'uppercase', color: A_COLORS.inkSoft, marginBottom: 14,
          }}>Today's plate</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Breakfast', 'Lunch', 'Dinner'].map((m, i) => (
              <div key={m} style={{
                flex: 1, aspectRatio: '1/1.1', borderRadius: 18,
                background: i === 0
                  ? 'linear-gradient(135deg, #f7d4b8 0%, #e8a87c 50%, #c9806d 100%)'
                  : `repeating-linear-gradient(45deg, ${A_COLORS.bg}, ${A_COLORS.bg} 6px, ${A_COLORS.hairline} 6px, ${A_COLORS.hairline} 7px)`,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 10, position: 'relative', cursor: 'pointer',
              }}>
                {i !== 0 && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: A_COLORS.inkFaint, fontSize: 22, fontFamily: A_FONTS.body, fontWeight: 300,
                  }}>+</div>
                )}
                <div style={{
                  fontFamily: A_FONTS.body, fontSize: 10, letterSpacing: 0.8,
                  textTransform: 'uppercase', fontWeight: 600,
                  color: i === 0 ? '#fff' : A_COLORS.inkSoft,
                }}>{m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ARow({ item, checked, onClick, isLast }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: isLast ? 'none' : `1px solid ${A_COLORS.hairline}`,
      textAlign: 'left',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 14,
        background: checked ? A_COLORS.forest : 'transparent',
        border: checked ? 'none' : `1.5px solid ${A_COLORS.inkFaint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.2s',
      }}>
        {checked && (
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <path d="M1 5.5l4 4L13 1" stroke={A_COLORS.lime} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{
        flex: 1, fontFamily: A_FONTS.body, fontSize: 16,
        color: checked ? A_COLORS.inkSoft : A_COLORS.ink,
        textDecoration: checked ? 'line-through' : 'none',
        textDecorationColor: A_COLORS.inkFaint,
        transition: 'all 0.2s',
      }}>{item.label}</div>
    </button>
  );
}

function ARing({ pct, size = 80 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={A_COLORS.hairline} strokeWidth="6" fill="none"/>
      <circle cx={size/2} cy={size/2} r={r}
        stroke={A_COLORS.forest} strokeWidth="6" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct/100)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        fontFamily={A_FONTS.display} fontSize="20" fontStyle="italic" fill={A_COLORS.ink}>
        {pct}<tspan fontSize="11" fill={A_COLORS.inkSoft}>%</tspan>
      </text>
    </svg>
  );
}

function AStreakChip({ streak }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: A_COLORS.lime, padding: '7px 14px 7px 10px',
      borderRadius: 100, marginTop: 18,
      fontFamily: A_FONTS.body, fontSize: 13, fontWeight: 600, color: A_COLORS.forestDeep,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 11, background: A_COLORS.forest, color: A_COLORS.lime,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
      }}>{streak}</span>
      day streak — your longest yet
    </div>
  );
}

// ─── Circle / Feed screen ──────────────────────────────
function AFeedScreen({ reactions, addReaction }) {
  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '70px 28px 24px', background: A_COLORS.paper }}>
        <div style={{
          fontFamily: A_FONTS.body, fontSize: 12, letterSpacing: 1.4,
          textTransform: 'uppercase', color: A_COLORS.inkSoft, marginBottom: 8,
        }}>Your circle · 6</div>
        <div style={{
          fontFamily: A_FONTS.display, fontSize: 30, fontStyle: 'italic',
          color: A_COLORS.ink, lineHeight: 1.1,
        }}>The kitchen<br/>table.</div>

        {/* member ring */}
        <div style={{ display: 'flex', gap: 12, marginTop: 22, overflowX: 'auto', paddingBottom: 4 }}>
          {GROUP.map(m => (
            <div key={m.id} style={{ flexShrink: 0, textAlign: 'center', width: 56 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 26,
                background: m.tint, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: A_FONTS.body, fontSize: 14, fontWeight: 600, color: A_COLORS.ink,
                position: 'relative', margin: '0 auto',
                outline: m.id === 'me' ? `2.5px solid ${A_COLORS.forest}` : 'none',
                outlineOffset: 2,
              }}>{m.initials}
                <div style={{
                  position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9,
                  background: A_COLORS.forest, color: A_COLORS.lime,
                  fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${A_COLORS.paper}`,
                }}>{m.streak}</div>
              </div>
              <div style={{
                fontFamily: A_FONTS.body, fontSize: 11, marginTop: 8,
                color: A_COLORS.inkSoft,
              }}>{m.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* feed */}
      <div style={{ padding: '12px 20px 0' }}>
        {FEED.map(post => (
          <APost key={post.id} post={post}
            myReactions={reactions[post.id] || []}
            onReact={(r) => addReaction(post.id, r)} />
        ))}
      </div>
    </div>
  );
}

function APost({ post, myReactions, onReact }) {
  const member = GROUP.find(g => g.id === post.who);
  return (
    <div style={{
      background: A_COLORS.paper, borderRadius: 24, padding: 18, marginBottom: 14,
      border: `1px solid ${A_COLORS.hairline}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 19, background: member.tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: A_FONTS.body, fontSize: 12, fontWeight: 600, color: A_COLORS.ink,
        }}>{member.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: A_FONTS.body, fontSize: 14, fontWeight: 600, color: A_COLORS.ink }}>{member.name}</div>
          <div style={{ fontFamily: A_FONTS.body, fontSize: 11, color: A_COLORS.inkSoft }}>{post.when}</div>
        </div>
        {post.kind === 'meal' && (
          <div style={{
            fontFamily: A_FONTS.body, fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
            color: A_COLORS.inkSoft, padding: '4px 10px', borderRadius: 10,
            background: A_COLORS.bg, border: `1px solid ${A_COLORS.hairline}`,
          }}>{post.label}</div>
        )}
      </div>

      {post.kind === 'meal' && (
        <div style={{
          height: 220, borderRadius: 18, background: post.bg, marginBottom: 12,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
            color: '#fff', borderRadius: 12, padding: '4px 10px',
            fontFamily: A_FONTS.body, fontSize: 11, fontWeight: 500,
          }}>{post.doneToday}/14 today</div>
        </div>
      )}

      {post.kind === 'streak' && (
        <div style={{
          height: 140, borderRadius: 18,
          background: `linear-gradient(135deg, ${A_COLORS.forest} 0%, ${A_COLORS.forestDeep} 100%)`,
          marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            fontFamily: A_FONTS.display, fontStyle: 'italic',
            fontSize: 80, color: A_COLORS.lime, lineHeight: 1, fontWeight: 300,
          }}>{post.streak}</div>
          <div style={{
            position: 'absolute', bottom: 14, fontFamily: A_FONTS.body,
            fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: A_COLORS.bg, opacity: 0.7,
          }}>day streak</div>
        </div>
      )}

      {post.kind === 'weigh' && (
        <div style={{
          height: 100, borderRadius: 18, background: A_COLORS.bg, marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: 18,
        }}>
          <div>
            <div style={{ fontFamily: A_FONTS.body, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: A_COLORS.inkSoft }}>Weight</div>
            <div style={{ fontFamily: A_FONTS.display, fontSize: 32, fontStyle: 'italic', color: A_COLORS.ink, lineHeight: 1, marginTop: 4 }}>{post.weight}<span style={{ fontSize: 14, color: A_COLORS.inkSoft }}>kg</span></div>
          </div>
          <div style={{ width: 1, height: 40, background: A_COLORS.hairline }} />
          <div>
            <div style={{ fontFamily: A_FONTS.body, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: A_COLORS.inkSoft }}>This week</div>
            <div style={{ fontFamily: A_FONTS.display, fontSize: 32, fontStyle: 'italic', color: A_COLORS.forest, lineHeight: 1, marginTop: 4 }}>{post.delta}<span style={{ fontSize: 14 }}>kg</span></div>
          </div>
        </div>
      )}

      <div style={{
        fontFamily: A_FONTS.body, fontSize: 14, color: A_COLORS.ink,
        lineHeight: 1.5, marginBottom: 14,
      }}>{post.caption}</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {['🔥', '👏', '💚'].map(r => {
          const active = myReactions.includes(r);
          const count = (post.reactions[r] || 0) + (active ? 1 : 0);
          return (
            <button key={r} onClick={() => onReact(r)} style={{
              background: active ? A_COLORS.forest : 'transparent',
              border: `1px solid ${active ? A_COLORS.forest : A_COLORS.hairline}`,
              borderRadius: 100, padding: '6px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: A_FONTS.body, fontSize: 13, fontWeight: 500,
              color: active ? A_COLORS.lime : A_COLORS.ink,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 14 }}>{r}</span>
              {count > 0 && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: A_FONTS.body, fontSize: 13, color: A_COLORS.inkSoft,
        }}>Reply</button>
      </div>
    </div>
  );
}

// ─── Track / Stats screen ──────────────────────────────
function ATrackScreen() {
  const max = Math.max(...WEEK_HISTORY.map(d => d.done));
  const weights = WEIGHT_TRACK.map(w => w.kg);
  const wmin = Math.min(...weights) - 0.3, wmax = Math.max(...weights) + 0.3;

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '70px 28px 28px', background: A_COLORS.paper }}>
        <div style={{
          fontFamily: A_FONTS.body, fontSize: 12, letterSpacing: 1.4,
          textTransform: 'uppercase', color: A_COLORS.inkSoft, marginBottom: 8,
        }}>Track</div>
        <div style={{
          fontFamily: A_FONTS.display, fontSize: 30, fontStyle: 'italic',
          color: A_COLORS.ink, lineHeight: 1.1,
        }}>Your slow,<br/>steady arc.</div>
      </div>

      <div style={{ padding: '4px 20px 0' }}>
        {/* big numbers */}
        <div style={{
          background: A_COLORS.forest, color: A_COLORS.bg,
          borderRadius: 24, padding: 24, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: A_FONTS.body, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', opacity: 0.6 }}>Weight</div>
              <div style={{ fontFamily: A_FONTS.display, fontSize: 48, fontStyle: 'italic', lineHeight: 1, marginTop: 6, fontWeight: 300 }}>
                71.2<span style={{ fontSize: 18, opacity: 0.7, marginLeft: 4 }}>kg</span>
              </div>
            </div>
            <div style={{
              padding: '5px 11px', borderRadius: 100, background: A_COLORS.lime,
              color: A_COLORS.forestDeep, fontFamily: A_FONTS.body, fontSize: 12, fontWeight: 600,
            }}>−1.9 kg in 8w</div>
          </div>
          {/* line chart */}
          <ALineChart data={WEIGHT_TRACK} min={wmin} max={wmax} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: A_FONTS.body, fontSize: 10, opacity: 0.5, letterSpacing: 0.6 }}>
            {WEIGHT_TRACK.filter((_, i) => i % 2 === 0).map(w => <span key={w.w}>{w.w}</span>)}
          </div>
        </div>

        {/* waist */}
        <div style={{
          background: A_COLORS.paper, borderRadius: 24, padding: 22, marginBottom: 14,
          border: `1px solid ${A_COLORS.hairline}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: A_FONTS.body, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: A_COLORS.inkSoft }}>Waist</div>
              <div style={{ fontFamily: A_FONTS.display, fontSize: 36, fontStyle: 'italic', color: A_COLORS.ink, lineHeight: 1, marginTop: 6 }}>
                84<span style={{ fontSize: 14, color: A_COLORS.inkSoft, marginLeft: 4 }}>cm</span>
              </div>
            </div>
            <div style={{ fontFamily: A_FONTS.body, fontSize: 13, color: A_COLORS.forest, fontWeight: 600 }}>−3 cm</div>
          </div>
          <button style={{
            marginTop: 16, width: '100%', padding: 14, borderRadius: 16,
            background: A_COLORS.bg, border: `1px dashed ${A_COLORS.inkFaint}`,
            fontFamily: A_FONTS.body, fontSize: 13, color: A_COLORS.inkSoft, cursor: 'pointer',
          }}>+ Log this week</button>
        </div>

        {/* habit history */}
        <div style={{
          background: A_COLORS.paper, borderRadius: 24, padding: 22, marginBottom: 14,
          border: `1px solid ${A_COLORS.hairline}`,
        }}>
          <div style={{ fontFamily: A_FONTS.body, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: A_COLORS.inkSoft, marginBottom: 18 }}>This week</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 110 }}>
            {WEEK_HISTORY.map((d, i) => {
              const h = (d.done / 14) * 100;
              const today = i === 6;
              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: '100%', height: `${h}%`, borderRadius: 8,
                    background: today ? A_COLORS.lime : A_COLORS.forest,
                    opacity: today ? 1 : 0.85,
                    position: 'relative',
                  }}>
                    {today && <div style={{
                      position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                      fontFamily: A_FONTS.body, fontSize: 11, fontWeight: 600, color: A_COLORS.forest,
                    }}>{d.done}</div>}
                  </div>
                  <div style={{
                    fontFamily: A_FONTS.body, fontSize: 11,
                    color: today ? A_COLORS.ink : A_COLORS.inkSoft,
                    fontWeight: today ? 600 : 400,
                  }}>{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* circle leaderboard */}
        <div style={{
          background: A_COLORS.paper, borderRadius: 24, padding: 22,
          border: `1px solid ${A_COLORS.hairline}`,
        }}>
          <div style={{ fontFamily: A_FONTS.body, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: A_COLORS.inkSoft, marginBottom: 14 }}>Circle streaks</div>
          {[...GROUP].sort((a, b) => b.streak - a.streak).slice(0, 4).map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${A_COLORS.hairline}`,
            }}>
              <div style={{
                width: 18, fontFamily: A_FONTS.display, fontStyle: 'italic',
                fontSize: 18, color: A_COLORS.inkSoft,
              }}>{i + 1}</div>
              <div style={{
                width: 32, height: 32, borderRadius: 16, background: m.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: A_FONTS.body, fontSize: 11, fontWeight: 600, color: A_COLORS.ink,
              }}>{m.initials}</div>
              <div style={{ flex: 1, fontFamily: A_FONTS.body, fontSize: 14, color: A_COLORS.ink, fontWeight: m.id === 'me' ? 600 : 400 }}>
                {m.name}{m.id === 'me' && <span style={{ color: A_COLORS.inkSoft, fontWeight: 400 }}> · you</span>}
              </div>
              <div style={{
                fontFamily: A_FONTS.body, fontSize: 14, fontWeight: 600,
                color: A_COLORS.forest, fontVariantNumeric: 'tabular-nums',
              }}>{m.streak}d</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ALineChart({ data, min, max }) {
  const W = 320, H = 70, pad = 4;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - pad * 2));
  const ys = data.map(d => H - pad - ((d.kg - min) / (max - min)) * (H - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');
  const area = `${path} L ${xs[xs.length-1]} ${H} L ${xs[0]} ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <path d={area} fill={A_COLORS.lime} fillOpacity="0.15"/>
      <path d={path} stroke={A_COLORS.lime} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={i === xs.length - 1 ? 4 : 2.5}
          fill={i === xs.length - 1 ? A_COLORS.lime : 'none'}
          stroke={A_COLORS.lime} strokeWidth="1.5"/>
      ))}
    </svg>
  );
}

// ─── main app ──────────────────────────────────────────
function FitCircleA() {
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
    const next = cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r];
    return { ...rx, [postId]: next };
  });

  return (
    <div style={{ height: '100%', background: A_COLORS.bg, position: 'relative' }}>
      {tab === 'today' && <ATodayScreen checked={checked} toggle={toggle} showNudge={showNudge} />}
      {tab === 'feed'  && <AFeedScreen reactions={reactions} addReaction={addReaction} />}
      {tab === 'stats' && <ATrackScreen />}
      <ATabBar active={tab} onChange={setTab} />
    </div>
  );
}

Object.assign(window, { FitCircleA });
