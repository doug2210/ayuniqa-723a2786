import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { games, categories } from "@/lib/games-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Games — Ayuniqa Studios" },
      { name: "description", content: "Browse the Ayuniqa portfolio of premium HTML5 slot games." },
      { property: "og:title", content: "Games — Ayuniqa Studios" },
      { property: "og:description", content: "Browse the Ayuniqa portfolio of premium HTML5 slot games." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(
    () =>
      games.filter(
        (g) =>
          (cat === "All" || g.category === cat) &&
          (q === "" || g.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, cat],
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          The <span className="text-gradient-brand">portfolio</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every title is certified, mobile-first, and ready to drop into your lobby.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search games…" className="pl-9 h-11" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth",
                  cat === c
                    ? "border-transparent bg-gradient-brand text-white shadow-glow"
                    : "border-border bg-card text-foreground/70 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No games match your search.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((g) => (
              <Link
                key={g.slug}
                to="/games/$slug"
                params={{ slug: g.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-warm">
                  <img src={g.cover} alt={g.title} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
                  <span className="absolute right-3 top-3 rounded-full bg-[color:var(--brand-yellow)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--brand-grey)]">
                    {g.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{g.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{g.tagline}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <span>RTP {g.rtp}%</span>
                    <span>·</span>
                    <span>{g.volatility} vol</span>
                    <span>·</span>
                    <span>{g.reels}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
