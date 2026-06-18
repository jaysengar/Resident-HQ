import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, AlertTriangle, AlertCircle, Info, RefreshCw } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import type { LogSeverity } from "@/lib/types";

const severityIcon: Record<LogSeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const severityStyle: Record<LogSeverity, string> = {
  info: "text-blue-400 bg-blue-400/10",
  warning: "text-amber-400 bg-amber-400/10",
  error: "text-rose-400 bg-rose-400/10",
};

const severityText: Record<LogSeverity, string> = {
  info: "text-blue-400",
  warning: "text-amber-400",
  error: "text-rose-400",
};

export function SystemLogs() {
  const { logs, loading, fetchLogs } = useAdmin();
  const [filter, setFilter] = useState<"all" | LogSeverity>("all");

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.severity === filter);

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400">
            <Terminal size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">System Logs</h2>
            <p className="text-sm text-muted-foreground">{logs.length} log entries</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchLogs}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </motion.button>
      </div>

      {/* Severity Filters */}
      <div className="flex gap-2">
        {(["all", "info", "warning", "error"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s
                ? s === "all"
                  ? "bg-foreground text-background"
                  : severityStyle[s as LogSeverity]
                : "bg-secondary text-muted-foreground hover:bg-accent/50"
            }`}
          >
            {s} {s !== "all" && `(${logs.filter((l) => l.severity === s).length})`}
          </button>
        ))}
      </div>

      {/* Log Entries */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl border border-border bg-card overflow-hidden font-mono"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 bg-secondary/50">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="ml-2 text-xs text-muted-foreground">residenthq-system-monitor</span>
            <span className="ml-auto text-[10px] text-muted-foreground animate-terminal-blink">
              ●
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            <AnimatePresence>
              {filtered.map((log, i) => {
                const Icon = severityIcon[log.severity];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 border-b border-border/30 px-4 py-3 hover:bg-accent/10 transition-colors"
                  >
                    <div
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ${severityStyle[log.severity]}`}
                    >
                      <Icon size={12} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground leading-relaxed">{log.message}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className={`font-semibold uppercase ${severityText[log.severity]}`}>
                          [{log.severity}]
                        </span>
                        <span>{log.source}</span>
                        {log.societyId && (
                          <span className="rounded bg-secondary px-1.5 py-0.5">
                            {log.societyId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-medium text-muted-foreground tabular-nums">
                        {formatTime(log.timestamp)}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No logs matching filter
            </div>
          )}
        </div>
      )}
    </div>
  );
}
