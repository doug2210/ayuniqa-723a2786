do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;

create or replace function public.current_user_has_role(_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = _role)
$$;
revoke execute on function public.current_user_has_role(public.app_role) from public;
grant execute on function public.current_user_has_role(public.app_role) to authenticated, service_role;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.site_config (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
grant select on public.site_config to anon, authenticated;
grant insert, update on public.site_config to authenticated;
grant all on public.site_config to service_role;
alter table public.site_config enable row level security;
drop policy if exists "site_config_select_public" on public.site_config;
create policy "site_config_select_public" on public.site_config for select to anon, authenticated using (true);
drop policy if exists "site_config_admin_insert" on public.site_config;
create policy "site_config_admin_insert" on public.site_config for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "site_config_admin_update" on public.site_config;
create policy "site_config_admin_update" on public.site_config for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
insert into public.site_config (id, data) values ('main', '{}'::jsonb) on conflict (id) do nothing;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
drop policy if exists "contact_insert_anyone" on public.contact_messages;
create policy "contact_insert_anyone" on public.contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "contact_admin_select" on public.contact_messages;
create policy "contact_admin_select" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "contact_admin_update" on public.contact_messages;
create policy "contact_admin_update" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(), 'admin'));

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
  status        text not null default 'released',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.games drop constraint if exists games_status_check;
alter table public.games add constraint games_status_check check (status in ('released', 'upcoming'));
grant select on public.games to anon, authenticated;
grant insert, update, delete on public.games to authenticated;
grant all on public.games to service_role;
alter table public.games enable row level security;
drop policy if exists "games_select_public" on public.games;
create policy "games_select_public" on public.games for select to anon, authenticated using (true);
drop policy if exists "games_admin_insert" on public.games;
create policy "games_admin_insert" on public.games for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "games_admin_update" on public.games;
create policy "games_admin_update" on public.games for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "games_admin_delete" on public.games;
create policy "games_admin_delete" on public.games for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_games_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists games_touch_updated_at on public.games;
create trigger games_touch_updated_at before update on public.games for each row execute function public.touch_games_updated_at();

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