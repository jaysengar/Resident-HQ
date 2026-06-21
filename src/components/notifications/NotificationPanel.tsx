import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  Loader2,
  UserPlus,
  CreditCard,
  AlertTriangle,
  Megaphone,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notifications";
import { useAuth } from "@/context/AuthContext";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, any> = {
  visitor: UserPlus,
  payment: CreditCard,
  alert: AlertTriangle,
  announcement: Megaphone,
};

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationPanel({
  open,
  onClose,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      const unreadCount = data.filter((n: Notification) => !n.is_read).length;
      onUnreadCountChange?.(unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
    
    if (user?.societyId) {
      let channel: any;
      import("@/lib/supabase").then(({ supabase }) => {
        channel = supabase
          .channel(`notifications_${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `society_id=eq.${user.societyId}`
            },
            (payload) => {
              const newNotif = payload.new as Notification;
              
              // Only process if it belongs to this user's flat or is society-wide
              if (!newNotif.flat_number || newNotif.flat_number === user.flat) {
                setNotifications((prev) => [newNotif, ...prev]);
                onUnreadCountChange?.((prev) => prev + 1);
                
                // Show a toast notification
                toast(newNotif.title, {
                  description: newNotif.body || newNotif.message,
                  icon: <Bell size={16} className="text-violet-500" />
                });
              }
            }
          )
          .subscribe();
      });

      return () => {
        if (channel) {
          import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
        }
      };
    }
  }, [fetchNotifications, user?.societyId, user?.flat, user?.id]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      const newUnread = notifications.filter(
        (n) => !n.is_read && n.id !== id
      ).length;
      onUnreadCountChange?.(newUnread);
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      onUnreadCountChange?.(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[90] w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Bell size={18} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Notifications
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllRead}
                    disabled={markingAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                  >
                    {markingAll ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CheckCheck size={12} />
                    )}
                    Mark all read
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div
                          className="h-3 bg-white/5 rounded-full animate-pulse"
                          style={{ width: `${70 - i * 5}%` }}
                        />
                        <div
                          className="h-2.5 bg-white/[0.03] rounded-full animate-pulse"
                          style={{ width: `${90 - i * 8}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <BellOff size={28} className="text-zinc-600" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-400">
                    No notifications yet
                  </p>
                  <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                    You'll see visitor alerts, payment updates, and announcements
                    here.
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-1">
                  {notifications.map((notif) => {
                    const Icon =
                      TYPE_ICONS[notif.type || ""] || Info;
                    return (
                      <motion.button
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          if (!notif.is_read) handleMarkRead(notif.id);
                        }}
                        className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl transition-colors relative ${
                          notif.is_read
                            ? "bg-transparent hover:bg-white/[0.02]"
                            : "bg-violet-500/[0.04] hover:bg-violet-500/[0.08] border border-violet-500/10"
                        }`}
                      >
                        {/* Unread dot */}
                        {!notif.is_read && (
                          <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                        )}

                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            notif.is_read
                              ? "bg-white/5 text-zinc-500"
                              : "bg-violet-500/10 text-violet-400"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold leading-tight ${
                              notif.is_read
                                ? "text-zinc-400"
                                : "text-white"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">
                            {getTimeAgo(notif.created_at)}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
