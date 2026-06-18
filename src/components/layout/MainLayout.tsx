import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { BottomNavigation } from "./BottomNavigation";
import { HomeView } from "@/components/views/HomeView";
import { DuesView } from "@/components/views/DuesView";
import { ServicesView } from "@/components/views/ServicesView";
import { CommunityView } from "@/components/views/CommunityView";

export function MainLayout() {
  const { tab } = useApp();
  return (
    <div className="dark h-[100dvh] w-full bg-black text-foreground selection:bg-primary/30">
      <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col bg-background shadow-[0_0_80px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* SVG Noise Overlay */}
        <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay">
          <svg className="h-full w-full opacity-50" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

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
        <BottomNavigation />
      </div>
    </div>
  );
}
