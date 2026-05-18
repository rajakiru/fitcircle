'use client';

import { useState, useEffect, useRef } from 'react';
import { B_COLORS, B_FONT, B_FONT_DISPLAY } from '@/lib/colors';
import { CHECKLIST_ITEMS } from '@/lib/data';
import { todayISO, offsetISO, loadLastMealTime, saveLastMealTime } from '@/lib/storage';
import { uploadMealPhoto, createFeedPost, getUserMealPosts, upsertBodyStat, getBodyStats, type FeedPost, type BodyStat } from '@/lib/supabase';
import TripleRing from './TripleRing';

type Checked = Record<string, boolean>;

type Props = {
  checked: Checked;
  toggle: (id: string) => void;
  showNudge: boolean;
  currentDate: string;
  onNavigateDate: (date: string) => void;
  userId: string;
  groupId: string | null;
};

const RING_GROUPS = ['nutrition', 'body', 'rhythm'] as const;
const RING_COLORS = ['#FF2D55', B_COLORS.lime, B_COLORS.green];

const SECTIONS = [
  { key: 'nutrition', title: 'Nutrition' },
  { key: 'rhythm',    title: 'Rhythm'    },
  { key: 'body',      title: 'Movement'  },
  { key: 'mind',      title: 'Mind'      },
] as const;

const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAY_NAMES   = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

function formatDate(iso: string): { dow: string; label: string; isToday: boolean } {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = DAY_NAMES[dt.getDay()];
  return {
    dow,
    label: `${dow}, ${MONTH_NAMES[m - 1]} ${d}`,
    isToday: iso === todayISO(),
  };
}

