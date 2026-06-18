import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary/80 text-muted-foreground mb-4">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
