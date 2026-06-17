import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { games as defaultGamesList } from "@/lib/games-data";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";
import { mergedGames } from "@/lib/site-config";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { BorderBeam } from "@/components/magicui/border-beam";
import { GameTrailer, GameScreenshots, PlayDemoButton } from "@/components/site/GameMedia";
import { GameAssetsBrowser } from "@/components/site/GameAssetsBrowser";

export const Route = createFileRoute("/games/$slug")({
  loader: ({ params }) => {
    const game = defaultGamesList.find((g) => g.slug === params.slug) ?? null;
    return { game, slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.game
      ? [
          { title: `${loaderData.game.title} — Ayuniqa` },
          { name: "description", content: loaderData.game.description },
          { property: "og:title", content: `${loaderData.game.title} — Ayuniqa` },
          { property: "og:description", content: loaderData.game.description },
          { property: "og:image", content: loaderData.game.cover },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-32 text-center">
        <h1 className="text-4xl font-black">Game not found</h1>
        <Button asChild className="mt-6 bg-gradient-brand text-white">
          <Link to="/games">Back to games</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-32 text-center">
        <h1 className="text-4xl font-black">Something went wrong</h1>
        <Button onClick={reset} className="mt-6 bg-gradient-brand text-white">Retry</Button>
      </div>
    </SiteLayout>
  ),
  component: GameDetail,
});

function GameDetail() {
  const { game: defaultGame, slug } = Route.useLoaderData();
  const { config } = useSiteConfig();
  const merged = mergedGames(config.games);
  const game = merged.find((g) => g.slug === (defaultGame?.slug ?? slug)) ?? defaultGame;
  if (!game) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-32 text-center">
          <h1 className="text-4xl font-black">Game not found</h1>
          <Button asChild className="mt-6 bg-gradient-brand text-white">
            <Link to="/games">Back to games</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link to="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> All games
        </Link>
      </section>
      <section className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ScrollReveal animation="fade-right">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-warm opacity-30 blur-3xl" />
            <div className="group relative overflow-hidden rounded-3xl">
              <BorderBeam size={280} duration={9} />
              <img src={game.cover} alt={game.title} width={1024} height={1024} className="w-full rounded-3xl shadow-glow transition-transform duration-700 group-hover:scale-[1.03]" />
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-left" delay={150}>
          <div>
            <span className="inline-block rounded-full bg-[color:var(--brand-yellow)] px-3 py-1 text-xs font-bold text-[color:var(--brand-grey)]">
              {game.category}
            </span>
            <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              {game.title}
            </h1>
            <p className="mt-3 text-xl text-muted-foreground">{game.tagline}</p>
            <p className="mt-6 text-foreground/80">{game.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec label="RTP" value={`${game.rtp}%`} />
              <Spec label="Volatility" value={game.volatility} />
              <Spec label="Reels" value={game.reels} />
              <Spec label="Paylines" value={String(game.paylines)} />
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Features</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {game.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-brand text-white">
                      <Check className="!size-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <PlayDemoButton url={game.demoUrl} title={game.title} />
              <Button asChild size="lg" variant="shimmer">
                <Link to="/contact">Request demo</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {game.trailerUrl && (
        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Trailer
            </h3>
            <GameTrailer url={game.trailerUrl} title={game.title} />
          </ScrollReveal>
        </section>
      )}

      {game.screenshots && game.screenshots.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up">
            <GameScreenshots shots={game.screenshots} title={game.title} />
          </ScrollReveal>
        </section>
      )}

      {game.assets && game.assets.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up">
            <GameAssetsBrowser assets={game.assets} gameSlug={game.slug} />
          </ScrollReveal>
        </section>
      )}
    </SiteLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-card">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
  );
}
