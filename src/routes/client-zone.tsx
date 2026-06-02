import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/client-zone")({
  head: () => ({
    meta: [
      { title: "Client Zone — ReelForge Studios" },
      { name: "description", content: "Secure portal for ReelForge partners. Approved access only." },
      { property: "og:title", content: "Client Zone — ReelForge Studios" },
      { property: "og:description", content: "Secure portal for approved ReelForge partners." },
    ],
  }),
  component: ClientZone,
});

function ClientZone() {
  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold shadow-card">
            <ShieldCheck className="text-[color:var(--brand-orange)]" /> Approved partners only
          </span>
          <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-6xl">
            The <span className="text-gradient-brand">Client Zone</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Download game assets, integration kits, math sheets and certifications. Access is granted on approval.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-foreground/80">
            <li>• Game art, logos and marketing kits</li>
            <li>• Math sheets and RTP reports</li>
            <li>• Integration documentation</li>
            <li>• Compliance certificates</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-glow">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
            <Lock />
          </div>
          <h2 className="mt-5 text-2xl font-black">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Authentication will be enabled once the backend is connected.
          </p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" disabled className="mt-1.5 h-11" placeholder="you@operator.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" disabled className="mt-1.5 h-11" placeholder="••••••••" />
            </div>
            <Button type="submit" disabled size="lg" className="w-full bg-gradient-brand text-white">
              Sign in (coming soon)
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Not a partner yet?{" "}
            <Link to="/contact" className="font-semibold text-[color:var(--brand-orange)]">Request access</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
