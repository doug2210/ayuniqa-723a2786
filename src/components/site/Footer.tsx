import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import logoAsset from "@/assets/ayuniqa-logo.png.asset.json";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";
import { SocialIcon, type SocialPlatform } from "@/components/site/SocialIcon";

export function Footer() {
  const { config } = useSiteConfig();
  const logoUrl = config.branding?.logoUrl ?? logoAsset.url;
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-secondary/40">
      <BorderBeam size={260} duration={12} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <img src={logoUrl} alt="Ayuniqa" className="h-9 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Premium slot games engineered for operators worldwide.
          </p>
          {config.social.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {config.social.map((s, i) => (
                <li key={`${s.platform}-${i}`}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label ?? s.platform}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 text-muted-foreground transition-smooth hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
                  >
                    <SocialIcon platform={s.platform as SocialPlatform} className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol title="Studio" links={[
          { to: "/games", label: "Games" },
          { to: "/services", label: "Services" },
          { to: "/about", label: "About" },
        ]} />
        <FooterCol title="Partners" links={[
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
