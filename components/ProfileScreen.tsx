'use client';

import { useState, useEffect } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { signOut, getProfile, getGroup, getGroupMembers, upsertProfile, createGroup, joinGroup, leaveGroup, deleteGroup, removeFromGroup, deleteAccount, type Profile, type Group } from '@/lib/supabase';

const TINTS = ['#0F4C3A', '#FF2D55', '#007AFF', '#FF9500', '#AF52DE', '#34C759'];

type Props = { userId: string; onSignOut: () => void };

function NoCircleCard({ userId, onCreated, onJoined }: {
  userId: string;
  onCreated: (g: Group, ms: Profile[]) => void;
  onJoined: (g: Group, ms: Profile[]) => void;
}) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        if (!value.trim()) { setError('Enter a circle name.'); return; }
        const g = await createGroup(value.trim(), userId);
        if (!g) { setError('Could not create circle.'); return; }
        const ms = await getGroupMembers(g.id);
        onCreated(g, ms);
      } else {
        if (!value.trim()) { setError('Enter an invite code.'); return; }
        const g = await joinGroup(value.trim(), userId);
        if (!g) { setError('Invalid invite code.'); return; }
        const ms = await getGroupMembers(g.id);
        onJoined(g, ms);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: B_COLORS.card, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', background: B_COLORS.bg, borderRadius: 10, padding: 3, marginBottom: 14 }}>
          {(['create', 'join'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setValue(''); setError(''); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: B_FONT, fontSize: 13, fontWeight: 600,
                background: mode === m ? B_COLORS.green : 'transparent',
                color: mode === m ? '#fff' : B_COLORS.inkSoft,
              }}>
              {m === 'create' ? 'Create circle' : 'Join circle'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, paddingBottom: 16 }}>
          <input
            placeholder={mode === 'create' ? 'Circle name' : 'INVITE CODE'}
            value={value}
            onChange={e => setValue(mode === 'join' ? e.target.value.toUpperCase() : e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            maxLength={mode === 'join' ? 6 : undefined}
            style={{
              flex: 1, padding: '11px 14px', borderRadius: 10,
              border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.bg,
              fontFamily: B_FONT, fontSize: 15, color: B_COLORS.ink, outline: 'none',
              letterSpacing: mode === 'join' ? 2 : 0,
            }}
          />
          <button onClick={submit} disabled={loading} style={{
            padding: '11px 18px', borderRadius: 10, border: 'none',
            cursor: loading ? 'default' : 'pointer',
            background: B_COLORS.green, color: '#fff',
            fontFamily: B_FONT, fontSize: 14, fontWeight: 600,
          }}>
            {loading ? '…' : mode === 'create' ? 'Create' : 'Join'}
          </button>
        </div>
      </div>
      {error && <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, padding: '0 16px 14px' }}>{error}</div>}
    </div>
  );
}

function Avatar({ name, tint, size = 40 }: { name: string; tint: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: B_FONT, fontSize: size * 0.38, fontWeight: 700, color: '#fff' }}>
        {initials || '?'}
      </span>
    </div>
  );
}

