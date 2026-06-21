import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { BottomNavigation } from "./BottomNavigation";
import { HomeView } from "@/components/views/HomeView";
import { DuesView } from "@/components/views/DuesView";
import { ServicesView } from "@/components/views/ServicesView";
import { CommunityView } from "@/components/views/CommunityView";
import { SOSModal } from "@/components/modals/SOSModal";
import { useState } from "react";

export function MainLayout() {
  const { tab } = useApp();
  const [sosOpen, setSosOpen] = useState(false);
  return (
    <div className="h-[100dvh] w-full bg-background text-foreground selection:bg-primary/30">
      <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col bg-background shadow-elevated relative overflow-hidden">
        


        <main className="flex-1 overflow-y-auto pb-28 relative z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              {tab === "home" && <HomeView />}
              {tab === "dues" && <DuesView />}
              {tab === "services" && <ServicesView />}
              {tab === "community" && <CommunityView />}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Floating SOS Button */}
        <button
          onClick={() => setSosOpen(true)}
          className="absolute bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-red-500 transition-colors"
        >
          <span className="font-black text-sm tracking-widest">SOS</span>
        </button>

        <BottomNavigation />
      </div>
      
      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}
