import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminChangeUserPassword } from "@/lib/admin-users.functions";

function randomPassword(len = 16) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_";
  const bytes = new Uint32Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

export function ChangePasswordDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const call = useServerFn(adminChangeUserPassword);

  function reset() {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
    setBusy(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const res = await call({ data: { email, newPassword: password } });
      setSuccess(
        `Senha atualizada para ${res.email}. Copie e envie manualmente ao usuário.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar senha de usuário</DialogTitle>
          <DialogDescription>
            Redefine diretamente a senha de qualquer conta aprovada, sem
            precisar de e-mail de recuperação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cp-email">E-mail do usuário</Label>
            <Input
              id="cp-email"
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cp-password">Nova senha (mín. 10)</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => setPassword(randomPassword(16))}
              >
                Gerar aleatória
              </button>
            </div>
            <Input
              id="cp-password"
              type="text"
              autoComplete="off"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 font-mono"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              {success}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Salvando…" : "Atualizar senha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}