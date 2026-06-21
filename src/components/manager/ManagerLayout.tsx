import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Wallet,
  LifeBuoy,
  Bell,
  Search,
  Menu,
  User,
  Settings,
  Lock,
  Palette,
  Vote,
  FileText,
  ClipboardList,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useManager, type ManagerTab } from "@/context/ManagerContext";
import { ManagerDashboard } from "./ManagerDashboard";
import { ResidentsTable } from "./ResidentsTable";
import { DuesCollection } from "./DuesCollection";
import { HelpdeskTickets } from "./HelpdeskTickets";
import { GuardsTable } from "./GuardsTable";
import { ManagerSettings } from "./ManagerSettings";
import { ManagerBranding } from "./ManagerBranding";
import { NocRequestsList } from "./NocRequestsList";
import { ManagerMessages } from "./ManagerMessages";
import { isFeatureAvailable, normalizePlan, FEATURE_REGISTRY, type PlanId, type FeatureId, type FeatureMeta } from "@/lib/planGating";
import { UpgradePlanModal } from "@/components/modals/UpgradePlanModal";
import { SubscriptionLockModal } from "@/components/modals/SubscriptionLockModal";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { Truck } from "lucide-react";

interface NavItem {
  id: ManagerTab;
  label: string;
  icon: any;
  featureId?: FeatureId;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, featureId: "dashboard" },
  { id: "residents", label: "Flats & Residents", icon: Building2, featureId: "residents" },
  { id: "nocs", label: "Moving NOCs", icon: Truck },
  { id: "guards", label: "Security Guards", icon: User, featureId: "guards" },
  { id: "dues", label: "Dues Collection", icon: Wallet, featureId: "dues" },
  { id: "helpdesk", label: "Helpdesk Tickets", icon: LifeBuoy, featureId: "helpdesk" },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "branding", label: "Branding", icon: Palette, featureId: "branding" },
  { id: "settings", label: "Settings", icon: Settings, featureId: "settings" },
];

export function ManagerLayout() {
  const { tab, setTab } = useManager();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("basic");
  const [societyId, setSocietyId] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: FeatureMeta | null }>({ open: false, feature: null });
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    import("@/lib/api/api").then(({ getSocietyPlan }) => {
      getSocietyPlan().then((data) => {
        // data is { plan, subscription_expires_at, id }
        setCurrentPlan(normalizePlan(data.plan));
        setSocietyId(data.id);
        if (data.subscription_expires_at) {
          setExpiryDate(new Date(data.subscription_expires_at));
        }
      }).catch(() => setCurrentPlan("basic"));
    });
  }, []);

  const isExpired = expiryDate ? expiryDate < new Date() : false;

  const handleNavClick = (item: NavItem) => {
    if (item.featureId && !isFeatureAvailable(item.featureId, currentPlan)) {
      const featureMeta = FEATURE_REGISTRY.find((f) => f.id === item.featureId);
      if (featureMeta) {
        setUpgradeModal({ open: true, feature: featureMeta });
      }
      return;
    }
    setTab(item.id);
  };

  return (
    <div className="dark flex h-[100dvh] w-full bg-[#0a0a0a] text-foreground font-sans overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside
        className={`relative z-20 shrink-0 flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-3xl transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-[72px]"
        }`}
        style={{ boxShadow: "1px 0 24px rgba(0,0,0,0.5)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-6">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-[0_0_15px_rgba(109,40,217,0.4)]">
            N
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="text-sm font-bold text-white truncate tracking-wide">Resident HQ</p>
              <p className="text-[10px] text-zinc-400 truncate uppercase tracking-widest">Manager Portal</p>
            </motion.div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = tab === item.id;
            const locked = item.featureId ? !isFeatureAvailable(item.featureId, currentPlan) : false;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: locked ? 1 : 0.96 }}
                onClick={() => handleNavClick(item)}
                className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                  locked
                    ? "text-zinc-600 cursor-not-allowed opacity-60"
                    : active
                      ? "text-white shadow-[0_0_20px_rgba(109,40,217,0.15)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {active && !locked && (
                  <motion.div
                    layoutId="manager-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon size={18} className={`relative shrink-0 transition-colors ${locked ? "text-zinc-600" : active ? "text-violet-400" : "text-zinc-500"}`} />
                {sidebarOpen && (
                  <span className="relative truncate tracking-wide flex items-center gap-2">
                    {item.label}
                    {locked && <Lock size={12} className="text-zinc-600" />}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Plan Badge */}
        {sidebarOpen && (
          <div className="mx-4 mb-2 p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Current Plan</p>
            <p className={`text-sm font-bold ${
              currentPlan === "enterprise" ? "text-amber-400" : currentPlan === "pro" ? "text-blue-400" : "text-emerald-400"
            }`}>
              {currentPlan === "enterprise" ? "Premium Automation" : currentPlan === "pro" ? "Smart Operations" : "Digital Security"}
            </p>
          </div>
        )}

        {/* Collapse Button */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest"
          >
            <Menu size={16} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col min-w-0 bg-[#0a0a0a]">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Top Bar */}
        <header className="relative z-10 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-2xl px-8 py-4">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 w-full max-w-md shadow-inner transition-colors focus-within:border-violet-500/50">
            <Search size={16} className="text-zinc-500" />
            <input
              placeholder="Search flats, residents, or tickets..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setNotifOpen(true)}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/40 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 p-1.5 pr-4 shadow-lg cursor-pointer hover:bg-white/5 transition-colors">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[11px] font-bold shadow-inner">
                M
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-white tracking-wide">Manager</p>
                <p className="text-[10px] text-zinc-400">Authorized Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {tab === "dashboard" && <ManagerDashboard />}
              {tab === "residents" && <ResidentsTable />}
              {tab === "nocs" && <NocRequestsList />}
              {tab === "guards" && <GuardsTable />}
              { tab === "dues" && <DuesCollection /> }
              { tab === "helpdesk" && <HelpdeskTickets /> }
              { tab === "messages" && <ManagerMessages /> }
              { tab === "branding" && <ManagerBranding currentPlan={currentPlan} /> }
              { tab === "settings" && <ManagerSettings /> }
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Upgrade Modal */}
      {upgradeModal.feature && (
        <UpgradePlanModal
          open={upgradeModal.open}
          onClose={() => setUpgradeModal({ open: false, feature: null })}
          feature={upgradeModal.feature}
          currentPlan={currentPlan}
        />
      )}

      {/* Subscription Lock Modal */}
      {isExpired && (
        <SubscriptionLockModal 
          societyId={societyId}
          onRenewSuccess={(newExpiryStr) => {
            setExpiryDate(new Date(newExpiryStr));
          }}
        />
      )}

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}
