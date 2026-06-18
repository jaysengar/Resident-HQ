import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={onClose}
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground hover:bg-accent"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
