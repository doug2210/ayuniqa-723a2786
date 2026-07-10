-- These SECURITY DEFINER helpers are intended for RLS/internal authorization checks,
-- not as client-callable RPC endpoints.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO service_role;