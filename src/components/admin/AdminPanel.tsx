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
  Info,
  Share2,
  Save,
  Check,
  Image as ImageIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useSiteConfig } from "@/components/site-config/SiteConfigProvider";
import {
  useGames,
  useGamesAdmin,
  useUpsertGame,
  useDeleteGame,
  emptyGame,
  GAME_CATEGORIES,
  GAME_VOLATILITIES,
  GAME_STATUSES,
  type GameStatus,
  type GameInput,
  type DbGame,
} from "@/lib/games-api";
import { useState, useEffect } from "react";
import {
  DEFAULT_HERO,
  DEFAULT_CONTACT,
  DEFAULT_SITE_CONFIG,
  DEFAULT_HERO_STAGE,
  DEFAULT_STATS,
  DEFAULT_AWARD,
  DEFAULT_ABOUT,
  DEFAULT_SOCIAL,
  SOCIAL_PLATFORMS,
  STAGE_ICON_NAMES,
  type FloatingConfig,
  type SiteConfig,
  type HeroStageConfig,
  type HeroStageSymbol,
  type HeroStageBadge,
  type StatItem,
  type AwardBadge,
  type StageTint,
  type AboutConfig,
  type AboutStat,
  type SocialLink,
  type SocialPlatform,
  type BrandingConfig,
} from "@/lib/site-config";
import { DEFAULT_FLOATING_ITEMS, type FloatingItem } from "@/lib/site-config";
import { ImageField } from "./ImageField";
import { adminSignOut } from "./AdminGate";
import { GameAssetUploader } from "./GameAssetUploader";
import { ContactInbox } from "./ContactInbox";
import { EmailDeliveryLog } from "./EmailDeliveryLog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
            Changes are saved instantly to Lovable Cloud and go live for all visitors.
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="brand"><ImageIcon className="!size-3.5" /> Brand</TabsTrigger>
          <TabsTrigger value="floating"><Sparkles className="!size-3.5" /> Symbols</TabsTrigger>
          <TabsTrigger value="hero"><Settings2 className="!size-3.5" /> Hero</TabsTrigger>
          <TabsTrigger value="games"><Gamepad2 className="!size-3.5" /> Games</TabsTrigger>
          <TabsTrigger value="about"><Info className="!size-3.5" /> About</TabsTrigger>
          <TabsTrigger value="contact"><MessageSquare className="!size-3.5" /> Contact</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="!size-3.5" /> Social</TabsTrigger>
          <TabsTrigger value="inbox"><InboxIcon className="!size-3.5" /> Inbox</TabsTrigger>
          <TabsTrigger value="emails"><SendIcon className="!size-3.5" /> Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-6">
          <BrandEditor
            value={config.branding}
            onChange={(next) => setConfig((c) => ({ ...c, branding: next }))}
          />
        </TabsContent>

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
          <GamesEditor />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactEditor
            value={config.contact}
            onChange={(next) => setConfig((c) => ({ ...c, contact: next }))}
          />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutEditor
            value={config.about}
            onChange={(next) => setConfig((c) => ({ ...c, about: next }))}
          />
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <SocialEditor
            value={config.social}
            onChange={(next) => setConfig((c) => ({ ...c, social: next }))}
          />
        </TabsContent>

        <TabsContent value="inbox" className="mt-6">
          <ContactInbox />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailDeliveryLog />
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
  return (
    <Tabs defaultValue="text">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="text">Text</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="award">Badge</TabsTrigger>
        <TabsTrigger value="scroll">Scroll video</TabsTrigger>
      </TabsList>
      <TabsContent value="text" className="mt-4">
        <HeroTextEditor value={value} onChange={onChange} />
      </TabsContent>
      <TabsContent value="stats" className="mt-4">
        <HeroStatsEditor
          value={value.stats}
          onChange={(stats) => onChange({ ...value, stats })}
        />
      </TabsContent>
      <TabsContent value="award" className="mt-4">
        <HeroAwardEditor
          value={value.award}
          onChange={(award) => onChange({ ...value, award })}
        />
      </TabsContent>
      <TabsContent value="scroll" className="mt-4">
        <HeroScrollEditor
          backgroundColor={value.backgroundColor}
          videoUrl={value.scrollVideoUrl}
          videoMode={value.scrollVideoMode}
          sideCropPct={value.scrollVideoSideCropPct ?? 0}
          fullHero={value}
          onChange={(patch) => onChange({ ...value, ...patch })}
        />
      </TabsContent>
    </Tabs>
  );
}

