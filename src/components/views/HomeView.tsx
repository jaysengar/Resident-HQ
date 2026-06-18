import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, Package, Ticket as TicketIcon, ShieldCheck, Bell, ShieldOff, QrCode } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { TopHeader, SectionTitle } from "@/components/layout/TopHeader";
import { GateAlertCard } from "@/components/cards/GateAlertCard";
import { NoticeCard } from "@/components/cards/NoticeCard";
import { NewTicketModal } from "@/components/modals/NewTicketModal";
import { InviteGuestModal } from "@/components/modals/InviteGuestModal";
import { ActivePollModal } from "@/components/modals/ActivePollModal";
import { AllNoticesModal } from "@/components/modals/AllNoticesModal";
import { EmptyState } from "@/components/ui/EmptyState";



export function HomeView() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  const { currentUser, gateAlerts, announcements, setTab } = useApp();
  const [ticketOpen, setTicketOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
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
  ];

  const pending = gateAlerts.filter((a) => a.status === "pending");

  return (
    <div className="dark bg-background min-h-[100dvh] text-foreground pb-8">
      <div className="px-5 pt-2">
        <TopHeader
          avatar={currentUser.name[0]}
          subtitle={getGreeting()}
          title={`Hello, ${currentUser.name}`}
          onBellClick={() => setNoticesOpen(true)}
        />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.05 }}
        className="mt-6 rounded-[28px] bg-card/80 backdrop-blur-xl p-6 border border-white/[0.08] shadow-elevated relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -z-10 pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Verified</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Flat {currentUser.flat}</p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">{currentUser.occupancyType}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">{currentUser.flatType}</span>
        </div>

        <div className="mt-6 flex flex-col gap-3 bg-black/50 backdrop-blur-md rounded-[20px] p-5 border border-white/[0.04] shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Name</span>
            <span className="text-xs font-semibold text-white">{currentUser.name}</span>
          </div>
          <div className="w-full h-px bg-white/[0.04]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Email</span>
            <span className="text-xs font-semibold text-white/90">{currentUser.email || "resident@residenthq.app"}</span>
          </div>
          <div className="w-full h-px bg-white/[0.04]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Phone</span>
            <span className="text-xs font-semibold text-white/90">{currentUser.phone || "N/A"}</span>
          </div>
        </div>
      </motion.div>

      <section className="mt-8">
        <SectionTitle title="Quick Actions" />
        <div className="mt-5 grid grid-cols-3 gap-4">
          {actions.map((a, i) => (
              <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={a.onClick}
              className="group flex flex-col items-center gap-3"
            >
              <div
                className={`grid h-[60px] w-[60px] place-items-center rounded-2xl bg-card text-foreground group-hover:bg-zinc-800/80 transition-all duration-300 border border-white/[0.08] shadow-card relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${a.tint} opacity-0 group-hover:opacity-25 transition-opacity duration-300 blur-xl`} />
                <a.icon size={24} strokeWidth={1.5} className="relative z-10 text-white/80 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] font-bold tracking-wide text-foreground/70 text-center leading-tight">
                {a.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Gate Alerts" badge={pending.length > 0 ? "Live" : undefined} />
        <div className="mt-4 space-y-3">
          <AnimatePresence>
            {gateAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-[20px] border border-white/5 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center shadow-lg"
              >
                <div className="h-10 w-10 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3 border border-white/5">
                  <ShieldCheck size={20} className="text-white/60" />
                </div>
                <p className="text-sm font-medium text-white/90">No pending alerts</p>
                <p className="text-[11px] text-white/50 mt-1">You're all caught up.</p>
              </motion.div>
            ) : (
              gateAlerts.map((a) => <GateAlertCard key={a.id} alert={a} />)
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-8 mb-6">
        <SectionTitle
          title="Notice Board"
          action={announcements.length > 5 ? "View all" : undefined}
          onAction={() => setNoticesOpen(true)}
        />
        <div className="mt-4 space-y-3">
          {announcements.slice(0, 5).map((n) => (
            <NoticeCard key={n.id} title={n.title} body={n.body} time={n.time} />
          ))}
          {announcements.length === 0 && (
            <EmptyState
              icon={Bell}
              title="No announcements yet"
              description="You'll see notices from your society management here."
            />
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
    </div>
  );
}
