import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { type ReactNode } from "react";

type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-in"
  | "scale-in"
  | "zoom-in"
  | "flip-up";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

const hiddenState: Record<AnimationType, string> = {
  "fade-up": "opacity-0 translate-y-40 scale-75 blur-sm",
  "fade-down": "opacity-0 -translate-y-40 scale-75 blur-sm",
  "fade-left": "opacity-0 -translate-x-40 scale-75 blur-sm",
  "fade-right": "opacity-0 translate-x-40 scale-75 blur-sm",
  "fade-in": "opacity-0 scale-90 blur-sm",
  "scale-in": "opacity-0 scale-75 blur-sm",
  "zoom-in": "opacity-0 scale-50 blur-md",
  "flip-up": "opacity-0 scale-75 blur-sm",
};

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 1200,
  className,
  threshold,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform,filter] will-change-transform",
        "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isVisible ? "opacity-100 translate-x-0 translate-y-0 scale-100 blur-0" : hiddenState[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
  animation?: AnimationType;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
  baseDelay = 0,
  animation = "fade-up",
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <ScrollReveal
          key={i}
          animation={animation}
          delay={baseDelay + i * staggerDelay}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
