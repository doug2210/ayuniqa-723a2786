import { useEffect, useRef } from "react";
import videoAsset from "@/assets/hero-scroll-v2.mp4.asset.json";

export function HeroScrollVideo({
  src,
  mode = "scroll",
  ready = true,
}: { src?: string | null; mode?: "scroll" | "loop"; ready?: boolean } = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;

    if (mode === "loop") {
      // Autoplay loop — no scroll scrubbing. `loop` is also set declaratively
      // on the element so the attribute is live from the first frame.
      const tryPlay = () => {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      };
      // Pre-empt the browser's end-of-stream seek (which shows a small pause)
      // by snapping back to 0 just before the final frame.
      const onTimeUpdate = () => {
        if (!video.duration) return;
        if (video.duration - video.currentTime < 0.15) {
          try {
            video.currentTime = 0;
          } catch {
            /* seek may throw before metadata is ready */
          }
          tryPlay();
        }
      };
      if (video.readyState >= 2) tryPlay();
      else video.addEventListener("loadeddata", tryPlay, { once: true });
      video.addEventListener("timeupdate", onTimeUpdate);
      return () => {
        video.removeEventListener("loadeddata", tryPlay);
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.pause();
      };
    }

    video.loop = false;
    video.pause();

    let rafId = 0;
    let metaReady = false;
    let targetTime = 0;

    const update = () => {
      rafId = 0;
      const section = video.closest("section");
      if (!section || !metaReady || !video.duration) return;
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
      metaReady = true;
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
  }, [src, mode, ready]);

  if (!ready) {
    // Reserve space without painting any video to avoid a flash of the
    // bundled fallback before the saved config resolves.
    return <div className="mx-auto block aspect-video w-full max-w-[560px]" aria-hidden />;
  }

  return (
    <video
      ref={videoRef}
      src={src || videoAsset.url}
      muted
      playsInline
      preload="auto"
      autoPlay={mode === "loop"}
      loop={mode === "loop"}
      disablePictureInPicture
      className="mx-auto block h-auto w-full max-w-[560px]"
    />
  );
}