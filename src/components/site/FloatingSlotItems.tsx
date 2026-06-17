import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";
import { DEFAULT_FLOATING_ITEMS, type FloatingItem } from "@/lib/site-config";
export { DEFAULT_FLOATING_ITEMS, type FloatingItem };

type Placed = FloatingItem & {
  id: number;
  side: "left" | "right";
  inset: number; // vw from the matching side
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
  items,
  density,
}: {
  items?: FloatingItem[];
  density?: number;
}) {
  const { config, loaded } = useSiteConfig();
  const effectiveItems = items ?? config.floating.items;
  const effectiveDensity = density ?? config.floating.density;
  // Avoid a flash of stale default icons before the Supabase config arrives.
  // When items are provided as a prop, render immediately (caller controls the data).
  const shouldRender = items !== undefined || loaded;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  const rafRef = useRef<number | null>(null);

  const isMobile = vw < 768;

  // The viewport "stage" cycles each item from below the fold up past the top.
  const stage = vh + 240;

  // Build a stable layout of placed items (deterministic per render).
  // Split evenly between left and right sides.
  const placed = useMemo<Placed[]>(() => {
    const leftRand = seededRandom(1337);
    const rightRand = seededRandom(7331);
    const count = Math.max(0, Math.round(effectiveItems.length * effectiveDensity));
    // Duplicate one item when needed so both sides are always perfectly balanced.
    const perSide = count > 0 ? Math.ceil(count / 2) : 0;
    const out: Placed[] = [];
    let id = 0;

    const place = (rand: () => number, side: "left" | "right") => {
      const base = effectiveItems[id % effectiveItems.length];
      const inset = isMobile ? 0.25 + rand() * 1.5 : 0.4 + rand() * 2.2;
      out.push({
        ...base,
        id,
        side,
        inset,
        offset: rand() * stage,
        drift: isMobile ? 3 + rand() * 6 : 6 + rand() * 16,
        driftSpeed: 0.0008 + rand() * 0.0014,
        rotate: (rand() - 0.5) * 0.4,
      });
      id += 1;
    };

    for (let i = 0; i < perSide; i++) place(leftRand, "left");
    for (let i = 0; i < perSide; i++) place(rightRand, "right");
    return out;
  }, [effectiveItems, effectiveDensity, stage, isMobile]);


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

  const sideMask = isMobile
    ? "linear-gradient(to right, black 0%, black 22%, transparent 38%, transparent 62%, black 78%, black 100%)"
    : "linear-gradient(to right, black 0%, black 14%, transparent 25%, transparent 75%, black 86%, black 100%)";

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 10, maskImage: sideMask, WebkitMaskImage: sideMask }}
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
        const directionalSway = p.side === "left" ? -Math.abs(sway) : Math.abs(sway);
        const hiddenOffset = Math.round(effectiveSize * (isMobile ? 0.56 : 0.64));
        const insetPx = (p.inset / 100) * vw;
        const visibleIntrusion = insetPx + effectiveSize - hiddenOffset;
        const fadeStart = isMobile ? 48 : 96;
        const fadeEnd = isMobile ? 96 : 150;
        const fadeProgress = (visibleIntrusion - fadeStart) / (fadeEnd - fadeStart);
        const edgeOpacity = Math.max(0, Math.min(1, 1 - fadeProgress));
        const sidePosition = p.side === "left"
          ? { left: `calc(${p.inset}vw - ${hiddenOffset}px)` }
          : { right: `calc(${p.inset}vw - ${hiddenOffset}px)` };
        const commonStyle = {
          position: "absolute" as const,
          ...sidePosition,
          top: 0,
          transform: `translate3d(${directionalSway}px, ${y}px, 0) rotate(${rot}deg)`,
          opacity: (p.opacity ?? 0.8) * edgeOpacity,
          filter,
          willChange: "transform" as const,
          userSelect: "none" as const,
          lineHeight: 1,
        };
        if (p.imageUrl) {
          return (
            <img
              key={p.id}
              src={p.imageUrl}
              alt=""
              draggable={false}
              style={{
                ...commonStyle,
                width: `${effectiveSize}px`,
                height: `${effectiveSize}px`,
                objectFit: "contain",
              }}
            />
          );
        }
        return (
          <span
            key={p.id}
            style={{
              ...commonStyle,
              fontSize: `${effectiveSize}px`,
              textShadow,
            }}
          >
            {p.symbol}
          </span>
        );
      })}
    </div>
  );
}
