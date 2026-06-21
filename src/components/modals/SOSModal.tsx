import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { triggerEmergency } from "@/lib/api/api";
import { toast } from "sonner";

export function SOSModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await triggerEmergency();
      toast.success("SOS Alert sent to security!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger SOS");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm rounded-3xl bg-red-950/90 border border-red-500/30 p-6 text-center shadow-2xl shadow-red-900/20"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Emergency SOS</h2>
          <p className="text-red-200 text-sm mb-8 leading-relaxed">
            This will immediately trigger a loud alarm at the main gate and notify all security personnel with your flat details.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleTrigger}
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "TRIGGER SOS ALARM"}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-2xl bg-white/5 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}
