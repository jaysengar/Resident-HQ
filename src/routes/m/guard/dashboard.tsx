import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ScanLine, UserCheck, Shield } from "lucide-react";

export const Route = createFileRoute("/m/guard/dashboard")({
  component: GuardDashboard,
});

function GuardDashboard() {
  return (
    <div className="p-6 pt-12 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Main Gate</h1>
          <p className="text-gray-500 font-medium text-sm flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active Duty
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-white/50 flex items-center justify-center">
          <Shield className="text-brand w-6 h-6" />
        </div>
      </motion.div>

      {/* Primary Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <button className="w-full bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border border-brand/20 shadow-elevated flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform">
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-brand" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
            <p className="text-sm text-gray-500">Quickly verify pre-approved visitors</p>
          </div>
        </button>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-900">Recent Entry</h2>
        
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Zomato Delivery</h3>
                <p className="text-sm text-gray-500">Flat 402 • 10 mins ago</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
