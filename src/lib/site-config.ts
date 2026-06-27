export type FloatingItem = {
  symbol: string;
  size?: number;
  speed?: number;
  opacity?: number;
  hue?: number;
  /** Optional image (PNG/SVG). When set, the image is rendered instead of the emoji/text symbol. */
  imageUrl?: string | null;
};

export const DEFAULT_FLOATING_ITEMS: FloatingItem[] = [
  { symbol: "💎", size: 110, speed: 0.7, opacity: 1.0, hue: 190 },
  { symbol: "7️⃣", size: 130, speed: 0.5, opacity: 1.0, hue: 0 },
  { symbol: "🎰", size: 140, speed: 0.45, opacity: 1.0, hue: 280 },
];

export type HeroCTA = { label: string; href: string };

/* ---------- HeroStage (interactive center stage) ---------- */

export type StageTint = "orange" | "yellow" | "light" | "grey" | "custom";

export const STAGE_ICON_NAMES = [
  "Crown",
  "Diamond",
  "Star",
  "Cherry",
  "Gem",
  "Coins",
  "Sparkles",
  "Zap",
  "Trophy",
  "Heart",
  "Flame",
  "Bell",
  "Award",
  "Rocket",
] as const;
export type StageIconName = (typeof STAGE_ICON_NAMES)[number];

export type HeroStageSymbol = {
  kind: "lucide" | "emoji" | "image";
  icon?: StageIconName;
  emoji?: string;
  imageUrl?: string | null;
  x: number; // %
  y: number; // %
  size: number; // px
  tint: StageTint;
  color?: string; // when tint === 'custom'
  depth: number; // 0..1
  delay: number; // s
  duration: number; // s
};

export type HeroStageBadge = {
  enabled: boolean;
  label: string;
  side: "left" | "right";
};

export type HeroStageCharacter = {
  imageUrl: string | null;
  scale: number; // %, 50..120
  offsetY: number; // %, -20..20
  shadow: boolean;
  parallax: number; // 0..1
};

export type HeroStageConfig = {
  mode: "character" | "reels" | "none";
  character: HeroStageCharacter;
  symbols: HeroStageSymbol[];
  badges: {
    megaWin: HeroStageBadge;
    html5: HeroStageBadge;
  };
};

export const DEFAULT_STAGE_SYMBOLS: HeroStageSymbol[] = [
  { kind: "lucide", icon: "Crown",    x: 12, y: 14, size: 56, tint: "orange", depth: 1.0, delay: 0.0, duration: 7.2 },
  { kind: "lucide", icon: "Diamond",  x: 82, y: 10, size: 44, tint: "light",  depth: 0.8, delay: 0.6, duration: 6.4 },
  { kind: "lucide", icon: "Star",     x: 90, y: 58, size: 38, tint: "yellow", depth: 0.6, delay: 1.1, duration: 5.8 },
  { kind: "lucide", icon: "Cherry",   x: 18, y: 78, size: 50, tint: "orange", depth: 0.9, delay: 0.3, duration: 7.0 },
  { kind: "lucide", icon: "Gem",      x: 70, y: 84, size: 42, tint: "light",  depth: 0.7, delay: 1.4, duration: 6.8 },
  { kind: "lucide", icon: "Coins",    x: 6,  y: 46, size: 36, tint: "yellow", depth: 0.5, delay: 0.9, duration: 6.2 },
  { kind: "lucide", icon: "Sparkles", x: 50, y: 4,  size: 28, tint: "light",  depth: 0.4, delay: 1.7, duration: 5.2 },
  { kind: "lucide", icon: "Zap",      x: 96, y: 36, size: 30, tint: "orange", depth: 0.55, delay: 2.0, duration: 5.6 },
];

export const DEFAULT_HERO_STAGE: HeroStageConfig = {
  mode: "reels",
  character: { imageUrl: null, scale: 100, offsetY: 0, shadow: true, parallax: 0.6 },
  symbols: DEFAULT_STAGE_SYMBOLS,
  badges: {
    megaWin: { enabled: true, label: "Mega Win", side: "left" },
    html5: { enabled: true, label: "HTML5", side: "right" },
  },
};

/* ---------- Hero stats & award ---------- */

export type StatItem = {
  enabled: boolean;
  value: number;
  suffix: string;
  decimals: number;
  label: string;
};

