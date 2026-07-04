import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-assets";

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ImageField({
  label,
  value,
  onChange,
  placeholder = "https://… or upload below",
  accept = "image/*",
  uploadLabel = "Upload image",
  previewKind = "image",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (next: string | null) => void;
  placeholder?: string;
  accept?: string;
  uploadLabel?: string;
  previewKind?: "image" | "video";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const path = `site/${randomId()}-${sanitize(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type || undefined,
          upsert: false,
          cacheControl: "31536000",
        });
      if (upErr) throw upErr;
      // Buckets are private (workspace policy blocks public buckets), so use
      // a long-lived signed URL. 100 years ≈ 3153600000 s.
      const { data: signed, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 100);
      if (signErr) throw signErr;
      onChange(signed.signedUrl);
    } catch (err) {
      const msg = (err as Error)?.message ?? "Upload failed.";
      setError(msg);
      console.error("[ImageField] upload failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={placeholder}
      />
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="!size-3.5" /> {busy ? "Uploading…" : uploadLabel}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="!size-3.5" /> Clear
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
          {previewKind === "video" ? (
            <video
              src={value}
              muted
              playsInline
              controls
              className="mx-auto h-40 w-auto"
            />
          ) : (
            <img src={value} alt="" className="mx-auto h-32 w-auto object-contain" />
          )}
        </div>
      )}
    </div>
  );
}