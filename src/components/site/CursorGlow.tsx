"use client";
import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[9999] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 mix-blend-screen"
      style={{
        left: pos.x,
        top: pos.y,
        opacity: visible ? 0.55 : 0,
        background:
          "radial-gradient(circle, color-mix(in oklab, var(--brand-orange) 35%, transparent) 0%, transparent 60%)",
      }}
    />
  );
}