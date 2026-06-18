import { motion } from "framer-motion";
import { ArrowUpRight, IndianRupee } from "lucide-react";
import { useApp } from "@/context/AppContext";

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
      <p className="opacity-75">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

export function DuesCard({ onPay }: { onPay: () => void }) {
  const { currentUser } = useApp();
  const paid = currentUser.balance === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 overflow-hidden rounded-3xl p-6 text-primary-foreground relative"
        style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wider opacity-80">Total Outstanding</p>
          <div className="mt-2 flex items-baseline gap-1">
            <IndianRupee size={26} className="opacity-90" />
            <span className="text-5xl font-bold tracking-tight">
              {currentUser.balance.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-xs opacity-85">
            {paid ? "You're all settled up 🎉" : "Multiple bills pending"}
          </p>
        </div>
      </motion.div>
    </>
  );
}
