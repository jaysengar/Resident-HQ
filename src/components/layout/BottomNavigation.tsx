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
        className="mx-5 mb-4 rounded-[28px] border border-border/50 bg-card/70 px-2 py-2 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <div className="grid grid-cols-4 relative">
          {items.map((it) => {
            const active = tab === it.id;
            return (
              <motion.button
                key={it.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTab(it.id)}
                className="relative flex flex-col items-center justify-center gap-1.5 py-2.5 z-10"
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`relative transition-colors duration-300 ${active ? "text-primary drop-shadow-md" : "text-muted-foreground hover:text-foreground/70"}`}>
                  <it.icon size={26} weight={active ? "duotone" : "regular"} />
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
