'use client';

import { useState, useEffect, useCallback } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { CHECKLIST_ITEMS } from '@/lib/data';
import { todayISO } from '@/lib/storage';
import {
  getMemberProgress, getFeedPosts, addReaction as addReactionDB,
  updateFeedPost, deleteFeedPost,
  type Profile, type FeedPost,
} from '@/lib/supabase';

type MemberProgress = { profile: Profile; done: number; pct: number };

type Props = { userId: string; groupId: string | null };

const EMOJI_OPTIONS = ['❤️', '🔥', '💪', '👏', '😍'];

function Avatar({ name, tint, size = 36 }: { name: string; tint: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontFamily: B_FONT, fontSize: size * 0.38, fontWeight: 700, color: '#fff' }}>{initials}</span>
    </div>
  );
}

function NoGroupCard() {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👩‍👩‍👧</div>
      <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: B_COLORS.ink, marginBottom: 8 }}>
        No circle yet
      </div>
      <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, lineHeight: 1.5 }}>
        Create or join a circle from your Profile tab to see your group&apos;s progress here.
      </div>
    </div>
  );
}

export default function FeedScreen({ userId, groupId }: Props) {
  const [members, setMembers] = useState<MemberProgress[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const load = useCallback(async () => {
    if (!groupId) { setLoading(false); return; }
    setLoading(true);
    const [ms, ps] = await Promise.all([
      getMemberProgress(groupId, todayISO(), CHECKLIST_ITEMS.length),
      getFeedPosts(groupId),
    ]);
    setMembers(ms);
    setPosts(ps);
    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const handleReact = async (postId: string, emoji: string) => {
    await addReactionDB(postId, userId, emoji);
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const cur = p.reactions[emoji] ?? [];
      const next = cur.includes(userId)
        ? cur.filter(id => id !== userId)
        : [...cur, userId];
      return { ...p, reactions: { ...p.reactions, [emoji]: next } };
    }));
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    await deleteFeedPost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setMenuPostId(null);
  };

  const handleEdit = async (postId: string) => {
    await updateFeedPost(postId, editCaption);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, caption: editCaption } : p));
    setEditingPostId(null);
    setMenuPostId(null);
  };

  const loggedCount = members.filter(m => m.done > 0).length;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>
            YOUR CIRCLE{members.length > 0 ? ` · ${members.length}` : ''}
          </div>
          <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>
            Circle
          </div>
        </div>
        <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15.5 9A6.5 6.5 0 1 1 9 2.5c2 0 3.8.9 5 2.3" stroke={B_COLORS.green} strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M14 2v3h3" stroke={B_COLORS.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {!groupId ? (
        <NoGroupCard />
      ) : loading ? (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>
          Loading…
        </div>
      ) : (
        <>
          {/* Today's progress strip */}
          {members.length > 0 && (
            <div style={{ padding: '8px 16px 0' }}>
              <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{
                  fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.ink,
                  marginBottom: 14, display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>Today&apos;s progress</span>
                  <span style={{ color: B_COLORS.inkSoft, fontWeight: 400 }}>{loggedCount} of {members.length} logged</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {members.map(({ profile, done, pct }) => {
                    const circ = 2 * Math.PI * 17;
                    return (
                      <div key={profile.id} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }}>
                            <circle cx="20" cy="20" r="17" stroke={B_COLORS.hairline} strokeWidth="3" fill="none" />
                            {done > 0 && (
                              <circle cx="20" cy="20" r="17" stroke={B_COLORS.green} strokeWidth="3" fill="none"
                                strokeLinecap="round" strokeDasharray={circ}
                                strokeDashoffset={circ * (1 - pct)} transform="rotate(-90 20 20)" />
                            )}
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar name={profile.name} tint={profile.tint} size={28} />
                          </div>
                        </div>
                        <div style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft, marginTop: 6 }}>
                          {profile.name.split(' ')[0].slice(0, 6)}
                        </div>
                        <div style={{ fontFamily: B_FONT, fontSize: 11, fontWeight: 600, color: B_COLORS.ink, marginTop: 1 }}>
                          {Math.round(pct * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Feed */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{
              fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
              padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
            }}>
              Recent
            </div>
            {posts.length === 0 ? (
              <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>
                  Nothing here yet. Start logging!
                </div>
              </div>
            ) : (
              <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
                {posts.map((post, i) => {
                  const member = post.profile;
                  const isOwner = post.user_id === userId;
                  const menuOpen = menuPostId === post.id;
                  const isEditing = editingPostId === post.id;
                  const myReactions = Object.entries(post.reactions)
                    .filter(([, ids]) => (ids as string[]).includes(userId))
                    .map(([e]) => e);
                  return (
                    <div key={post.id} style={{
                      padding: '14px 16px',
                      borderBottom: i === posts.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
                    }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        {member && <Avatar name={member.name} tint={member.tint} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink }}>
                            {member?.name ?? 'Member'}
                          </div>
                          <div style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft, marginTop: 1 }}>
                            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {isOwner && (
                          <div style={{ position: 'relative' }}>
                            <button onClick={() => setMenuPostId(menuOpen ? null : post.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8 }}>
                              <span style={{ fontFamily: B_FONT, fontSize: 18, color: B_COLORS.inkSoft, letterSpacing: 1 }}>•••</span>
                            </button>
                            {menuOpen && (
                              <div style={{
                                position: 'absolute', right: 0, top: 30, zIndex: 10,
                                background: '#fff', borderRadius: 12, overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 130,
                              }}>
                                <button onClick={() => { setEditingPostId(post.id); setEditCaption(post.caption ?? ''); setMenuPostId(null); }}
                                  style={{
                                    width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                                    cursor: 'pointer', textAlign: 'left',
                                    fontFamily: B_FONT, fontSize: 14, color: B_COLORS.ink,
                                    borderBottom: `0.5px solid ${B_COLORS.hairline}`,
                                  }}>Edit caption</button>
                                <button onClick={() => handleDelete(post.id)}
                                  style={{
                                    width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                                    cursor: 'pointer', textAlign: 'left',
                                    fontFamily: B_FONT, fontSize: 14, color: B_COLORS.red,
                                  }}>Delete post</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Caption / edit */}
                      {isEditing ? (
                        <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
                          <input
                            value={editCaption}
                            onChange={e => setEditCaption(e.target.value)}
                            autoFocus
                            style={{
                              flex: 1, padding: '8px 12px', borderRadius: 10,
                              border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.bg,
                              fontFamily: B_FONT, fontSize: 14, color: B_COLORS.ink, outline: 'none',
                            }}
                          />
                          <button onClick={() => handleEdit(post.id)}
                            style={{ padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: B_COLORS.green, color: '#fff', fontFamily: B_FONT, fontSize: 13, fontWeight: 600 }}>
                            Save
                          </button>
                          <button onClick={() => setEditingPostId(null)}
                            style={{ padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: B_COLORS.bg, color: B_COLORS.inkSoft, fontFamily: B_FONT, fontSize: 13 }}>
                            ✕
                          </button>
                        </div>
                      ) : post.caption ? (
                        <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.ink, marginBottom: 8 }}>
                          {post.caption}
                        </div>
                      ) : null}

                      {post.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.image_url} alt="meal"
                          style={{ width: '100%', borderRadius: 10, marginBottom: 8, display: 'block' }} />
                      )}
                      {/* Reactions */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {EMOJI_OPTIONS.map(e => {
                          const count = (post.reactions[e] as string[] | undefined)?.length ?? 0;
                          const mine = myReactions.includes(e);
                          return (
                            <button key={e} onClick={() => handleReact(post.id, e)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                padding: '3px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: mine ? B_COLORS.greenSoft : B_COLORS.bg,
                              }}>
                              <span style={{ fontSize: 14 }}>{e}</span>
                              {count > 0 && (
                                <span style={{ fontFamily: B_FONT, fontSize: 11, fontWeight: 600, color: mine ? B_COLORS.green : B_COLORS.inkSoft }}>
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
