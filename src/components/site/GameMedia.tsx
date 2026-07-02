import { useState } from "react";
import { Play, X, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { getVideoEmbed } from "@/lib/game-media";

export function GameTrailer({ url, title }: { url?: string | null; title: string }) {
  const embed = getVideoEmbed(url);
  if (!embed) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-card">
      <div className="aspect-video w-full">
        {embed.kind === "video" ? (
          <video src={embed.src} controls className="h-full w-full" />
        ) : (
          <iframe
            src={embed.src}
            title={`${title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
}

export function GameScreenshots({ shots, title }: { shots?: string[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const list = (shots ?? []).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        <Images className="size-4" /> Screenshots
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-glow"
          >
            <img
              src={src}
              alt={`${title} screenshot ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-5xl border-border bg-card p-2 sm:p-3">
          <DialogHeader className="sr-only">
            <DialogTitle>{title} screenshot</DialogTitle>
          </DialogHeader>
          {active !== null && (
            <img
              src={list[active]}
              alt={`${title} screenshot ${active + 1}`}
              className="mx-auto max-h-[80vh] w-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PlayDemoButton({ url, title }: { url?: string | null; title: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return null;
  return (
    <>
      <Button size="lg" variant="shimmer" onClick={() => setOpen(true)}>
        <Play className="!size-4" /> Play demo
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideCloseButton className="max-w-5xl border-border bg-card p-0">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border p-3">
            <DialogTitle>{title} — demo</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
              <X className="!size-4" />
            </Button>
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={url}
              title={`${title} demo`}
              allow="autoplay; fullscreen; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}