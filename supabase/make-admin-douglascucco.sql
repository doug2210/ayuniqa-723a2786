-- Promove contact@douglascucco.com a admin.
-- Rode este SQL no SQL Editor do Supabase.
-- Pré-requisito: a conta já precisa ter sido criada (sign up em /admin).

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'contact@douglascucco.com'
on conflict (user_id, role) do nothing;

-- Verificar:
select u.email, r.role
from auth.users u
join public.user_roles r on r.user_id = u.id
where u.email = 'contact@douglascucco.com';