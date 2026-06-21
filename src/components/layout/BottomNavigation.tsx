import { motion } from "framer-motion";
import { House, Wallet, Wrench, UsersThree } from "@phosphor-icons/react";
import { useApp, type Tab } from "@/context/AppContext";

export function BottomNavigation() {
  const { tab, setTab } = useApp();
  const items: { id: Tab; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: House },
    { id: "dues", label: "Dues", icon: Wallet },
    { id: "services", label: "Services", icon: Wrench },
    { id: "community", label: "Community", icon: UsersThree },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 pb-4 pt-2 bg-gradient-to-t from-background via-background/90 to-transparent">
      <div
        className="mx-4 mb-2 rounded-3xl border border-border/50 bg-card/95 px-2 py-1.5 backdrop-blur-3xl shadow-elevated"
      >
        <div className="grid grid-cols-4">
          {items.map((it) => {
            const active = tab === it.id;
            return (
              <motion.button
                key={it.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTab(it.id)}
                className="relative flex flex-col items-center gap-1.5 py-2"
              >
                {active && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -top-1.5 h-1 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    style={{ boxShadow: "0 2px 10px var(--color-primary)" }}
                  />
                )}
                <div className={`relative transition-colors duration-300 ${active ? "text-primary drop-shadow-md" : "text-muted-foreground"}`}>
                  <it.icon size={24} weight={active ? "fill" : "regular"} />
                </div>
                <span
                  className={`relative text-[10px] font-bold tracking-wide transition-colors duration-300 ${active ? "text-primary" : "text-muted-foreground"}`}
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
