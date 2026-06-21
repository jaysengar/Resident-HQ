import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronRight } from "lucide-react";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { ProfileSettingsModal } from "@/components/modals/ProfileSettingsModal";

export function TopHeader({
  title,
  subtitle,
  avatar,
}: {
  title: string;
  subtitle: string;
  avatar?: string;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-xl pt-6 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          {avatar && (
            <button 
              onClick={() => setProfileOpen(true)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold shadow-[var(--shadow-card)] transition-transform hover:scale-105 active:scale-95"
            >
              {avatar}
            </button>
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
          onClick={() => setNotifOpen(true)}
          whileTap={{ scale: 0.9 }}
          className="relative grid h-11 w-11 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-white/5"
        >
          <Bell size={20} className="text-white/80" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive ring-2 ring-background" />
            </span>
          )}
        </motion.button>
      </header>

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
      <ProfileSettingsModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
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
