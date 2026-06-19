import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Calendar, FileText } from "lucide-react";
import { useState } from "react";
import { submitNocRequest } from "@/lib/api/api";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NocRequestModal({ open, onClose }: Props) {
  const [type, setType] = useState<"Move-In" | "Move-Out">("Move-In");
  const [movingDate, setMovingDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingDate) {
      toast.error("Please select a moving date.");
      return;
    }

    setLoading(true);
    try {
      const formattedDate = new Date(movingDate).toISOString();
      await submitNocRequest(type, formattedDate, reason);
      toast.success("NOC Request submitted successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit NOC request.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Truck size={20} className="text-primary" />
              Moving NOC
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-5">
            Apply for a No Objection Certificate to allow moving trucks into the society premises.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("Move-In")}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    type === "Move-In" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  Move-In
                </button>
                <button
                  type="button"
                  onClick={() => setType("Move-Out")}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    type === "Move-Out" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  Move-Out
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Moving Date & Time
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="datetime-local"
                  required
                  value={movingDate}
                  onChange={(e) => setMovingDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Vehicle Details / Notes
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Packers and Movers truck details, expected arrival..."
                  className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg disabled:opacity-50 transition-all hover:opacity-90"
            >
              {loading ? "Submitting..." : "Submit NOC Request"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
