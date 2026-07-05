import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  message_id: string | null;
  template_name: string | null;
  recipient_email: string | null;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type Preset = "24h" | "7d" | "30d" | "custom";

const PAGE_SIZE = 50;

function presetRange(p: Preset, customStart: string, customEnd: string): { start: Date; end: Date } {
  const end = new Date();
  if (p === "custom") {
    return {
      start: customStart ? new Date(customStart) : new Date(Date.now() - 7 * 864e5),
      end: customEnd ? new Date(customEnd + "T23:59:59") : end,
    };
  }
  const hours = p === "24h" ? 24 : p === "7d" ? 24 * 7 : 24 * 30;
  return { start: new Date(end.getTime() - hours * 3600 * 1000), end };
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "sent")
    return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/20 dark:text-green-400">Sent</Badge>;
  if (s === "dlq" || s === "failed" || s === "bounced" || s === "complained")
    return <Badge variant="destructive">{s === "dlq" ? "Failed" : s.charAt(0).toUpperCase() + s.slice(1)}</Badge>;
  if (s === "suppressed")
    return <Badge className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400">Suppressed</Badge>;
  if (s === "pending")
    return <Badge variant="secondary">Pending</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function EmailDeliveryLog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [template, setTemplate] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const range = useMemo(
    () => presetRange(preset, customStart, customEnd),
    [preset, customStart, customEnd],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("email_send_log")
      .select("id, message_id, template_name, recipient_email, status, error_message, metadata, created_at")
      .gte("created_at", range.start.toISOString())
      .lte("created_at", range.end.toISOString())
      .order("created_at", { ascending: false })
      .limit(2000);
    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      setRows((data ?? []) as Row[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customStart, customEnd]);

  // Deduplicate by message_id (keep latest — rows are already ordered desc)
  const deduped = useMemo(() => {
    const seen = new Set<string>();
    const out: Row[] = [];
    for (const r of rows) {
      const key = r.message_id ?? r.id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }, [rows]);

  const templates = useMemo(() => {
    const s = new Set<string>();
    deduped.forEach((r) => r.template_name && s.add(r.template_name));
    return Array.from(s).sort();
  }, [deduped]);

  const filtered = useMemo(() => {
    return deduped.filter((r) => {
      if (template !== "all" && r.template_name !== template) return false;
      if (status !== "all") {
        const s = r.status.toLowerCase();
        if (status === "failed" && !["dlq", "failed", "bounced", "complained"].includes(s)) return false;
        if (status === "sent" && s !== "sent") return false;
        if (status === "suppressed" && s !== "suppressed") return false;
        if (status === "pending" && s !== "pending") return false;
      }
      return true;
    });
  }, [deduped, template, status]);

  const stats = useMemo(() => {
    const s = { total: filtered.length, sent: 0, failed: 0, suppressed: 0, pending: 0 };
    for (const r of filtered) {
      const st = r.status.toLowerCase();
      if (st === "sent") s.sent++;
      else if (["dlq", "failed", "bounced", "complained"].includes(st)) s.failed++;
      else if (st === "suppressed") s.suppressed++;
      else if (st === "pending") s.pending++;
    }
    return s;
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    if (page >= totalPages) setPage(0);
  }, [totalPages, page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">Email delivery log</h3>
          <p className="text-xs text-muted-foreground">
            Every contact form and transactional email attempt, deduplicated by delivery. Latest status per message.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`!size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-[auto_1fr_1fr] md:items-end">
          <div>
            <Label className="text-xs">Time range</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(["24h", "7d", "30d", "custom"] as Preset[]).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={preset === p ? "default" : "outline"}
                  onClick={() => setPreset(p)}
                >
                  {p === "24h" ? "Last 24h" : p === "7d" ? "7 days" : p === "30d" ? "30 days" : "Custom"}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All templates</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="suppressed">Suppressed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {preset === "custom" && (
            <div className="md:col-span-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">From</Label>
                <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={stats.total} tone="default" />
        <StatCard label="Sent" value={stats.sent} tone="green" />
        <StatCard label="Failed" value={stats.failed} tone="red" />
        <StatCard label="Suppressed" value={stats.suppressed} tone="yellow" />
        <StatCard label="Pending" value={stats.pending} tone="muted" />
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="size-4 mt-0.5 shrink-0" /> {error}
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Template</th>
                <th className="px-3 py-2 text-left font-medium">Recipient</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && paged.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No emails match the current filters.</td></tr>
              ) : (
                paged.map((r) => {
                  const isFailed = ["dlq", "failed", "bounced", "complained"].includes(r.status.toLowerCase());
                  const isOpen = expanded === r.id;
                  return (
                    <>
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs">{r.template_name ?? "—"}</td>
                        <td className="px-3 py-2 max-w-[220px] truncate" title={r.recipient_email ?? ""}>
                          {r.recipient_email ?? "—"}
                        </td>
                        <td className="px-3 py-2">{statusBadge(r.status)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => setExpanded(isOpen ? null : r.id)}
                          >
                            {isOpen ? "Hide" : "View"}
                          </Button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={r.id + "-x"} className="bg-muted/20">
                          <td colSpan={5} className="px-3 py-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <div className="text-xs font-semibold text-muted-foreground">Message ID</div>
                                <div className="font-mono text-xs break-all">{r.message_id ?? "—"}</div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-muted-foreground">Row ID</div>
                                <div className="font-mono text-xs break-all">{r.id}</div>
                              </div>
                              {isFailed && r.error_message && (
                                <div className="md:col-span-2">
                                  <div className="text-xs font-semibold text-destructive">Error</div>
                                  <div className="whitespace-pre-wrap rounded border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                                    {r.error_message}
                                  </div>
                                </div>
                              )}
                              {r.metadata && (
                                <div className="md:col-span-2">
                                  <div className="text-xs font-semibold text-muted-foreground">Metadata</div>
                                  <pre className="max-h-64 overflow-auto rounded border border-border bg-muted/40 p-2 text-xs">
{JSON.stringify(r.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                <ChevronLeft className="!size-3.5" /> Prev
              </Button>
              <span>Page {page + 1} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="!size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "default" | "green" | "red" | "yellow" | "muted" }) {
  const toneClass =
    tone === "green" ? "text-green-600 dark:text-green-400"
    : tone === "red" ? "text-destructive"
    : tone === "yellow" ? "text-yellow-600 dark:text-yellow-400"
    : tone === "muted" ? "text-muted-foreground"
    : "text-foreground";
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-black ${toneClass}`}>{value.toLocaleString()}</div>
    </Card>
  );
}