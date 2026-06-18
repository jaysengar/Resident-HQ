import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useManager } from "@/context/ManagerContext";
import type { TicketStatus } from "@/lib/types";

const STATUS_OPTIONS: TicketStatus[] = ["Open", "In Progress", "Resolved"];

const statusStyle: Record<string, string> = {
  Open: "bg-destructive/10 text-destructive",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-success/10 text-success",
};

const statusIcon: Record<string, typeof AlertCircle> = {
  Open: AlertCircle,
  "In Progress": Clock,
  Resolved: CheckCircle,
};

const priorityStyle: Record<string, string> = {
  Low: "bg-blue-50 text-blue-600",
  Medium: "bg-amber-50 text-amber-600",
  High: "bg-rose-50 text-rose-600",
};

export function HelpdeskTickets() {
  const { tickets, loading, fetchTickets, handleResolveTicket } = useManager();
  const [filter, setFilter] = useState<"All" | TicketStatus>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filtered = filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  const getTimeAgo = (isoStr: string) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Helpdesk Tickets</h2>
        <p className="text-xs text-muted-foreground">{tickets.length} total tickets</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["All", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 opacity-70">
                ({tickets.filter((t) => t.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((ticket) => {
              const Icon = statusIcon[ticket.status];
              const isExpanded = expandedId === ticket.id;

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="overflow-hidden rounded-2xl border border-transparent bg-black/40 backdrop-blur-md border-white/10"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  {/* Ticket Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/30 transition-colors"
                  >
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${statusStyle[ticket.status]}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {ticket.title}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyle[ticket.priority]}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>Flat {ticket.flatNo}</span>
                        <span>•</span>
                        <span>{ticket.residentName}</span>
                        <span>•</span>
                        <span>{getTimeAgo(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[ticket.status]}`}
                    >
                      {ticket.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted-foreground" />
                    ) : (
                      <ChevronDown size={16} className="text-muted-foreground" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-transparent/40 px-4 py-4 space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Description</p>
                            <p className="mt-1 text-sm text-foreground">{ticket.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Category:{" "}
                              <strong className="text-foreground">{ticket.category}</strong>
                            </span>
                            <span>•</span>
                            <span>Updated: {getTimeAgo(ticket.updatedAt)}</span>
                          </div>

                          {/* Status Change Buttons */}
                          <div className="flex gap-2 pt-2">
                            <p className="text-xs font-medium text-muted-foreground mr-2 self-center">
                              Change Status:
                            </p>
                            {STATUS_OPTIONS.filter((s) => s !== ticket.status).map((s) => (
                              <motion.button
                                key={s}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleResolveTicket(ticket.id, s)}
                                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${statusStyle[s]} hover:opacity-80`}
                              >
                                {s}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-transparent bg-black/40 backdrop-blur-md border-white/10/50 p-8 text-center text-sm text-muted-foreground">
              No tickets matching "{filter}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
