import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon } from "lucide-react";
import { useGuard } from "@/context/GuardContext";

export function EmergencyAlertModal() {
  const { activeEmergency, resolveEmergency } = useGuard();

  if (!activeEmergency) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-red-950/95 backdrop-blur-xl p-6">
        {/* Pulsing background effect */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 bg-red-600/20"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 w-full max-w-sm text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.8)]"
          >
            <AlertOctagon size={64} />
          </motion.div>

          <h1 className="mb-2 text-4xl font-black text-white uppercase tracking-widest">
            SOS ALERT
          </h1>
          <p className="mb-8 text-lg font-bold text-red-200">
            Emergency Triggered at <br />
            <span className="text-3xl text-white">Flat {activeEmergency.flat_number}</span>
          </p>

          <button
            onClick={() => resolveEmergency(activeEmergency.id)}
            className="w-full rounded-2xl bg-white py-5 text-lg font-black text-red-600 shadow-2xl hover:bg-gray-100 transition-all active:scale-95"
          >
            MARK AS RESOLVED
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
