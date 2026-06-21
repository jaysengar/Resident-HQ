import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "./ModalShell";

export function CreateBillModal({
  open,
  onClose,
  onSuccess,
  defaultFlatNo,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultFlatNo?: string;
}) {
  const [title, setTitle] = useState("Monthly Maintenance");
  const [amount, setAmount] = useState(2500);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [billType, setBillType] = useState<"bulk" | "specific">(defaultFlatNo ? "specific" : "bulk");
  const [flatNumber, setFlatNumber] = useState(defaultFlatNo || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setBillType(defaultFlatNo ? "specific" : "bulk");
      setFlatNumber(defaultFlatNo || "");
      setTitle(""); // Let manager type reason easily
      setAmount(0); // Let manager type amount easily
    }
  }, [open, defaultFlatNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billType === "specific" && !flatNumber.trim()) {
      toast.error("Please enter a flat number");
      return;
    }

    setLoading(true);
    try {
      const { generateBills } = await import("@/lib/api/api");
      await generateBills({
        title,
        amount,
        dueDate: new Date(dueDate).toISOString(),
        flatNumber: billType === "specific" ? flatNumber.trim() : undefined,
      });

      toast.success(billType === "bulk" ? "Bulk bills generated" : `Bill sent to Flat ${flatNumber}`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate bills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Create Bill">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bill Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBillType("bulk")}
              className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                billType === "bulk"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Bulk (All Flats)
            </button>
            <button
              type="button"
              onClick={() => setBillType("specific")}
              className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                billType === "specific"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Specific Flat
            </button>
          </div>
        </div>

        {billType === "specific" && (
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Flat Number
            </label>
            <input
              required
              type="text"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="e.g. A-101"
              className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bill Title / Reason
          </label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Amount (₹)
            </label>
            <input
              required
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Due Date
            </label>
            <input
              required
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          Generate {billType === "bulk" ? "Bills" : "Bill"}
        </motion.button>
      </form>
    </ModalShell>
  );
}
