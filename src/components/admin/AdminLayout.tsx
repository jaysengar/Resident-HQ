import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Wallet,
  ScrollText,
  Menu,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useAdmin, type AdminTab } from "@/context/AdminContext";
import { AdminOverview } from "./AdminOverview";
import { SocietyManagement } from "./SocietyManagement";
import { RevenueBilling } from "./RevenueBilling";
import { SystemLogs } from "./SystemLogs";

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "societies", label: "Manage Societies", icon: Building2 },
  { id: "revenue", label: "Revenue & Billing", icon: Wallet },
  { id: "logs", label: "System Logs", icon: ScrollText },
];

export function AdminLayout() {
  const { tab, setTab } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-dark flex h-[100dvh] w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`shrink-0 flex flex-col border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-[72px]"
        }`}
        style={{
          background: "linear-gradient(180deg, oklch(0.15 0.025 260), oklch(0.12 0.02 260))",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white font-black text-sm shadow-lg">
            <Shield size={18} />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">Resident HQ Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">Super Admin Panel</p>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = tab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(item.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="admin-nav-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-700/20 border border-violet-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                {active && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-violet-400 to-purple-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon size={18} className="relative shrink-0" />
                {sidebarOpen && <span className="relative truncate">{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        {/* Collapse */}
        <div className="border-t border-border/50 p-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-card/50 backdrop-blur-xl">
          <div>
            <p className="text-sm font-bold text-foreground">
              {NAV_ITEMS.find((n) => n.id === tab)?.label}
            </p>
            <p className="text-[11px] text-muted-foreground">Super Admin — residenthq.io</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              All Systems Operational
            </span>
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-1.5">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white text-[11px] font-bold">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-foreground">Super Admin</p>
                <p className="text-[10px] text-muted-foreground">admin@residenthq.io</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "overview" && <AdminOverview />}
              {tab === "societies" && <SocietyManagement />}
              {tab === "revenue" && <RevenueBilling />}
              {tab === "logs" && <SystemLogs />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
