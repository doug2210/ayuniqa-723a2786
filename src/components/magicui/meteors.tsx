"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Meteors({ number = 20, className }: { number?: number; className?: string }) {
  const [styles, setStyles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: number }, () => ({
      top: -5,
      left: `${Math.floor(Math.random() * 100)}%`,
      animationDelay: Math.random() * 2 + "s",
      animationDuration: Math.floor(Math.random() * 8 + 4) + "s",
    }));
    setStyles(arr);
  }, [number]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {styles.map((style, idx) => (
        <span
          key={idx}
          style={style}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-[color:var(--brand-light-orange)] shadow-[0_0_0_1px_#ffffff10]"
        >
          <span className="pointer-events-none absolute top-1/2 -z-10 h-px w-[60px] -translate-y-1/2 bg-gradient-to-r from-[color:var(--brand-orange)] to-transparent" />
        </span>
      ))}
    </div>
  );
}