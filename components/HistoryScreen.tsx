'use client';

import { useState, useEffect } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { CHECKLIST_ITEMS, WEIGHT_TRACK } from '@/lib/data';
import { WeightPoint } from '@/lib/data';
import { todayISO, isoToDate } from '@/lib/storage';
import {
  getMonthCompletion, getBodyStats, upsertBodyStat, getWeekHistory, getMemberStreaks,
  type BodyStat, type Profile,
} from '@/lib/supabase';
import MonthCalendar from './MonthCalendar';
import LineChart from './LineChart';

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

function toWeightPoints(logs: BodyStat[]): WeightPoint[] {
  const withWeight = logs.filter(l => l.weight !== null);
  if (withWeight.length < 2) return WEIGHT_TRACK;
  return withWeight.map(l => {
    const d = isoToDate(l.date);
    const label = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}`;
    return { w: label, kg: l.weight!, waist: l.waist ?? 84 };
  });
}

function toWaistPoints(logs: BodyStat[]): WeightPoint[] {
  const withWaist = logs.filter(l => l.waist !== null);
  if (withWaist.length < 2) return WEIGHT_TRACK;
  return withWaist.map(l => {
    const d = isoToDate(l.date);
    const label = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}`;
    return { w: label, kg: l.weight ?? 71, waist: l.waist! };
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

  const saveWeight = async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w)) return;
    await upsertBodyStat(userId, todayISO(), { weight: w });
    const updated = await getBodyStats(userId);
    setBodyLogs(updated);
    setWeightInput('');
    setEditingWeight(false);
  };

  const saveWaist = async () => {
    const c = parseFloat(waistInput);
    if (isNaN(c)) return;
    await upsertBodyStat(userId, todayISO(), { waist: c });
    const updated = await getBodyStats(userId);
    setBodyLogs(updated);
    setWaistInput('');
    setEditingWaist(false);
  };

  const weightPoints = toWeightPoints(bodyLogs);
  const waistPoints  = toWaistPoints(bodyLogs);

  const latestWeight = [...bodyLogs].reverse().find(l => l.weight !== null)?.weight
    ?? WEIGHT_TRACK[WEIGHT_TRACK.length - 1].kg;
  const latestWaist  = [...bodyLogs].reverse().find(l => l.waist  !== null)?.waist
    ?? WEIGHT_TRACK[WEIGHT_TRACK.length - 1].waist;

  const firstWeight  = (bodyLogs.find(l => l.weight !== null)?.weight ?? WEIGHT_TRACK[0].kg);
  const firstWaist   = (bodyLogs.find(l => l.waist  !== null)?.waist  ?? WEIGHT_TRACK[0].waist);
  const weightDelta  = +(latestWeight! - firstWeight!).toFixed(1);
  const waistDelta   = +(latestWaist!  - firstWaist!).toFixed(0);

  const wWeights = weightPoints.map(p => p.kg);
  const wMin = Math.min(...wWeights) - 0.3;
  const wMax = Math.max(...wWeights) + 0.3;

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
          <button onClick={() => { setEditingWeight(v => !v); setWeightInput(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.blue }}>
            {editingWeight ? 'Cancel' : 'Edit'}
          </button>
        )}
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>
                  {latestWeight}
                </span>
                <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>kg</span>
              </div>
              <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 4 }}>
                Last 8 weeks
              </div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: 8,
              background: weightDelta <= 0 ? B_COLORS.greenSoft : '#FFF0F0',
              fontFamily: B_FONT, fontSize: 12, fontWeight: 700,
              color: weightDelta <= 0 ? B_COLORS.green : B_COLORS.red,
            }}>
              {weightDelta > 0 ? '+' : ''}{weightDelta} kg
            </div>
          </div>

          {editingWeight ? (
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
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
          ) : (
            <div style={{ marginTop: 14 }}>
              <LineChart data={weightPoints} field="kg" min={wMin} max={wMax} color={B_COLORS.green} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                {weightPoints.filter((_, i) => i % 2 === 0).map(w => (
                  <span key={w.w} style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkSoft }}>{w.w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Waist ── */}
      <div style={{ padding: '14px 16px 0' }}>
        {sectionHeader('Waist',
          <button onClick={() => { setEditingWaist(v => !v); setWaistInput(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.blue }}>
            {editingWaist ? 'Cancel' : 'Edit'}
          </button>
        )}
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: B_COLORS.ink, letterSpacing: -0.8 }}>
                  {latestWaist}
                </span>
                <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>cm</span>
              </div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: 8,
              background: waistDelta <= 0 ? '#F0F4DC' : '#FFF0F0',
              fontFamily: B_FONT, fontSize: 12, fontWeight: 700,
              color: waistDelta <= 0 ? '#5A6E1A' : B_COLORS.red,
            }}>
              {waistDelta > 0 ? '+' : ''}{waistDelta} cm
            </div>
          </div>

          {editingWaist ? (
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
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
          ) : (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
              {waistPoints.map((w, i) => (
                <div key={w.w} style={{
                  flex: 1,
                  height: `${Math.max(4, ((w.waist - (Math.min(...waistPoints.map(p => p.waist)) - 1)) /
                    (Math.max(...waistPoints.map(p => p.waist)) - Math.min(...waistPoints.map(p => p.waist)) + 2)) * 60)}px`,
                  background: i === waistPoints.length - 1 ? '#A8C926' : 'rgba(168,201,38,0.4)',
                  borderRadius: 3,
                }} />
              ))}
            </div>
          )}
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
