import { games as defaultGames, type Game } from "@/lib/games-data";

export type FloatingItem = {
  symbol: string;
  size?: number;
  speed?: number;
  opacity?: number;
  hue?: number;
};

export const DEFAULT_FLOATING_ITEMS: FloatingItem[] = [
  { symbol: "💎", size: 110, speed: 0.7, opacity: 1.0, hue: 190 },
  { symbol: "7️⃣", size: 130, speed: 0.5, opacity: 1.0, hue: 0 },
  { symbol: "🎰", size: 140, speed: 0.45, opacity: 1.0, hue: 280 },
];

export type HeroCTA = { label: string; href: string };

export type HeroConfig = {
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  subtitle: string;
  primaryCta: HeroCTA;
  secondaryCta: HeroCTA;
  heroImageUrl: string | null; // optional override; null = use built-in HeroStage
};

export type GameOverride = Partial<Pick<Game, "title" | "tagline" | "description" | "rtp" | "cover">> & {
  slug: string;
};

export type ContactConfig = {
  email: string;
  phone: string;
  address: string;
  compliance: string;
};

export type FloatingConfig = {
  items: FloatingItem[];
  density: number;
};

export type SiteConfig = {
  version: 1;
  hero: HeroConfig;
  floating: FloatingConfig;
  games: GameOverride[]; // sparse; merged with defaults by slug
  contact: ContactConfig;
};

export const DEFAULT_HERO: HeroConfig = {
  badge: "iGaming Studio · est. 2021",
  titlePrefix: "Slots that ",
  titleAccent: "spin smarter",
  titleSuffix: ", win bigger.",
  subtitle:
    "We design, build and certify premium HTML5 slot games for operators across regulated markets — bold art, fair math, and seamless integration.",
  primaryCta: { label: "Explore games", href: "/games" },
  secondaryCta: { label: "Partner with us", href: "/contact" },
  heroImageUrl: null,
};

export const DEFAULT_CONTACT: ContactConfig = {
  email: "partners@ayuniqa.io",
  phone: "+356 2778 0000",
  address: "Sliema, Malta · Sofia, Bulgaria",
  compliance: "B2B only. 18+. We do not offer real-money gambling to end users.",
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  version: 1,
  hero: DEFAULT_HERO,
  floating: { items: DEFAULT_FLOATING_ITEMS, density: 1.2 },
  games: [],
  contact: DEFAULT_CONTACT,
};

export const SITE_CONFIG_KEY = "ayuniqa.siteConfig.v1";
export const ADMIN_SESSION_KEY = "ayuniqa.admin.session";

/** Deep merge user config over defaults, tolerating missing keys. */
export function mergeConfig(stored: unknown): SiteConfig {
  if (!stored || typeof stored !== "object") return DEFAULT_SITE_CONFIG;
  const s = stored as Partial<SiteConfig>;
  return {
    version: 1,
    hero: { ...DEFAULT_HERO, ...(s.hero ?? {}) },
    floating: {
      items: Array.isArray(s.floating?.items) && s.floating!.items.length > 0
        ? s.floating!.items
        : DEFAULT_FLOATING_ITEMS,
      density: typeof s.floating?.density === "number" ? s.floating.density : 1.2,
    },
    games: Array.isArray(s.games) ? s.games : [],
    contact: { ...DEFAULT_CONTACT, ...(s.contact ?? {}) },
  };
}

/** Apply game overrides on top of defaults, preserving order of defaults. */
export function mergedGames(overrides: GameOverride[]): Game[] {
  if (!overrides || overrides.length === 0) return defaultGames;
  const map = new Map(overrides.map((o) => [o.slug, o]));
  return defaultGames.map((g) => {
    const o = map.get(g.slug);
    if (!o) return g;
    // Strip undefined overrides so they don't blank-out defaults.
    const clean = Object.fromEntries(
      Object.entries(o).filter(([, v]) => v !== undefined && v !== ""),
    );
    return { ...g, ...clean };
  });
}

export function loadConfig(): SiteConfig {
  if (typeof window === "undefined") return DEFAULT_SITE_CONFIG;
  try {
    const raw = window.localStorage.getItem(SITE_CONFIG_KEY);
    if (!raw) return DEFAULT_SITE_CONFIG;
    return mergeConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function saveConfig(cfg: SiteConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(cfg));
  } catch (err) {
    console.error("[site-config] failed to save", err);
  }
}

export function resetConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SITE_CONFIG_KEY);
}