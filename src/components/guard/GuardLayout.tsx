import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Package, Briefcase, Users, Megaphone, Loader2, KeyRound, Truck } from "lucide-react";
import { toast } from "sonner";
import { useGuard } from "@/context/GuardContext";
import { verifyEntryCode } from "@/lib/api/api";
import { GuardHeader } from "./GuardHeader";
import { ActiveEntryCard } from "./ActiveEntryCard";
import { EntryRequestModal } from "./EntryRequestModal";
import { ApprovalScreen } from "./ApprovalScreen";
import { NewAnnouncementModal } from "./NewAnnouncementModal";
import { NoticeCard } from "@/components/cards/NoticeCard";
import { EmergencyAlertModal } from "./EmergencyAlertModal";
import { MovingPassModal } from "./MovingPassModal";

export function GuardLayout() {
  const { entries, tickets, announcements, removeAnnouncement, loading, fetchEntries, setModalOpen } = useGuard();
  const [entryCode, setEntryCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [movingPassOpen, setMovingPassOpen] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entryCode.length !== 6) {
      toast.error("Code must be 6 digits");
      return;
    }

    setVerifying(true);
    try {
      const { visitor } = await verifyEntryCode(entryCode);
      toast.success(`Entry Approved for ${visitor.name} (Flat ${visitor.flat_number})`);
      setEntryCode("");
      fetchEntries(); // refresh lists
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired code");
    } finally {
      setVerifying(false);
    }
  };

  const actions = [
    {
      label: "New Visitor",
      icon: UserPlus,
      tint: "from-blue-500 to-indigo-600",
      onClick: () => setModalOpen(true, "Visitor"),
    },
    {
      label: "Delivery / Cab",
      icon: Package,
      tint: "from-rose-500 to-orange-500",
      onClick: () => setModalOpen(true, "Delivery"),
    },
    {
      label: "Staff Entry",
      icon: Briefcase,
      tint: "from-emerald-500 to-teal-600",
      onClick: () => setModalOpen(true, "Staff"),
    },
    {
      label: "Announcement",
      icon: Megaphone,
      tint: "from-purple-500 to-fuchsia-600",
      onClick: () => setModalOpen(true, "Announcement"),
    },
    {
      label: "Moving Pass",
      icon: Truck,
      tint: "from-violet-500 to-purple-600",
      onClick: () => setMovingPassOpen(true),
    },
  ];

  return (
    <div className="dark h-[100dvh] w-full bg-black text-foreground selection:bg-primary/30">
      <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col bg-background shadow-[0_0_80px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <main className="flex-1 overflow-y-auto px-5 pb-6">
          <GuardHeader />

          {/* Code Verification Input */}
          <section className="mt-5">
            <form onSubmit={handleVerifyCode} className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-primary/50 group-focus-within:text-primary transition-colors">
                <KeyRound size={18} />
              </div>
              <input
                type="number"
                value={entryCode}
                onChange={(e) => setEntryCode(e.target.value)}
                placeholder="Enter 6-digit Pre-approval Code"
                disabled={verifying}
                className="w-full rounded-[1.5rem] border border-white/10 bg-zinc-900/80 backdrop-blur-xl py-4 pl-11 pr-24 text-sm font-bold tracking-widest text-white placeholder:text-white/30 placeholder:font-normal placeholder:tracking-normal focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 outline-none shadow-xl"
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                type="submit"
                disabled={verifying || entryCode.length === 0}
                className="absolute inset-y-2 right-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 text-xs font-bold text-primary-foreground shadow-md disabled:opacity-50 transition-all"
              >
                {verifying ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
              </motion.button>
            </form>
          </section>

          {/* Main Action Buttons */}
          <section className="mt-6">
            <div className="grid grid-cols-2 gap-3">
              {actions.map((a, i) => (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={a.onClick}
                  className="group relative overflow-hidden flex flex-col items-center gap-3 rounded-[1.5rem] border border-white/5 bg-zinc-900/60 backdrop-blur-xl p-4 text-center transition-all duration-300 hover:bg-zinc-800/80 shadow-lg hover:shadow-2xl hover:border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div
                    className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${a.tint} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <a.icon size={26} className="group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-bold text-foreground/90 tracking-wide">
                    {a.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Live Feed */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground tracking-tight">People Inside</h2>
                {entries.length > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" />
                    {entries.length} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80">
                <Users size={14} />
                Live Feed
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary" />
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  {entries.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-[1.5rem] border border-white/5 bg-zinc-900/50 p-8 text-center shadow-lg"
                    >
                      <Users size={32} className="mx-auto text-white/20 mb-3" />
                      <p className="text-xs text-white/50 font-medium">
                        No one currently inside. Entries will appear here.
                      </p>
                    </motion.div>
                  ) : (
                    entries.map((entry) => <ActiveEntryCard key={entry.id} entry={entry} />)
                  )}
                </AnimatePresence>
              )}
            </div>
          </section>

          {/* Flat Needs (Tickets) */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground tracking-tight">Flat Needs / Helpdesk</h2>
            </div>
            <div className="mt-3 space-y-3">
              {tickets?.length > 0 ? (
                tickets.map((t) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={t.id} 
                    className="rounded-[1.5rem] border border-white/5 bg-zinc-900/60 backdrop-blur-md p-5 hover:bg-zinc-800/60 transition-all shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1.5">
                          {t.category || "Request"}
                        </span>
                        <h3 className="text-sm font-semibold mt-0.5">{t.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                          <span className="font-medium text-foreground/80">Flat {t.flatNo}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          {t.residentName}
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[10px] font-bold text-orange-500 shadow-sm">
                        {t.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-zinc-900/30 p-6 text-center text-xs text-white/40 font-medium">
                  No pending flat needs.
                </div>
              )}
            </div>
          </section>
          {/* Announcements Feed */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground tracking-tight">Recent Announcements</h2>
            </div>
            <div className="mt-3 space-y-3">
              {announcements?.length > 0 ? (
                announcements.map((a) => (
                  <NoticeCard 
                    key={a.id} 
                    title={a.title} 
                    body={a.body} 
                    time={a.time} 
                    onDelete={() => removeAnnouncement(a.id)}
                  />
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-zinc-900/30 p-5 text-center text-xs text-white/40 font-medium">
                  No recent announcements.
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Modals & Overlays */}
        <EntryRequestModal />
        <NewAnnouncementModal />
        <AnimatePresence>
          <ApprovalScreen />
        </AnimatePresence>
        <EmergencyAlertModal />
        <MovingPassModal open={movingPassOpen} onClose={() => setMovingPassOpen(false)} />
      </div>
    </div>
  );
}