export default function TodayScreen({ checked, toggle, showNudge, currentDate, onNavigateDate, userId, groupId }: Props) {
  const done = Object.values(checked).filter(Boolean).length;
  const { label, isToday } = formatDate(currentDate);

  const [mealPosts, setMealPosts] = useState<FeedPost[]>([]);
  const [bodyStats, setBodyStats] = useState<BodyStat[]>([]);
  const [editingMeasure, setEditingMeasure] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [savingMeasure, setSavingMeasure] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastMealTime, setLastMealTime] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [editingIF, setEditingIF] = useState(false);
  const [ifTimeInput, setIfTimeInput] = useState('');

  useEffect(() => {
    getUserMealPosts(userId, currentDate).then(setMealPosts);
  }, [userId, currentDate]);

  useEffect(() => {
    getBodyStats(userId).then(setBodyStats);
  }, [userId]);

  useEffect(() => {
    setLastMealTime(loadLastMealTime());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handlePost = async () => {
    if (!groupId || !pendingFile) return;
    setPosting(true);
    const imageUrl = await uploadMealPhoto(userId, pendingFile);
    const fullCaption = caption.trim() ? `${selectedMeal} · ${caption.trim()}` : selectedMeal;
    await createFeedPost(userId, groupId, imageUrl, fullCaption);
    const updated = await getUserMealPosts(userId, currentDate);
    setMealPosts(updated);
    setPosting(false);
    setSheetOpen(false);
    setPendingFile(null);
    setPendingPreview(null);
    setCaption('');
    const mealISO = new Date().toISOString();
    saveLastMealTime(mealISO);
    setLastMealTime(mealISO);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSlotPost = (meal: string) =>
    mealPosts.find(p => p.caption?.startsWith(meal));

  const ringStats = RING_GROUPS.map(g => {
    const items = CHECKLIST_ITEMS.filter(i => i.group === g);
    const d = items.filter(i => checked[i.id]).length;
    return { g, d, t: items.length, pct: d / items.length };
  });

  const latestStat = [...bodyStats].reverse().find(s => s.weight !== null || s.waist !== null);
  const latestWeight = [...bodyStats].reverse().find(s => s.weight !== null)?.weight ?? null;
  const latestWaist = [...bodyStats].reverse().find(s => s.waist !== null)?.waist ?? null;
  const daysSinceUpdate = latestStat
    ? Math.floor((new Date().getTime() - new Date(latestStat.date).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const showNudgeMeasure = isToday && (daysSinceUpdate === null || daysSinceUpdate >= 7);

  const saveMeasure = async () => {
    const w = parseFloat(weightInput);
    const c = parseFloat(waistInput);
    if (isNaN(w) && isNaN(c)) return;
    setSavingMeasure(true);
    await upsertBodyStat(userId, todayISO(), {
      ...(isNaN(w) ? {} : { weight: w }),
      ...(isNaN(c) ? {} : { waist: c }),
    });
    const updated = await getBodyStats(userId);
    setBodyStats(updated);
    setWeightInput('');
    setWaistInput('');
    setEditingMeasure(false);
    setSavingMeasure(false);
  };

  const canGoForward = currentDate < todayISO();

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Date nav header */}
      <div style={{ padding: '52px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onNavigateDate(offsetISO(currentDate, -1))}
            style={{
              width: 32, height: 32, borderRadius: 16,
              background: B_COLORS.greenSoft, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
              <path d="M7 1L1 6.5L7 12" stroke={B_COLORS.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.red, fontWeight: 600, letterSpacing: 0.4 }}>
              {label}
            </div>
          </div>

          <button
            onClick={() => canGoForward && onNavigateDate(offsetISO(currentDate, 1))}
            style={{
              width: 32, height: 32, borderRadius: 16,
              background: canGoForward ? B_COLORS.greenSoft : 'transparent',
              border: 'none',
              cursor: canGoForward ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
              <path
                d="M1 1L7 6.5L1 12"
                stroke={canGoForward ? B_COLORS.green : B_COLORS.inkFaint}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div style={{
          fontFamily: B_FONT_DISPLAY, fontSize: 34, fontWeight: 700,
          color: B_COLORS.ink, letterSpacing: 0.4, marginTop: 6, paddingLeft: 4,
        }}>
          {isToday ? 'Today' : formatDate(currentDate).label.split(', ')[1]}
        </div>
      </div>

      {/* Activity rings card */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: B_FONT, fontSize: 17, fontWeight: 600, color: B_COLORS.green }}>Activity</span>
            <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft, letterSpacing: -0.08 }}>
              {done} of {CHECKLIST_ITEMS.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <TripleRing stats={ringStats} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ringStats.map((r, i) => (
                <div key={r.g}>
                  <div style={{
                    fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft,
                    letterSpacing: -0.06, textTransform: 'uppercase', fontWeight: 600,
                  }}>{r.g}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: B_FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: RING_COLORS[i], letterSpacing: -0.5 }}>{r.d}</span>
                    <span style={{ fontFamily: B_FONT, fontSize: 13, color: B_COLORS.inkSoft }}>/{r.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IF card — only for today */}
      {showNudge && (
        <>
          <div style={{ padding: '14px 16px 0' }}>
            <div style={{
              fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
              padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
            }}>
              Intermittent fasting
            </div>
            <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 28, fontWeight: 600, color: B_COLORS.ink, letterSpacing: -0.5 }}>
                    14h 08m
                  </div>
                  <div style={{ fontFamily: B_FONT, fontSize: 12, color: B_COLORS.inkSoft, marginTop: 2 }}>of 16h fasting window</div>
                </div>
                <span style={{ fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.green }}>88%</span>
              </div>
              <div style={{ height: 6, background: B_COLORS.bg, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '88%', background: B_COLORS.green, borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft }}>Last meal 7:42 PM</span>
                <span style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft }}>Break 11:42 AM</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Checklist sections */}
      {SECTIONS.map(sec => {
        const items = CHECKLIST_ITEMS.filter(i => i.group === sec.key);
        const sectionDone = items.filter(i => checked[i.id]).length;
        return (
          <div key={sec.key} style={{ padding: '20px 16px 0' }}>
            <div style={{
              fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
              padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{sec.title}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{sectionDone}/{items.length}</span>
            </div>
            <div style={{ background: B_COLORS.card, borderRadius: 14, overflow: 'hidden' }}>
              {items.map((it, i) => (
                <button
                  key={it.id}
                  onClick={() => toggle(it.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: i === items.length - 1 ? 'none' : `0.5px solid ${B_COLORS.hairline}`,
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                    background: checked[it.id] ? B_COLORS.green : 'transparent',
                    border: checked[it.id] ? 'none' : `1.5px solid ${B_COLORS.inkFaint}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {checked[it.id] && (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path d="M1 5l3.5 3.5L12 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ flex: 1, fontFamily: B_FONT, fontSize: 16, color: B_COLORS.ink, letterSpacing: -0.4 }}>
                    {it.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Meals card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{
          fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.inkSoft,
          padding: '0 4px 8px', textTransform: 'uppercase', letterSpacing: -0.08,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>Meals</span>
          {isToday && groupId && (
            <button
              onClick={() => setSheetOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke={B_COLORS.green} strokeWidth="1.5" />
                <path d="M9 6v6M6 9h6" stroke={B_COLORS.green} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div style={{ background: B_COLORS.card, borderRadius: 14, padding: 12, display: 'flex', gap: 8 }}>
          {(['Breakfast', 'Lunch', 'Dinner'] as const).map(meal => {
            const post = getSlotPost(meal);
            return (
              <div
                key={meal}
                onClick={() => {
                  if (!isToday || !groupId) return;
                  setSelectedMeal(meal);
                  setSheetOpen(true);
                }}
                style={{
                  flex: 1, aspectRatio: '1 / 1.05', borderRadius: 10,
                  position: 'relative', overflow: 'hidden',
                  background: post ? '#000' : B_COLORS.bg,
                  border: post ? 'none' : `1px dashed ${B_COLORS.inkFaint}`,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', padding: 0,
                  cursor: isToday && groupId ? 'pointer' : 'default',
                }}
              >
                {post?.image_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image_url} alt={meal} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '6px 8px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                    }}>
                      <div style={{ fontFamily: B_FONT, fontSize: 10, fontWeight: 600, color: '#fff' }}>{meal}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 10 }}>
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: B_COLORS.inkFaint, fontSize: 22, fontWeight: 200,
                    }}>+</div>
                    <div>
                      <div style={{ fontFamily: B_FONT, fontSize: 11, fontWeight: 600, color: B_COLORS.inkSoft }}>{meal}</div>
                      <div style={{ fontFamily: B_FONT, fontSize: 10, color: B_COLORS.inkFaint, marginTop: 1 }}>—</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Measurements */}
      {isToday && (
        <div style={{ padding: '14px 16px 0' }}>
          {showNudgeMeasure && !editingMeasure && (
            <div style={{
              background: '#FFF8EC', borderRadius: 12, padding: '10px 14px',
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#FF9500" strokeWidth="1.5"/>
                <path d="M8 5v4M8 11v.5" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: B_FONT, fontSize: 13, color: '#B36B00', flex: 1 }}>
                {daysSinceUpdate === null ? 'Log your first measurements' : `Update your measurements — ${daysSinceUpdate} days since last update`}
              </span>
            </div>
          )}
          <div style={{ background: B_COLORS.card, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingMeasure ? 14 : 0 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Weight</div>
                  <div style={{ fontFamily: B_FONT, fontSize: 20, fontWeight: 700, color: B_COLORS.ink, marginTop: 2 }}>
                    {latestWeight !== null ? `${latestWeight} kg` : <span style={{ color: B_COLORS.inkFaint }}>—</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: B_FONT, fontSize: 11, color: B_COLORS.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Waist</div>
                  <div style={{ fontFamily: B_FONT, fontSize: 20, fontWeight: 700, color: B_COLORS.ink, marginTop: 2 }}>
                    {latestWaist !== null ? `${latestWaist} cm` : <span style={{ color: B_COLORS.inkFaint }}>—</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => { setEditingMeasure(v => !v); setWeightInput(''); setWaistInput(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 13, fontWeight: 600, color: B_COLORS.green }}>
                {editingMeasure ? 'Cancel' : 'Update'}
              </button>
            </div>
            {editingMeasure && (
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="number" step="0.1" placeholder="Weight kg"
                  value={weightInput} onChange={e => setWeightInput(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.bg, fontFamily: B_FONT, fontSize: 15, color: B_COLORS.ink, outline: 'none' }}
                />
                <input type="number" step="0.5" placeholder="Waist cm"
                  value={waistInput} onChange={e => setWaistInput(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.bg, fontFamily: B_FONT, fontSize: 15, color: B_COLORS.ink, outline: 'none' }}
                />
                <button onClick={saveMeasure} disabled={savingMeasure}
                  style={{ padding: '10px 16px', borderRadius: 10, background: B_COLORS.green, border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {savingMeasure ? '…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Meal post sheet */}
      {sheetOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end',
        }} onClick={e => { if (e.target === e.currentTarget) { setSheetOpen(false); setPendingFile(null); setPendingPreview(null); setCaption(''); } }}>
          <div style={{
            width: '100%', background: B_COLORS.bg, borderRadius: '20px 20px 0 0',
            padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto',
          }}>
            {/* Sheet header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: B_FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: B_COLORS.ink }}>
                Share a meal
              </div>
              <button onClick={() => { setSheetOpen(false); setPendingFile(null); setPendingPreview(null); setCaption(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: B_FONT, fontSize: 15, color: B_COLORS.inkSoft }}>
                Cancel
              </button>
            </div>

            {/* Meal selector */}
            <div style={{ display: 'flex', background: B_COLORS.card, borderRadius: 10, padding: 3, marginBottom: 16, gap: 3 }}>
              {(['Breakfast', 'Lunch', 'Dinner'] as const).map(m => (
                <button key={m} onClick={() => setSelectedMeal(m)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: B_FONT, fontSize: 13, fontWeight: 600,
                  background: selectedMeal === m ? B_COLORS.green : 'transparent',
                  color: selectedMeal === m ? '#fff' : B_COLORS.inkSoft,
                }}>{m}</button>
              ))}
            </div>

            {/* Photo picker */}
            {pendingPreview ? (
              <div style={{ position: 'relative', marginBottom: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingPreview} alt="preview" style={{ width: '100%', borderRadius: 14, maxHeight: 260, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => { setPendingFile(null); setPendingPreview(null); fileInputRef.current?.click(); }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 20,
                    padding: '5px 12px', cursor: 'pointer',
                    fontFamily: B_FONT, fontSize: 12, color: '#fff', fontWeight: 600,
                  }}>Change</button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} style={{
                width: '100%', aspectRatio: '16/9', borderRadius: 14, border: `1.5px dashed ${B_COLORS.inkFaint}`,
                background: B_COLORS.card, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14,
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M3 20V8a2 2 0 012-2h2.5l2-2.5h5L16.5 6H23a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={B_COLORS.inkFaint} strokeWidth="1.5" />
                  <circle cx="14" cy="14" r="3.5" stroke={B_COLORS.inkFaint} strokeWidth="1.5" />
                </svg>
                <span style={{ fontFamily: B_FONT, fontSize: 14, color: B_COLORS.inkSoft }}>Add photo</span>
              </button>
            )}

            {/* Caption input */}
            <input
              placeholder="Add a note… (optional)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: `1px solid ${B_COLORS.hairline}`, background: B_COLORS.card,
                fontFamily: B_FONT, fontSize: 15, color: B_COLORS.ink, outline: 'none',
                boxSizing: 'border-box', marginBottom: 16,
              }}
            />

            {/* Post button */}
            <button
              onClick={handlePost}
              disabled={posting || !pendingFile}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
                cursor: posting || !pendingFile ? 'default' : 'pointer',
                background: posting || !pendingFile ? B_COLORS.inkFaint : B_COLORS.green,
                fontFamily: B_FONT, fontSize: 16, fontWeight: 600, color: '#fff',
              }}
            >
              {posting ? 'Posting…' : 'Post to Circle'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
