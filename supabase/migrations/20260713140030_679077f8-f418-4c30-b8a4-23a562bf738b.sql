
-- 1) Move has_role to app_private so it is not in the exposed API schema.
create or replace function app_private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

revoke all on function app_private.has_role(uuid, public.app_role) from public;
grant execute on function app_private.has_role(uuid, public.app_role) to authenticated, service_role;

-- Repoint every policy that referenced public.has_role.
-- public.site_config
drop policy if exists site_config_admin_insert on public.site_config;
create policy site_config_admin_insert on public.site_config
  for insert to authenticated
  with check (app_private.has_role(auth.uid(), 'admin'));

drop policy if exists site_config_admin_update on public.site_config;
create policy site_config_admin_update on public.site_config
  for update to authenticated
  using (app_private.has_role(auth.uid(), 'admin'))
  with check (app_private.has_role(auth.uid(), 'admin'));

-- public.contact_messages
drop policy if exists contact_admin_select on public.contact_messages;
create policy contact_admin_select on public.contact_messages
  for select to authenticated
  using (app_private.has_role(auth.uid(), 'admin'));

drop policy if exists contact_admin_update on public.contact_messages;
create policy contact_admin_update on public.contact_messages
  for update to authenticated
  using (app_private.has_role(auth.uid(), 'admin'));

-- public.games
drop policy if exists games_admin_insert on public.games;
create policy games_admin_insert on public.games
  for insert to authenticated
  with check (app_private.has_role(auth.uid(), 'admin'));

drop policy if exists games_admin_update on public.games;
create policy games_admin_update on public.games
  for update to authenticated
  using (app_private.has_role(auth.uid(), 'admin'))
  with check (app_private.has_role(auth.uid(), 'admin'));

drop policy if exists games_admin_delete on public.games;
create policy games_admin_delete on public.games
  for delete to authenticated
  using (app_private.has_role(auth.uid(), 'admin'));

-- public.email_send_log
drop policy if exists "Admins can read email send log" on public.email_send_log;
create policy "Admins can read email send log" on public.email_send_log
  for select to authenticated
  using (app_private.has_role(auth.uid(), 'admin'));

-- storage.objects — site-assets
drop policy if exists "Admins manage site-assets" on storage.objects;
create policy "Admins manage site-assets" on storage.objects
  for all to authenticated
  using (bucket_id = 'site-assets' and app_private.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'site-assets' and app_private.has_role(auth.uid(), 'admin'));

drop policy if exists site_assets_admin_select on storage.objects;
create policy site_assets_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'site-assets' and app_private.has_role(auth.uid(), 'admin'));

-- storage.objects — game-assets
drop policy if exists "Admins manage game-assets" on storage.objects;
create policy "Admins manage game-assets" on storage.objects
  for all to authenticated
  using (bucket_id = 'game-assets' and app_private.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'game-assets' and app_private.has_role(auth.uid(), 'admin'));

drop policy if exists game_assets_admin_select on storage.objects;
create policy game_assets_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'game-assets' and app_private.has_role(auth.uid(), 'admin'));

-- Now safe to drop the public-facing wrapper.
drop function if exists public.has_role(uuid, public.app_role);

-- 2) Convert games_public view to SECURITY INVOKER so it enforces the querying
-- user's RLS instead of the view creator's permissions.
alter view public.games_public set (security_invoker = on);

-- 3) Restrict public.profiles reads to authenticated users only.
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_authenticated on public.profiles
  for select to authenticated
  using (true);
