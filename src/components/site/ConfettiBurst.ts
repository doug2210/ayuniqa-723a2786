"use client";
import confetti from "canvas-confetti";

export function fireConfetti(origin?: { x: number; y: number }) {
  if (typeof window === "undefined") return;
  const opts = {
    particleCount: 80,
    spread: 75,
    startVelocity: 45,
    ticks: 200,
    scalar: 0.9,
    colors: ["#f24b02", "#f5a514", "#f6eb23", "#ffffff"],
    origin: origin ?? { x: 0.5, y: 0.6 },
  };
  confetti(opts);
  setTimeout(() => confetti({ ...opts, particleCount: 50, spread: 100 }), 150);
}

export function confettiFromEvent(e: React.MouseEvent) {
  fireConfetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
}