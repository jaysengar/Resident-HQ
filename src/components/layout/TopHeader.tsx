import { motion } from "framer-motion";
import { Bell, ChevronRight } from "lucide-react";

export function TopHeader({
  title,
  subtitle,
  avatar,
  onBellClick,
}: {
  title: string;
  subtitle: string;
  avatar?: string;
  onBellClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-xl pt-6 pb-2">
      <div className="flex items-center gap-3 min-w-0">
        {avatar && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold shadow-[var(--shadow-card)]">
            {avatar}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest font-bold text-white/50">{subtitle}</p>
          <h1
            className={`truncate font-extrabold tracking-tight text-white ${avatar ? "text-xl mt-0.5" : "text-3xl"}`}
          >
            {title}
          </h1>
        </div>
      </div>
      <motion.button
        onClick={onBellClick}
        whileTap={{ scale: 0.9 }}
        className="relative grid h-11 w-11 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
      >
        <Bell size={20} />
        <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
      </motion.button>
    </header>
  );
}

export function SectionTitle({
  title,
  action,
  badge,
  onAction,
}: {
  title: string;
  action?: string;
  badge?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-white/70">{title}</h2>
        {badge && (
          <span className="flex items-center gap-1.5 rounded-full bg-success/20 border border-success/30 px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-success shadow-[0_0_10px_rgba(var(--color-success),0.2)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" /> {badge}
          </span>
        )}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-xs font-medium text-primary"
        >
          {action} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
