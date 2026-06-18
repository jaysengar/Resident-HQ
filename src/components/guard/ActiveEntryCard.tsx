import { motion } from "framer-motion";
import { LogOut, Clock, User, Package, Car, Briefcase } from "lucide-react";
import type { ActiveEntry } from "@/lib/types";
import { useGuard } from "@/context/GuardContext";

const typeIcons: Record<string, typeof User> = {
  Visitor: User,
  Delivery: Package,
  Cab: Car,
  Staff: Briefcase,
};

const typeColors: Record<string, string> = {
  Visitor: "bg-blue-500/10 text-blue-400",
  Delivery: "bg-rose-500/10 text-rose-400",
  Cab: "bg-amber-500/10 text-amber-400",
  Staff: "bg-emerald-500/10 text-emerald-400",
};

function getTimeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export function ActiveEntryCard({ entry }: { entry: ActiveEntry }) {
  const { handleMarkExit } = useGuard();
  const Icon = typeIcons[entry.type] || User;
  const color = typeColors[entry.type] || "bg-gray-50 text-gray-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-center gap-3 rounded-[1.25rem] border border-white/5 bg-zinc-900/60 backdrop-blur-sm p-4 shadow-lg hover:bg-zinc-800/60 transition-colors"
    >
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">{entry.name}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80">
            {entry.type}
          </span>
          <span className="font-medium text-white/70">Flat {entry.flatNo}</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock size={10} />
          {getTimeAgo(entry.enteredAt)}
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleMarkExit(entry.id)}
        className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
      >
        <LogOut size={14} />
        Exit
      </motion.button>
    </motion.div>
  );
}
