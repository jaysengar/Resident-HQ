import { motion } from "framer-motion";
import { Package, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useApp, type GateAlert } from "@/context/AppContext";

export function GateAlertCard({ alert }: { alert: GateAlert }) {
  const { updateAlertStatus, removeAlert } = useApp();

  useEffect(() => {
    if (alert.status === "pending") return;
    const t = setTimeout(() => removeAlert(alert.id), 2000);
    return () => clearTimeout(t);
  }, [alert.status, alert.id, removeAlert]);

  const handleApprove = () => {
    updateAlertStatus(alert.id, "approved");
    toast.success("Guest Approved", { description: `${alert.name} can enter.` });
  };
  const handleDeny = () => {
    updateAlertStatus(alert.id, "denied");
    toast.error("Entry Denied", { description: `${alert.name} has been denied.` });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-[24px] border p-5 backdrop-blur-xl transition-all ${
        alert.status === "approved"
          ? "border-success/40 bg-success/10 shadow-[0_8px_30px_rgba(var(--color-success),0.1)]"
          : alert.status === "denied"
            ? "border-destructive/40 bg-destructive/10 shadow-[0_8px_30px_rgba(var(--color-destructive),0.1)]"
            : "border-border/50 bg-card/70 shadow-[0_4px_24px_rgb(0,0,0,0.04)]"
      }`}
    >
      {alert.status === "pending" ? (
        <>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Package size={28} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold tracking-tight text-foreground">{alert.type} at Gate</p>
              <p className="truncate text-sm font-medium text-muted-foreground">{alert.name}</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold tracking-widest text-muted-foreground">
              <Clock size={14} weight="bold" /> 0:42
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleDeny}
              className="flex items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3.5 text-sm font-bold text-destructive hover:bg-destructive/15 transition-colors border border-destructive/20"
            >
              <XCircle size={20} weight="fill" /> Deny
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleApprove}
              className="flex items-center justify-center gap-2 rounded-2xl bg-success py-3.5 text-sm font-bold text-success-foreground hover:bg-success/90 transition-colors shadow-md shadow-success/20"
            >
              <CheckCircle size={20} weight="fill" /> Approve
            </motion.button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4 py-2">
          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl ${
              alert.status === "approved"
                ? "bg-success/20 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {alert.status === "approved" ? <CheckCircle size={28} weight="fill" /> : <XCircle size={28} weight="fill" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {alert.status === "approved" ? "Guest Approved" : "Entry Denied"}
            </p>
            <p className="text-xs text-muted-foreground">Gate has been notified</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
