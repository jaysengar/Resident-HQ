import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2, UserPlus, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "./ModalShell";
import { preApproveVisitor } from "@/lib/api/api";

export function InviteGuestModal({
  open,
  onClose,
  initialType = "Visitor",
}: {
  open: boolean;
  onClose: () => void;
  initialType?: "Visitor" | "Delivery";
}) {
  const [type, setType] = useState<"Visitor" | "Delivery">(initialType);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name or company");
      return;
    }

    setLoading(true);
    try {
      const res = await preApproveVisitor({ name, type, expectedDate: date });
      setCode(res.code);
      toast.success(`${type} pre-approved successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to pre-approve");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!code) return;
    const msg = `Hi ${name}, your entry to the society is pre-approved! Please show this code at the main gate: *${code}*.`;
    navigator.clipboard.writeText(msg);
    toast.success("Message copied to clipboard!");
  };

  const handleClose = () => {
    setCode(null);
    setName("");
    onClose();
  };

  return (
    <ModalShell open={open} onClose={handleClose} title="Pre-approve Entry">
      <AnimatePresence mode="wait">
        {!code ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex rounded-xl bg-secondary/50 p-1">
              {(["Visitor", "Delivery"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                {type === "Visitor" ? "Guest Name" : "Company / Delivery Partner"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === "Visitor" ? "e.g., Rahul Sharma" : "e.g., Amazon"}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Expected Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                required
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {type === "Visitor" ? <UserPlus size={16} /> : <Package size={16} />}
              {loading ? "Generating Code..." : "Generate Entry Code"}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">{code}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Entry code generated for <strong>{name}</strong>. Share this code so they can enter without waiting.
            </p>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={copyToClipboard}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 py-3 text-sm font-semibold text-primary"
            >
              <Copy size={16} />
              Copy WhatsApp Message
            </motion.button>

            <button
              onClick={handleClose}
              className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
}
