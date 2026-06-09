import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AuroraText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10 bg-[linear-gradient(110deg,var(--brand-orange),45%,var(--brand-yellow),55%,var(--brand-light-orange))] bg-[length:200%_100%] bg-clip-text text-transparent animate-aurora">
        {children}
      </span>
    </span>
  );
}