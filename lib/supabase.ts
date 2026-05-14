import { createClient, type SupabaseClient, type AuthChangeEvent, type Session } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  tint: string;
  group_id: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  items: Record<string, boolean>;
  created_at: string;
}

export interface BodyStat {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  waist: number | null;
  created_at: string;
}

export interface FeedPost {
  id: string;
  user_id: string;
  group_id: string;
  type: 'meal' | 'streak' | 'weigh_in';
  image_url: string | null;
  caption: string | null;
  streak: number | null;
  reactions: Record<string, string[]>;
  created_at: string;
  profile?: Profile;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  return getSupabase().auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return getSupabase().auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return getSupabase().auth.signOut();
}

export function onAuthChange(cb: (event: AuthChangeEvent, session: Session | null) => void) {
  return getSupabase().auth.onAuthStateChange(cb);
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function upsertProfile(userId: string, updates: Partial<Pick<Profile, 'name' | 'tint' | 'group_id'>>) {
  return getSupabase()
    .from('profiles')
    .upsert({ id: userId, ...updates });
}

// ── Groups ────────────────────────────────────────────────────────────────────

export async function createGroup(name: string, userId: string): Promise<Group | null> {
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data } = await getSupabase()
    .from('groups')
    .insert({ name, invite_code: inviteCode, created_by: userId })
    .select()
    .maybeSingle();
  if (data) {
    await upsertProfile(userId, { group_id: data.id });
  }
  return data;
}

export async function joinGroup(inviteCode: string, userId: string): Promise<Group | null> {
  const { data } = await getSupabase()
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .maybeSingle();
  if (data) {
    await upsertProfile(userId, { group_id: data.id });
  }
  return data;
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const { data } = await getSupabase()
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .maybeSingle();
  return data;
}

export async function getGroupMembers(groupId: string): Promise<Profile[]> {
  const { data } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('group_id', groupId);
  return data ?? [];
}

// ── Daily logs ────────────────────────────────────────────────────────────────

export async function getDailyLog(userId: string, date: string): Promise<Record<string, boolean> | null> {
  const { data } = await getSupabase()
    .from('daily_logs')
    .select('items')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  return data?.items ?? null;
}

export async function saveDailyLog(userId: string, date: string, items: Record<string, boolean>) {
  return getSupabase()
    .from('daily_logs')
    .upsert({ user_id: userId, date, items }, { onConflict: 'user_id,date' });
}

export async function getMonthCompletion(
  userId: string,
  year: number,
  month: number,
  totalItems: number,
): Promise<Record<string, number>> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to   = `${year}-${String(month).padStart(2, '0')}-31`;
  const { data } = await getSupabase()
    .from('daily_logs')
    .select('date, items')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to);
  const result: Record<string, number> = {};
  for (const row of data ?? []) {
    const done = Object.values(row.items as Record<string, boolean>).filter(Boolean).length;
    result[row.date] = done / totalItems;
  }
  return result;
}

export async function getWeekHistory(
  userId: string,
  n: number,
  totalItems: number,
): Promise<{ day: string; done: number; isToday: boolean }[]> {
  const today = new Date();
  const days = Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return d;
  });
  const from = days[0].toISOString().slice(0, 10);
  const to   = days[n - 1].toISOString().slice(0, 10);

  const { data } = await getSupabase()
    .from('daily_logs')
    .select('date, items')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to);

  const byDate: Record<string, number> = {};
  for (const row of data ?? []) {
    byDate[row.date] = Object.values(row.items as Record<string, boolean>).filter(Boolean).length;
  }

  const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayStr = today.toISOString().slice(0, 10);
  return days.map(d => {
    const dateStr = d.toISOString().slice(0, 10);
    return { day: DAY[d.getDay()], done: byDate[dateStr] ?? 0, isToday: dateStr === todayStr };
  });
}

export async function getMemberProgress(
  groupId: string,
  date: string,
  totalItems: number,
): Promise<{ profile: Profile; done: number; pct: number }[]> {
  const members = await getGroupMembers(groupId);
  const { data } = await getSupabase()
    .from('daily_logs')
    .select('user_id, items')
    .eq('date', date)
    .in('user_id', members.map(m => m.id));

  const byUser: Record<string, number> = {};
  for (const row of data ?? []) {
    byUser[row.user_id] = Object.values(row.items as Record<string, boolean>).filter(Boolean).length;
  }

  return members.map(profile => {
    const done = byUser[profile.id] ?? 0;
    return { profile, done, pct: done / totalItems };
  });
}

