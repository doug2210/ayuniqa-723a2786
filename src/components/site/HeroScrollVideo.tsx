import { useEffect, useRef } from "react";
import videoAsset from "@/assets/hero-scroll-v2.mp4.asset.json";

export function HeroScrollVideo({
  src,
  mode = "scroll",
}: { src?: string | null; mode?: "scroll" | "loop" } = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (mode === "loop") {
      // Autoplay loop — no scroll scrubbing.
      video.loop = true;
      const tryPlay = () => {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      };
      if (video.readyState >= 2) tryPlay();
      else video.addEventListener("loadeddata", tryPlay, { once: true });
      return () => {
        video.removeEventListener("loadeddata", tryPlay);
        video.pause();
      };
    }

    video.loop = false;
    video.pause();

    let rafId = 0;
    let ready = false;
    let targetTime = 0;

    const update = () => {
      rafId = 0;
      const section = video.closest("section");
      if (!section || !ready || !video.duration) return;
      const rect = section.getBoundingClientRect();
      const denom = rect.height || 1;
      let p = -rect.top / denom;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      targetTime = p * video.duration;
      try {
        video.currentTime = targetTime;
      } catch {
        /* seek can throw before metadata is fully ready */
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    const onLoaded = () => {
      ready = true;
      update();
    };

    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener("loadedmetadata", onLoaded);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      video.removeEventListener("loadedmetadata", onLoaded);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [src, mode]);

  return (
    <video
      ref={videoRef}
      src={src || videoAsset.url}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      className="mx-auto block h-auto w-full max-w-[560px]"
    />
  );
}