import { createFileRoute } from "@tanstack/react-router";
import { Palette, Cpu, ShieldCheck, Plug, BarChart3, Headphones } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Ayuniqa Studios" },
      { name: "description", content: "End-to-end slot game services: design, math, certification, integration." },
      { property: "og:title", content: "Services — Ayuniqa Studios" },
      { property: "og:description", content: "End-to-end slot game services." },
    ],
  }),
  component: Services,
});

const services = [
  { icon: Palette, title: "Game design & art", body: "Concept, character art, animation and UX tuned for retention." },
  { icon: Cpu, title: "Math & engineering", body: "Volatility modelling, RNG, and our own HTML5 engine." },
  { icon: ShieldCheck, title: "Certification", body: "GLI, iTech Labs, MGA, UKGC compliance and audits." },
  { icon: Plug, title: "Integration", body: "Single REST API or aggregator hand-off — live in days." },
  { icon: BarChart3, title: "Live analytics", body: "Cohort-grade reports, A/B testing and player insights." },
  { icon: Headphones, title: "24/7 support", body: "Dedicated partner success manager and on-call engineers." },
];

function Services() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
            One studio. <span className="text-gradient-brand">Every step.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            From the first sketch to live in your lobby — we own every step so you don't have to coordinate five vendors.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} animation="fade-up" delay={i * 100}>
              <div className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-glow">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
                  <s.icon className="!size-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
