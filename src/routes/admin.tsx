import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ReelForge Studios" },
      { name: "description", content: "Internal admin panel for managing games, assets and partners." },
    ],
  }),
  component: Admin,
});

function Admin() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6 lg:px-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
          <Lock />
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Admin panel</h1>
        <p className="mt-3 text-muted-foreground">
          The admin panel will be activated once the backend is connected. You'll manage games, assets, partner approvals, messages and site content from here.
        </p>
        <Button asChild className="mt-8 bg-gradient-brand text-white">
          <Link to="/">Back to site</Link>
        </Button>
      </section>
    </SiteLayout>
  );
}
