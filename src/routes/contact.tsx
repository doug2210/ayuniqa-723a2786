import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, Phone, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { fireConfetti } from "@/components/site/ConfettiBurst";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Please enter your name." })
    .max(120, { message: "Name must be 120 characters or fewer." }),
  company: z
    .string()
    .trim()
    .max(160, { message: "Company must be 160 characters or fewer." })
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(254, { message: "Email must be 254 characters or fewer." }),
  message: z
    .string()
    .trim()
    .min(1, { message: "Please write a short message." })
    .max(5000, { message: "Message must be 5000 characters or fewer." }),
});

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSiteConfig();

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-7xl gap-12 overflow-hidden px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ScrollReveal animation="fade-right">
          <div>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              Let's <span className="text-gradient-brand">talk</span>.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Operators, aggregators and partners — we'd love to hear from you. Average response time: 1 business day.
            </p>

            <div className="mt-10 space-y-4 text-sm">
              <InfoRow icon={Mail} label={config.contact.email} />
              <InfoRow icon={Phone} label={config.contact.phone} />
              <InfoRow icon={MapPin} label={config.contact.address} />
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
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError(null);
                  const form = e.currentTarget as HTMLFormElement;
                  const fd = new FormData(form);
                  const parsed = contactSchema.safeParse({
                    name: String(fd.get("name") ?? ""),
                    company: String(fd.get("company") ?? ""),
                    email: String(fd.get("email") ?? ""),
                    message: String(fd.get("message") ?? ""),
                  });
                  if (!parsed.success) {
                    setBusy(false);
                    setError(parsed.error.issues[0]?.message ?? "Please review the form and try again.");
                    return;
                  }
                  const { error: insertError } = await supabase
                    .from("contact_messages")
                    .insert(parsed.data);
                  if (insertError) {
                    setBusy(false);
                    setError("Submission failed, please try again.");
                    return;
                  }
                  // Fire-and-acknowledge email notification
                  try {
                    const res = await fetch("/api/public/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(parsed.data),
                    });
                    if (!res.ok) console.warn("Contact email send returned", res.status);
                  } catch (err) {
                    console.warn("Contact email send failed", err);
                  }
                  setBusy(false);
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
                  <Textarea id="message" name="message" required rows={5} className="mt-1.5" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" variant="shimmer" className="w-full" disabled={busy}>
                  {busy ? "Sending…" : "Send message"}
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
      <Input id={id} name={id} type={type} required={required} className="mt-1.5 h-11" />
    </div>
  );
}
