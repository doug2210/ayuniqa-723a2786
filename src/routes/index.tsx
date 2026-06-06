import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Gamepad2, Globe, ShieldCheck, Zap, Trophy } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { games } from "@/lib/games-data";
import { HeroStage } from "@/components/site/HeroStage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayuniqa — Premium iGaming Slots Studio" },
      { name: "description", content: "B2B slot games studio crafting premium, certified slot titles for operators worldwide." },
      { property: "og:title", content: "Ayuniqa — Premium iGaming Slots Studio" },
      { property: "og:description", content: "Premium, certified slot games for operators worldwide." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <Strengths />
      <FeaturedGames />
      <Services />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--brand-light-orange)_25%,transparent),transparent_60%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklab,var(--brand-yellow)_18%,transparent),transparent_55%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground/80 shadow-card">
            <Sparkles className="text-[color:var(--brand-orange)]" /> iGaming Studio · est. 2021
          </span>
          <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Slots that <span className="text-gradient-brand">spin smarter</span>, win bigger.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            We design, build and certify premium HTML5 slot games for operators across regulated markets — bold art, fair math, and seamless integration.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90 shadow-glow">
              <Link to="/games">Explore games <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Partner with us</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
            <Stat n="40+" label="Slot titles" />
            <Stat n="25" label="Markets" />
            <Stat n="99.9%" label="Uptime" />
          </div>
        </div>
        <div className="relative">
          <HeroStage />
          <span className="absolute -bottom-2 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[color:var(--brand-yellow)] px-3 py-1.5 text-xs font-bold text-[color:var(--brand-grey)] shadow-card">
            <Trophy className="!size-3.5" /> Studio of the year nominee
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-black text-gradient-brand">{n}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

const strengths = [
  { icon: Gamepad2, title: "Original art & math", body: "In-house artists and mathematicians craft every reel from scratch." },
  { icon: ShieldCheck, title: "Certified & compliant", body: "GLI / iTech Labs certified, ready for regulated markets." },
  { icon: Zap, title: "Lightning integration", body: "Single API, drop-in HTML5, optimised for mobile-first play." },
  { icon: Globe, title: "Global reach", body: "Multi-currency, 20+ languages, partner CDN across 5 continents." },
];

function Strengths() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
          Built for serious <span className="text-gradient-brand">operators</span>.
        </h2>
        <p className="mt-3 text-muted-foreground">Everything you need to launch hit titles faster.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {strengths.map((s) => (
          <div key={s.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-glow">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white transition-smooth group-hover:scale-110">
              <s.icon className="!size-5" />
            </div>
            <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedGames() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Featured games</h2>
            <p className="mt-2 text-muted-foreground">A taste of the Ayuniqa portfolio.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/games">View all <ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((g) => (
            <Link
              key={g.slug}
              to="/games/$slug"
              params={{ slug: g.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-warm">
                <img src={g.cover} alt={g.title} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
                <span className="absolute right-3 top-3 rounded-full bg-[color:var(--brand-yellow)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--brand-grey)]">
                  {g.volatility}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{g.title}</h3>
                  <span className="text-xs text-muted-foreground">RTP {g.rtp}%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{g.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const items = [
    { title: "Game design", body: "Concept, art direction, and feature design crafted for retention." },
    { title: "Math & engineering", body: "Volatility modelling, RNG and HTML5 engine built in-house." },
    { title: "Certification", body: "GLI, iTech, MGA, UKGC — we handle the paperwork." },
    { title: "Integration", body: "Single REST API or aggregator hand-off. Live in days, not weeks." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            End-to-end <span className="text-gradient-brand">slot delivery</span>.
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            From the first sketch to certified release — one studio, one accountable team.
          </p>
          <Button asChild className="mt-6 bg-gradient-brand text-white">
            <Link to="/services">All services <ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((i, idx) => (
            <div key={i.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs font-bold text-[color:var(--brand-orange)]">0{idx + 1}</div>
              <h3 className="mt-1 font-bold">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-white shadow-glow sm:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[color:var(--brand-yellow)]/30 blur-3xl" />
        <h2 className="max-w-2xl text-3xl font-black sm:text-5xl">Ready to add Ayuniqa titles to your lobby?</h2>
        <p className="mt-3 max-w-xl text-white/90">Tell us about your platform — we'll get you live with a sample title in 14 days.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link to="/contact">Get in touch</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/0 text-white hover:bg-white/10 hover:text-white">
            <Link to="/client-zone">Client Zone</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
