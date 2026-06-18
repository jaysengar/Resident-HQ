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
        <main className="flex-1 overflow-y-auto pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
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
