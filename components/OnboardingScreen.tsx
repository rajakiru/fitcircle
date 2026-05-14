'use client';

import { useState } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { upsertProfile, createGroup, joinGroup } from '@/lib/supabase';

const TINTS = ['#0F4C3A', '#FF2D55', '#007AFF', '#FF9500', '#AF52DE', '#34C759'];

type Props = { userId: string; onComplete: () => void };

export default function OnboardingScreen({ userId, onComplete }: Props) {
  const [step, setStep] = useState<'profile' | 'group'>('profile');
  const [name, setName] = useState('');
  const [tint, setTint] = useState(TINTS[0]);
  const [groupMode, setGroupMode] = useState<'create' | 'join'>('create');
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    if (!name.trim()) { setError('Enter your name.'); return; }
    setError('');
    setLoading(true);
    try {
      await upsertProfile(userId, { name: name.trim(), tint });
      setStep('group');
    } finally {
      setLoading(false);
    }
  };

  const saveGroup = async () => {
    setError('');
    if (!inviteCode.trim()) { setError('Enter an invite code.'); return; }
    setLoading(true);
    try {
      const g = await joinGroup(inviteCode.trim(), userId);
      if (!g) { setError('Invalid invite code — ask your circle admin.'); return; }
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    borderRadius: 12, border: `1px solid ${B_COLORS.hairline}`,
    background: B_COLORS.card, fontFamily: B_FONT, fontSize: 16,
    color: B_COLORS.ink, outline: 'none', boxSizing: 'border-box',
    textTransform: groupMode === 'join' ? 'uppercase' : 'none',
    letterSpacing: groupMode === 'join' ? 2 : 0,
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: B_COLORS.bg, overflowY: 'auto',
    }}>
      <div style={{ padding: '60px 24px 40px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.green, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
          STEP {step === 'profile' ? '1' : '2'} OF 2
        </div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.5, marginBottom: 6 }}>
          {step === 'profile' ? 'Your profile' : 'Your circle'}
        </div>
        <div style={{ fontFamily: B_FONT, fontSize: 15, color: B_COLORS.inkSoft }}>
          {step === 'profile'
            ? 'How should your circle know you?'
            : 'Create a new circle or join an existing one.'}
        </div>
      </div>

      <div style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {step === 'profile' ? (
          <>
            <input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              autoFocus
            />
            <div>
              <div style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Colour
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {TINTS.map(t => (
                  <button key={t} onClick={() => setTint(t)}
                    style={{
                      width: 36, height: 36, borderRadius: 18, border: 'none', cursor: 'pointer',
                      background: t, flexShrink: 0,
                      outline: tint === t ? `3px solid ${B_COLORS.ink}` : '3px solid transparent',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <input
              placeholder="INVITE CODE"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              style={inputStyle}
              maxLength={6}
              autoFocus
            />
            <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>
              Ask your circle admin for the 6-letter code.
            </div>
          </>
        )}

        {error && (
          <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red }}>{error}</div>
        )}

        <button
          onClick={step === 'profile' ? saveProfile : saveGroup}
          disabled={loading}
          style={{
            padding: '15px 0', borderRadius: 14, border: 'none',
            cursor: loading ? 'default' : 'pointer',
            background: loading ? B_COLORS.greenSoft : B_COLORS.green,
            color: loading ? B_COLORS.inkSoft : '#fff',
            fontFamily: B_FONT, fontSize: 16, fontWeight: 600,
          }}
        >
          {loading ? 'Please wait…' : step === 'profile' ? 'Continue' : 'Get started'}
        </button>

        {step === 'group' && (
          <button
            onClick={onComplete}
            style={{
              padding: '12px 0', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: B_FONT, fontSize: 14,
              color: B_COLORS.inkSoft,
            }}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
