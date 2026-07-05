import { createFileRoute } from "@tanstack/react-router";

// One-off backfill: convert stored public /object/public/site-assets/... URLs
// on the games table into long-lived signed URLs, so the bucket can stay
// private per workspace policy without breaking the public site.
// Protected by ADMIN_BOOTSTRAP_SECRET; safe to leave in place but intended
// to be deleted after a successful run.
export const Route = createFileRoute("/api/public/backfill-signed-urls")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-bootstrap-secret");
        if (!secret || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const PUBLIC_PREFIX = "/storage/v1/object/public/site-assets/";
        const TTL = 60 * 60 * 24 * 365 * 100; // 100 years

        const toPath = (url: string | null): string | null => {
          if (!url) return null;
          const idx = url.indexOf(PUBLIC_PREFIX);
          if (idx < 0) return null;
          return url.slice(idx + PUBLIC_PREFIX.length);
        };

        const sign = async (url: string | null): Promise<string | null> => {
          const path = toPath(url);
          if (!path) return url;
          const { data, error } = await supabaseAdmin.storage
            .from("site-assets")
            .createSignedUrl(path, TTL);
          if (error || !data) {
            console.warn("[backfill] sign failed", path, error?.message);
            return url;
          }
          return data.signedUrl;
        };

        const { data: games, error } = await supabaseAdmin
          .from("games")
          .select("id, cover_url, trailer_url, screenshots");
        if (error) {
          return new Response(`db error: ${error.message}`, { status: 500 });
        }

        const results: Array<{ id: string; updated: boolean }> = [];
        for (const g of games ?? []) {
          const nextCover = await sign(g.cover_url);
          const nextTrailer = await sign(g.trailer_url);
          const shotsRaw: unknown = g.screenshots;
          const shots: string[] = Array.isArray(shotsRaw)
            ? shotsRaw.filter((s): s is string => typeof s === "string")
            : [];
          const nextShots = await Promise.all(shots.map((s) => sign(s)));
          const patch: {
            cover_url?: string;
            trailer_url?: string | null;
            screenshots?: string[];
          } = {};
          if (nextCover && nextCover !== g.cover_url) patch.cover_url = nextCover;
          if (nextTrailer !== g.trailer_url)
            patch.trailer_url = nextTrailer ?? null;
          const cleanShots = nextShots.filter(
            (s): s is string => typeof s === "string",
          );
          if (JSON.stringify(cleanShots) !== JSON.stringify(shots))
            patch.screenshots = cleanShots;
          if (Object.keys(patch).length === 0) {
            results.push({ id: g.id, updated: false });
            continue;
          }
          const { error: upErr } = await supabaseAdmin
            .from("games")
            .update(patch)
            .eq("id", g.id);
          if (upErr) {
            console.warn("[backfill] update failed", g.id, upErr.message);
            results.push({ id: g.id, updated: false });
          } else {
            results.push({ id: g.id, updated: true });
          }
        }

        return new Response(JSON.stringify({ ok: true, results }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});