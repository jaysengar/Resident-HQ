import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, X, Clock } from "lucide-react";

export const Route = createFileRoute("/m/resident/approvals")({
  component: ResidentApprovals,
});

function ResidentApprovals() {
  return (
    <div className="p-6 pt-12 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pending</h1>
        <p className="text-gray-500 font-medium">Visitors waiting for approval</p>
      </motion.div>

      <div className="space-y-4 mt-8">
        {/* Placeholder Pending Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-elevated border border-white"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <div>
              <h3 className="font-black text-xl text-gray-900">Amazon Delivery</h3>
              <div className="flex items-center gap-1 text-sm text-brand font-medium">
                <Clock className="w-4 h-4" />
                <span>Waiting at Main Gate</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <X className="w-5 h-5" /> Deny
            </button>
            <button className="flex-1 bg-brand text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md hover:bg-brand-hover">
              <Check className="w-5 h-5" /> Approve
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
