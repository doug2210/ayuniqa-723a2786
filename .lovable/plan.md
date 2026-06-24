## Plan

### 1. Upload the video as a CDN asset
- Run `lovable-assets create --file /mnt/user-uploads/magnific_create-a-video_YV47KM0WeC.mp4 --filename hero-scroll.mp4 > src/assets/hero-scroll.mp4.asset.json`.

### 2. Hero background + top effects (`src/routes/index.tsx`)
- On the `<section>`, replace the radial-gradient overlay div and remove `<Meteors number={18} />` so the hero has a solid `#FEF5F3` background (inline `style={{ backgroundColor: "#FEF5F3" }}` on the section, keeping `relative isolate overflow-hidden`).
- Keep the text column, stats, CTAs, and award badge untouched.

### 3. Replace the right-side element with a scroll-scrubbed video
- Replace the `<HeroStage />` (and the surrounding award-badge overlay) inside the right column with a new component `<HeroScrollVideo />`. No glow rings, no particles, no badges, no astronaut — just the video element, centered, responsive (`w-full max-w-[560px] aspect-square` or natural ratio), with rounded corners optional but nothing layered in front/behind.

### 4. New component `src/components/site/HeroScrollVideo.tsx`
- Render a muted, `playsInline`, `preload="auto"` `<video>` pointing at the uploaded asset URL. No `autoplay`, no `controls`.
- Use a ref + `requestAnimationFrame`-throttled `scroll` listener on `window`.
- On each frame:
  - Get the hero `<section>` bounding rect (passed via a ref or via `video.closest('section')`).
  - Compute scroll progress `p = clamp((-rect.top) / rect.height, 0, 1)` — `0` when the hero just enters the viewport top, `1` when its bottom hits the viewport top (user is leaving the hero).
  - Set `video.currentTime = p * video.duration` (≈ 4s, so frame 4s plays exactly as the hero scrolls out).
- Wait for `loadedmetadata` before scrubbing. iOS Safari note: keep `muted` + `playsInline` so seeking works without a gesture.
- Cleanup listener on unmount.

### 5. Technical notes
- No changes to `HeroStage.tsx`, `AstronautMascot`, or astronaut asset — they simply stop being used by the hero. (Leave them in repo for now; user didn't ask to delete.)
- Keep stats z-index as-is; with no overlay layers there's nothing to fight over.
- Build/typecheck after changes.
