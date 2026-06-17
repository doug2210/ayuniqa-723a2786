import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GameAsset } from "@/lib/games-data";

export type DbGame = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  volatility: string;
  rtp: number;
  reels: string;
  paylines: number;
  cover_url: string;
  description: string;
  features: string[];
  trailer_url: string | null;
  demo_url: string | null;
  screenshots: string[];
  assets: GameAsset[];
  position: number;
};

function fromRow(row: Record<string, unknown>): DbGame {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    tagline: String(row.tagline ?? ""),
    category: String(row.category ?? "Classic"),
    volatility: String(row.volatility ?? "Medium"),
    rtp: typeof row.rtp === "number" ? row.rtp : parseFloat(String(row.rtp ?? 0)) || 0,
    reels: String(row.reels ?? "5x3"),
    paylines: Number(row.paylines ?? 0) || 0,
    cover_url: String(row.cover_url ?? ""),
    description: String(row.description ?? ""),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    trailer_url: (row.trailer_url as string | null) ?? null,
    demo_url: (row.demo_url as string | null) ?? null,
    screenshots: Array.isArray(row.screenshots) ? (row.screenshots as string[]) : [],
    assets: Array.isArray(row.assets) ? (row.assets as GameAsset[]) : [],
    position: Number(row.position ?? 0) || 0,
  };
}

export async function fetchGames(): Promise<DbGame[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[games] fetch failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => fromRow(r as Record<string, unknown>));
}

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: fetchGames,
    staleTime: 30_000,
  });
}

export function useGame(slug: string) {
  const q = useGames();
  const game = q.data?.find((g) => g.slug === slug) ?? null;
  return { ...q, game };
}

/* ---------- Mutations (admin only — enforced by RLS) ---------- */

export type GameInput = Omit<DbGame, "id"> & { id?: string };

function toRow(g: GameInput): Record<string, unknown> {
  return {
    ...(g.id ? { id: g.id } : {}),
    slug: g.slug,
    title: g.title,
    tagline: g.tagline,
    category: g.category,
    volatility: g.volatility,
    rtp: g.rtp,
    reels: g.reels,
    paylines: g.paylines,
    cover_url: g.cover_url,
    description: g.description,
    features: g.features,
    trailer_url: g.trailer_url,
    demo_url: g.demo_url,
    screenshots: g.screenshots,
    assets: g.assets,
    position: g.position,
  };
}

export function useUpsertGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (g: GameInput) => {
      const { data, error } = await supabase
        .from("games")
        .upsert(toRow(g), { onConflict: "slug" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useDeleteGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase.from("games").delete().eq("slug", slug);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export const GAME_CATEGORIES = ["Classic", "Adventure", "Fantasy", "Fruits"] as const;
export const GAME_VOLATILITIES = ["Low", "Medium", "High"] as const;

export function emptyGame(): GameInput {
  return {
    slug: "",
    title: "",
    tagline: "",
    category: "Classic",
    volatility: "Medium",
    rtp: 96.0,
    reels: "5x3",
    paylines: 20,
    cover_url: "",
    description: "",
    features: [],
    trailer_url: null,
    demo_url: null,
    screenshots: [],
    assets: [],
    position: 999,
  };
}