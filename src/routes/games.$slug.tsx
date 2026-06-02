import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { games } from "@/lib/games-data";

export const Route = createFileRoute("/games/$slug")({
  loader: ({ params }) => {
    const game = games.find((g) => g.slug === params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.game.title} — ReelForge` },
          { name: "description", content: loaderData.game.description },
          { property: "og:title", content: `${loaderData.game.title} — ReelForge` },
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
  const { game } = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link to="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> All games
        </Link>
      </section>
      <section className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-warm opacity-30 blur-3xl" />
          <img src={game.cover} alt={game.title} width={1024} height={1024} className="w-full rounded-3xl shadow-glow" />
        </div>
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
              {game.features.map((f) => (
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
            <Button asChild size="lg" className="bg-gradient-brand text-white shadow-glow">
              <Link to="/contact">Request demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/client-zone">Get assets</Link>
            </Button>
          </div>
        </div>
      </section>
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
