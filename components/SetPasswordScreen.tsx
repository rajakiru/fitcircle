'use client';

import { useState } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { updatePassword } from '@/lib/supabase';

type Props = { onDone: () => void };

export default function SetPasswordScreen({ onDone }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) { setError(err.message); }
    else { onDone(); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.card,
    fontFamily: B_FONT, fontSize: 16, color: B_COLORS.ink,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: B_COLORS.bg, padding: '0 24px',
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: B_COLORS.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="5" y="13" width="18" height="12" rx="2" stroke="white" strokeWidth="2"/>
            <path d="M9 13V9a5 5 0 0110 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.5 }}>
          Set new password
        </div>
        <div style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, marginTop: 6 }}>
          Choose a new password for your account.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <input
          type="password" placeholder="New password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={inputStyle}
        />
        <input
          type="password" placeholder="Confirm password" value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={inputStyle}
        />
      </div>

      {error && (
        <div style={{ marginTop: 12, fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, width: '100%' }}>
          {error}
        </div>
      )}

      <button onClick={submit} disabled={loading} style={{
        marginTop: 20, width: '100%', padding: '15px 0',
        borderRadius: 14, border: 'none', cursor: loading ? 'default' : 'pointer',
        background: loading ? B_COLORS.greenSoft : B_COLORS.green,
        color: loading ? B_COLORS.inkSoft : '#fff',
        fontFamily: B_FONT, fontSize: 16, fontWeight: 600,
      }}>
        {loading ? 'Saving…' : 'Update password'}
      </button>
    </div>
  );
}
