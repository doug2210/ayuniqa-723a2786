import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/ayuniqa-logo.png.asset.json";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
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
          <p className="mt-3 text-xs text-muted-foreground">
            B2B only. 18+. We do not offer real-money gambling to end users.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ayuniqa Studios. All rights reserved.
      </div>
    </footer>
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
