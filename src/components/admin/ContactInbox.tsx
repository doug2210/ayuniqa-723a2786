import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, RefreshCw, Trash2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ContactMessage = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

export function ContactInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("contact_messages")
      .select("id, name, company, email, message, created_at, read_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) {
      setError(err.message);
      setMessages([]);
    } else {
      setMessages((data ?? []) as ContactMessage[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const markRead = async (id: string, read: boolean) => {
    const read_at = read ? new Date().toISOString() : null;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read_at } : m)));
    const { error: err } = await supabase
      .from("contact_messages")
      .update({ read_at })
      .eq("id", id);
    if (err) {
      setError(err.message);
      void load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    const prev = messages;
    setMessages((p) => p.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    const { error: err } = await supabase.from("contact_messages").delete().eq("id", id);
    if (err) {
      setError(err.message);
      setMessages(prev);
    }
  };

  const copyEmail = async (id: string, email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      // ignore
    }
  };

  const visible = filter === "unread" ? messages.filter((m) => !m.read_at) : messages;
  const unreadCount = messages.filter((m) => !m.read_at).length;
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  // Auto-mark as read when opened
  useEffect(() => {
    if (selected && !selected.read_at) {
      void markRead(selected.id, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Contact inbox</h3>
          <p className="text-xs text-muted-foreground">
            Messages submitted through the site contact form.{" "}
            {unreadCount > 0 && <span className="font-semibold">{unreadCount} unread.</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All ({messages.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`!size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="max-h-[70vh] overflow-y-auto p-0">
          {loading && messages.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : visible.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {filter === "unread" ? "No unread messages." : "No messages yet."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((m) => {
                const isSelected = m.id === selectedId;
                const isUnread = !m.read_at;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setSelectedId(m.id)}
                      className={`flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50 ${
                        isSelected ? "bg-muted" : ""
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
                          isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isUnread ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`truncate text-sm ${isUnread ? "font-bold" : "font-medium"}`}>
                            {m.name}
                          </span>
                          {m.company && (
                            <span className="truncate text-xs text-muted-foreground">· {m.company}</span>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.message}</div>
                      </div>
                      <div className="shrink-0 text-right text-[10px] text-muted-foreground">
                        {formatDate(m.created_at)}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="max-h-[70vh] overflow-y-auto p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-lg font-bold">{selected.name}</h4>
                  {selected.company && (
                    <p className="text-sm text-muted-foreground">{selected.company}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {selected.email}
                    </a>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      onClick={() => void copyEmail(selected.id, selected.email)}
                      aria-label="Copy email"
                    >
                      {copiedId === selected.id ? (
                        <Check className="!size-3.5 text-green-600" />
                      ) : (
                        <Copy className="!size-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={selected.read_at ? "secondary" : "default"}>
                    {selected.read_at ? "Read" : "Unread"}
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${selected.email}?subject=Re:%20Ayuniqa%20contact`}>Reply</a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void markRead(selected.id, !selected.read_at)}
                  >
                    {selected.read_at ? "Mark unread" : "Mark read"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void remove(selected.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="!size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm">
                {selected.message}
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-[200px] place-items-center text-center text-sm text-muted-foreground">
              Select a message to read it.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}