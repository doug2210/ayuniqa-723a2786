import { Link } from "@tanstack/react-router";
import { Menu, X, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/ayuniqa-logo.png.asset.json";

const links = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "h-14 border-border/80 bg-background/95 shadow-glow backdrop-blur-xl"
          : "h-16 border-border/40 bg-background/70 backdrop-blur-md",
      )}
    >
      <div className={cn("mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8")}>
        <Link to="/" className="group flex items-center gap-2">
          <img
            src={logoAsset.url}
            alt="Ayuniqa"
            className="h-8 w-auto transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110 sm:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="story-link rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition-smooth hover:-translate-y-0.5 hover:text-foreground data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="shimmer">
            <Link to="/client-zone">
              <Lock /> Client Zone
            </Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 md:hidden transition-all",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild className="mt-2 bg-gradient-brand text-white">
            <Link to="/client-zone" onClick={() => setOpen(false)}>
              <Lock /> Client Zone
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
