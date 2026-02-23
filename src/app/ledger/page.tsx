"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCheck,
  TrendingUp,
  TrendingDown,
  Repeat,
  BookOpen,
  PackagePlus,
  Flame,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

type LedgerEntry = Transaction & { id: string };
type SortField = "timestamp" | "action" | "amountTons";
type SortDir = "asc" | "desc";

/* ─── Action metadata ─────────────────────────────────────── */
const ACTION_META: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  ISSUED: {
    label: "Issued",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
    icon: PackagePlus,
  },
  SOLD: {
    label: "Sold",
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
    icon: TrendingDown,
  },
  LISTED: {
    label: "Listed",
    color:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/50",
    icon: TrendingUp,
  },
  RETIRED: {
    label: "Retired",
    color:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50",
    icon: Flame,
  },
  TRANSFERRED: {
    label: "Transferred",
    color:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/50",
    icon: Repeat,
  },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action] ?? {
    label: action,
    color: "bg-muted text-muted-foreground border-border",
    icon: BookOpen,
  };
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        meta.color
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function CopyHash({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title={hash}
      className="group flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
    >
      <span className="truncate max-w-[120px]">
        {hash.length > 14 ? `${hash.slice(0, 6)}…${hash.slice(-6)}` : hash}
      </span>
      {copied ? (
        <CheckCheck className="h-3 w-3 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
      )}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex items-center gap-4 shadow-card animate-slide-up card-hover",
        delay
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground tabular-nums">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchLedger = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await fetch("/api/ledger");
      if (res.ok) {
        const data: LedgerEntry[] = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger(false);
  }, [fetchLedger]);

  useEffect(() => {
    const interval = setInterval(() => fetchLedger(true), 15_000);
    return () => clearInterval(interval);
  }, [fetchLedger]);

  /* ─── Derived Stats ──────────────────────────────────────── */
  const stats = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const tx of transactions) {
      totals[tx.action] = (totals[tx.action] ?? 0) + 1;
    }
    return {
      total: transactions.length,
      issued: totals["ISSUED"] ?? 0,
      sold: totals["SOLD"] ?? 0,
      retired: totals["RETIRED"] ?? 0,
    };
  }, [transactions]);

  /* ─── Filtering + Sorting ────────────────────────────────── */
  const filtered = useMemo(() => {
    let rows = transactions;
    if (actionFilter !== "all") rows = rows.filter((t) => t.action === actionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.txHash?.toLowerCase().includes(q) ||
          t.creditId?.toLowerCase().includes(q) ||
          t.from?.toLowerCase().includes(q) ||
          t.to?.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortField === "timestamp") {
        av = new Date(a.timestamp).getTime();
        bv = new Date(b.timestamp).getTime();
      } else if (sortField === "amountTons") {
        av = a.amountTons ?? 0;
        bv = b.amountTons ?? 0;
      } else {
        av = a.action ?? "";
        bv = b.action ?? "";
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [transactions, search, actionFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-emerald-500" />
    );
  };

  const uniqueActions = [...new Set(transactions.map((t) => t.action))];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1 animate-slide-up">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Public Audit Ledger</h1>
          {isRefreshing && (
            <span className="text-xs text-muted-foreground animate-fade-in">syncing…</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground ml-10">
          Transparent, append-only log of all carbon credit transactions.
        </p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Transactions" value={stats.total} icon={Database} color="bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300" delay="delay-75" />
        <StatCard label="Credits Issued" value={stats.issued} icon={PackagePlus} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" delay="delay-150" />
        <StatCard label="Credits Sold" value={stats.sold} icon={TrendingDown} color="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" delay="delay-225" />
        <StatCard label="Credits Retired" value={stats.retired} icon={Flame} color="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" delay="delay-300" />
      </div>

      {/* ── Table Container ──────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-slide-up delay-150">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 min-w-0 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hash, credit ID, address…"
              className="pl-9 h-9 text-sm bg-background"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-[130px] text-sm">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {uniqueActions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => fetchLedger(false)}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm data-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tx Hash</th>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("action")}
                  >
                    Type <SortIcon field="action" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium">Credit ID</th>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("amountTons")}
                  >
                    Amount (tCO₂e) <SortIcon field="amountTons" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium">From</th>
                <th className="px-4 py-3 text-left font-medium">To</th>
                <th className="px-4 py-3 text-right font-medium">
                  <button
                    className="flex items-center gap-1.5 ml-auto hover:text-foreground transition-colors"
                    onClick={() => toggleSort("timestamp")}
                  >
                    Timestamp <SortIcon field="timestamp" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: pageSize > 10 ? 8 : 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32 ml-auto" /></td>
                  </tr>
                ))
              ) : paginated.length > 0 ? (
                paginated.map((tx, idx) => (
                  <tr key={tx.id} className={cn("animate-fade-in", `delay-[${idx * 30}ms]`)}>
                    <td className="px-4 py-3">
                      <CopyHash hash={tx.txHash ?? tx.id} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={tx.action} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      <span className="truncate max-w-[120px] block" title={tx.creditId}>
                        {tx.creditId?.length > 14
                          ? `${tx.creditId.slice(0, 6)}…${tx.creditId.slice(-6)}`
                          : tx.creditId}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      {tx.amountTons != null
                        ? tx.amountTons.toLocaleString()
                        : <span className="text-muted-foreground font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px]">
                      <span className="truncate block" title={tx.from}>{tx.from || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px]">
                      <span className="truncate block" title={tx.to}>{tx.to || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                      <p>No transactions found.</p>
                      {(search || actionFilter !== "all") && (
                        <button
                          className="text-xs text-primary underline underline-offset-2"
                          onClick={() => { setSearch(""); setActionFilter("all"); }}
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              >
                <SelectTrigger className="h-7 w-[70px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
