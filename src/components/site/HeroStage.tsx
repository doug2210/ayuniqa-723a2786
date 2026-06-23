import { useEffect, useRef, useState, useMemo } from "react";
import {
  Crown, Diamond, Star, Cherry, Gem, Sparkles, Coins, Zap,
  Trophy, Heart, Flame, Bell, Award, Rocket,
} from "lucide-react";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";
import type { HeroStageSymbol, StageTint, StageIconName } from "@/lib/site-config";
import { AstronautMascot } from "@/components/site/AstronautMascot";

const ICON_MAP: Record<StageIconName, typeof Crown> = {
  Crown, Diamond, Star, Cherry, Gem, Coins, Sparkles, Zap,
  Trophy, Heart, Flame, Bell, Award, Rocket,
};

const REEL_STRIPS = [
  ["7", "★", "♦", "BAR", "♛", "🍒", "💎"],
  ["♦", "7", "BAR", "★", "💎", "♛", "🍒"],
  ["★", "💎", "🍒", "7", "♦", "BAR", "♛"],
];

const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + ((i * 7) % 5),
  delay: (i % 10) * 0.4,
  duration: 6 + ((i * 3) % 7),
}));

function tintVar(t: StageTint, custom?: string) {
  switch (t) {
    case "orange": return "var(--brand-orange)";
    case "yellow": return "var(--brand-yellow)";
    case "light":  return "var(--brand-light-orange)";
    case "grey":   return "var(--brand-grey)";
    case "custom": return custom || "var(--brand-orange)";
    default:       return "var(--brand-orange)";
  }
}

export function HeroStage() {
  const { config } = useSiteConfig();
  const stage = config.hero.stage;
  const ref = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setParallax({ x, y });
    };
    const onLeave = () => setParallax({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const reels = useMemo(() => REEL_STRIPS, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full max-w-[560px] select-none"
      style={{ perspective: "1200px" }}
    >
      {/* Conic glow ring */}
      <div
        className="absolute inset-[6%] rounded-full opacity-70 blur-2xl animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 0deg, color-mix(in oklab, var(--brand-orange) 55%, transparent), color-mix(in oklab, var(--brand-yellow) 45%, transparent), color-mix(in oklab, var(--brand-light-orange) 55%, transparent), color-mix(in oklab, var(--brand-orange) 55%, transparent))",
        }}
      />
      {/* Inner soft glow */}
      <div className="absolute inset-[18%] rounded-full bg-gradient-warm opacity-40 blur-3xl" />

      {/* Dotted halo */}
      <svg
        className="absolute inset-0 h-full w-full animate-spin-reverse"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
      >
        <circle
          cx="100"
          cy="100"
          r="86"
          stroke="color-mix(in oklab, var(--brand-orange) 55%, transparent)"
          strokeWidth="0.6"
          strokeDasharray="1 4"
        />
        <circle
          cx="100"
          cy="100"
          r="74"
          stroke="color-mix(in oklab, var(--brand-light-orange) 65%, transparent)"
          strokeWidth="0.4"
          strokeDasharray="0.5 3"
        />
      </svg>

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full animate-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background:
                p.id % 3 === 0
                  ? "var(--brand-yellow)"
                  : p.id % 3 === 1
                  ? "var(--brand-orange)"
                  : "var(--brand-light-orange)",
              boxShadow: "0 0 8px currentColor",
              color:
                p.id % 3 === 0
                  ? "var(--brand-yellow)"
                  : p.id % 3 === 1
                  ? "var(--brand-orange)"
                  : "var(--brand-light-orange)",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Center astronaut mascot (default stage) */}
      {stage.mode === "reels" && (
        <div
          className="absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${parallax.x * 18}px, ${parallax.y * 18}px) rotateX(${parallax.y * -6}deg) rotateY(${parallax.x * 8}deg)`,
            transition: "transform 0.25s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          <AstronautMascot className="h-auto w-full" />
        </div>
      )}

      {/* Center character image */}
      {stage.mode === "character" && stage.character.imageUrl && (
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${stage.character.scale}%`,
            transform: `translate(-50%, calc(-50% + ${stage.character.offsetY}%)) translate(${parallax.x * 30 * stage.character.parallax}px, ${parallax.y * 30 * stage.character.parallax}px)`,
            transition: "transform 0.25s ease-out",
            maxWidth: "85%",
          }}
        >
          <img
            src={stage.character.imageUrl}
            alt=""
            draggable={false}
            className="mx-auto h-auto w-full object-contain"
            style={{
              filter: stage.character.shadow
                ? "drop-shadow(0 20px 40px color-mix(in oklab, var(--brand-orange) 45%, transparent))"
                : undefined,
            }}
          />
        </div>
      )}

      {/* Floating chip badges — placed on the outer stage so they don't unbalance the centered reel box */}
      {stage.badges.megaWin.enabled && (
        <div
          className={`pointer-events-none absolute top-[28%] z-20 -rotate-6 rounded-2xl bg-[color:var(--brand-yellow)] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[color:var(--brand-grey)] shadow-card animate-float ${stage.badges.megaWin.side === "right" ? "right-[14%]" : "left-[14%]"}`}
        >
          {stage.badges.megaWin.label}
        </div>
      )}
      {stage.badges.html5.enabled && (
        <div
          className={`pointer-events-none absolute bottom-[26%] z-20 rotate-6 rounded-full bg-gradient-brand px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-glow ${stage.badges.html5.side === "left" ? "left-[12%]" : "right-[12%]"}`}
        >
          {stage.badges.html5.label}
        </div>
      )}

      {/* Floating icon symbols */}
      {stage.symbols.map((s: HeroStageSymbol, i: number) => {
        const px = parallax.x * 30 * s.depth;
        const py = parallax.y * 30 * s.depth;
        const color = tintVar(s.tint, s.color);
        const Icon = s.kind === "lucide" ? (ICON_MAP[s.icon ?? "Star"] ?? Star) : null;
        return (
          <div
            key={i}
            className="pointer-events-none absolute"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(-50%, -50%) translate(${px}px, ${py}px)`,
              transition: "transform 0.25s ease-out",
            }}
          >
            <div
              className="animate-floaty"
              style={{
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            >
              <div
                className="grid place-items-center rounded-2xl border border-border bg-card/90 shadow-card backdrop-blur"
                style={{
                  width: s.size,
                  height: s.size,
                  color,
                  boxShadow: `0 10px 30px -10px ${color}`,
                }}
              >
                {s.kind === "lucide" && Icon && (
                  <Icon style={{ width: s.size * 0.5, height: s.size * 0.5 }} />
                )}
                {s.kind === "emoji" && (
                  <span style={{ fontSize: s.size * 0.55, lineHeight: 1 }}>{s.emoji || "✨"}</span>
                )}
                {s.kind === "image" && s.imageUrl && (
                  <img
                    src={s.imageUrl}
                    alt=""
                    draggable={false}
                    style={{ width: s.size * 0.7, height: s.size * 0.7, objectFit: "contain" }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
