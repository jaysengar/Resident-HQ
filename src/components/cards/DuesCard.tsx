import { motion } from "framer-motion";
import { CurrencyInr, Waves } from "@phosphor-icons/react";
import { useApp } from "@/context/AppContext";

export function DuesCard({ onPay }: { onPay: () => void }) {
  const { currentUser } = useApp();
  const paid = currentUser.balance === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 overflow-hidden rounded-[32px] p-8 text-white relative shadow-[0_20px_40px_rgba(var(--color-primary),0.2)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-0" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/20 rounded-full blur-2xl pointer-events-none z-0" />
        
        <div className="relative z-10 flex justify-between items-start mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Total Outstanding</p>
          <Waves size={24} className="text-white/40" weight="duotone" />
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-1">
            <CurrencyInr size={32} weight="bold" className="text-white/90" />
            <span className="text-[56px] leading-none font-black tracking-tight">
              {currentUser.balance.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white/70">
            {paid ? "You're all settled up 🎉" : "Multiple bills pending"}
          </p>
        </div>
      </motion.div>
    </>
  );
}
