import { motion } from "framer-motion";

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className = "" }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-2xl border border-border/40 bg-card p-5 ${className}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="space-y-3">
        {/* Avatar row */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-secondary animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 rounded-full bg-secondary animate-pulse" />
            <div className="h-2.5 w-1/3 rounded-full bg-secondary/70 animate-pulse" />
          </div>
        </div>
        {/* Content lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-secondary animate-pulse"
            style={{ width: `${85 - i * 15}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl p-4 ${className}`}>
      <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 rounded-full bg-secondary animate-pulse" />
        <div className="h-2.5 w-1/2 rounded-full bg-secondary/70 animate-pulse" />
      </div>
      <div className="h-6 w-16 rounded-full bg-secondary animate-pulse" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1 rounded-2xl border border-border/40 bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="h-10 bg-secondary/50 animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border/20 px-4 py-3"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="h-6 w-14 rounded-lg bg-secondary animate-pulse" />
          <div className="h-3 w-28 rounded-full bg-secondary animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-secondary/70 animate-pulse hidden sm:block" />
          <div className="flex-1" />
          <div className="h-5 w-16 rounded-full bg-secondary animate-pulse" />
        </div>
      ))}
    </div>
  );
}
