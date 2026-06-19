import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { TopHeader, SectionTitle } from "@/components/layout/TopHeader";
import { DuesCard } from "@/components/cards/DuesCard";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/SkeletonCard";

export function DuesView() {
  const { transactions, bills, dataReady } = useApp();
  const [payOpen, setPayOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const currentMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  
  const pendingBills = bills.filter(b => b.status !== "paid");

  return (
    <div className="px-5">
      <TopHeader title="Dues & Payments" subtitle={currentMonth} />

      <DuesCard onPay={() => {}} />

      <section className="mt-7">
        <SectionTitle title="Pending Bills" />
        <div className="mt-3 space-y-2.5">
          {!dataReady ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : pendingBills.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No pending bills"
              description="You're all caught up on your dues."
            />
          ) : (
            pendingBills.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                  <Receipt size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(b.due_date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{Number(b.amount).toLocaleString("en-IN")}</p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedBill(b);
                      setPayOpen(true);
                    }}
                    className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary"
                  >
                    Pay Now
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="mt-7">
        <SectionTitle title="Transaction History" />
        <div className="mt-3 space-y-2.5">
          {!dataReady ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Your payment history will appear here after you make a payment."
            />
          ) : (
            transactions.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
                  <Check size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.date} • {t.method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{t.amount}</p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const text = `Resident HQ - Payment Receipt\n\nDate: ${t.date}\nAmount: INR ${t.amount}\nMethod: ${t.method}\nTransaction ID: ${t.id}\nStatus: Success\n\nThank you!`;
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Receipt_${t.id.slice(0, 8)}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Invoice downloaded");
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary"
                  >
                    <Download size={12} /> Invoice
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <PaymentModal 
        open={payOpen} 
        onClose={() => setPayOpen(false)} 
        bill={selectedBill} 
      />
    </div>
  );
}
