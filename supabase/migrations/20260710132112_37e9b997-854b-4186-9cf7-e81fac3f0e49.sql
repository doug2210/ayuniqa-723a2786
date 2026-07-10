
-- Allow anon to read games rows through RLS (needed because games_public view runs with security_invoker=true)
CREATE POLICY games_select_anon ON public.games FOR SELECT TO anon USING (true);

-- Prevent anon from querying the base table directly via the Data API,
-- so public reads must go through the games_public view (which sanitizes internal asset paths).
REVOKE ALL ON public.games FROM anon;
