-- =====================================================================
-- Run once in the Supabase SQL Editor.
-- Adds a `status` column to public.games so the admin can mark a title
-- as 'upcoming' (shown in the "Upcoming Games" section) instead of the
-- default 'released' (shown in "Featured games" / portfolio).
-- Idempotent: safe to run multiple times.
-- =====================================================================

alter table public.games
  add column if not exists status text not null default 'released';

alter table public.games
  drop constraint if exists games_status_check;

alter table public.games
  add constraint games_status_check
  check (status in ('released', 'upcoming'));