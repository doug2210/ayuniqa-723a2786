-- =====================================================================
-- Run this in the Supabase SQL Editor (once) to create the games table.
-- It is idempotent: safe to run multiple times.
-- Source of truth: also present in supabase/schema.sql (section 8).
-- =====================================================================

create table if not exists public.games (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  tagline       text not null default '',
  category      text not null default 'Classic',
  volatility    text not null default 'Medium',
  rtp           numeric(5,2) not null default 96.0,
  reels         text not null default '5x3',
  paylines      int  not null default 20,
  cover_url     text not null default '',
  description   text not null default '',
  features      jsonb not null default '[]'::jsonb,
  trailer_url   text,
  demo_url      text,
  screenshots   jsonb not null default '[]'::jsonb,
  assets        jsonb not null default '[]'::jsonb,
  position      int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

grant select on public.games to anon, authenticated;
grant insert, update, delete on public.games to authenticated;
grant all on public.games to service_role;

alter table public.games enable row level security;

drop policy if exists "games_select_public" on public.games;
create policy "games_select_public" on public.games
  for select to anon, authenticated using (true);

drop policy if exists "games_admin_insert" on public.games;
create policy "games_admin_insert" on public.games
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "games_admin_update" on public.games;
create policy "games_admin_update" on public.games
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "games_admin_delete" on public.games;
create policy "games_admin_delete" on public.games
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_games_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists games_touch_updated_at on public.games;
create trigger games_touch_updated_at
  before update on public.games
  for each row execute function public.touch_games_updated_at();

insert into public.games
  (slug, title, tagline, category, volatility, rtp, reels, paylines, cover_url, description, features, position)
values
  ('cosmic-fortune',  'Cosmic Fortune',  'Reach for the stars, win galactic prizes.',  'Adventure', 'High',   96.5, '5x4', 50, '/games/cosmic-fortune.jpg',
   'A high-volatility space odyssey with expanding wilds, free spins, and a progressive multiplier that grows with every cosmic cluster.',
   '["Expanding Wilds","Free Spins","Progressive Multiplier","Bonus Buy"]'::jsonb, 1),
  ('dragon-blaze',    'Dragon Blaze',    'Awaken the dragon, ignite massive wins.',    'Fantasy',   'High',   96.2, '5x3', 25, '/games/dragon-blaze.jpg',
   'Mystical fantasy slot featuring flaming respins, dragon wilds, and an explosive hold-and-win bonus round.',
   '["Hold & Win","Dragon Wilds","Flaming Respins"]'::jsonb, 2),
  ('fruit-fiesta',    'Fruit Fiesta',    'A juicy classic with a modern twist.',       'Fruits',    'Low',    96.8, '5x3', 20, '/games/fruit-fiesta.jpg',
   'Bright, energetic and instantly addictive. Cascading fruits drop fresh wins with every spin.',
   '["Cascading Reels","Cluster Pays","Mystery Symbols"]'::jsonb, 3),
  ('pharaohs-gold',   'Pharaoh''s Gold', 'Unlock the treasures of ancient Egypt.',     'Adventure', 'Medium', 96.4, '5x3', 30, '/games/pharaohs-gold.jpg',
   'Discover scarab scatters, expanding pharaoh symbols, and a tomb-bonus that reveals layered jackpots.',
   '["Expanding Symbols","Tomb Bonus","4 Jackpot Tiers"]'::jsonb, 4)
on conflict (slug) do nothing;