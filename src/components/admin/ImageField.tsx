import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageField({
  label,
  value,
  onChange,
  placeholder = "https://… or upload below",
  accept = "image/*",
  uploadLabel = "Upload image",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (next: string | null) => void;
  placeholder?: string;
  accept?: string;
  uploadLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 1_500_000) {
      alert("Image is larger than ~1.5MB. localStorage may fail. Prefer a URL.");
    }
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      onChange(dataUrl);
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
      {value && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
          <img src={value} alt="" className="mx-auto h-32 w-auto object-contain" />
        </div>
      )}
    </div>
  );
}