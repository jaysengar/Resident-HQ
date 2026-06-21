import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function GuardHeader() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl pb-3 pt-5">
      {/* Society Name & SOS */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span className="truncate">{user?.societyAddress || "Gate 1"}</span>
          </div>
          <h1 className="mt-0.5 text-lg font-bold tracking-tight text-foreground leading-tight truncate">
            {user?.societyName || "Society Name"}
          </h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            toast.error("🚨 SOS Alert Sent!", {
              description: "Security team has been notified immediately.",
            })
          }
          className="animate-pulse-glow flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white font-black text-sm"
          style={{ background: "var(--guard-gradient)" }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <AlertTriangle size={18} />
            <span className="text-[10px] font-bold">SOS</span>
          </div>
        </motion.button>
      </div>

      {/* Date/Time Bar */}
      <div
        className="mt-3 flex items-center gap-3 rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 shadow-sm"
      >
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock size={14} />
          <span className="text-xs font-medium">{formatDate(time)}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-sm font-bold tabular-nums text-foreground">{formatTime(time)}</span>
        </div>
      </div>

      {/* Guard Badge */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
          <Shield size={12} /> On Duty — {user?.name || "Guard"}
        </div>
      </div>
    </header>
  );
}
