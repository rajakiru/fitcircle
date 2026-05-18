'use client';

import { useState } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { signIn, signUp, resetPassword } from '@/lib/supabase';

type Props = { onSuccess: () => void };

type Mode = 'signin' | 'signup' | 'forgot';
type Done = 'none' | 'signup_confirm' | 'reset_sent';

const Logo = () => (
  <div style={{ marginBottom: 40, textAlign: 'center' }}>
    <div style={{
      width: 64, height: 64, borderRadius: 20, background: B_COLORS.green,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px',
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="2" fill="none"
          strokeDasharray="10 28" strokeDashoffset="-3" transform="rotate(-90 16 16)" />
      </svg>
    </div>
    <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.5 }}>
      FitCircle
    </div>
    <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, marginTop: 4 }}>
      Track habits together
    </div>
  </div>
);

export default function LoginScreen({ onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('signin');
  const [done, setDone] = useState<Done>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = (m: Mode) => { setMode(m); setError(''); setDone('none'); };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.card,
    fontFamily: B_FONT, fontSize: 16, color: B_COLORS.ink,
    outline: 'none', boxSizing: 'border-box',
  };

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        if (!email) { setError('Enter your email.'); return; }
        const { error: err } = await resetPassword(email);
        if (err) { setError(err.message); }
        else { setDone('reset_sent'); }
      } else {
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        const { error: err } = mode === 'signin'
          ? await signIn(email, password)
          : await signUp(email, password);
        if (err) { setError(err.message); }
        else if (mode === 'signup') { setDone('signup_confirm'); }
        else { onSuccess(); }
      }
    } finally {
      setLoading(false);
    }
  };

  const wrap = (children: React.ReactNode) => (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: B_COLORS.bg, padding: '0 24px',
    }}>
      {children}
    </div>
  );

  // ── Success screens ───────────────────────────────────────────────────────────

  if (done === 'signup_confirm') return wrap(
    <>
      <Logo />
      <div style={{ width: '100%', background: B_COLORS.card, borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>📬</div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: B_COLORS.ink, marginBottom: 8 }}>
          Check your inbox
        </div>
        <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, lineHeight: 1.6, marginBottom: 24 }}>
          We sent a confirmation link to{' '}
          <span style={{ fontWeight: 600, color: B_COLORS.ink }}>{email}</span>.
          {' '}Click it to activate your account, then sign in.
        </div>
        <button onClick={() => reset('signin')} style={{
          width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
          cursor: 'pointer', background: B_COLORS.green, color: '#fff',
          fontFamily: B_FONT, fontSize: 15, fontWeight: 600,
        }}>Back to sign in</button>
      </div>
    </>
  );

  if (done === 'reset_sent') return wrap(
    <>
      <Logo />
      <div style={{ width: '100%', background: B_COLORS.card, borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🔑</div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: B_COLORS.ink, marginBottom: 8 }}>
          Reset link sent
        </div>
        <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, lineHeight: 1.6, marginBottom: 24 }}>
          We sent a password reset link to{' '}
          <span style={{ fontWeight: 600, color: B_COLORS.ink }}>{email}</span>.
          {' '}Check your inbox and follow the instructions.
        </div>
        <button onClick={() => reset('signin')} style={{
          width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
          cursor: 'pointer', background: B_COLORS.green, color: '#fff',
          fontFamily: B_FONT, fontSize: 15, fontWeight: 600,
        }}>Back to sign in</button>
      </div>
    </>
  );

  // ── Forgot password ───────────────────────────────────────────────────────────

  if (mode === 'forgot') return wrap(
    <>
      <Logo />
      <div style={{ width: '100%' }}>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: B_COLORS.ink, marginBottom: 6 }}>
          Reset password
        </div>
        <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, marginBottom: 24, lineHeight: 1.5 }}>
          Enter your email and we&apos;ll send you a reset link.
        </div>
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ ...inputStyle, marginBottom: 12 }}
        />
        {error && (
          <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, marginBottom: 12 }}>{error}</div>
        )}
        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
          cursor: loading ? 'default' : 'pointer',
          background: loading ? B_COLORS.greenSoft : B_COLORS.green,
          color: loading ? B_COLORS.inkSoft : '#fff',
          fontFamily: B_FONT, fontSize: 16, fontWeight: 600, marginBottom: 16,
        }}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <button onClick={() => reset('signin')} style={{
          width: '100%', padding: '12px 0', borderRadius: 14, border: 'none',
          cursor: 'pointer', background: 'none',
          fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft,
        }}>← Back to sign in</button>
      </div>
    </>
  );

  // ── Sign in / Sign up ─────────────────────────────────────────────────────────

  return wrap(
    <>
      <Logo />

      <div style={{
        display: 'flex', background: B_COLORS.card, borderRadius: 10,
        padding: 3, marginBottom: 24, width: '100%',
      }}>
        {(['signin', 'signup'] as const).map(m => (
          <button key={m} onClick={() => reset(m)} style={{
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={inputStyle}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={inputStyle}
        />
      </div>

      {mode === 'signin' && (
        <button onClick={() => reset('forgot')} style={{
          marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft,
          alignSelf: 'flex-end', padding: '2px 0',
        }}>Forgot password?</button>
      )}

      {error && (
        <div style={{
          marginTop: 10, fontFamily: B_FONT, fontSize: 13,
          color: B_COLORS.red, textAlign: 'center', width: '100%',
        }}>{error}</div>
      )}

      <button onClick={submit} disabled={loading} style={{
        marginTop: 20, width: '100%', padding: '15px 0',
        borderRadius: 14, border: 'none', cursor: loading ? 'default' : 'pointer',
        background: loading ? B_COLORS.greenSoft : B_COLORS.green,
        color: loading ? B_COLORS.inkSoft : '#fff',
        fontFamily: B_FONT, fontSize: 16, fontWeight: 600,
        transition: 'all 0.15s',
      }}>
        {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>
    </>
  );
}
