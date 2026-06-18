import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Send, Building2 } from "lucide-react";
import { useGuard } from "@/context/GuardContext";
import type { EntryType } from "@/lib/types";

const COMPANIES = [
  "Zomato",
  "Swiggy",
  "Amazon",
  "Flipkart",
  "Blinkit",
  "BigBasket",
  "Uber",
  "Ola",
  "Other",
];

export function EntryRequestModal() {
  const { modalOpen, modalType, approvalStatus, setModalOpen, submitEntry } = useGuard();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [phone, setPhone] = useState("");

  if (!modalOpen) return null;

  const isDelivery = modalType === "Delivery";
  const isPending = approvalStatus === "pending";

  const handleSubmit = async () => {
    if (!flatNo.trim()) return;
    await submitEntry({
      type: (modalType as EntryType) || "Visitor",
      name: name || company || "Unknown",
      company: isDelivery ? company : undefined,
      flatNo: flatNo.trim(),
      phone: phone || undefined,
    });
  };

  const handleClose = () => {
    if (isPending) return;
    setModalOpen(false);
    setName("");
    setCompany("");
    setFlatNo("");
    setPhone("");
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-t-3xl bg-background p-5 sm:rounded-3xl"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {modalType === "Visitor"
                  ? "New Visitor"
                  : modalType === "Staff"
                    ? "Staff Entry"
                    : "Delivery / Cab"}
              </h3>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground hover:bg-accent disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pending State */}
            {isPending ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center gap-4 py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"
                >
                  <Loader2 size={32} />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Waiting for Resident Approval...
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Request sent to Flat {flatNo}. Waiting for response.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  Awaiting approval
                </div>
              </motion.div>
            ) : (
              /* Form */
              <div className="mt-4 space-y-4">
                {/* Company Select (Delivery only) */}
                {isDelivery && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Service / Company
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {COMPANIES.map((c) => (
                        <motion.button
                          key={c}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCompany(c)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                            company === c
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:bg-accent"
                          }`}
                        >
                          {c}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {isDelivery
                      ? "Delivery Person Name"
                      : modalType === "Staff"
                        ? "Staff Name"
                        : "Visitor Name"}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Flat Number */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Flat Number</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                    <Building2 size={16} className="text-muted-foreground" />
                    <input
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      placeholder="e.g. B-402"
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone (optional) */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Phone (Optional)
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!flatNo.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-4 text-sm font-semibold text-background disabled:opacity-50 transition-colors"
                  style={{ boxShadow: "var(--shadow-elevated)" }}
                >
                  <Send size={16} />
                  Request Entry Approval
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