function HeroTextEditor({
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
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({
              ...value,
              badge: DEFAULT_HERO.badge,
              titlePrefix: DEFAULT_HERO.titlePrefix,
              titleAccent: DEFAULT_HERO.titleAccent,
              titleSuffix: DEFAULT_HERO.titleSuffix,
              subtitle: DEFAULT_HERO.subtitle,
              primaryCta: DEFAULT_HERO.primaryCta,
              secondaryCta: DEFAULT_HERO.secondaryCta,
            })
          }
        >
          <RotateCcw className="!size-3.5" /> Reset textos
        </Button>
      </div>
    </Card>
  );
}

/* ---------- Hero stats / award / stage ---------- */

function HeroStatsEditor({
  value,
  onChange,
}: {
  value: StatItem[];
  onChange: (next: StatItem[]) => void;
}) {
  const update = (i: number, patch: Partial<StatItem>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-3">
      {value.map((s, i) => (
        <Card key={i} className="p-4">
          <div className="grid gap-3 sm:grid-cols-[auto,1fr,1fr,1fr,1fr] sm:items-end">
            <div className="flex items-center gap-2">
              <Switch checked={s.enabled} onCheckedChange={(v) => update(i, { enabled: v })} />
              <Label className="text-xs">On</Label>
            </div>
            <NumberField label="Value" value={s.value} min={0} max={999999} step={0.1} onChange={(v) => update(i, { value: v })} />
            <div>
              <Label className="text-xs">Suffix</Label>
              <Input value={s.suffix} onChange={(e) => update(i, { suffix: e.target.value })} />
            </div>
            <NumberField label="Decimals" value={s.decimals} min={0} max={3} step={1} onChange={(v) => update(i, { decimals: v })} />
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={s.label} onChange={(e) => update(i, { label: e.target.value })} />
            </div>
          </div>
        </Card>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_STATS)}>
        <RotateCcw className="!size-3.5" /> Reset stats
      </Button>
    </div>
  );
}

function HeroAwardEditor({
  value,
  onChange,
}: {
  value: AwardBadge;
  onChange: (next: AwardBadge) => void;
}) {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-3">
        <Switch checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} />
        <Label>Mostrar badge</Label>
      </div>
      <div>
        <Label>Texto</Label>
        <Input value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} />
      </div>
      <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_AWARD)}>
        <RotateCcw className="!size-3.5" /> Reset
      </Button>
    </Card>
  );
}

/* ---------- Hero scroll video editor (bg color + video) ---------- */

