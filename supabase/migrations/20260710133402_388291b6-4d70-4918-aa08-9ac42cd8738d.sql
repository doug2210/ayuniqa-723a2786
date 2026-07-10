CREATE SCHEMA IF NOT EXISTS app_private;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.public_game_assets(_game_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN g.assets IS NULL THEN NULL::jsonb
    WHEN jsonb_typeof(g.assets) <> 'array'::text THEN g.assets
    ELSE COALESCE((
      SELECT jsonb_agg(elem.value - 'path'::text)
      FROM jsonb_array_elements(g.assets) AS elem(value)
    ), '[]'::jsonb)
  END
  FROM public.games AS g
  WHERE g.id = _game_id
$$;

REVOKE ALL ON FUNCTION app_private.public_game_assets(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.public_game_assets(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE VIEW public.games_public
WITH (security_invoker = true)
AS
SELECT
  games.id,
  games.slug,
  games.title,
  games.tagline,
  games.category,
  games.volatility,
  games.rtp,
  games.reels,
  games.paylines,
  games.cover_url,
  games.description,
  games.features,
  games.trailer_url,
  games.demo_url,
  games.screenshots,
  games.position,
  games.status,
  games.created_at,
  games.updated_at,
  app_private.public_game_assets(games.id) AS assets
FROM public.games;

REVOKE SELECT ON public.games FROM anon;
GRANT SELECT (
  id,
  slug,
  title,
  tagline,
  category,
  volatility,
  rtp,
  reels,
  paylines,
  cover_url,
  description,
  features,
  trailer_url,
  demo_url,
  screenshots,
  position,
  status,
  created_at,
  updated_at
) ON public.games TO anon;

GRANT SELECT ON public.games_public TO anon, authenticated;
GRANT ALL ON public.games_public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;