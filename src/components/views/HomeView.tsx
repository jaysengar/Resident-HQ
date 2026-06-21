import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, Package, Ticket as TicketIcon, ShieldCheck, Bell, ShieldWarning, QrCode, FileText, Truck } from "@phosphor-icons/react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { TopHeader, SectionTitle } from "@/components/layout/TopHeader";
import { GateAlertCard } from "@/components/cards/GateAlertCard";
import { NoticeCard } from "@/components/cards/NoticeCard";
import { NewTicketModal } from "@/components/modals/NewTicketModal";
import { InviteGuestModal } from "@/components/modals/InviteGuestModal";
import { ActivePollModal } from "@/components/modals/ActivePollModal";
import { AllNoticesModal } from "@/components/modals/AllNoticesModal";
import { NocRequestModal } from "@/components/modals/NocRequestModal";
import { VisitorHistoryModal } from "@/components/modals/VisitorHistoryModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard, SkeletonRow } from "@/components/ui/SkeletonCard";


export function HomeView() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  const { currentUser, gateAlerts, announcements, setTab, dataReady } = useApp();
  const [ticketOpen, setTicketOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [nocOpen, setNocOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [inviteType, setInviteType] = useState<"Visitor" | "Delivery">("Visitor");

  const actions = [
    {
      label: "Invite Guest",
      icon: UserPlus,
      tint: "from-primary to-primary-glow",
      onClick: () => {
        setInviteType("Visitor");
        setInviteOpen(true);
      },
    },
    {
      label: "Pre-approve",
      icon: Package,
      tint: "from-emerald-500 to-teal-500",
      onClick: () => {
        setInviteType("Delivery");
        setInviteOpen(true);
      },
    },
    {
      label: "Raise Ticket",
      icon: TicketIcon,
      tint: "from-orange-500 to-rose-500",
      onClick: () => setTicketOpen(true),
    },
    {
      label: "Moving NOC",
      icon: Truck,
      tint: "from-violet-500 to-fuchsia-500",
      onClick: () => setNocOpen(true),
    },
  ];

  const pending = gateAlerts.filter((a) => a.status === "pending");

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-8 selection:bg-primary/30">
      <div className="px-5 pt-2">
        <TopHeader
          avatar={currentUser.name[0]}
          subtitle={getGreeting()}
          title={`Hello, ${currentUser.name}`}
        />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.05 }}
        className="mt-6 rounded-[32px] bg-card/60 backdrop-blur-3xl p-6 border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
            <ShieldCheck size={14} weight="bold" />
            <span>Verified</span>
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Flat {currentUser.flat}</p>
        </div>
        
        <div className="relative z-10 mt-2">
          <h2 className="text-3xl font-black tracking-tight text-foreground">{currentUser.name}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{currentUser.societyName}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs font-medium text-muted-foreground">{currentUser.occupancyType}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3 relative z-10">
          <button onClick={() => setTab("dues")} className="flex-1 bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-2xl shadow-md hover:bg-primary/90 transition-all active:scale-95">
            View Dues
          </button>
          <button onClick={() => setTicketOpen(true)} className="flex-1 bg-secondary text-secondary-foreground font-bold text-sm py-3.5 rounded-2xl border border-border/50 hover:bg-secondary/80 transition-all active:scale-95">
            Raise Ticket
          </button>
        </div>
      </motion.div>

      <section className="mt-8">
        <SectionTitle title="Quick Actions" />
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-1">
          {actions.map((a, i) => (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={a.onClick}
              className="snap-start shrink-0 flex flex-col items-center gap-2"
            >
              <div className="grid h-[72px] w-[72px] place-items-center rounded-[24px] bg-card/80 border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${a.tint} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <a.icon size={28} weight="duotone" className={`relative z-10 text-foreground`} />
              </div>
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground text-center">
                {a.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle 
          title="Gate Alerts" 
          badge={pending.length > 0 ? "Live" : undefined} 
          action="View History"
          onAction={() => setHistoryOpen(true)}
        />
        <div className="mt-4 space-y-3">
          {!dataReady ? (
            // Loading skeletons
            <>
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
            </>
          ) : (
            <AnimatePresence>
              {gateAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[20px] border border-border/50 bg-card/80 p-6 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <ShieldCheck size={32} weight="fill" className="text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm font-medium text-foreground">All Clear</p>
                  <p className="text-xs text-muted-foreground mt-1">No pending gate alerts right now.</p>
                </motion.div>
              ) : (
                gateAlerts.map((a) => <GateAlertCard key={a.id} alert={a} />)
              )}
            </AnimatePresence>
          )}
        </div>
      </section>


      
      </div>

      <button onClick={() => setTab("dues")} className="sr-only">
        go to dues
      </button>

      <NewTicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} />
      <InviteGuestModal open={inviteOpen} onClose={() => setInviteOpen(false)} initialType={inviteType} />
      <ActivePollModal />
      <AllNoticesModal open={noticesOpen} onClose={() => setNoticesOpen(false)} announcements={announcements} />
      <NocRequestModal open={nocOpen} onClose={() => setNocOpen(false)} />
      <VisitorHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
