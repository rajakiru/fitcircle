import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { FEED, GROUP } from '@/lib/data';
import PostRow from './PostRow';

type Props = {
  reactions: Record<string, string[]>;
  addReaction: (postId: string, r: string) => void;
};

export default function FeedScreen({ reactions, addReaction }: Props) {
  const loggedCount = GROUP.filter(m => m.donePct > 0).length;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 8px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>
          YOUR CIRCLE · {GROUP.length}
        </div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>
          Circle
        </div>
      </div>

      {/* Today's progress strip */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '14px 16px' }}>
          <div style={{
            fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.ink,
            marginBottom: 14, display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Today&apos;s progress</span>
            <span style={{ color: B_COLORS.inkSoft, fontWeight: 400 }}>{loggedCount} of {GROUP.length} logged</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {GROUP.map(m => {
              const circumference = 2 * Math.PI * 17;
              return (
                <div key={m.id} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto' }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }}>
                      <circle cx="20" cy="20" r="17" stroke={B_COLORS.hairline} strokeWidth="3" fill="none" />
                      <circle
                        cx="20" cy="20" r="17"
                        stroke={B_COLORS.green} strokeWidth="3" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - m.donePct / 100)}
                        transform="rotate(-90 20 20)"
                      />
                    </svg>
                    <div style={{
                      position: 'absolute', top: 4, right: 4, bottom: 4, left: 4,
                      borderRadius: 16, background: m.tint,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: B_FONT, fontSize: 11, fontWeight: 700, color: B_COLORS.ink,
                    }}>
                      {m.initials}
                    </div>
                  </div>
                  <div style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft, marginTop: 6 }}>
                    {m.name.length > 6 ? m.name.slice(0, 5) : m.name}
                  </div>
                  <div style={{ fontFamily: B_FONT, fontSize: 11, fontWeight: 600, color: B_COLORS.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                    {m.donePct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
          padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
        }}>
          Recent
        </div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
          {FEED.map((post, i) => (
            <PostRow
              key={post.id}
              post={post}
              isLast={i === FEED.length - 1}
              myReactions={reactions[post.id] ?? []}
              onReact={r => addReaction(post.id, r)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
