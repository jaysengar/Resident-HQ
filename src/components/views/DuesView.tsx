import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, DownloadSimple, Receipt } from "@phosphor-icons/react";
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

      <section className="mt-8">
        <SectionTitle title="Pending Bills" />
        <div className="mt-4 space-y-3">
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
                className="flex items-center gap-4 rounded-[20px] border border-border/50 bg-card/60 backdrop-blur-xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all hover:bg-card/80"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                  <Receipt size={24} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold tracking-tight text-foreground">{b.title}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Due: {new Date(b.due_date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-base font-black text-foreground">₹{Number(b.amount).toLocaleString("en-IN")}</p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedBill(b);
                      setPayOpen(true);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    Pay Now
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 pb-24">
        <SectionTitle title="Transaction History" />
        <div className="mt-4 space-y-3">
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
                className="flex items-center gap-4 rounded-[20px] border border-border/50 bg-card/60 backdrop-blur-xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all hover:bg-card/80"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-success/10 text-success">
                  <CheckCircle size={24} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold tracking-tight text-foreground">{t.title}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {t.date} • {t.method}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-sm font-black text-foreground">₹{t.amount}</p>
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
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    <DownloadSimple size={14} weight="bold" /> Invoice
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
