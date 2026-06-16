import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import logoAsset from "@/assets/ayuniqa-logo.png.asset.json";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";

export function Footer() {
  const { config } = useSiteConfig();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-secondary/40">
      <BorderBeam size={260} duration={12} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <img src={logoAsset.url} alt="Ayuniqa" className="h-9 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Premium slot games engineered for operators worldwide.
          </p>
        </div>
        <FooterCol title="Studio" links={[
          { to: "/games", label: "Games" },
          { to: "/services", label: "Services" },
          { to: "/about", label: "About" },
        ]} />
        <FooterCol title="Partners" links={[
          { to: "/client-zone", label: "Client Zone" },
          { to: "/contact", label: "Contact" },
        ]} />
        <div>
          <h4 className="text-sm font-semibold">Compliance</h4>
          <p className="mt-3 text-xs text-muted-foreground">{config.contact.compliance}</p>
        </div>
      </div>
      <Copyright />
    </footer>
  );
}

function Copyright() {
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return (
    <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
      © {year} Ayuniqa Studios. All rights reserved.
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-muted-foreground transition-smooth hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
