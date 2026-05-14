-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Groups ────────────────────────────────────────────────────────────────────
create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,
  created_by  uuid,
  created_at  timestamptz not null default now()
);

-- ── Profiles ──────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id         uuid primary key,
  name       text not null default '',
  tint       text not null default '#0F4C3A',
  group_id   uuid references groups(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── Daily logs ────────────────────────────────────────────────────────────────
create table if not exists daily_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  date       date not null,
  items      jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ── Body stats ────────────────────────────────────────────────────────────────
create table if not exists body_stats (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  date       date not null,
  weight     numeric,
  waist      numeric,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ── Feed posts ────────────────────────────────────────────────────────────────
create table if not exists feed_posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  group_id   uuid not null references groups(id) on delete cascade,
  type       text not null check (type in ('meal','streak','weigh_in')),
  image_url  text,
  caption    text,
  streak     int,
  reactions  jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── Permissions ───────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists daily_logs_user_date on daily_logs (user_id, date);
create index if not exists body_stats_user_date on body_stats (user_id, date);
create index if not exists feed_posts_group_created on feed_posts (group_id, created_at desc);
create index if not exists profiles_group_id on profiles (group_id);
