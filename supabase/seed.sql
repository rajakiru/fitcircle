-- ── Seed data: users, groups, daily logs ──────────────────────────────────────
-- Run this in Supabase SQL Editor after schema.sql

-- Fixed UUIDs for repeatability
DO $$
DECLARE
  kiru_id  uuid := 'a1a1a1a1-0000-0000-0000-000000000001';
  riya_id  uuid := 'a2a2a2a2-0000-0000-0000-000000000002';
  main_id  uuid := 'b1b1b1b1-0000-0000-0000-000000000001';
  ichinoe_id uuid := 'b2b2b2b2-0000-0000-0000-000000000002';
  test_id  uuid := 'b3b3b3b3-0000-0000-0000-000000000003';
  all_done jsonb := '{"metab":true,"protein":true,"nuts":true,"veg":true,"fruit":true,"nosugar":true,"water":true,"meals3":true,"dinner8":true,"if":true,"sleep":true,"exercise":true,"steps":true,"nophone":true}';
BEGIN

-- ── Auth users ────────────────────────────────────────────────────────────────
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
) VALUES
  (kiru_id,  '00000000-0000-0000-0000-000000000000', 'kiru@fitcircle.app',  crypt('pass',    gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
  (riya_id,  '00000000-0000-0000-0000-000000000000', 'riya@fitcircle.app',  crypt('pass123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- ── Groups ────────────────────────────────────────────────────────────────────
INSERT INTO groups (id, name, invite_code, created_by) VALUES
  (main_id,    'main',    'MAIN01', kiru_id),
  (ichinoe_id, 'ichinoe', 'ICHI01', kiru_id),
  (test_id,    'test',    'TEST01', kiru_id)
ON CONFLICT (id) DO NOTHING;

-- ── Profiles ──────────────────────────────────────────────────────────────────
INSERT INTO profiles (id, name, tint, group_id) VALUES
  (kiru_id, 'Kiru', '#0F4C3A', main_id),
  (riya_id, 'Riya', '#FF2D55', main_id)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, tint = EXCLUDED.tint, group_id = EXCLUDED.group_id;

-- ── Kiru daily logs: all 14 done every day this month ─────────────────────────
INSERT INTO daily_logs (user_id, date, items) VALUES
  (kiru_id, '2026-05-01', all_done),
  (kiru_id, '2026-05-02', all_done),
  (kiru_id, '2026-05-03', all_done),
  (kiru_id, '2026-05-04', all_done),
  (kiru_id, '2026-05-05', all_done),
  (kiru_id, '2026-05-06', all_done),
  (kiru_id, '2026-05-07', all_done),
  (kiru_id, '2026-05-08', all_done),
  (kiru_id, '2026-05-09', all_done),
  (kiru_id, '2026-05-10', all_done),
  (kiru_id, '2026-05-11', all_done),
  (kiru_id, '2026-05-12', all_done),
  (kiru_id, '2026-05-13', all_done)
ON CONFLICT (user_id, date) DO UPDATE SET items = EXCLUDED.items;

-- ── Riya daily logs: random gaps each day ─────────────────────────────────────
INSERT INTO daily_logs (user_id, date, items) VALUES
  (riya_id, '2026-05-01', '{"metab":true,"protein":true,"nuts":false,"veg":true,"fruit":false,"nosugar":true,"water":true,"meals3":true,"dinner8":false,"if":true,"sleep":true,"exercise":true,"steps":false,"nophone":true}'),
  (riya_id, '2026-05-02', '{"metab":true,"protein":false,"nuts":true,"veg":true,"fruit":true,"nosugar":false,"water":true,"meals3":true,"dinner8":true,"if":false,"sleep":true,"exercise":false,"steps":true,"nophone":true}'),
  (riya_id, '2026-05-03', '{"metab":true,"protein":true,"nuts":true,"veg":false,"fruit":true,"nosugar":true,"water":false,"meals3":true,"dinner8":true,"if":true,"sleep":false,"exercise":true,"steps":true,"nophone":false}'),
  (riya_id, '2026-05-04', '{"metab":false,"protein":true,"nuts":true,"veg":true,"fruit":true,"nosugar":true,"water":true,"meals3":false,"dinner8":true,"if":true,"sleep":true,"exercise":true,"steps":true,"nophone":true}'),
  (riya_id, '2026-05-05', '{"metab":true,"protein":true,"nuts":false,"veg":false,"fruit":true,"nosugar":true,"water":true,"meals3":true,"dinner8":false,"if":true,"sleep":true,"exercise":false,"steps":true,"nophone":true}'),
  (riya_id, '2026-05-06', '{"metab":true,"protein":true,"nuts":true,"veg":true,"fruit":false,"nosugar":false,"water":true,"meals3":true,"dinner8":true,"if":true,"sleep":true,"exercise":true,"steps":false,"nophone":false}'),
  (riya_id, '2026-05-07', '{"metab":true,"protein":false,"nuts":true,"veg":true,"fruit":true,"nosugar":true,"water":false,"meals3":true,"dinner8":true,"if":false,"sleep":true,"exercise":true,"steps":true,"nophone":true}'),
  (riya_id, '2026-05-08', '{"metab":true,"protein":true,"nuts":true,"veg":false,"fruit":true,"nosugar":true,"water":true,"meals3":false,"dinner8":true,"if":true,"sleep":false,"exercise":true,"steps":true,"nophone":true}'),
  (riya_id, '2026-05-09', '{"metab":true,"protein":true,"nuts":false,"veg":true,"fruit":false,"nosugar":true,"water":true,"meals3":true,"dinner8":true,"if":true,"sleep":true,"exercise":false,"steps":false,"nophone":true}'),
  (riya_id, '2026-05-10', '{"metab":false,"protein":true,"nuts":true,"veg":true,"fruit":true,"nosugar":true,"water":true,"meals3":true,"dinner8":false,"if":true,"sleep":true,"exercise":true,"steps":true,"nophone":false}'),
  (riya_id, '2026-05-11', '{"metab":true,"protein":true,"nuts":true,"veg":true,"fruit":true,"nosugar":false,"water":false,"meals3":true,"dinner8":true,"if":true,"sleep":true,"exercise":true,"steps":true,"nophone":true}'),
  (riya_id, '2026-05-12', '{"metab":true,"protein":false,"nuts":true,"veg":false,"fruit":true,"nosugar":true,"water":true,"meals3":true,"dinner8":true,"if":true,"sleep":false,"exercise":true,"steps":true,"nophone":true}'),
  (riya_id, '2026-05-13', '{"metab":true,"protein":true,"nuts":true,"veg":true,"fruit":false,"nosugar":true,"water":true,"meals3":false,"dinner8":true,"if":true,"sleep":true,"exercise":false,"steps":true,"nophone":true}')
ON CONFLICT (user_id, date) DO UPDATE SET items = EXCLUDED.items;

END $$;
