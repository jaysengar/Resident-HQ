import { motion } from "framer-motion";
import { Megaphone, Trash } from "@phosphor-icons/react";

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
      className="flex items-start gap-4 rounded-[20px] border border-border/50 bg-card/60 backdrop-blur-xl p-4 group shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all hover:bg-card/80"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Megaphone size={24} weight="duotone" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold tracking-tight text-foreground">{title}</p>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
            >
              <Trash size={16} weight="duotone" />
            </button>
          )}
        </div>
        <p className="mt-1 text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed">{body}</p>
        <p className="mt-2 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/70">{time}</p>
      </div>
    </motion.div>
  );
}
