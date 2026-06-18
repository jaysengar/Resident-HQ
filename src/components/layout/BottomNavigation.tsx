import { motion } from "framer-motion";
import { Home, Wallet, Wrench, Users } from "lucide-react";
import { useApp, type Tab } from "@/context/AppContext";

export function BottomNavigation() {
  const { tab, setTab } = useApp();
  const items: { id: Tab; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "dues", label: "Dues", icon: Wallet },
    { id: "services", label: "Services", icon: Wrench },
    { id: "community", label: "Community", icon: Users },
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-20 pb-4">
      <div
        className="mx-4 mb-2 rounded-[2rem] border border-white/10 bg-zinc-900/90 px-2 py-1.5 backdrop-blur-2xl shadow-2xl"
      >
        <div className="grid grid-cols-4">
          {items.map((it) => {
            const active = tab === it.id;
            return (
              <motion.button
                key={it.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTab(it.id)}
                className="relative flex flex-col items-center gap-1.5 py-2.5"
              >
                {active && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -top-1.5 h-1 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    style={{ boxShadow: "0 2px 10px var(--color-primary)" }}
                  />
                )}
                <div className={`relative transition-colors duration-300 ${active ? "text-primary drop-shadow-md" : "text-white/40"}`}>
                  <it.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                </div>
                <span
                  className={`relative text-[10px] font-bold tracking-wide transition-colors duration-300 ${active ? "text-primary" : "text-white/40"}`}
                >
                  {it.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
