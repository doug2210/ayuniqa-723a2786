import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Plus,
  RotateCcw,
  Trash2,
  Upload as UploadIcon,
  LogOut,
  ExternalLink,
  Settings2,
  Sparkles,
  Gamepad2,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";
import { games as defaultGames } from "@/lib/games-data";
import {
  DEFAULT_HERO,
  DEFAULT_CONTACT,
  DEFAULT_SITE_CONFIG,
  type FloatingConfig,
  type GameOverride,
  type SiteConfig,
} from "@/lib/site-config";
import { DEFAULT_FLOATING_ITEMS, type FloatingItem } from "@/lib/site-config";
import { ImageField } from "./ImageField";
import { adminSignOut } from "./AdminGate";

export function AdminPanel() {
  const { config, setConfig, reset } = useSiteConfig();

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ayuniqa-site-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importRef = useRef<HTMLInputElement>(null);
  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as SiteConfig;
      setConfig({ ...DEFAULT_SITE_CONFIG, ...parsed, version: 1 });
      alert("Config imported.");
    } catch (err) {
      alert("Invalid JSON file.");
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Site admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Changes save instantly to your browser. No backend yet — use export/import to share.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/"><ExternalLink className="!size-3.5" /> View site</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <Download className="!size-3.5" /> Export
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importJson(f);
              e.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <UploadIcon className="!size-3.5" /> Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Reset all site content to defaults? This cannot be undone.")) reset();
            }}
          >
            <RotateCcw className="!size-3.5" /> Reset all
          </Button>
          <Button variant="ghost" size="sm" onClick={adminSignOut}>
            <LogOut className="!size-3.5" /> Sign out
          </Button>
        </div>
      </header>

      <Tabs defaultValue="floating">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="floating"><Sparkles className="!size-3.5" /> Symbols</TabsTrigger>
          <TabsTrigger value="hero"><Settings2 className="!size-3.5" /> Hero</TabsTrigger>
          <TabsTrigger value="games"><Gamepad2 className="!size-3.5" /> Games</TabsTrigger>
          <TabsTrigger value="contact"><MessageSquare className="!size-3.5" /> Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="floating" className="mt-6">
          <FloatingEditor
            value={config.floating}
            onChange={(next) => setConfig((c) => ({ ...c, floating: next }))}
          />
        </TabsContent>

        <TabsContent value="hero" className="mt-6">
          <HeroEditor
            value={config.hero}
            onChange={(next) => setConfig((c) => ({ ...c, hero: next }))}
          />
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <GamesEditor
            value={config.games}
            onChange={(next) => setConfig((c) => ({ ...c, games: next }))}
          />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactEditor
            value={config.contact}
            onChange={(next) => setConfig((c) => ({ ...c, contact: next }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Floating items editor ---------- */

function FloatingEditor({
  value,
  onChange,
}: {
  value: FloatingConfig;
  onChange: (next: FloatingConfig) => void;
}) {
  const update = (i: number, patch: Partial<FloatingItem>) => {
    onChange({ ...value, items: value.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  };
  const remove = (i: number) => onChange({ ...value, items: value.items.filter((_, idx) => idx !== i) });
  const add = () =>
    onChange({
      ...value,
      items: [...value.items, { symbol: "⭐", size: 80, speed: 0.5, opacity: 1, hue: 50 }],
    });

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">Density</h3>
            <p className="text-xs text-muted-foreground">How many copies of each symbol float across the page.</p>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[value.density]}
              min={0}
              max={6}
              step={0.1}
              onValueChange={([v]) => onChange({ ...value, density: v })}
              className="w-48"
            />
            <span className="w-10 text-right text-sm font-mono">{value.density.toFixed(1)}</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-bold">Symbols ({value.items.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onChange({ items: DEFAULT_FLOATING_ITEMS, density: 1.2 })}>
            <RotateCcw className="!size-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={add}>
            <Plus className="!size-3.5" /> Add symbol
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {value.items.map((it, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,auto] sm:items-end">
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-muted text-2xl">
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    it.symbol || "?"
                  )}
                </div>
                <div>
                  <Label className="text-xs">Symbol {it.imageUrl ? "(hidden — image set)" : ""}</Label>
                  <Input
                    value={it.symbol}
                    onChange={(e) => update(i, { symbol: e.target.value })}
                    disabled={!!it.imageUrl}
                  />
                </div>
                <NumberField label="Size" value={it.size ?? 80} min={20} max={300} step={2} onChange={(v) => update(i, { size: v })} />
                <NumberField label="Speed" value={it.speed ?? 0.5} min={0.05} max={2} step={0.05} onChange={(v) => update(i, { speed: v })} />
                <NumberField label="Opacity" value={it.opacity ?? 1} min={0.1} max={1} step={0.05} onChange={(v) => update(i, { opacity: v })} />
                <NumberField label="Hue" value={it.hue ?? 0} min={0} max={360} step={5} onChange={(v) => update(i, { hue: v })} />
                <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
                  <Trash2 className="!size-4 text-destructive" />
                </Button>
              </div>
              <ImageField
                label="Custom image (PNG / SVG) — replaces the emoji symbol when set"
                value={it.imageUrl ?? null}
                onChange={(v) => update(i, { imageUrl: v })}
                placeholder="https://… or upload a .png / .svg"
                accept="image/png,image/svg+xml,image/webp,image/jpeg,image/gif"
                uploadLabel="Upload PNG / SVG"
              />
            </div>
          </Card>
        ))}
        {value.items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No symbols. Add one or click Reset.
          </p>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
      />
    </div>
  );
}

/* ---------- Hero editor ---------- */

function HeroEditor({
  value,
  onChange,
}: {
  value: typeof DEFAULT_HERO;
  onChange: (next: typeof DEFAULT_HERO) => void;
}) {
  const set = <K extends keyof typeof DEFAULT_HERO>(k: K, v: (typeof DEFAULT_HERO)[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Badge</Label>
        <Input value={value.badge} onChange={(e) => set("badge", e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Title (prefix)</Label>
          <Input value={value.titlePrefix} onChange={(e) => set("titlePrefix", e.target.value)} />
        </div>
        <div>
          <Label>Title (accent / gradient)</Label>
          <Input value={value.titleAccent} onChange={(e) => set("titleAccent", e.target.value)} />
        </div>
        <div>
          <Label>Title (suffix)</Label>
          <Input value={value.titleSuffix} onChange={(e) => set("titleSuffix", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Subtitle</Label>
        <Textarea rows={3} value={value.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="rounded-lg border border-border p-3">
          <legend className="px-2 text-xs font-bold uppercase text-muted-foreground">Primary CTA</legend>
          <div className="space-y-2">
            <Input
              placeholder="Label"
              value={value.primaryCta.label}
              onChange={(e) => set("primaryCta", { ...value.primaryCta, label: e.target.value })}
            />
            <Input
              placeholder="Href"
              value={value.primaryCta.href}
              onChange={(e) => set("primaryCta", { ...value.primaryCta, href: e.target.value })}
            />
          </div>
        </fieldset>
        <fieldset className="rounded-lg border border-border p-3">
          <legend className="px-2 text-xs font-bold uppercase text-muted-foreground">Secondary CTA</legend>
          <div className="space-y-2">
            <Input
              placeholder="Label"
              value={value.secondaryCta.label}
              onChange={(e) => set("secondaryCta", { ...value.secondaryCta, label: e.target.value })}
            />
            <Input
              placeholder="Href"
              value={value.secondaryCta.href}
              onChange={(e) => set("secondaryCta", { ...value.secondaryCta, href: e.target.value })}
            />
          </div>
        </fieldset>
      </div>
      <ImageField
        label="Hero image (optional — replaces the animated reel stage)"
        value={value.heroImageUrl}
        onChange={(v) => set("heroImageUrl", v)}
      />
      <div className="pt-2">
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_HERO)}>
          <RotateCcw className="!size-3.5" /> Reset hero
        </Button>
      </div>
    </Card>
  );
}

/* ---------- Games editor ---------- */

function GamesEditor({
  value,
  onChange,
}: {
  value: GameOverride[];
  onChange: (next: GameOverride[]) => void;
}) {
  const byslug = new Map(value.map((o) => [o.slug, o]));
  const getOverride = (slug: string): GameOverride => byslug.get(slug) ?? { slug };

  const updateGame = (slug: string, patch: Partial<GameOverride>) => {
    const existing = byslug.get(slug);
    const next: GameOverride = { ...(existing ?? { slug }), ...patch, slug };
    const others = value.filter((o) => o.slug !== slug);
    onChange([...others, next]);
  };
  const resetGame = (slug: string) => onChange(value.filter((o) => o.slug !== slug));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Override per-game fields. Empty fields fall back to the built-in defaults.
      </p>
      {defaultGames.map((g) => {
        const o = getOverride(g.slug);
        return (
          <Card key={g.slug} className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{g.category}</div>
                <h4 className="font-bold">{o.title ?? g.title}</h4>
              </div>
              <Button variant="ghost" size="sm" onClick={() => resetGame(g.slug)}>
                <RotateCcw className="!size-3.5" /> Reset
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input value={o.title ?? g.title} onChange={(e) => updateGame(g.slug, { title: e.target.value })} />
              </div>
              <div>
                <Label>RTP %</Label>
                <Input
                  type="number"
                  step={0.1}
                  value={o.rtp ?? g.rtp}
                  onChange={(e) => updateGame(g.slug, { rtp: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={o.tagline ?? g.tagline} onChange={(e) => updateGame(g.slug, { tagline: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={o.description ?? g.description}
                onChange={(e) => updateGame(g.slug, { description: e.target.value })}
              />
            </div>
            <ImageField
              label="Cover image"
              value={o.cover ?? g.cover}
              onChange={(v) => updateGame(g.slug, { cover: v ?? undefined })}
            />
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Contact editor ---------- */

function ContactEditor({
  value,
  onChange,
}: {
  value: typeof DEFAULT_CONTACT;
  onChange: (next: typeof DEFAULT_CONTACT) => void;
}) {
  const set = <K extends keyof typeof DEFAULT_CONTACT>(k: K, v: string) => onChange({ ...value, [k]: v });
  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Email</Label>
        <Input value={value.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={value.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div>
        <Label>Address</Label>
        <Input value={value.address} onChange={(e) => set("address", e.target.value)} />
      </div>
      <div>
        <Label>Footer compliance text</Label>
        <Textarea rows={2} value={value.compliance} onChange={(e) => set("compliance", e.target.value)} />
      </div>
      <div className="pt-1">
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_CONTACT)}>
          <RotateCcw className="!size-3.5" /> Reset contact
        </Button>
      </div>
    </Card>
  );
}