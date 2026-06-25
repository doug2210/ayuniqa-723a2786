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

    // Safari-specific: enforce the autoplay contract imperatively because
    // some Safari builds ignore the JSX props when `src` is set after mount.
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Safari blocked autoplay — resume on the next user gesture.
          const resume = () => {
            const r = video.play();
            if (r && typeof r.catch === "function") r.catch(() => {});
            window.removeEventListener("pointerdown", resume);
            window.removeEventListener("touchstart", resume);
            window.removeEventListener("keydown", resume);
            window.removeEventListener("scroll", resume);
          };
          window.addEventListener("pointerdown", resume, { once: true });
          window.addEventListener("touchstart", resume, { once: true });
          window.addEventListener("keydown", resume, { once: true });
          window.addEventListener("scroll", resume, { once: true, passive: true });
        });
      }
    };

    // After src changes Safari may sit in NETWORK_EMPTY until load() is called.
    try {
      video.load();
    } catch {
      /* noop */
    }

    if (mode === "loop") {
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
      const onVisibility = () => {
        if (!document.hidden) tryPlay();
      };
      if (video.readyState >= 2) tryPlay();
      video.addEventListener("loadedmetadata", tryPlay);
      video.addEventListener("loadeddata", tryPlay);
      video.addEventListener("canplay", tryPlay);
      video.addEventListener("timeupdate", onTimeUpdate);
      document.addEventListener("visibilitychange", onVisibility);
      return () => {
        video.removeEventListener("loadedmetadata", tryPlay);
        video.removeEventListener("loadeddata", tryPlay);
        video.removeEventListener("canplay", tryPlay);
        video.removeEventListener("timeupdate", onTimeUpdate);
        document.removeEventListener("visibilitychange", onVisibility);
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

  return (
    <video
      ref={videoRef}
      src={ready ? src || videoAsset.url : undefined}
      muted
      defaultMuted
      playsInline
      preload="auto"
      autoPlay={mode === "loop"}
      loop={mode === "loop"}
      disablePictureInPicture
      className="mx-auto block h-auto w-full max-w-[560px]"
      style={ready ? undefined : { visibility: "hidden", aspectRatio: "16 / 9" }}
    />
  );
}