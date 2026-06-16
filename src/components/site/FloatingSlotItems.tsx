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
  { symbol: "🍒", size: 48, speed: 0.55, opacity: 0.95, hue: 350 },
  { symbol: "🍋", size: 44, speed: 0.7, opacity: 0.9, hue: 50 },
  { symbol: "🔔", size: 50, speed: 0.45, opacity: 0.9, hue: 40 },
  { symbol: "💎", size: 42, speed: 0.8, opacity: 1.0, hue: 190 },
  { symbol: "7️⃣", size: 54, speed: 0.5, opacity: 0.95, hue: 0 },
  { symbol: "⭐", size: 46, speed: 0.65, opacity: 0.9, hue: 45 },
  { symbol: "🍀", size: 44, speed: 0.6, opacity: 0.95, hue: 130 },
  { symbol: "🎰", size: 56, speed: 0.4, opacity: 0.9, hue: 280 },
  { symbol: "🪙", size: 40, speed: 0.9, opacity: 0.95, hue: 45 },
  { symbol: "🎲", size: 46, speed: 0.55, opacity: 0.9, hue: 310 },
  { symbol: "👑", size: 48, speed: 0.5, opacity: 0.95, hue: 45 },
  { symbol: "💰", size: 48, speed: 0.7, opacity: 0.95, hue: 130 },
  { symbol: "🃏", size: 44, speed: 0.6, opacity: 0.9, hue: 220 },
  { symbol: "🎯", size: 46, speed: 0.75, opacity: 0.95, hue: 30 },
  { symbol: "🔥", size: 50, speed: 0.5, opacity: 0.9, hue: 15 },
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
  density = 2.2,
}: {
  items?: FloatingItem[];
  density?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const rafRef = useRef<number | null>(null);

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
      if (side === "left") {
        leftVw = rand() * 10; // 0-10vw
      } else {
        leftVw = 90 + rand() * 10; // 90-100vw
      }
      out.push({
        ...base,
        id: i,
        left: leftVw,
        offset: rand() * 1200,
        drift: 20 + rand() * 60,
        driftSpeed: 0.0008 + rand() * 0.0014,
        rotate: (rand() - 0.5) * 0.4,
      });
    }
    return out;
  }, [items, density]);

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
    const onResize = () => setVh(window.innerHeight);
    setScrollY(window.scrollY);
    setVh(window.innerHeight);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // The viewport "stage" cycles each item from below the fold up past the top.
  const stage = vh + 240;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
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
        return (
          <span
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}vw`,
              top: 0,
              transform: `translate3d(${sway}px, ${y}px, 0) rotate(${rot}deg)`,
              fontSize: `${p.size ?? 40}px`,
              opacity: p.opacity ?? 0.8,
              filter,
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