export const DEFAULT_STATS: StatItem[] = [
  { enabled: true, value: 40,   suffix: "+", decimals: 0, label: "Slot titles" },
  { enabled: true, value: 25,   suffix: "",  decimals: 0, label: "Markets" },
  { enabled: true, value: 99.9, suffix: "%", decimals: 1, label: "Uptime" },
];

export type AwardBadge = { enabled: boolean; label: string };
export const DEFAULT_AWARD: AwardBadge = { enabled: true, label: "Studio of the year nominee" };

export type HeroConfig = {
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  subtitle: string;
  primaryCta: HeroCTA;
  secondaryCta: HeroCTA;
  /** @deprecated migrated to stage.character.imageUrl */
  heroImageUrl?: string | null;
  stats: StatItem[];
  award: AwardBadge;
  stage: HeroStageConfig;
  /** Solid background color for the hero section. */
  backgroundColor: string;
  /** Optional video URL that replaces the default scroll-scrubbed hero video. */
  scrollVideoUrl: string | null;
  /** Playback mode for the hero video: scrubbed by scroll, or auto-looping. */
  scrollVideoMode: "scroll" | "loop";
  /** Percentage of horizontal black bars to crop from each side of the hero video (0–45). */
  scrollVideoSideCropPct?: number;
};

export type ContactConfig = {
  email: string;
  phone: string;
  address: string;
  compliance: string;
};

export type AboutStat = { value: string; label: string };

export type AboutConfig = {
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  lead: string;
  stats: AboutStat[];
  paragraphs: string[];
};

