import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import type { Ticket } from "@/context/AppContext";

const tints: Record<Ticket["status"], string> = {
  Assigned: "bg-amber-50 text-amber-700",
  "In Progress": "bg-sky-50 text-sky-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Wrench size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{ticket.title}</p>
        <p className="text-xs text-muted-foreground">
          #{ticket.id} • {ticket.time}
        </p>
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tints[ticket.status]}`}
      >
        {ticket.status}
      </span>
    </motion.div>
  );
}
