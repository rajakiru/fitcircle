'use client';

import { useState, useEffect } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { CHECKLIST_ITEMS } from '@/lib/data';
import { todayISO, isoToDate } from '@/lib/storage';
import {
  getMonthCompletion, getBodyStats, upsertBodyStat, deleteBodyStat, getWeekHistory, getMemberStreaks,
  type BodyStat, type Profile,
} from '@/lib/supabase';
import MonthCalendar from './MonthCalendar';

type Props = { userId: string; groupId: string | null; onJumpToDate: (date: string) => void };

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function sectionHeader(title: string, right?: React.ReactNode) {
  return (
    <div style={{
      fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
      padding: '0 4px 8px', textTransform: 'uppercase' as const, letterSpacing: -0.08,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span>{title}</span>
      {right}
    </div>
  );
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function BarChart({ points, color, unit }: { points: { label: string; value: number }[]; color: string; unit: string }) {
  if (points.length === 0) return null;
  const vals = points.map(p => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const BAR_H = 64;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: BAR_H + 32 }}>
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          const h = Math.max(8, ((p.value - min) / range) * BAR_H * 0.8 + BAR_H * 0.2);
          return (
            <div key={p.label + i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }}>
              <span style={{ fontFamily: B_FONT, fontSize: 9, color: B_COLORS.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
                {isLast ? `${p.value}` : ''}
              </span>
              <div style={{ width: '100%', height: h, borderRadius: 4, background: isLast ? color : `${color}55` }} />
              <span style={{ fontFamily: B_FONT, fontSize: 9, color: isLast ? B_COLORS.ink : B_COLORS.inkSoft, fontWeight: isLast ? 600 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                {p.label.split(' ')[1]}
                <br />{p.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft, marginTop: 4, textAlign: 'right' }}>{unit}</div>
    </div>
  );
}

function toBarPoints(logs: BodyStat[], field: 'weight' | 'waist'): { label: string; value: number }[] {
  return logs
    .filter(l => l[field] !== null)
    .slice(-10)
    .map(l => {
      const d = isoToDate(l.date);
      return { label: `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`, value: l[field] as number };
    });
}

export default function HistoryScreen({ userId, groupId, onJumpToDate }: Props) {
  const now = isoToDate(todayISO());

  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [completion, setCompletion] = useState<Record<string, number>>({});

  const [bodyLogs, setBodyLogs] = useState<BodyStat[]>([]);
  const [weekHistory, setWeekHistory] = useState<{ day: string; done: number; isToday: boolean }[]>([]);
  const [memberStreaks, setMemberStreaks] = useState<{ profile: Profile; streak: number }[]>([]);

  const [editingWeight, setEditingWeight] = useState(false);
  const [editingWaist,  setEditingWaist]  = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput,  setWaistInput]  = useState('');

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1;

  useEffect(() => {
    getMonthCompletion(userId, viewYear, viewMonth, CHECKLIST_ITEMS.length)
      .then(setCompletion);
  }, [userId, viewYear, viewMonth]);

  useEffect(() => {
    getBodyStats(userId).then(setBodyLogs);
    getWeekHistory(userId, 7, CHECKLIST_ITEMS.length).then(setWeekHistory);
  }, [userId]);

  useEffect(() => {
    if (!groupId) return;
    getMemberStreaks(groupId).then(setMemberStreaks);
  }, [groupId]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const reloadStats = async () => {
    const updated = await getBodyStats(userId);
    setBodyLogs(updated);
  };

  const saveWeight = async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w)) return;
    await upsertBodyStat(userId, todayISO(), { weight: w });
    await reloadStats();
    setWeightInput('');
    setEditingWeight(false);
  };

  const saveWaist = async () => {
    const c = parseFloat(waistInput);
    if (isNaN(c)) return;
    await upsertBodyStat(userId, todayISO(), { waist: c });
    await reloadStats();
    setWaistInput('');
    setEditingWaist(false);
  };

  const handleDeleteStat = async (id: string) => {
    await deleteBodyStat(id);
    await reloadStats();
  };

  const weightLogs = bodyLogs.filter(l => l.weight !== null);
  const waistLogs  = bodyLogs.filter(l => l.waist  !== null);

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null;
  const latestWaist  = waistLogs.length  > 0 ? waistLogs[waistLogs.length - 1].waist   : null;
  const firstWeight  = weightLogs.length > 0 ? weightLogs[0].weight : null;
  const firstWaist   = waistLogs.length  > 0 ? waistLogs[0].waist   : null;

  const weightDelta = (latestWeight !== null && firstWeight !== null && weightLogs.length > 1)
    ? +(latestWeight - firstWeight).toFixed(1) : null;
  const waistDelta  = (latestWaist !== null && firstWaist !== null && waistLogs.length > 1)
    ? +(latestWaist - firstWaist).toFixed(0) : null;

  const weightPoints = toBarPoints(bodyLogs, 'weight');
  const waistPoints  = toBarPoints(bodyLogs, 'waist');

  const sortedStreaks = [...memberStreaks].sort((a, b) => b.streak - a.streak);

  const displayWeek = weekHistory.length > 0 ? weekHistory : [
    { day: 'M', done: 12, isToday: false },
    { day: 'T', done: 11, isToday: false },
    { day: 'W', done: 10, isToday: false },
    { day: 'T', done: 13, isToday: false },
    { day: 'F', done: 11, isToday: false },
    { day: 'S', done: 14, isToday: false },
    { day: 'S', done:  9, isToday: true  },
  ];

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 8px' }}>
        <div style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.red, fontWeight: 600, letterSpacing: -0.08 }}>
          {MONTH_NAMES[viewMonth - 1].toUpperCase()} {viewYear}
        </div>
        <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 2 }}>
          History
        </div>
      </div>

      {/* ── Calendar ── */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={prevMonth} style={{
              width: 28, height: 28, borderRadius: 14, background: B_COLORS.bg,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="7" height="11" viewBox="0 0 7 11" fill="none">
                <path d="M6 1L1 5.5L6 10" stroke={B_COLORS.green} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink }}>
              {MONTH_NAMES[viewMonth - 1]} {viewYear}
            </div>
            <button onClick={nextMonth} style={{
              width: 28, height: 28, borderRadius: 14,
              background: isCurrentMonth ? 'transparent' : B_COLORS.bg,
              border: 'none', cursor: isCurrentMonth ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="7" height="11" viewBox="0 0 7 11" fill="none">
                <path d="M1 1L6 5.5L1 10"
                  stroke={isCurrentMonth ? B_COLORS.inkFaint : B_COLORS.green}
                  strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <MonthCalendar
            year={viewYear}
            month={viewMonth}
            completion={completion}
            onDayTap={onJumpToDate}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { color: B_COLORS.red,    label: '0%'   },
              { color: '#FF9500',        label: '<40%' },
              { color: B_COLORS.lime,   label: '<70%' },
              { color: '#34C759',        label: '<90%' },
              { color: B_COLORS.green,  label: '100%' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <circle cx="5" cy="5" r="4" stroke={item.color} strokeWidth="1.5" fill="none" />
                </svg>
                <span style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Weight ── */}
      <div style={{ padding: '20px 16px 0' }}>
        {sectionHeader('Weight',
          <button onClick={() => { setEditingWeight(v => !v); setWeightInput(latestWeight !== null ? String(latestWeight) : ''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.blue }}>
            {editingWeight ? 'Cancel' : 'Edit'}
          </button>
        )}
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>
                  {latestWeight ?? '—'}
                </span>
                {latestWeight !== null && <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>kg</span>}
              </div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 4 }}>
                {weightLogs.length > 0 ? 'All time' : 'No data yet'}
              </div>
            </div>
            {weightDelta !== null && (
              <div style={{
                padding: '5px 10px', borderRadius: 8,
                background: weightDelta <= 0 ? B_COLORS.greenSoft : '#FFF0F0',
                fontFamily: B_FONT, fontSize: 12, fontWeight: 700,
                color: weightDelta <= 0 ? B_COLORS.green : B_COLORS.red,
              }}>
                {weightDelta > 0 ? '+' : ''}{weightDelta} kg
              </div>
            )}
          </div>

          {editingWeight ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <input
                  type="number" step="0.1" placeholder="kg"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, fontFamily: B_FONT, fontSize: 16, color: B_COLORS.ink,
                    background: B_COLORS.bg, border: `0.5px solid ${B_COLORS.hairline}`,
                    borderRadius: 8, padding: '10px 12px', outline: 'none',
                  }}
                />
                <button onClick={saveWeight} style={{
                  padding: '10px 20px', borderRadius: 8, background: B_COLORS.green,
                  border: 'none', cursor: 'pointer', fontFamily: B_FONT,
                  fontSize: 14, fontWeight: 600, color: '#fff',
                }}>Save</button>
              </div>
              {weightLogs.slice().reverse().slice(0, 5).map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: `0.5px solid ${B_COLORS.hairline}` }}>
                  <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>{l.date}</span>
                  <span style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink }}>{l.weight} kg</span>
                  <button onClick={() => handleDeleteStat(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 12, color: B_COLORS.red, padding: '2px 6px' }}>Delete</button>
                </div>
              ))}
            </div>
          ) : weightLogs.length > 0 ? (
            <BarChart points={weightPoints} color={B_COLORS.green} unit="kg" />
          ) : null}
        </div>
      </div>

      {/* ── Waist ── */}
      <div style={{ padding: '14px 16px 0' }}>
        {sectionHeader('Waist',
          <button onClick={() => { setEditingWaist(v => !v); setWaistInput(latestWaist !== null ? String(latestWaist) : ''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.blue }}>
            {editingWaist ? 'Cancel' : 'Edit'}
          </button>
        )}
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>
                  {latestWaist ?? '—'}
                </span>
                {latestWaist !== null && <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>cm</span>}
              </div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 4 }}>
                {waistLogs.length > 0 ? 'All time' : 'No data yet'}
              </div>
            </div>
            {waistDelta !== null && (
              <div style={{
                padding: '5px 10px', borderRadius: 8,
                background: waistDelta <= 0 ? '#F0F4DC' : '#FFF0F0',
                fontFamily: B_FONT, fontSize: 12, fontWeight: 700,
                color: waistDelta <= 0 ? '#5A6E1A' : B_COLORS.red,
              }}>
                {waistDelta > 0 ? '+' : ''}{waistDelta} cm
              </div>
            )}
          </div>

          {editingWaist ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <input
                  type="number" step="0.5" placeholder="cm"
                  value={waistInput}
                  onChange={e => setWaistInput(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, fontFamily: B_FONT, fontSize: 16, color: B_COLORS.ink,
                    background: B_COLORS.bg, border: `0.5px solid ${B_COLORS.hairline}`,
                    borderRadius: 8, padding: '10px 12px', outline: 'none',
                  }}
                />
                <button onClick={saveWaist} style={{
                  padding: '10px 20px', borderRadius: 8, background: B_COLORS.green,
                  border: 'none', cursor: 'pointer', fontFamily: B_FONT,
                  fontSize: 14, fontWeight: 600, color: '#fff',
                }}>Save</button>
              </div>
              {waistLogs.slice().reverse().slice(0, 5).map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: `0.5px solid ${B_COLORS.hairline}` }}>
                  <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>{l.date}</span>
                  <span style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: B_COLORS.ink }}>{l.waist} cm</span>
                  <button onClick={() => handleDeleteStat(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 12, color: B_COLORS.red, padding: '2px 6px' }}>Delete</button>
                </div>
              ))}
            </div>
          ) : waistLogs.length > 0 ? (
            <BarChart points={waistPoints} color="#A8C926" unit="cm" />
          ) : null}
        </div>
      </div>

      {/* ── Habits this week ── */}
      <div style={{ padding: '14px 16px 0' }}>
        {sectionHeader('Habits this week')}
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {displayWeek.map((d, i) => {
              const barH = Math.round((d.done / CHECKLIST_ITEMS.length) * 64);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 600, color: B_COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>
                    {d.done > 0 ? d.done : ''}
                  </span>
                  <div style={{
                    width: '100%', height: `${barH}px`,
                    background: d.isToday ? B_COLORS.green : 'rgba(15,76,58,0.45)',
                    borderRadius: 4,
                  }} />
                  <span style={{ fontFamily: B_FONT, fontSize: 10, color: d.isToday ? B_COLORS.ink : B_COLORS.inkSoft, fontWeight: d.isToday ? 600 : 400 }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Circle streaks ── */}
      {groupId && (
        <div style={{ padding: '14px 16px 0' }}>
          {sectionHeader('Circle streaks')}
          <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
            {sortedStreaks.length === 0 ? (
              <div style={{ padding: '20px 16px', fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft, textAlign: 'center' }}>
                No streak data yet
              </div>
            ) : sortedStreaks.map(({ profile, streak }, i) => {
              const initials = profile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
              const isMe = profile.id === userId;
              return (
                <div key={profile.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                  borderBottom: i === sortedStreaks.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
                }}>
                  <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft, fontWeight: 600, fontVariantNumeric: 'tabular-nums', width: 16 }}>
                    {i + 1}
                  </span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14, background: profile.tint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: B_FONT, fontSize: 11, fontWeight: 700, color: '#fff',
                  }}>{initials}</div>
                  <span style={{
                    flex: 1, fontFamily: B_FONT, fontSize: 15, color: B_COLORS.ink,
                    fontWeight: isMe ? 600 : 400, letterSpacing: -0.3,
                  }}>
                    {profile.name || 'Member'}
                    {isMe && <span style={{ color: B_COLORS.inkSoft, fontWeight: 400 }}> (you)</span>}
                  </span>
                  <span style={{ fontFamily: B_FONT, fontSize: 14, fontWeight: 700, color: B_COLORS.green, fontVariantNumeric: 'tabular-nums' }}>
                    {streak}
                  </span>
                  <span style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft }}>days</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
