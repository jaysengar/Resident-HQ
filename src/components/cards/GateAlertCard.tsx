import { motion } from "framer-motion";
import { Package, Check, X, Clock } from "lucide-react";
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
      className={`rounded-3xl border p-5 transition-colors ${
        alert.status === "approved"
          ? "border-success/40 bg-success/10"
          : alert.status === "denied"
            ? "border-destructive/40 bg-destructive/10"
            : "border-border/70 bg-card"
      }`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {alert.status === "pending" ? (
        <>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <Package size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{alert.type} at Gate</p>
              <p className="truncate text-sm text-muted-foreground">{alert.name}</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Clock size={12} /> 0:42
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleDeny}
              className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-sm font-semibold text-destructive hover:bg-destructive/15"
            >
              <X size={18} /> Deny
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleApprove}
              className="flex items-center justify-center gap-2 rounded-xl bg-success py-3 text-sm font-semibold text-success-foreground hover:shadow-lg"
            >
              <Check size={18} /> Approve
            </motion.button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 py-2">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl ${
              alert.status === "approved"
                ? "bg-success/20 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {alert.status === "approved" ? <Check size={22} /> : <X size={22} />}
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