export const SOCIAL_PLATFORMS = [
  "twitter",
  "linkedin",
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
  "github",
  "discord",
  "website",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type SocialLink = { platform: SocialPlatform; url: string; label?: string };

export type FloatingConfig = {
  items: FloatingItem[];
  density: number;
};

export type BrandingConfig = {
  /** Custom logo URL used in the header and footer. Null = use default asset. */
  logoUrl: string | null;
};

export const DEFAULT_BRANDING: BrandingConfig = {
  logoUrl: null,
};

export type SiteConfig = {
  version: 1;
  hero: HeroConfig;
  floating: FloatingConfig;
  contact: ContactConfig;
  about: AboutConfig;
  social: SocialLink[];
  branding: BrandingConfig;
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
  stats: DEFAULT_STATS,
  award: DEFAULT_AWARD,
  stage: DEFAULT_HERO_STAGE,
  backgroundColor: "#F7F3E6",
  scrollVideoUrl: null,
  scrollVideoMode: "scroll",
  scrollVideoSideCropPct: 0,
};

export const DEFAULT_CONTACT: ContactConfig = {
  email: "partners@ayuniqa.io",
  phone: "+356 2778 0000",
  address: "Sliema, Malta · Sofia, Bulgaria",
  compliance: "B2B only. 18+. We do not offer real-money gambling to end users.",
};

export const DEFAULT_ABOUT: AboutConfig = {
  titlePrefix: "Crafted by ",
  titleAccent: "slot people",
  titleSuffix: ", for slot people.",
  lead: "Ayuniqa is a B2B iGaming studio founded in 2021 by veterans from some of the industry's biggest names. We obsess over the math, the moment of anticipation, and the polish that turns a spin into a story.",
  stats: [
    { value: "40+", label: "Titles shipped" },
    { value: "60", label: "Team members" },
    { value: "25", label: "Regulated markets" },
  ],
  paragraphs: [
    "Our team blends senior artists, mathematicians, and engineers under one roof. We believe great slots come from tight feedback loops — designers sitting next to mathematicians, math reviewed against player behaviour, art iterated alongside engine performance.",
    "We work with licensed operators and aggregators across Europe, LATAM, and emerging markets. Every release is certified for the jurisdictions we serve.",
  ],
};

export const DEFAULT_SOCIAL: SocialLink[] = [
  { platform: "linkedin", url: "https://www.linkedin.com/" },
  { platform: "twitter", url: "https://twitter.com/" },
  { platform: "instagram", url: "https://www.instagram.com/" },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  version: 1,
  hero: DEFAULT_HERO,
  floating: { items: DEFAULT_FLOATING_ITEMS, density: 1.2 },
  contact: DEFAULT_CONTACT,
  about: DEFAULT_ABOUT,
  social: DEFAULT_SOCIAL,
  branding: DEFAULT_BRANDING,
};

export const SITE_CONFIG_KEY = "ayuniqa.siteConfig.v1";
export const ADMIN_SESSION_KEY = "ayuniqa.admin.session";

/** Deep merge user config over defaults, tolerating missing keys. */
export function mergeConfig(stored: unknown): SiteConfig {
  if (!stored || typeof stored !== "object") return DEFAULT_SITE_CONFIG;
  const s = stored as Partial<SiteConfig>;
  const heroIn = (s.hero ?? {}) as Partial<HeroConfig>;
  const stageIn = (heroIn.stage ?? {}) as Partial<HeroStageConfig>;
  const characterIn = (stageIn.character ?? {}) as Partial<HeroStageCharacter>;
  // Migrate legacy heroImageUrl -> stage.character.imageUrl + character mode.
  const migratedCharacterUrl =
    characterIn.imageUrl ?? (heroIn.heroImageUrl ? heroIn.heroImageUrl : null);
  const migratedMode: HeroStageConfig["mode"] =
    stageIn.mode ?? (heroIn.heroImageUrl ? "character" : DEFAULT_HERO_STAGE.mode);
  const mergedStage: HeroStageConfig = {
    mode: migratedMode,
    character: {
      ...DEFAULT_HERO_STAGE.character,
      ...characterIn,
      imageUrl: migratedCharacterUrl,
    },
    symbols:
      Array.isArray(stageIn.symbols) && stageIn.symbols.length > 0
        ? (stageIn.symbols as HeroStageSymbol[])
        : DEFAULT_HERO_STAGE.symbols,
    badges: {
      megaWin: { ...DEFAULT_HERO_STAGE.badges.megaWin, ...(stageIn.badges?.megaWin ?? {}) },
      html5: { ...DEFAULT_HERO_STAGE.badges.html5, ...(stageIn.badges?.html5 ?? {}) },
    },
  };
  return {
    version: 1,
    hero: {
      ...DEFAULT_HERO,
      ...heroIn,
      stats: Array.isArray(heroIn.stats) && heroIn.stats.length > 0 ? heroIn.stats : DEFAULT_STATS,
      award: { ...DEFAULT_AWARD, ...(heroIn.award ?? {}) },
      stage: mergedStage,
      heroImageUrl: null,
      backgroundColor:
        typeof heroIn.backgroundColor === "string" && heroIn.backgroundColor.trim()
          ? heroIn.backgroundColor
          : DEFAULT_HERO.backgroundColor,
      scrollVideoUrl:
        typeof heroIn.scrollVideoUrl === "string" && heroIn.scrollVideoUrl.trim()
          ? heroIn.scrollVideoUrl
          : null,
      scrollVideoMode:
        heroIn.scrollVideoMode === "loop" ? "loop" : "scroll",
      scrollVideoSideCropPct:
        typeof heroIn.scrollVideoSideCropPct === "number"
          ? Math.max(0, Math.min(45, heroIn.scrollVideoSideCropPct))
          : DEFAULT_HERO.scrollVideoSideCropPct,
    },
    floating: {
      items: Array.isArray(s.floating?.items) && s.floating!.items.length > 0
        ? s.floating!.items
        : DEFAULT_FLOATING_ITEMS,
      density: typeof s.floating?.density === "number" ? s.floating.density : 1.2,
    },
    contact: { ...DEFAULT_CONTACT, ...(s.contact ?? {}) },
    about: {
      ...DEFAULT_ABOUT,
      ...(s.about ?? {}),
      stats:
        Array.isArray(s.about?.stats) && s.about!.stats.length > 0
          ? s.about!.stats
          : DEFAULT_ABOUT.stats,
      paragraphs:
        Array.isArray(s.about?.paragraphs) && s.about!.paragraphs.length > 0
          ? s.about!.paragraphs
          : DEFAULT_ABOUT.paragraphs,
    },
    social: Array.isArray(s.social) ? s.social : DEFAULT_SOCIAL,
    branding: {
      ...DEFAULT_BRANDING,
      ...(s.branding ?? {}),
      logoUrl:
        typeof s.branding?.logoUrl === "string" && s.branding.logoUrl.trim()
          ? s.branding.logoUrl
          : null,
    },
  };
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