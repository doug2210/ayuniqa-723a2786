import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ReelForge Studios" },
      { name: "description", content: "Meet the team behind ReelForge — artists, mathematicians, and engineers shipping premium slots." },
      { property: "og:title", content: "About — ReelForge Studios" },
      { property: "og:description", content: "Meet the team behind ReelForge." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          Crafted by <span className="text-gradient-brand">slot people</span>, for slot people.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          ReelForge is a B2B iGaming studio founded in 2021 by veterans from some of the industry's biggest names. We obsess over the math, the moment of anticipation, and the polish that turns a spin into a story.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            { n: "40+", l: "Titles shipped" },
            { n: "60", l: "Team members" },
            { n: "25", l: "Regulated markets" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
              <div className="text-4xl font-black text-gradient-brand">{s.n}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 space-y-6 text-foreground/85">
          <p>
            Our team blends senior artists, mathematicians, and engineers under one roof. We believe great slots come from tight feedback loops — designers sitting next to mathematicians, math reviewed against player behaviour, art iterated alongside engine performance.
          </p>
          <p>
            We work with licensed operators and aggregators across Europe, LATAM, and emerging markets. Every release is certified for the jurisdictions we serve.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
