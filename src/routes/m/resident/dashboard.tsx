import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Bell, Clock, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/m/resident/dashboard")({
  component: ResidentDashboard,
});

function ResidentDashboard() {
  return (
    <div className="p-6 pt-12 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hello,</h1>
          <p className="text-gray-500 font-medium">Welcome back home.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-white/50 flex items-center justify-center">
          <Shield className="text-brand w-6 h-6" />
        </div>
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          <div className="bg-blue-50 p-3 rounded-full">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <span className="font-semibold text-gray-800">Pending</span>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          <div className="bg-orange-50 p-3 rounded-full">
            <Bell className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-semibold text-gray-800">Notices</span>
        </div>
      </motion.div>

      {/* Recent Visitors */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Visitors</h2>
          <button className="text-brand text-sm font-semibold flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Placeholder for Visitors */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Delivery Boy</h3>
                <p className="text-sm text-gray-500">Today, 2:30 PM</p>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                Approved
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
