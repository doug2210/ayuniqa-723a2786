import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white font-black">
              R
            </span>
            <span className="text-lg font-extrabold">
              Reel<span className="text-gradient-brand">Forge</span>
            </span>
          </div>
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
        © {new Date().getFullYear()} ReelForge Studios. All rights reserved.
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
