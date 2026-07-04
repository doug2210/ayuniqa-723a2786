import { useRef, useState, type DragEvent } from "react";
import { Upload, Trash2, Folder, File as FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { GameAsset } from "@/lib/games-data";
import { formatBytes } from "@/lib/game-media";

const BUCKET = "game-assets";

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-\/]/g, "_");
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

type FileWithPath = File & { webkitRelativePath?: string };

export function GameAssetUploader({
  slug,
  assets,
  onChange,
}: {
  slug: string;
  assets: GameAsset[];
  onChange: (next: GameAsset[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");

  async function uploadOne(file: FileWithPath, overrideFolder?: string) {
    const rel = file.webkitRelativePath || "";
    // Folder priority: relative path's first segment > explicit folderName input > none
    let folder: string | null = null;
    let name = file.name;
    if (rel && rel.includes("/")) {
      const parts = rel.split("/").filter(Boolean);
      folder = parts.slice(0, -1).join("/");
      name = parts[parts.length - 1];
    } else if (overrideFolder && overrideFolder.trim()) {
      folder = overrideFolder.trim().replace(/^\/+|\/+$/g, "");
    }
    const id = randomId();
    const safeFolder = folder ? sanitize(folder) : null;
    const safeName = sanitize(name);
    const path = safeFolder
      ? `${slug}/${safeFolder}/${id}-${safeName}`
      : `${slug}/${id}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (upErr) throw upErr;
    // Private bucket: mint a long-lived signed URL (100 years).
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 100);
    if (signErr) throw signErr;
    const asset: GameAsset = {
      id,
      name,
      folder: safeFolder,
      url: signed.signedUrl,
      path,
      size: file.size,
      contentType: file.type || null,
    };
    return asset;
  }

  async function handleFiles(files: FileList | File[], overrideFolder?: string) {
    const list = Array.from(files) as FileWithPath[];
    if (list.length === 0) return;
    setError(null);
    setUploading(list.length);
    // Snapshot the current assets once; we append to this base after each
    // successful upload so partial progress is never lost if the user closes
    // the tab or the form re-renders mid-batch.
    let current = assets.slice();
    try {
      for (const f of list) {
        try {
          const asset = await uploadOne(f, overrideFolder);
          current = [...current, asset];
          // Persist progress immediately after each file.
          onChange(current);
        } catch (err) {
          console.error("[game-assets] upload failed for", f.name, err);
          setError(
            (err as Error)?.message ??
              `Upload of "${f.name}" failed. Make sure you're signed in as admin.`,
          );
        } finally {
          setUploading((n) => Math.max(0, n - 1));
        }
      }
    } finally {
      setUploading(0);
    }
  }

  async function removeAsset(a: GameAsset) {
    if (!confirm(`Remover "${a.name}"? Isso apaga o arquivo do storage.`)) return;
    const { error: delErr } = await supabase.storage.from(BUCKET).remove([a.path]);
    if (delErr) {
      console.warn("[game-assets] delete failed:", delErr.message);
      // Still remove from list — the storage object might already be gone.
    }
    onChange(assets.filter((x) => x.id !== a.id));
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (!dt) return;
    // Support folder drops via DataTransferItems
    const items = dt.items;
    if (items && items.length && typeof (items[0] as any).webkitGetAsEntry === "function") {
      const entries: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = (items[i] as any).webkitGetAsEntry?.();
        if (entry) entries.push(entry);
      }
      void readEntriesAsFiles(entries).then((files) => {
        if (files.length) void handleFiles(files);
      });
      return;
    }
    if (dt.files && dt.files.length) void handleFiles(dt.files, folderName);
  };

  // Group by folder for display
  const groups = new Map<string, GameAsset[]>();
  for (const a of assets) {
    const k = a.folder || "(root)";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(a);
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        Downloadable assets ({assets.length})
      </Label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-smooth " +
          (dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20")
        }
      >
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm">
          Arraste e solte arquivos ou pastas aqui
        </p>
        <p className="text-xs text-muted-foreground">
          Suporta múltiplos arquivos. Pastas são preservadas no download.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Pasta (opcional)"
            className="h-8 w-44"
          />
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files, folderName);
              e.target.value = "";
            }}
          />
          <input
            ref={folderInput}
            type="file"
            multiple
            className="hidden"
            // @ts-expect-error non-standard attribute
            webkitdirectory=""
            directory=""
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <FileIcon className="!size-3.5" /> Arquivos
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => folderInput.current?.click()}>
            <Folder className="!size-3.5" /> Pasta
          </Button>
        </div>
        {uploading > 0 && (
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Enviando {uploading} arquivo(s)…
          </p>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      {groups.size > 0 && (
        <div className="space-y-3">
          {[...groups.entries()].map(([folder, items]) => (
            <div key={folder} className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Folder className="size-3.5" />
                {folder}
                <span className="ml-auto font-normal normal-case">{items.length} arquivo(s)</span>
              </div>
              <ul className="divide-y divide-border">
                {items.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <FileIcon className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{a.name}</span>
                    <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                      {formatBytes(a.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => void removeAsset(a)}
                      aria-label="Remover"
                    >
                      <Trash2 className="!size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

async function readEntriesAsFiles(entries: any[]): Promise<FileWithPath[]> {
  const out: FileWithPath[] = [];
  for (const entry of entries) {
    await walk(entry, "", out);
  }
  return out;
}

function walk(entry: any, prefix: string, out: FileWithPath[]): Promise<void> {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file((file: File) => {
        const rel = prefix ? `${prefix}/${file.name}` : file.name;
        Object.defineProperty(file, "webkitRelativePath", { value: rel });
        out.push(file as FileWithPath);
        resolve();
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const next = prefix ? `${prefix}/${entry.name}` : entry.name;
      const readAll = () => {
        reader.readEntries(async (batch: any[]) => {
          if (!batch.length) return resolve();
          for (const child of batch) await walk(child, next, out);
          readAll();
        });
      };
      readAll();
    } else resolve();
  });
}