function HeroScrollEditor({
  backgroundColor,
  videoUrl,
  videoMode,
  sideCropPct,
  fullHero,
  onChange,
}: {
  backgroundColor: string;
  videoUrl: string | null;
  videoMode: "scroll" | "loop";
  sideCropPct: number;
  fullHero: typeof DEFAULT_HERO;
  onChange: (patch: {
    backgroundColor?: string;
    scrollVideoUrl?: string | null;
    scrollVideoMode?: "scroll" | "loop";
    scrollVideoSideCropPct?: number;
  }) => void;
}) {
  const { setConfig } = useSiteConfig();
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    // Re-assert the current hero config to force a Supabase upsert + cross-tab broadcast.
    setConfig((c) => ({ ...c, hero: { ...fullHero } }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <div>
          <h3 className="font-bold">Cor de fundo do Hero</h3>
          <p className="text-xs text-muted-foreground">
            Cor sólida usada como background da seção principal. Sem gradientes ou efeitos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent p-1"
            aria-label="Selecionar cor"
          />
          <Input
            value={backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            placeholder="#F7F3E6"
            className="max-w-[180px] font-mono"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ backgroundColor: DEFAULT_HERO.backgroundColor })}
          >
            <RotateCcw className="!size-3.5" /> Reset cor
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h3 className="font-bold">Vídeo de scroll</h3>
          <p className="text-xs text-muted-foreground">
            Substitui o vídeo padrão exibido ao lado do texto. Escolha entre controlar o vídeo
            pelo scroll da página ou deixá-lo rodando em loop automático.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">Tamanho ideal do vídeo</p>
          <p className="mt-1 text-xs opacity-90">
            Para evitar cortes e barras pretas, use <strong>1920×1080 (16:9)</strong> ou mais largo
            (ex: 2560×1080). O vídeo ocupa 100% da largura da tela com altura mínima de 50vh;
            o conteúdo importante deve ficar no <strong>centro do frame</strong>.
            Evite arquivos com barras pretas embutidas — o player já preenche a tela automaticamente.
          </p>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Modo de reprodução
          </Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ scrollVideoMode: "scroll" })}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                videoMode === "scroll"
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <div className="font-bold">Scroll</div>
              <div className="text-xs text-muted-foreground">
                Avança quadro a quadro conforme o usuário rola a página.
              </div>
            </button>
            <button
              type="button"
              onClick={() => onChange({ scrollVideoMode: "loop" })}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                videoMode === "loop"
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <div className="font-bold">Loop</div>
              <div className="text-xs text-muted-foreground">
                Toca automaticamente em loop, sem interagir com o scroll.
              </div>
            </button>
          </div>
        </div>
        <ImageField
          label="Arquivo de vídeo (MP4 / WebM)"
          value={videoUrl}
          onChange={(v) => onChange({ scrollVideoUrl: v })}
          accept="video/mp4,video/webm,video/quicktime"
          uploadLabel="Upload vídeo"
          placeholder="https://… ou faça upload"
          previewKind="video"
        />
        <p className="text-xs text-muted-foreground">
          Deixe vazio para usar o vídeo padrão embutido.
        </p>
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Corte lateral do vídeo
            </Label>
            <span className="font-mono text-xs text-muted-foreground">{sideCropPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={sideCropPct}
            onChange={(e) => onChange({ scrollVideoSideCropPct: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Use para esconder barras pretas embutidas nas laterais do arquivo. O conteúdo central é
            ampliado horizontalmente até preencher toda a largura, sem distorcer a proporção.
          </p>
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Button onClick={handleSave} size="sm">
            {saved ? (
              <>
                <Check className="!size-3.5" /> Salvo!
              </>
            ) : (
              <>
                <Save className="!size-3.5" /> Salvar alterações
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            As alterações também são salvas automaticamente ao editar.
          </p>
        </div>
      </Card>
    </div>
  );
}

function HeroStageEditor({
  value,
  onChange,
}: {
  value: HeroStageConfig;
  onChange: (next: HeroStageConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <div>
          <h3 className="font-bold">Miolo central</h3>
          <p className="text-xs text-muted-foreground">Escolha o que aparece no centro do palco.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[200px,1fr] sm:items-center">
          <Label>Modo</Label>
          <Select value={value.mode} onValueChange={(v) => onChange({ ...value, mode: v as HeroStageConfig["mode"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="character">Imagem custom (personagem)</SelectItem>
              <SelectItem value="reels">Reels animados</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value.mode === "character" && (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <ImageField
              label="Imagem do personagem (PNG / SVG / JPG)"
              value={value.character.imageUrl}
              onChange={(v) => onChange({ ...value, character: { ...value.character, imageUrl: v } })}
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              uploadLabel="Upload personagem"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <SliderField label="Escala (%)" value={value.character.scale} min={50} max={120} step={1}
                onChange={(v) => onChange({ ...value, character: { ...value.character, scale: v } })} />
              <SliderField label="Offset Y (%)" value={value.character.offsetY} min={-20} max={20} step={1}
                onChange={(v) => onChange({ ...value, character: { ...value.character, offsetY: v } })} />
              <SliderField label="Parallax" value={value.character.parallax} min={0} max={1} step={0.05}
                onChange={(v) => onChange({ ...value, character: { ...value.character, parallax: v } })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={value.character.shadow}
                onCheckedChange={(v) => onChange({ ...value, character: { ...value.character, shadow: v } })} />
              <Label>Glow atrás do personagem</Label>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Ícones flutuantes ({value.symbols.length})</h3>
            <p className="text-xs text-muted-foreground">Aparecem ao redor do miolo central.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"
              onClick={() => onChange({ ...value, symbols: DEFAULT_HERO_STAGE.symbols })}>
              <RotateCcw className="!size-3.5" /> Reset
            </Button>
            <Button size="sm"
              onClick={() => onChange({
                ...value,
                symbols: [...value.symbols, {
                  kind: "lucide", icon: "Star", x: 50, y: 50, size: 40,
                  tint: "orange", depth: 0.6, delay: 0, duration: 6,
                }],
              })}>
              <Plus className="!size-3.5" /> Adicionar
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {value.symbols.map((sym, i) => (
            <StageSymbolRow
              key={i}
              value={sym}
              onChange={(patch) =>
                onChange({
                  ...value,
                  symbols: value.symbols.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
                })
              }
              onRemove={() =>
                onChange({ ...value, symbols: value.symbols.filter((_, idx) => idx !== i) })
              }
            />
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h3 className="font-bold">Badges decorativos</h3>
        <StageBadgeRow label="Mega Win" value={value.badges.megaWin}
          onChange={(b) => onChange({ ...value, badges: { ...value.badges, megaWin: b } })} />
        <StageBadgeRow label="HTML5" value={value.badges.html5}
          onChange={(b) => onChange({ ...value, badges: { ...value.badges, html5: b } })} />
      </Card>

      <div>
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_HERO_STAGE)}>
          <RotateCcw className="!size-3.5" /> Reset palco
        </Button>
      </div>
    </div>
  );
}

function StageSymbolRow({
  value,
  onChange,
  onRemove,
}: {
  value: HeroStageSymbol;
  onChange: (patch: Partial<HeroStageSymbol>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr,1fr,1fr,auto] sm:items-end">
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={value.kind} onValueChange={(v) => onChange({ kind: v as HeroStageSymbol["kind"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lucide">Ícone (Lucide)</SelectItem>
              <SelectItem value="emoji">Emoji / texto</SelectItem>
              <SelectItem value="image">Imagem</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value.kind === "lucide" && (
          <div>
            <Label className="text-xs">Ícone</Label>
            <Select value={value.icon ?? "Star"} onValueChange={(v) => onChange({ icon: v as HeroStageSymbol["icon"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGE_ICON_NAMES.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {value.kind === "emoji" && (
          <div>
            <Label className="text-xs">Emoji / texto</Label>
            <Input value={value.emoji ?? ""} onChange={(e) => onChange({ emoji: e.target.value })} />
          </div>
        )}
        {value.kind === "image" && <div />}
        <div>
          <Label className="text-xs">Tint</Label>
          <Select value={value.tint} onValueChange={(v) => onChange({ tint: v as StageTint })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="yellow">Yellow</SelectItem>
              <SelectItem value="light">Light orange</SelectItem>
              <SelectItem value="grey">Grey</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
          <Trash2 className="!size-4 text-destructive" />
        </Button>
      </div>
      {value.tint === "custom" && (
        <div>
          <Label className="text-xs">Cor (hex)</Label>
          <Input value={value.color ?? "#ff7a00"} onChange={(e) => onChange({ color: e.target.value })} />
        </div>
      )}
      {value.kind === "image" && (
        <ImageField
            label="Imagem (SVG, PNG, GIF, JPG)"
          value={value.imageUrl ?? null}
          onChange={(v) => onChange({ imageUrl: v })}
            accept="image/png,image/svg+xml,image/webp,image/jpeg,image/gif"
            uploadLabel="Upload SVG/PNG/GIF"
        />
      )}
      <div className="grid gap-3 sm:grid-cols-6">
        <SliderField label="X %" value={value.x} min={0} max={100} step={1} onChange={(v) => onChange({ x: v })} />
        <SliderField label="Y %" value={value.y} min={0} max={100} step={1} onChange={(v) => onChange({ y: v })} />
        <NumberField label="Size" value={value.size} min={16} max={140} step={2} onChange={(v) => onChange({ size: v })} />
        <SliderField label="Depth" value={value.depth} min={0} max={1} step={0.05} onChange={(v) => onChange({ depth: v })} />
        <NumberField label="Delay" value={value.delay} min={0} max={10} step={0.1} onChange={(v) => onChange({ delay: v })} />
        <NumberField label="Duration" value={value.duration} min={1} max={15} step={0.2} onChange={(v) => onChange({ duration: v })} />
      </div>
    </div>
  );
}

function StageBadgeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: HeroStageBadge;
  onChange: (next: HeroStageBadge) => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[auto,1fr,180px] sm:items-end">
      <div className="flex items-center gap-2">
        <Switch checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} />
        <Label className="text-xs">{label}</Label>
      </div>
      <div>
        <Label className="text-xs">Texto</Label>
        <Input value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Lado</Label>
        <Select value={value.side} onValueChange={(v) => onChange({ ...value, side: v as "left" | "right" })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SliderField({
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
      <div className="mb-1 flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs font-mono text-muted-foreground">{typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

/* ---------- Games editor ---------- */

function GamesEditor() {
  const { data: games = [], isLoading } = useGamesAdmin();
  const upsert = useUpsertGame();
  const del = useDeleteGame();
  const DRAFT_KEY = "ayuniqa.admin.gameDraft.v1";
  const [editing, setEditing] = useState<GameInput | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tab, setTab] = useState<GameStatus>("released");

  // Restore in-progress draft after accidental reloads / remounts.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameInput;
        if (parsed && typeof parsed === "object") setEditing(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist draft on every change so uploads-in-progress survive reloads.
  useEffect(() => {
    try {
      if (editing) {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(editing));
      } else {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      // ignore quota / privacy errors
    }
  }, [editing]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    setSaveError(null);
    setEditing(null);
  };

  const startEdit = (g: DbGame) => {
    setSaveError(null);
    setEditing({ ...g });
  };
  const startNew = () => {
    setSaveError(null);
    setEditing({ ...emptyGame(), status: tab });
  };

  if (editing) {
    return (
      <GameForm
        value={editing}
        onChange={setEditing}
        onCancel={() => {
          if (!confirm("Discard unsaved changes?")) return;
          clearDraft();
        }}
        onSave={async () => {
          setSaveError(null);
          try {
            await upsert.mutateAsync(editing);
            clearDraft();
          } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Save failed. Please try again.");
          }
        }}
        saving={upsert.isPending}
        error={saveError}
      />
    );
  }

  const visibleGames = games.filter((g) => (g.status ?? "released") === tab);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as GameStatus)}>
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
          <TabsTrigger value="released">Released</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          Clique em <strong>Editar</strong> para alterar os campos de um jogo, ou no ícone de lixeira para excluí-lo. As mudanças vão ao ar imediatamente no site público.
        </p>
        <Button size="sm" onClick={startNew}>
          <Plus className="!size-3.5" /> Add {tab === "upcoming" ? "upcoming" : "game"}
        </Button>
      </div>

      {isLoading && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Loading games…
        </p>
      )}

      {!isLoading && visibleGames.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {tab === "upcoming"
            ? "Nenhum jogo em Upcoming. Clique em \"Add upcoming\" para adicionar o primeiro."
            : "No games yet. Click \"Add game\" to create the first one."}
        </p>
      )}

      <div className="grid gap-3">
        {visibleGames.map((g) => (
          <Card key={g.slug} className="flex flex-wrap items-center gap-4 p-4">
            <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted">
              {g.cover_url && (
                <img src={g.cover_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {g.category} · {g.volatility} · RTP {g.rtp}% · ordem {g.position}
              </div>
              <h4 className="font-bold">{g.title}</h4>
              <p className="truncate text-xs text-muted-foreground">/{g.slug}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(g)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!confirm(`Delete "${g.title}"? This cannot be undone.`)) return;
                  try {
                    await del.mutateAsync(g.slug);
                  } catch (err) {
                    alert("Delete failed: " + (err instanceof Error ? err.message : String(err)));
                  }
                }}
              >
                <Trash2 className="!size-3.5 text-destructive" /> Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GameForm({
  value,
  onChange,
  onCancel,
  onSave,
  saving,
  error,
}: {
  value: GameInput;
  onChange: (v: GameInput) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}) {
  const set = <K extends keyof GameInput>(k: K, v: GameInput[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black">{value.id ? "Edit game" : "New game"}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving || !value.slug || !value.title}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Save failed: {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Slug (URL, lowercase, no spaces)</Label>
          <Input
            value={value.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="big-catch"
          />
        </div>
        <div>
          <Label>Title</Label>
          <Input value={value.title} onChange={(e) => set("title", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Tagline</Label>
        <Input value={value.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Category</Label>
          <Select value={value.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GAME_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={value.status ?? "released"} onValueChange={(v) => set("status", v as GameStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GAME_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "upcoming" ? "Upcoming" : "Released"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Volatility</Label>
          <Select value={value.volatility} onValueChange={(v) => set("volatility", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GAME_VOLATILITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>RTP %</Label>
          <Input
            type="number" step={0.1}
            value={value.rtp}
            onChange={(e) => set("rtp", parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Reels (e.g. 5x3)</Label>
          <Input value={value.reels} onChange={(e) => set("reels", e.target.value)} />
        </div>
        <div>
          <Label>Paylines</Label>
          <Input
            type="number"
            value={value.paylines}
            onChange={(e) => set("paylines", parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Display order (lower = first)</Label>
          <Input
            type="number"
            value={value.position}
            onChange={(e) => set("position", parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea rows={4} value={value.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <ImageField
        label="Cover image"
        value={value.cover_url || null}
        onChange={(v) => set("cover_url", v ?? "")}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        placeholder="https://… (PNG, JPG, GIF, WebP, SVG)"
        uploadLabel="Upload cover image"
      />

      <div>
        <Label>Features</Label>
        <StringListEditor
          value={value.features}
          onChange={(v) => set("features", v)}
          placeholder="e.g. Free Spins"
          addLabel="Add feature"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Trailer URL (YouTube, Vimeo or .mp4)</Label>
          <Input
            value={value.trailer_url ?? ""}
            onChange={(e) => set("trailer_url", e.target.value || null)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div>
          <Label>Play-demo URL (iframe)</Label>
          <Input
            value={value.demo_url ?? ""}
            onChange={(e) => set("demo_url", e.target.value || null)}
            placeholder="https://demo.example.com/game"
          />
        </div>
      </div>

      <ScreenshotsEditor
        value={value.screenshots}
        onChange={(next) => set("screenshots", next)}
      />

      {value.slug && (
        <GameAssetUploader
          slug={value.slug}
          assets={value.assets}
          onChange={(next) => set("assets", next)}
        />
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving || !value.slug || !value.title}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}

function StringListEditor({
  value,
  onChange,
  placeholder,
  addLabel,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            aria-label="Remove"
          >
            <Trash2 className="!size-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange([...value, ""])}
      >
        <Plus className="!size-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

/* ---------- Screenshots editor ---------- */

function ScreenshotsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Screenshots ({value.length})
        </Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange([...value, ""])}
        >
          <Plus className="!size-3.5" /> Add screenshot
        </Button>
      </div>
      {value.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
          No screenshots yet. Add a URL or upload one below.
        </p>
      )}
      <div className="space-y-2">
        {value.map((src, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <ImageField
              label={`Screenshot ${i + 1}`}
              value={src}
              onChange={(v) => {
                const next = [...value];
                next[i] = v ?? "";
                onChange(next);
              }}
              accept="image/png,image/jpeg,image/webp,image/gif"
              placeholder="https://… ou faça upload"
              uploadLabel="Upload screenshot"
            />
            <div className="mt-2 text-right">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="!size-3.5 text-destructive" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
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

/* ---------- About editor ---------- */

function AboutEditor({
  value,
  onChange,
}: {
  value: AboutConfig;
  onChange: (next: AboutConfig) => void;
}) {
  const updateStat = (i: number, patch: Partial<AboutStat>) =>
    onChange({
      ...value,
      stats: value.stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  const updateParagraph = (i: number, text: string) =>
    onChange({ ...value, paragraphs: value.paragraphs.map((p, idx) => (idx === i ? text : p)) });
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Title (prefix)</Label>
            <Input
              value={value.titlePrefix}
              onChange={(e) => onChange({ ...value, titlePrefix: e.target.value })}
            />
          </div>
          <div>
            <Label>Title (accent / gradient)</Label>
            <Input
              value={value.titleAccent}
              onChange={(e) => onChange({ ...value, titleAccent: e.target.value })}
            />
          </div>
          <div>
            <Label>Title (suffix)</Label>
            <Input
              value={value.titleSuffix}
              onChange={(e) => onChange({ ...value, titleSuffix: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Lead paragraph</Label>
          <Textarea
            rows={3}
            value={value.lead}
            onChange={(e) => onChange({ ...value, lead: e.target.value })}
          />
        </div>
      </Card>

      <Card className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Stats ({value.stats.length})</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange({ ...value, stats: [...value.stats, { value: "10+", label: "Novo" }] })}
          >
            <Plus className="!size-3.5" /> Add stat
          </Button>
        </div>
        {value.stats.map((s, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr,2fr,auto] sm:items-end">
            <div>
              <Label className="text-xs">Valor</Label>
              <Input value={s.value} onChange={(e) => updateStat(i, { value: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={s.label} onChange={(e) => updateStat(i, { label: e.target.value })} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange({ ...value, stats: value.stats.filter((_, idx) => idx !== i) })}
              aria-label="Remove stat"
            >
              <Trash2 className="!size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Paragraphs ({value.paragraphs.length})</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange({ ...value, paragraphs: [...value.paragraphs, ""] })}
          >
            <Plus className="!size-3.5" /> Add paragraph
          </Button>
        </div>
        {value.paragraphs.map((p, i) => (
          <div key={i} className="space-y-1">
            <Textarea rows={3} value={p} onChange={(e) => updateParagraph(i, e.target.value)} />
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange({ ...value, paragraphs: value.paragraphs.filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="!size-3.5 text-destructive" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_ABOUT)}>
        <RotateCcw className="!size-3.5" /> Reset About
      </Button>
    </div>
  );
}

/* ---------- Social editor ---------- */

function SocialEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
}) {
  const update = (i: number, patch: Partial<SocialLink>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Social links ({value.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onChange(DEFAULT_SOCIAL)}>
            <RotateCcw className="!size-3.5" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={() => onChange([...value, { platform: "website", url: "https://" }])}
          >
            <Plus className="!size-3.5" /> Add link
          </Button>
        </div>
      </div>
      {value.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No links yet. Click "Add link" to start.
        </p>
      )}
      {value.map((s, i) => (
        <Card key={i} className="p-4">
          <div className="grid gap-3 sm:grid-cols-[180px,1fr,auto] sm:items-end">
            <div>
              <Label className="text-xs">Platform</Label>
              <Select
                value={s.platform}
                onValueChange={(v) => update(i, { platform: v as SocialPlatform })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={s.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              aria-label="Remove"
            >
              <Trash2 className="!size-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Brand editor (logo) ---------- */

function BrandEditor({
  value,
  onChange,
}: {
  value: BrandingConfig;
  onChange: (next: BrandingConfig) => void;
}) {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <h3 className="font-bold">Site logo</h3>
        <p className="text-xs text-muted-foreground">
          Used in the top menu and footer across every page. Recommended: PNG or SVG with transparent background, height ≥ 72px.
        </p>
      </div>
      <ImageField
        label="Custom logo (leave empty to use the default Ayuniqa logo)"
        value={value.logoUrl}
        onChange={(v) => onChange({ ...value, logoUrl: v })}
        placeholder="https://… or upload a .png / .svg"
        accept="image/png,image/svg+xml,image/webp,image/jpeg"
        uploadLabel="Upload logo"
      />
      {value.logoUrl && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...value, logoUrl: null })}>
          <RotateCcw className="!size-3.5" /> Restore default logo
        </Button>
      )}
    </Card>
  );
}