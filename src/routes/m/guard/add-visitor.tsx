import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Camera, Send } from "lucide-react";

export const Route = createFileRoute("/m/guard/add-visitor")({
  component: GuardAddVisitor,
});

function GuardAddVisitor() {
  return (
    <div className="p-6 pt-12 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">New Entry</h1>
        <p className="text-gray-500 font-medium">Capture visitor details</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mt-8"
      >
        {/* Photo Capture Area */}
        <div className="w-full h-40 bg-white rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 active:bg-gray-50 transition-colors">
          <Camera className="w-10 h-10 mb-2" />
          <span className="font-semibold">Tap to Take Photo</span>
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Visitor Name" 
            className="w-full bg-white p-4 rounded-2xl border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/50 font-medium text-gray-900"
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Flat Number" 
              className="w-full bg-white p-4 rounded-2xl border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/50 font-medium text-gray-900"
            />
            <select className="w-full bg-white p-4 rounded-2xl border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/50 font-medium text-gray-900">
              <option>Guest</option>
              <option>Delivery</option>
              <option>Cab</option>
            </select>
          </div>
          <input 
            type="tel" 
            placeholder="Phone Number (Optional)" 
            className="w-full bg-white p-4 rounded-2xl border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/50 font-medium text-gray-900"
          />
        </div>

        {/* Action Button */}
        <button className="w-full bg-brand text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md hover:bg-brand-hover mt-6">
          <Send className="w-5 h-5" /> Request Approval
        </button>
      </motion.div>
    </div>
  );
}
