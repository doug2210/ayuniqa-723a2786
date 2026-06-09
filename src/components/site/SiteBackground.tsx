import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";

export function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AnimatedGridPattern
        numSquares={28}
        maxOpacity={0.18}
        duration={3.5}
        className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-10%]"
      />
    </div>
  );
}