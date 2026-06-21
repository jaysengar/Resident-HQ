import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
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
  Download
} from "lucide-react";
import { toast } from "sonner";
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
    .map(c => ({ label: c.label, icon: iconsMap[c.icon_name] || Wrench, color: c.color_class }));

  const directory = categories
    .filter(c => c.type === "directory")
    .map(c => ({ label: c.label, icon: iconsMap[c.icon_name] || Users, color: c.color_class }));

  // Categories dynamically fetched
  const list = (seg === "helpdesk" ? helpdesk : directory).filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5">
      <TopHeader title="Services" subtitle="Helpdesk & local pros" />

      <div
        className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <Search size={18} className="text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="What do you need help with?"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 rounded-2xl bg-secondary p-1 text-sm font-medium">
        {(["helpdesk", "directory", "documents"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeg(s)}
            className="relative rounded-xl px-2 py-2.5 transition-colors text-xs"
          >
            {seg === s && (
              <motion.div
                layoutId="seg-pill"
                className="absolute inset-0 rounded-xl bg-card"
                style={{ boxShadow: "var(--shadow-soft)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className={`relative ${seg === s ? "text-foreground" : "text-muted-foreground"} whitespace-nowrap`}>
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
            className="mt-5"
          >
            <SectionTitle title="Categories" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {categoriesLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-3">
                    <div className="h-12 w-12 rounded-xl bg-secondary animate-pulse" style={{ animationDelay: `${i * 0.08}s` }} />
                    <div className="h-3 w-14 rounded-full bg-secondary animate-pulse" />
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
                      onClick={() => setMsgOpen(true)}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-3"
                      style={{ boxShadow: "var(--shadow-soft)" }}
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <Users size={22} />
                      </div>
                      <span className="text-xs font-semibold text-primary">Message Manager</span>
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
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-3"
                    style={{ boxShadow: "var(--shadow-soft)" }}
                  >
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${c.color}`}>
                      <c.icon size={22} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{c.label}</span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.section>
        ) : (
          <motion.section 
            key="documents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-5"
          >
            <div className="flex items-center justify-between">
              <SectionTitle title="Society Documents" />
              {currentUser.role === "manager" && (
                <button
                  onClick={() => setUploadOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  + Upload
                </button>
              )}
            </div>
            <div className="mt-3 space-y-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.category}</p>
                    </div>
                    <motion.a
                      whileTap={{ scale: 0.9 }}
                      href={doc.url}
                      download
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-accent"
                    >
                      <Download size={14} />
                    </motion.a>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No documents uploaded yet.
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
