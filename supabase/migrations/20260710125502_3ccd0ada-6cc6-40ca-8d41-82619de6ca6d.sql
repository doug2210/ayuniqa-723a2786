-- Sanitize public exposure of internal storage paths on public.games
CREATE OR REPLACE VIEW public.games_public
WITH (security_invoker = true) AS
SELECT
  id, slug, title, tagline, category, volatility, rtp, reels, paylines,
  cover_url, description, features, trailer_url, demo_url, screenshots,
  position, status, created_at, updated_at,
  CASE
    WHEN assets IS NULL THEN NULL::jsonb
    WHEN jsonb_typeof(assets) <> 'array' THEN assets
    ELSE COALESCE((
      SELECT jsonb_agg(elem - 'path')
      FROM jsonb_array_elements(assets) elem
    ), '[]'::jsonb)
  END AS assets
FROM public.games;

GRANT SELECT ON public.games_public TO anon, authenticated;

-- Restrict raw games table reads (which include storage paths) to signed-in users only
DROP POLICY IF EXISTS "games_select_public" ON public.games;
CREATE POLICY "games_select_authenticated" ON public.games
  FOR SELECT TO authenticated USING (true);

-- Lock down SECURITY DEFINER email/queue helpers so signed-in users cannot invoke them
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;