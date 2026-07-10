-- Allow the public, security-invoker view to read the base game rows for anonymous visitors.
GRANT SELECT ON public.games TO anon;
GRANT SELECT ON public.games_public TO anon;

-- Keep authenticated/admin access intact for the admin UI.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;
GRANT SELECT ON public.games_public TO authenticated;
GRANT ALL ON public.games_public TO service_role;

-- Ensure the required anonymous read policy exists for the security-invoker view.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'games'
      AND policyname = 'games_select_anon'
  ) THEN
    CREATE POLICY games_select_anon
      ON public.games
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;