import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/m/resident/sos")({
  component: ResidentSOS,
});

function ResidentSOS() {
  const [triggered, setTriggered] = useState(false);

  const handleSOS = () => {
    setTriggered(true);
    toast.error("Emergency Alert Sent to Security!", { duration: 5000 });
    // Trigger vibration if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  };

  return (
    <div className="p-6 pt-12 min-h-screen flex flex-col items-center justify-center -mt-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Emergency SOS</h1>
        <p className="text-gray-500 font-medium px-4">Hold the button to instantly alert the main gate security guards.</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSOS}
        className={`relative w-64 h-64 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)] transition-all duration-300 ${
          triggered ? "bg-red-600 animate-pulse" : "bg-red-500"
        }`}
      >
        <div className="absolute inset-2 rounded-full border-4 border-white/20" />
        <div className="absolute inset-6 rounded-full border-2 border-white/10" />
        
        <div className="flex flex-col items-center text-white">
          <AlertTriangle className="w-16 h-16 mb-2" />
          <span className="font-black text-2xl tracking-widest">SOS</span>
        </div>
      </motion.button>
    </div>
  );
}
