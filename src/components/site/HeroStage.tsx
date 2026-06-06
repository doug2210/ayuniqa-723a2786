import { useEffect, useRef, useState, useMemo } from "react";
import { Crown, Diamond, Star, Cherry, Gem, Sparkles, Coins, Zap } from "lucide-react";

type Symbol = {
  icon: typeof Crown;
  label?: string;
  x: number; // %
  y: number; // %
  size: number; // px
  delay: number;
  duration: number;
  tint: "orange" | "yellow" | "light" | "grey";
  depth: number; // 0..1 parallax strength
};

const SYMBOLS: Symbol[] = [
  { icon: Crown,    x: 12, y: 14, size: 56, delay: 0.0, duration: 7.2, tint: "orange", depth: 1.0 },
  { icon: Diamond,  x: 82, y: 10, size: 44, delay: 0.6, duration: 6.4, tint: "light",  depth: 0.8 },
  { icon: Star,     x: 90, y: 58, size: 38, delay: 1.1, duration: 5.8, tint: "yellow", depth: 0.6 },
  { icon: Cherry,   x: 18, y: 78, size: 50, delay: 0.3, duration: 7.0, tint: "orange", depth: 0.9 },
  { icon: Gem,      x: 70, y: 84, size: 42, delay: 1.4, duration: 6.8, tint: "light",  depth: 0.7 },
  { icon: Coins,    x: 6,  y: 46, size: 36, delay: 0.9, duration: 6.2, tint: "yellow", depth: 0.5 },
  { icon: Sparkles, x: 50, y: 4,  size: 28, delay: 1.7, duration: 5.2, tint: "light",  depth: 0.4 },
  { icon: Zap,      x: 96, y: 36, size: 30, delay: 2.0, duration: 5.6, tint: "orange", depth: 0.55 },
];

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

function tintVar(t: Symbol["tint"]) {
  switch (t) {
    case "orange": return "var(--brand-orange)";
    case "yellow": return "var(--brand-yellow)";
    case "light":  return "var(--brand-light-orange)";
    default:       return "var(--brand-grey)";
  }
}

export function HeroStage() {
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

      {/* Center reel stage */}
      <div
        className="absolute left-1/2 top-1/2 w-[58%]"
        style={{
          transform: `translate(-50%, -50%) rotateX(${parallax.y * -8}deg) rotateY(${parallax.x * 10}deg)`,
          transition: "transform 0.25s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative rounded-3xl border border-border bg-card/95 p-4 shadow-glow backdrop-blur">
          {/* Top brand bar */}
          <div className="mb-3 flex items-center justify-between rounded-xl bg-gradient-brand px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <span>ReelForge</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5">Live</span>
          </div>

          {/* Reels */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gradient-to-b from-[color:var(--brand-grey)]/5 to-[color:var(--brand-orange)]/5 p-2">
            {reels.map((strip, i) => (
              <div
                key={i}
                className="relative h-32 overflow-hidden rounded-xl bg-card shadow-card sm:h-36"
              >
                {/* Top/Bottom fade */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-card to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-card to-transparent" />
                {/* Highlight line */}
                <div
                  className="pointer-events-none absolute inset-x-1 top-1/2 z-20 h-10 -translate-y-1/2 rounded-md border-2"
                  style={{ borderColor: "color-mix(in oklab, var(--brand-orange) 70%, transparent)" }}
                />
                <div
                  className="flex flex-col items-center justify-start gap-2 py-2 will-change-transform animate-reel"
                  style={{
                    animationDuration: `${4 + i * 1.4}s`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  {[...strip, ...strip].map((s, j) => (
                    <span
                      key={j}
                      className="grid h-10 w-10 place-items-center text-2xl font-black"
                      style={{
                        color:
                          j % 3 === 0
                            ? "var(--brand-orange)"
                            : j % 3 === 1
                            ? "var(--brand-light-orange)"
                            : "var(--brand-grey)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom meta */}
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>RTP 96.4%</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--brand-orange)]" />
              MAX WIN 10,000x
            </span>
          </div>
        </div>

      </div>

      {/* Floating chip badges — placed on the outer stage so they don't unbalance the centered reel box */}
      <div className="pointer-events-none absolute left-[14%] top-[28%] z-20 -rotate-6 rounded-2xl bg-[color:var(--brand-yellow)] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[color:var(--brand-grey)] shadow-card animate-float">
        Mega Win
      </div>
      <div className="pointer-events-none absolute right-[12%] bottom-[26%] z-20 rotate-6 rounded-full bg-gradient-brand px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-glow">
        HTML5
      </div>

      {/* Floating icon symbols */}
      {SYMBOLS.map((s, i) => {
        const Icon = s.icon;
        const px = parallax.x * 30 * s.depth;
        const py = parallax.y * 30 * s.depth;
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
                  color: tintVar(s.tint),
                  boxShadow: `0 10px 30px -10px ${tintVar(s.tint)}`,
                }}
              >
                <Icon style={{ width: s.size * 0.5, height: s.size * 0.5 }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
