import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, User, Clock } from "lucide-react";

export const Route = createFileRoute("/m/guard/expected")({
  component: GuardExpected,
});

function GuardExpected() {
  return (
    <div className="p-6 pt-12 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expected</h1>
        <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
          <Calendar className="w-4 h-4" /> Today's pre-approved list
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 space-y-4"
      >
        {/* Expected Guest Placeholder */}
        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-white/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900">Rahul Sharma</h3>
            <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold">Flat 204</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> Guest</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Expected: 5:00 PM</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
