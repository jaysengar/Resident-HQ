import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass as Search,
  Plus,
  Drop as Droplet,
  Lightning as Zap,
  Hammer,
  Sparkle as Sparkles,
  ShieldCheck,
  Wrench,
  Users,
  Car,
  Megaphone,
  FileText,
  DownloadSimple as Download
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { TopHeader, SectionTitle } from "@/components/layout/TopHeader";
import { TicketCard } from "@/components/cards/TicketCard";
import { NewTicketModal } from "@/components/modals/NewTicketModal";
import { DocumentUploadModal } from "@/components/modals/DocumentUploadModal";
import { ServiceProviderModal } from "@/components/modals/ServiceProviderModal";
import { DirectMessageModal } from "@/components/modals/DirectMessageModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export function ServicesView() {
  const { user } = useAuth();
  const { currentUser, activeTickets, documents, fetchInitialData } = useApp();
  const [seg, setSeg] = useState<"helpdesk" | "directory" | "documents">("helpdesk");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [dirOpen, setDirOpen] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    import("@/lib/api/api").then(({ getServiceCategories }) => {
      getServiceCategories().then((data) => {
        setCategories(data);
        setCategoriesLoading(false);
      }).catch(() => setCategoriesLoading(false));
    });
  }, []);

  const iconsMap: Record<string, any> = {
    Droplet,
    Zap,
    Hammer,
    Sparkles,
    ShieldCheck,
    Wrench,
    Users,
    Car,
    Megaphone,
    FileText,
  };

  const helpdesk = categories
    .filter(c => c.type === "helpdesk")
    .map(c => ({ label: c.label || c.name, icon: iconsMap[c.icon_name || c.icon] || Wrench, color: c.color_class || c.color }));

  const directory = categories
    .filter(c => c.type === "directory")
    .map(c => ({ label: c.label || c.name, icon: iconsMap[c.icon_name || c.icon] || Users, color: c.color_class || c.color }));

  // Categories dynamically fetched
  const list = (seg === "helpdesk" ? helpdesk : directory).filter((item) =>
    (item.label || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5">
      <TopHeader title="Services" subtitle="Helpdesk & local pros" />

      <div
        className="mt-6 flex items-center gap-3 rounded-full border border-border/50 bg-card/60 backdrop-blur-xl px-5 py-3.5 shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-colors focus-within:bg-card/80 focus-within:border-primary/30"
      >
        <Search size={20} className="text-muted-foreground" weight="bold" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="What do you need help with?"
          className="flex-1 bg-transparent text-[15px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="mt-5 grid grid-cols-3 rounded-[20px] bg-secondary/50 p-1.5 text-sm font-bold backdrop-blur-md border border-border/30">
        {(["helpdesk", "directory", "documents"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeg(s)}
            className="relative rounded-2xl px-2 py-3 transition-colors text-xs uppercase tracking-wider"
          >
            {seg === s && (
              <motion.div
                layoutId="seg-pill"
                className="absolute inset-0 rounded-2xl bg-card shadow-[0_2px_8px_rgb(0,0,0,0.08)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className={`relative z-10 ${seg === s ? "text-foreground" : "text-muted-foreground"} whitespace-nowrap`}>
              {s === "helpdesk" ? "Helpdesk" : s === "directory" ? "Directory" : "Documents"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {seg !== "documents" ? (
          <motion.section 
            key="services"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <SectionTitle title="Categories" />
            <div className="mt-4 grid grid-cols-3 gap-4">
              {categoriesLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-3 rounded-[24px] border border-border/40 bg-card/40 backdrop-blur-md p-4">
                    <div className="h-14 w-14 rounded-2xl bg-secondary animate-pulse" style={{ animationDelay: `${i * 0.08}s` }} />
                    <div className="h-3 w-16 rounded-full bg-secondary animate-pulse" />
                  </div>
                ))
              ) : list.length === 0 ? (
                <div className="col-span-3 text-center text-xs text-muted-foreground py-4">
                  No services found matching "{search}"
                </div>
              ) : (
                <>
                  {seg === "helpdesk" && !search && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      onClick={() => {
                        if (user?.subscriptionPlan === "Basic") {
                          toast.error("Locked Feature", {
                            description: "Manager Chat is not available on the Basic (5k) plan. Society needs to upgrade.",
                          });
                          return;
                        }
                        setMsgOpen(true);
                      }}
                      className={`flex flex-col items-center justify-center gap-3 rounded-[24px] border p-4 backdrop-blur-md transition-all ${
                        user?.subscriptionPlan === "Basic" 
                          ? "border-muted/30 bg-muted/5 opacity-75 grayscale" 
                          : "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:shadow-[0_4px_20px_rgba(var(--color-primary),0.1)]"
                      }`}
                    >
                      <div className={`grid h-14 w-14 place-items-center rounded-2xl ${
                        user?.subscriptionPlan === "Basic"
                          ? "bg-muted/20 text-muted-foreground"
                          : "bg-primary/10 text-primary"
                      }`}>
                        <Users size={28} weight="duotone" />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider text-center ${
                        user?.subscriptionPlan === "Basic" ? "text-muted-foreground" : "text-primary"
                      }`}>
                        {user?.subscriptionPlan === "Basic" ? "Chat (Locked)" : "Message Manager"}
                      </span>
                    </motion.button>
                  )}
                  {list.map((c) => (
                  <motion.button
                    key={c.label}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (seg === "helpdesk") setTicketOpen(true);
                      else setDirOpen(c.label);
                    }}
                    className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-border/40 bg-card/40 backdrop-blur-md p-4 transition-all hover:bg-card/60 hover:shadow-[0_2px_12px_rgb(0,0,0,0.03)]"
                  >
                    <div className={`grid h-14 w-14 place-items-center rounded-2xl ${c.color.replace('bg-', 'bg-').replace('/10', '/15')}`}>
                      <c.icon size={28} weight="duotone" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide text-foreground text-center leading-tight">{c.label}</span>
                  </motion.button>
                  ))}
                </>
              )}
            </div>
          </motion.section>
        ) : (
          <motion.section 
            key="documents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between">
              <SectionTitle title="Society Documents" />
              {currentUser.role === "manager" && (
                <button
                  onClick={() => setUploadOpen(true)}
                  className="text-[11px] font-bold tracking-wider uppercase text-primary hover:text-primary/80 transition-colors"
                >
                  + Upload
                </button>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 rounded-[20px] border border-border/50 bg-card/60 backdrop-blur-xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <FileText size={24} weight="duotone" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold tracking-tight text-foreground">{doc.title}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{doc.category}</p>
                    </div>
                    <motion.a
                      whileTap={{ scale: 0.9 }}
                      href={doc.url}
                      download
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary/80 text-foreground hover:bg-secondary transition-colors"
                    >
                      <Download size={18} weight="bold" />
                    </motion.a>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-border/60 bg-card/30 backdrop-blur-sm p-6 text-center">
                  <FileText size={32} weight="duotone" className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No documents uploaded yet.</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <SectionTitle title="Active Tickets" />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setTicketOpen(true)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <Plus size={14} /> Raise Ticket
          </motion.button>
        </div>
        <div className="mt-3 space-y-2.5">
          <AnimatePresence>
            {activeTickets.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </AnimatePresence>
          {activeTickets.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center text-xs text-muted-foreground">
              No active tickets. Tap "Raise Ticket" to create one.
            </p>
          )}
        </div>
      </section>

      <NewTicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} />
      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={() => fetchInitialData()}
      />
      <ServiceProviderModal
        open={!!dirOpen}
        onClose={() => setDirOpen(null)}
        category={dirOpen}
      />
      <DirectMessageModal open={msgOpen} onClose={() => setMsgOpen(false)} />
    </div>
  );
}
