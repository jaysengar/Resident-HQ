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
import { NocRequestModal } from "@/components/modals/NocRequestModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard, SkeletonRow } from "@/components/ui/SkeletonCard";
import { Truck } from "lucide-react";


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
    <div className="bg-[#f0f4f8] min-h-[100dvh] text-gray-900 pb-8">
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
        className="mt-6 rounded-[28px] bg-white p-6 border border-gray-200 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Verified</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Flat {currentUser.flat}</p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{currentUser.occupancyType}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{currentUser.flatType}</span>
        </div>

        <div className="mt-6 flex flex-col gap-3 bg-gray-50 rounded-[20px] p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Name</span>
            <span className="text-xs font-semibold text-gray-900">{currentUser.name}</span>
          </div>
          <div className="w-full h-px bg-gray-200" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Email</span>
            <span className="text-xs font-semibold text-gray-800">{currentUser.email || "resident@residenthq.app"}</span>
          </div>
          <div className="w-full h-px bg-gray-200" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Phone</span>
            <span className="text-xs font-semibold text-gray-800">{currentUser.phone || "N/A"}</span>
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
                className="grid h-[60px] w-[60px] place-items-center rounded-2xl bg-white text-gray-900 group-hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-sm relative overflow-hidden"
              >
                <a.icon size={24} strokeWidth={1.5} className="relative z-10 text-brand group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold tracking-wide text-gray-600 text-center leading-tight">
                {a.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Gate Alerts" badge={pending.length > 0 ? "Live" : undefined} />
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
                  className="rounded-[20px] border border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center mb-3 border border-gray-100">
                    <ShieldCheck size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No pending alerts</p>
                  <p className="text-[11px] text-gray-500 mt-1">You're all caught up.</p>
                </motion.div>
              ) : (
                gateAlerts.map((a) => <GateAlertCard key={a.id} alert={a} />)
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      <section className="mt-8 mb-6">
        <SectionTitle
          title="Notice Board"
          action={announcements.length > 5 ? "View all" : undefined}
          onAction={() => setNoticesOpen(true)}
        />
        <div className="mt-4 space-y-3">
          {!dataReady ? (
            // Loading skeletons
            <>
              <SkeletonCard lines={3} />
              <SkeletonCard lines={2} />
              <SkeletonCard lines={3} />
            </>
          ) : announcements.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No announcements yet"
              description="You'll see notices from your society management here."
            />
          ) : (
            announcements.slice(0, 5).map((n) => (
              <NoticeCard key={n.id} title={n.title} body={n.body} time={n.time} />
            ))
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
    </div>
  );
}
