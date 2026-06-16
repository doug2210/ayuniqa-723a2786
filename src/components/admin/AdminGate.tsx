import { useEffect, useState, type ReactNode } from "react";
import { Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_SESSION_KEY } from "@/lib/site-config";

const ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || "ayuniqa";

export function AdminGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    if (typeof window === "undefined") return;
    setAuthed(window.localStorage.getItem(ADMIN_SESSION_KEY) === "true");
  }, []);

  if (!hydrated) return null;

  if (authed) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
          <Lock />
        </div>
        <h1 className="mt-4 text-center text-2xl font-black">Admin access</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter the admin password to manage site content. Client-side protection only — replace with real auth when Lovable Cloud is enabled.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (pwd === ADMIN_PASSWORD) {
              window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
              setAuthed(true);
              setError(null);
            } else {
              setError("Wrong password.");
            }
          }}
        >
          <div>
            <Label htmlFor="admin-pwd">Password</Label>
            <Input
              id="admin-pwd"
              type="password"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="mt-1.5 h-11"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="shimmer" className="w-full">
            <LogIn /> Sign in
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Default password: <code className="rounded bg-muted px-1">ayuniqa</code> · override with{" "}
            <code className="rounded bg-muted px-1">VITE_ADMIN_PASSWORD</code>
          </p>
        </form>
      </div>
    </div>
  );
}

export function adminSignOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.reload();
}