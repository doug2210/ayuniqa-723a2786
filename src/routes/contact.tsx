import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { fireConfetti } from "@/components/site/ConfettiBurst";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ayuniqa Studios" },
      { name: "description", content: "Talk to Ayuniqa about partnership, integration, or new game commissions." },
      { property: "og:title", content: "Contact — Ayuniqa Studios" },
      { property: "og:description", content: "Talk to Ayuniqa about partnership or integration." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ScrollReveal animation="fade-right">
          <div>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              Let's <span className="text-gradient-brand">talk</span>.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Operators, aggregators and partners — we'd love to hear from you. Average response time: 1 business day.
            </p>

            <div className="mt-10 space-y-4 text-sm">
              <InfoRow icon={Mail} label="partners@ayuniqa.io" />
              <InfoRow icon={Phone} label="+356 2778 0000" />
              <InfoRow icon={MapPin} label="Sliema, Malta · Sofia, Bulgaria" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-left" delay={150}>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            {sent ? (
              <div className="py-16 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white">
                  <Check />
                </div>
                <h3 className="mt-4 text-2xl font-black">Message sent</h3>
                <p className="mt-2 text-muted-foreground">We'll get back to you within one business day.</p>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  fireConfetti();
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="name" label="Name" required />
                  <Field id="company" label="Company" required />
                </div>
                <Field id="email" label="Work email" type="email" required />
                <div>
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea id="message" required rows={5} className="mt-1.5" />
                </div>
                <Button type="submit" size="lg" variant="shimmer" className="w-full">
                  Send message
                </Button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </section>
    </SiteLayout>
  );
}

function InfoRow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-[color:var(--brand-orange)]">
        <Icon className="size-4" />
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Field({ id, label, type = "text", required }: { id: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required={required} className="mt-1.5 h-11" />
    </div>
  );
}
