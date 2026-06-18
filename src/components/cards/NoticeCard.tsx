import { motion } from "framer-motion";
import { Megaphone, Trash2 } from "lucide-react";

export function NoticeCard({ 
  title, 
  body, 
  time,
  onDelete 
}: { 
  title: string; 
  body: string; 
  time: string;
  onDelete?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 group"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Megaphone size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-start">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{body}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground/80">{time}</p>
      </div>
    </motion.div>
  );
}
