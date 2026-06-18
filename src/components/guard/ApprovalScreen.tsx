import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useGuard } from "@/context/GuardContext";
import { useEffect } from "react";

export function ApprovalScreen() {
  const { approvalStatus, resetApproval } = useGuard();

  useEffect(() => {
    if (approvalStatus === "approved") {
      const t = setTimeout(() => resetApproval(), 2500);
      return () => clearTimeout(t);
    }
  }, [approvalStatus, resetApproval]);

  if (approvalStatus !== "approved") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 152), oklch(0.45 0.18 165))" }}
      onClick={resetApproval}
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        className="flex flex-col items-center gap-4 text-white"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
        >
          <CheckCircle size={80} strokeWidth={1.5} />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-4xl font-black tracking-tight"
        >
          APPROVED ✅
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base opacity-80"
        >
          Entry has been granted
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 2 }}
          className="mt-4 h-1 w-48 rounded-full bg-white/30 origin-left"
        />
      </motion.div>
    </motion.div>
  );
}
