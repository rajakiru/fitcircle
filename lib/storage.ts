const CL_PREFIX = 'fc_cl_';
const BODY_KEY   = 'fc_body';
const IF_KEY     = 'fc_if_lastmeal';

// ── Date helpers ──────────────────────────────────────────────────────────────

export function todayISO(): string {
  return dateToISO(new Date());
}

export function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function offsetISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return dateToISO(new Date(y, m - 1, d + delta));
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// ── Checklist persistence ─────────────────────────────────────────────────────

export function loadChecklist(date: string): Record<string, boolean> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CL_PREFIX + date);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : null;
  } catch {
    return null;
  }
}

export function saveChecklist(date: string, state: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CL_PREFIX + date, JSON.stringify(state));
  } catch { /* storage full — silently ignore */ }
}

// Returns a map of "YYYY-MM-DD" → completion fraction (0–1) for every day
// in the given month that has a saved checklist entry.
export function loadMonthCompletion(
  year: number,
  month: number,
  totalItems: number,
): Record<string, number> {
  if (typeof window === 'undefined') return {};
  const prefix = `${CL_PREFIX}${year}-${pad(month)}-`;
  const result: Record<string, number> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const state = JSON.parse(raw) as Record<string, boolean>;
      const done = Object.values(state).filter(Boolean).length;
      const dateStr = key.slice(CL_PREFIX.length);
      result[dateStr] = done / totalItems;
    }
  } catch { /* ignore */ }
  return result;
}

// ── Body stats ────────────────────────────────────────────────────────────────

export interface BodyEntry {
  date: string;
  weight?: number;
  waist?: number;
}

export function loadBodyLogs(): BodyEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BODY_KEY);
    return raw ? (JSON.parse(raw) as BodyEntry[]) : [];
  } catch {
    return [];
  }
}

// Returns the last `n` days' habit completion counts, oldest first.
export function loadWeekHistory(
  n: number,
  totalItems: number,
): { day: string; done: number; isToday: boolean }[] {
  const today = todayISO();
  const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return Array.from({ length: n }, (_, i) => {
    const date = offsetISO(today, -(n - 1 - i));
    const log = loadChecklist(date);
    const done = log ? Object.values(log).filter(Boolean).length : 0;
    const d = isoToDate(date);
    return { day: DAY[d.getDay()], done, isToday: date === today };
  });
}

// ── Intermittent fasting ──────────────────────────────────────────────────────

export function loadLastMealTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(IF_KEY);
}

export function saveLastMealTime(isoDatetime: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(IF_KEY, isoDatetime);
  } catch { /* ignore */ }
}

export function saveBodyLog(entry: BodyEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = loadBodyLogs();
    const idx = logs.findIndex(l => l.date === entry.date);
    if (idx >= 0) {
      logs[idx] = { ...logs[idx], ...entry };
    } else {
      logs.push(entry);
      logs.sort((a, b) => a.date.localeCompare(b.date));
    }
    localStorage.setItem(BODY_KEY, JSON.stringify(logs));
  } catch { /* ignore */ }
}
