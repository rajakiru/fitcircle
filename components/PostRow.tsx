import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { FeedPost, GROUP } from '@/lib/data';

type Props = {
  post: FeedPost;
  isLast: boolean;
  myReactions: string[];
  onReact: (r: string) => void;
};

export default function PostRow({ post, isLast, myReactions, onReact }: Props) {
  const member = GROUP.find(g => g.id === post.who)!;

  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
    }}>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 14, background: member.tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: B_FONT, fontSize: 11, fontWeight: 700, color: B_COLORS.ink, flexShrink: 0,
        }}>
          {member.initials}
        </div>
        <span style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink, letterSpacing: -0.2 }}>
          {member.name}
        </span>
        <span style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft }}>·</span>
        <span style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft }}>{post.when}</span>
        <div style={{ flex: 1 }} />
        {post.kind === 'meal' && post.label && (
          <span style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 700, color: B_COLORS.inkSoft, letterSpacing: 0.6 }}>
            {post.label}
          </span>
        )}
      </div>

      {/* Meal photo */}
      {post.kind === 'meal' && (
        <div style={{ height: 180, borderRadius: 10, background: post.bg, marginBottom: 10, position: 'relative' }}>
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            color: '#fff', borderRadius: 8, padding: '4px 9px',
            fontFamily: B_FONT, fontSize: 11, fontWeight: 600,
          }}>
            ✓ {post.doneToday}/14
          </div>
        </div>
      )}

      {/* Streak badge */}
      {post.kind === 'streak' && (
        <div style={{
          height: 90, borderRadius: 10, background: B_COLORS.greenSoft, marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 48, fontWeight: 700, color: B_COLORS.green, letterSpacing: -1 }}>
            {post.streak}
          </div>
          <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.green, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', lineHeight: 1.4 }}>
            day<br />streak
          </div>
        </div>
      )}

      {/* Weigh-in */}
      {post.kind === 'weigh' && (
        <div style={{
          height: 70, borderRadius: 10, background: B_COLORS.bg, marginBottom: 10,
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Weight
            </div>
            <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.4 }}>
              {post.weight} <span style={{ fontSize: 12, color: B_COLORS.inkSoft, fontWeight: 500 }}>kg</span>
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 8, background: B_COLORS.greenSoft,
            fontFamily: B_FONT, fontSize: 12, fontWeight: 700, color: B_COLORS.green,
          }}>
            {post.delta} kg this week
          </div>
        </div>
      )}

      {/* Caption */}
      <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.ink, lineHeight: 1.4, letterSpacing: -0.2, marginBottom: 10 }}>
        {post.caption}
      </div>

      {/* Reactions */}
      <div style={{ display: 'flex', gap: 6 }}>
        {['🔥', '👏', '💚'].map(r => {
          const on = myReactions.includes(r);
          const count = (post.reactions[r] ?? 0) + (on ? 1 : 0);
          return (
            <button
              key={r}
              onClick={() => onReact(r)}
              style={{
                background: on ? B_COLORS.greenSoft : B_COLORS.bg,
                border: 'none', borderRadius: 8, padding: '5px 9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: B_FONT, fontSize: 12, fontWeight: 600,
                color: on ? B_COLORS.green : B_COLORS.ink2,
              }}
            >
              <span>{r}</span>
              {count > 0 && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