export default function ProfileScreen({ userId, onSignOut }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTint, setEditTint] = useState(TINTS[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      let p = await getProfile(userId);
      if (!p) {
        await upsertProfile(userId, { name: '', tint: '#0F4C3A' });
        p = await getProfile(userId);
      }
      if (!p) return;
      setProfile(p);
      setEditName(p.name);
      setEditTint(p.tint);
      if (p.group_id) {
        const [g, ms] = await Promise.all([getGroup(p.group_id), getGroupMembers(p.group_id)]);
        setGroup(g);
        setMembers(ms);
      }
    })();
  }, [userId]);

  const saveEdit = async () => {
    await upsertProfile(userId, { name: editName.trim(), tint: editTint });
    setProfile(p => p ? { ...p, name: editName.trim(), tint: editTint } : p);
    setEditing(false);
  };

  const copyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!profile) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: B_COLORS.bg }}>
        <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>Loading…</span>
      </div>
    );
  }

  const activeTint = editing ? editTint : profile.tint;

  return (
    <div style={{ background: B_COLORS.bg, minHeight: '100%', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ padding: '52px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.5 }}>
          Profile
        </div>
        <button
          onClick={() => { setEditing(e => !e); setEditName(profile.name); setEditTint(profile.tint); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 15, color: B_COLORS.green, fontWeight: 600 }}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Profile card */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 16, overflow: 'hidden' }}>
          {/* Colored accent bar */}
          <div style={{ height: 5, background: activeTint }} />
          <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar name={editing ? editName : profile.name} tint={activeTint} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                    border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.bg,
                    fontFamily: B_FONT, fontSize: 17, fontWeight: 600, color: B_COLORS.ink, outline: 'none',
                  }}
                />
              ) : (
                <>
                  <div style={{ fontFamily: B_FONT, fontSize: 22, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.3 }}>
                    {profile.name || 'No name'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    {group && (
                      <div style={{
                        width: 8, height: 8, borderRadius: 4, background: B_COLORS.green, flexShrink: 0,
                      }} />
                    )}
                    <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>
                      {group?.name ?? 'No circle'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {editing && (
            <div style={{ padding: '0 16px 20px' }}>
              <div style={{ fontFamily: B_FONT, fontSize: 12, fontWeight: 600, color: B_COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>
                Colour
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {TINTS.map(t => (
                  <button key={t} onClick={() => setEditTint(t)}
                    style={{
                      width: 32, height: 32, borderRadius: 16, border: 'none', cursor: 'pointer',
                      background: t, outline: editTint === t ? `3px solid ${B_COLORS.ink}` : '3px solid transparent',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
              <button onClick={saveEdit}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
                  cursor: 'pointer', background: B_COLORS.green, color: '#fff',
                  fontFamily: B_FONT, fontSize: 16, fontWeight: 600,
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Circle section */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08 }}>
          Your Circle
        </div>

        {!group ? (
          <NoCircleCard
            userId={userId}
            onCreated={(g, ms) => { setGroup(g); setMembers(ms); }}
            onJoined={(g, ms) => { setGroup(g); setMembers(ms); }}
          />
        ) : (
          <>
            {/* Invite code card */}
            <div style={{ background: B_COLORS.card, borderRadius: 16, padding: '16px', marginBottom: 10 }}>
              <div style={{ fontFamily: B_FONT, fontSize: 12, fontWeight: 600, color: B_COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>
                {group.name} · Invite code
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  flex: 1, background: B_COLORS.bg, borderRadius: 10, padding: '12px 14px',
                  fontFamily: B_FONT, fontSize: 22, fontWeight: 700, color: B_COLORS.green,
                  letterSpacing: 6,
                }}>
                  {group.invite_code}
                </div>
                <button onClick={copyCode} style={{
                  padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: copied ? B_COLORS.greenSoft : B_COLORS.bg,
                  fontFamily: B_FONT, fontSize: 13, fontWeight: 600,
                  color: copied ? B_COLORS.green : B_COLORS.inkSoft,
                  transition: 'background 0.15s',
                  flexShrink: 0,
                }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkFaint, marginTop: 8 }}>
                Share this code so others can join your circle
              </div>
            </div>

            {/* Members card */}
            <div style={{ background: B_COLORS.card, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{
                padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: `0.5px solid ${B_COLORS.hairline}`,
              }}>
                <span style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Members
                </span>
                <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>
                  {members.length}
                </span>
              </div>

              {members.map((m, i) => (
                <div key={m.id} style={{
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: i === members.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
                }}>
                  <Avatar name={m.name} tint={m.tint} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: B_FONT, fontSize: 15, fontWeight: 600, color: B_COLORS.ink }}>
                      {m.name || 'Member'}
                    </div>
                    {m.id === userId && (
                      <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 1 }}>you</div>
                    )}
                  </div>
                  {group?.created_by === userId && m.id !== userId && (
                    <button onClick={async () => {
                      if (!confirm(`Remove ${m.name || 'this member'} from the circle?`)) return;
                      await removeFromGroup(m.id);
                      setMembers(prev => prev.filter(x => x.id !== m.id));
                    }} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: B_FONT, fontSize: 12, fontWeight: 600, color: B_COLORS.red,
                      padding: '4px 8px', borderRadius: 8,
                    }}>Remove</button>
                  )}
                </div>
              ))}

              {/* Leave / Delete */}
              <div style={{ borderTop: `0.5px solid ${B_COLORS.hairline}` }}>
                {group.created_by === userId ? (
                  <button onClick={async () => {
                    if (!confirm('Delete this circle? All members will be removed.')) return;
                    await deleteGroup(group.id);
                    setGroup(null); setMembers([]);
                  }} style={{
                    width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.red,
                  }}>
                    Delete circle
                  </button>
                ) : (
                  <button onClick={async () => {
                    if (!confirm('Leave this circle?')) return;
                    await leaveGroup(userId);
                    setGroup(null); setMembers([]);
                  }} style={{
                    width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.red,
                  }}>
                    Leave circle
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Account section */}
      <div style={{ padding: '28px 16px 0' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08 }}>
          Account
        </div>
        <div style={{ background: B_COLORS.card, borderRadius: 16, overflow: 'hidden' }}>
          <button
            onClick={async () => { await signOut(); onSignOut(); }}
            style={{
              width: '100%', padding: '16px', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `0.5px solid ${B_COLORS.hairline}`,
            }}
          >
            <span style={{ fontFamily: B_FONT, fontSize: 15, fontWeight: 600, color: B_COLORS.red }}>Sign out</span>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1l5 5-5 5" stroke={B_COLORS.inkFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={async () => {
              if (!confirm('Permanently delete your account? This cannot be undone.')) return;
              await deleteAccount();
              onSignOut();
            }}
            style={{
              width: '100%', padding: '16px', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{ fontFamily: B_FONT, fontSize: 15, color: B_COLORS.inkSoft }}>Delete account</span>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1l5 5-5 5" stroke={B_COLORS.inkFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
