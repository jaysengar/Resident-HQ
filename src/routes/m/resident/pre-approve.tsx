import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { QrCode, Share2 } from "lucide-react";

export const Route = createFileRoute("/m/resident/pre-approve")({
  component: ResidentPreApprove,
});

function ResidentPreApprove() {
  return (
    <div className="p-6 pt-12 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Invite Guest</h1>
        <p className="text-gray-500 font-medium">Generate entry code</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-[2rem] shadow-elevated border border-white/50 text-center space-y-6 mt-8"
      >
        <div className="w-48 h-48 bg-gray-50 mx-auto rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center">
          <QrCode className="w-16 h-16 text-gray-300" />
        </div>
        
        <div>
          <h2 className="text-4xl font-black tracking-widest text-brand">847 291</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Valid until tonight at 11:59 PM</p>
        </div>

        <button className="w-full bg-brand text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md hover:bg-brand-hover">
          <Share2 className="w-5 h-5" /> Share Invite
        </button>
      </motion.div>
    </div>
  );
}
