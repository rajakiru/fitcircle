'use client';

import { useState } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { signIn, signUp } from '@/lib/supabase';

type Props = { onSuccess: () => void };

export default function LoginScreen({ onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { error: err } = mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password);
      if (err) { setError(err.message); }
      else { onSuccess(); }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    borderRadius: 12, border: `1px solid ${B_COLORS.hairline}`,
    background: B_COLORS.card, fontFamily: B_FONT, fontSize: 16,
    color: B_COLORS.ink, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: B_COLORS.bg, padding: '0 24px',
    }}>
      {/* Logo / wordmark */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: B_COLORS.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="2" fill="none" strokeDasharray="10 28" strokeDashoffset="-3"
              transform="rotate(-90 16 16)" />
          </svg>
        </div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.5 }}>
          FitCircle
        </div>
        <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, marginTop: 4 }}>
          Track habits together
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'flex', background: B_COLORS.card, borderRadius: 10,
        padding: 3, marginBottom: 24, width: '100%',
      }}>
        {(['signin', 'signup'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(''); }}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontFamily: B_FONT, fontSize: 14, fontWeight: 600,
              background: mode === m ? B_COLORS.green : 'transparent',
              color: mode === m ? '#fff' : B_COLORS.inkSoft,
              transition: 'all 0.15s',
            }}>
            {m === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </div>

      {error && (
        <div style={{
          marginTop: 12, fontFamily: B_FONT, fontSize: 13,
          color: B_COLORS.red, textAlign: 'center',
        }}>{error}</div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        style={{
          marginTop: 20, width: '100%', padding: '15px 0',
          borderRadius: 14, border: 'none', cursor: loading ? 'default' : 'pointer',
          background: loading ? B_COLORS.greenSoft : B_COLORS.green,
          color: loading ? B_COLORS.inkSoft : '#fff',
          fontFamily: B_FONT, fontSize: 16, fontWeight: 600,
          transition: 'all 0.15s',
        }}
      >
        {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>
    </div>
  );
}
