import { useEffect, useMemo, useRef, useState } from "react";

// Default slot-themed symbols. Later, the admin panel can override
// this list (and per-symbol speed/size/opacity) via a backend config.
// Until then, the source of truth lives here so anyone can tweak it.
export type FloatingItem = {
  symbol: string; // emoji or short text
  size?: number; // px
  speed?: number; // multiplier, 1 = matches scroll
  opacity?: number;
  hue?: number; // optional drop-shadow color hue
};

export const DEFAULT_FLOATING_ITEMS: FloatingItem[] = [
  { symbol: "💎", size: 110, speed: 0.7, opacity: 1.0, hue: 190 },
  { symbol: "7️⃣", size: 130, speed: 0.5, opacity: 1.0, hue: 0 },
  { symbol: "🎰", size: 140, speed: 0.45, opacity: 1.0, hue: 280 },
];

type Placed = FloatingItem & {
  id: number;
  left: number; // vw
  offset: number; // px initial offset
  drift: number; // horizontal sway amplitude px
  driftSpeed: number; // sway frequency
  rotate: number; // deg per scroll unit
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function FloatingSlotItems({
  items = DEFAULT_FLOATING_ITEMS,
  density = 1.2,
}: {
  items?: FloatingItem[];
  density?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  const rafRef = useRef<number | null>(null);

  const isMobile = vw < 768;

  // The viewport "stage" cycles each item from below the fold up past the top.
  const stage = vh + 240;

  // Build a stable layout of placed items (deterministic per render).
  const placed = useMemo<Placed[]>(() => {
    const rand = seededRandom(1337);
    const count = Math.round(items.length * density);
    const out: Placed[] = [];
    for (let i = 0; i < count; i++) {
      const base = items[i % items.length];
      // Place symbols on the left or right edge only so they never overlap content.
      const side = i % 2 === 0 ? "left" : "right";
      let leftVw: number;
      if (isMobile) {
        // On mobile, push them mostly off-screen so they never cover text.
        if (side === "left") {
          leftVw = -8 + rand() * 6; // -8 to -2vw (partially off-screen left)
        } else {
          leftVw = 96 + rand() * 6; // 96 to 102vw (partially off-screen right)
        }
      } else {
        if (side === "left") {
          leftVw = rand() * 12; // 0-12vw
        } else {
          leftVw = 88 + rand() * 12; // 88-100vw
        }
      }
      out.push({
        ...base,
        id: i,
        left: leftVw,
        offset: rand() * stage,
        drift: isMobile ? 6 + rand() * 14 : 20 + rand() * 60,
        driftSpeed: 0.0008 + rand() * 0.0014,
        rotate: (rand() - 0.5) * 0.4,
      });
    }
    return out;
  }, [items, density, stage, isMobile]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafRef.current = null;
      });
    };
    const onResize = () => {
      setVh(window.innerHeight);
      setVw(window.innerWidth);
    };
    setScrollY(window.scrollY);
    setVh(window.innerHeight);
    setVw(window.innerWidth);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {placed.map((p) => {
        const speed = p.speed ?? 0.6;
        // Items rise as the page is scrolled down.
        const traveled = scrollY * speed + p.offset;
        const y = stage - (traveled % stage); // px from top
        const sway = Math.sin(traveled * p.driftSpeed) * p.drift;
        const rot = traveled * p.rotate;
        const filter = p.hue !== undefined
          ? `drop-shadow(0 8px 24px hsl(${p.hue} 90% 60% / 0.55))`
          : undefined;
        const textShadow = p.hue !== undefined
          ? `0 0 12px hsl(${p.hue} 90% 60% / 0.8), 0 0 24px hsl(${p.hue} 90% 60% / 0.5)`
          : "0 0 12px rgba(255,255,255,0.6), 0 0 24px rgba(255,255,255,0.3)";
        const effectiveSize = isMobile ? Math.round((p.size ?? 40) * 0.6) : (p.size ?? 40);
        return (
          <span
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}vw`,
              top: 0,
              transform: `translate3d(${sway}px, ${y}px, 0) rotate(${rot}deg)`,
              fontSize: `${effectiveSize}px`,
              opacity: p.opacity ?? 0.8,
              filter,
              textShadow,
              willChange: "transform",
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            {p.symbol}
          </span>
        );
      })}
    </div>
  );
}
