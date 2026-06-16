import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ayuniqa Studios" },
      { name: "description", content: "Internal admin panel for managing games, assets and partners." },
    ],
  }),
  component: Admin,
});

function Admin() {
  return (
    <SiteLayout>
      <AdminGate>
        <AdminPanel />
      </AdminGate>
    </SiteLayout>
  );
}
