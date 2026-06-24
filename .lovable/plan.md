## Issues

**1. Flash of old hero video on reload.**
`SiteConfigProvider` mounts with `DEFAULT_SITE_CONFIG` (where `scrollVideoUrl = null`), so `HeroScrollVideo` immediately renders the bundled fallback (`hero-scroll-v2.mp4`). A moment later Supabase responds with the admin-saved `scrollVideoUrl` and the `<video src>` swaps — that swap is the "flash" the user sees.

**2. Loop has a small pause before restarting.**
The native `<video loop>` attribute is currently set imperatively in `useEffect` after mount (`video.loop = true`), so the first cycle can end before `loop` is applied. Even when applied, the browser's loop-seek introduces a noticeable hiccup, made worse if the source mp4 carries an audio track or non-faststart `moov` atom.

## Fix

### `src/components/site/HeroScrollVideo.tsx`
- Accept a `ready` prop (or use the existing site config `loaded` flag in the parent). When the parent passes `ready=false`, render nothing (or a transparent placeholder of the same aspect) so the bundled fallback never paints before Supabase resolves.
- Set `loop` and `autoPlay` declaratively in JSX when `mode === "loop"` (instead of toggling in `useEffect`) so the attribute exists from the first frame.
- For smoother looping, add a `timeupdate` handler in loop mode that, when `duration - currentTime < 0.15s`, resets `currentTime = 0` immediately and calls `play()` — this short-circuits the browser's end-of-stream seek and eliminates the visible pause. Keep the native `loop` attribute as a safety net.
- Keep scroll mode behavior unchanged.

### `src/routes/index.tsx`
- Pull `loaded` from `useSiteConfig()` and pass it to `<HeroScrollVideo ready={loaded} ... />`. The hero column already has a fixed aspect (max-width 560px, intrinsic video aspect) — reserve the box via a wrapping `div` with `aspect-video` (or matching aspect) so layout doesn't jump while we wait one tick for Supabase.

### Re-encode the bundled fallback video (optional but recommended)
- The current `hero-scroll-v2.mp4` likely has an audio track and/or trailing silence that contributes to the loop gap. Re-encode with `ffmpeg -i in.mp4 -an -movflags +faststart -pix_fmt yuv420p -c:v libx264 -crf 20 out.mp4` and re-upload as a new asset, replacing `src/assets/hero-scroll-v2.mp4.asset.json`. This makes both the bundled fallback and any user who keeps the default loop seamlessly.

### Out of scope
- No changes to admin panel UI, background gradient, stats, or other hero content.
- No changes to site-config persistence model (Supabase remains source of truth).

## Result
- On refresh the hero video area stays empty for a beat (no layout shift), then paints the correct admin-selected video once — no swap, no flash.
- In loop mode the video restarts without the visible pause.