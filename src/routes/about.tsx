import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";

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
  const { config } = useSiteConfig();
  const about = config.about;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            {about.titlePrefix}
            <span className="text-gradient-brand">{about.titleAccent}</span>
            {about.titleSuffix}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {about.lead}
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {about.stats.map((s, i) => (
            <ScrollReveal key={`${s.label}-${i}`} animation="fade-up" delay={i * 100}>
              <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <div className="text-4xl font-black text-gradient-brand">{s.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-16 space-y-6 text-foreground/85">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </SiteLayout>
  );
}