// ── Body stats ────────────────────────────────────────────────────────────────

export async function leaveGroup(userId: string) {
  return getSupabase().from('profiles').update({ group_id: null }).eq('id', userId);
}

export async function deleteGroup(groupId: string) {
  return getSupabase().from('groups').delete().eq('id', groupId);
}

export async function getBodyStats(userId: string): Promise<BodyStat[]> {
  const { data } = await getSupabase()
    .from('body_stats')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  return data ?? [];
}

export async function upsertBodyStat(userId: string, date: string, updates: { weight?: number; waist?: number }) {
  return getSupabase()
    .from('body_stats')
    .upsert({ user_id: userId, date, ...updates }, { onConflict: 'user_id,date' });
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export async function getFeedPosts(groupId: string, limit = 20): Promise<FeedPost[]> {
  const { data } = await getSupabase()
    .from('feed_posts')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];

  const userIds = [...new Set(data.map((p: FeedPost) => p.user_id))];
  const { data: profiles } = await getSupabase()
    .from('profiles')
    .select('id, name, tint')
    .in('id', userIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p: { id: string; name: string; tint: string }) => [p.id, p]));

  return data.map((post: FeedPost) => ({ ...post, profile: profileMap[post.user_id] ?? undefined })) as FeedPost[];
}

export async function getMemberStreaks(
  groupId: string,
): Promise<{ profile: Profile; streak: number }[]> {
  const members = await getGroupMembers(groupId);
  if (members.length === 0) return [];

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 90);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = today.toISOString().slice(0, 10);

  const { data } = await getSupabase()
    .from('daily_logs')
    .select('user_id, date, items')
    .in('user_id', members.map(m => m.id))
    .gte('date', fromStr)
    .lte('date', toStr);

  const byUser: Record<string, Set<string>> = {};
  for (const row of data ?? []) {
    const done = Object.values(row.items as Record<string, boolean>).filter(Boolean).length;
    if (done > 0) {
      if (!byUser[row.user_id]) byUser[row.user_id] = new Set();
      byUser[row.user_id].add(row.date);
    }
  }

  return members.map(profile => {
    const logged = byUser[profile.id] ?? new Set<string>();
    let streak = 0;
    const cursor = new Date(today);
    while (true) {
      const dateStr = cursor.toISOString().slice(0, 10);
      if (!logged.has(dateStr)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { profile, streak };
  });
}

export async function updateFeedPost(postId: string, caption: string) {
  return getSupabase().from('feed_posts').update({ caption }).eq('id', postId);
}

export async function deleteFeedPost(postId: string) {
  return getSupabase().from('feed_posts').delete().eq('id', postId);
}

export async function addReaction(postId: string, userId: string, emoji: string) {
  const { data } = await getSupabase()
    .from('feed_posts')
    .select('reactions')
    .eq('id', postId)
    .maybeSingle();

  const reactions: Record<string, string[]> = data?.reactions ?? {};
  const current = reactions[emoji] ?? [];
  if (current.includes(userId)) {
    reactions[emoji] = current.filter(id => id !== userId);
  } else {
    reactions[emoji] = [...current, userId];
  }

  return getSupabase()
    .from('feed_posts')
    .update({ reactions })
    .eq('id', postId);
}

export async function uploadMealPhoto(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await getSupabase().storage.from('meals').upload(path, file);
  if (error) { console.error('upload error', error); return null; }
  const { data } = getSupabase().storage.from('meals').getPublicUrl(path);
  return data.publicUrl;
}

export async function createFeedPost(
  userId: string,
  groupId: string,
  imageUrl: string | null,
  caption: string | null,
): Promise<FeedPost | null> {
  const { data } = await getSupabase()
    .from('feed_posts')
    .insert({ user_id: userId, group_id: groupId, type: 'meal', image_url: imageUrl, caption, reactions: {} })
    .select()
    .maybeSingle();
  return data;
}

export async function getUserMealPosts(userId: string, date: string): Promise<FeedPost[]> {
  const from = `${date}T00:00:00`;
  const to = `${date}T23:59:59`;
  const { data } = await getSupabase()
    .from('feed_posts')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'meal')
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: true });
  return (data as FeedPost[]) ?? [];
}
