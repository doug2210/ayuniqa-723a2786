create or replace function public.touch_games_updated_at()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin new.updated_at = now(); return new; end $$;

revoke execute on function public.touch_games_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.current_user_has_role(public.app_role) from anon;

drop policy if exists "contact_insert_anyone" on public.contact_messages;
create policy "contact_insert_anyone" on public.contact_messages
  for insert to anon, authenticated
  with check (
    name is not null and length(trim(name)) > 0
    and email is not null and length(trim(email)) > 0
    and message is not null and length(trim(message)) > 0
  );