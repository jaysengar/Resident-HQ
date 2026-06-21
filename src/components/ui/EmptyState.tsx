import { motion } from "framer-motion";
import { Inbox } from "@phosphor-icons/react";

interface EmptyStateProps {
  icon?: any;
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
      className={`flex flex-col items-center justify-center py-16 px-6 text-center rounded-[24px] border border-dashed border-border/60 bg-card/40 backdrop-blur-sm ${className}`}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary/80 text-muted-foreground mb-5 shadow-inner">
        <Icon size={36} weight="duotone" className="opacity-70" />
      </div>
      <p className="text-base font-bold tracking-tight text-foreground">{title}</p>
      {description && (
        <p className="mt-2 text-[13px] font-medium text-muted-foreground max-w-[240px] leading-relaxed">{description}</p>
      )}
      {action && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="mt-6 rounded-2xl bg-primary px-6 py-3 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
