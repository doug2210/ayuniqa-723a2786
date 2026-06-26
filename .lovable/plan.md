## 1. Game cards: keep only the image/gif

Remove the text block (title + RTP/tagline/volatility/reels) from card components. Keep just the cover image with the existing badge. Apply in:

- `src/routes/index.tsx` — `FeaturedGames` and `UpcomingGames` cards: drop the `<div className="p-4">…</div>` block; keep image + badge.
- `src/routes/games.index.tsx` — both released grid and `Upcoming` grid cards: drop the lower text block; keep image + badge.

The game detail page (`/games/$slug`) is untouched — titles still appear there.

## 2. Hero: video as full-width background behind the title

Rework the `Hero` section in `src/routes/index.tsx`:

- Convert the two-column grid into a single full-width stage. The `<HeroScrollVideo>` becomes an absolutely positioned background spanning the entire section width (edge to edge of the viewport), behind the text.
- Add a readability overlay (subtle dark/brand gradient) above the video and below the text so the headline, subtitle, CTAs, and stats stay legible.
- Text content (badge, title, subtitle, CTAs, stats) is centered (or left-aligned within max-w container) on top of the video, with appropriate vertical padding to maintain hero height.
- Update `src/components/site/HeroScrollVideo.tsx`: remove the `max-w-[560px]` cap and make the video fill its container (`w-full h-full object-cover`) so it can act as a full-bleed background.

Scroll-driven playback logic stays as-is (it still targets `video.closest("section")`).

## Technical notes

- No data, schema, or admin changes.
- No new dependencies.
- `HeroStage` / `AstronautMascot` are not used by the current hero; left untouched.
