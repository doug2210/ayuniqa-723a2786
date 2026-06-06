import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ayuniqa Studios" },
      { name: "description", content: "Meet the team behind Ayuniqa — artists, mathematicians, and engineers shipping premium slots." },
      { property: "og:title", content: "About — Ayuniqa Studios" },
      { property: "og:description", content: "Meet the team behind Ayuniqa." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            Crafted by <span className="text-gradient-brand">slot people</span>, for slot people.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Ayuniqa is a B2B iGaming studio founded in 2021 by veterans from some of the industry's biggest names. We obsess over the math, the moment of anticipation, and the polish that turns a spin into a story.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            { n: "40+", l: "Titles shipped" },
            { n: "60", l: "Team members" },
            { n: "25", l: "Regulated markets" },
          ].map((s, i) => (
            <ScrollReveal key={s.l} animation="fade-up" delay={i * 100}>
              <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <div className="text-4xl font-black text-gradient-brand">{s.n}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-16 space-y-6 text-foreground/85">
            <p>
              Our team blends senior artists, mathematicians, and engineers under one roof. We believe great slots come from tight feedback loops — designers sitting next to mathematicians, math reviewed against player behaviour, art iterated alongside engine performance.
            </p>
            <p>
              We work with licensed operators and aggregators across Europe, LATAM, and emerging markets. Every release is certified for the jurisdictions we serve.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </SiteLayout>
  );
}
