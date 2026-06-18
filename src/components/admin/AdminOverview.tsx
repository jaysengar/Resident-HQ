import { useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, IndianRupee, Users, TrendingUp, Zap } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export function AdminOverview() {
  const { overview, loading, fetchOverview } = useAdmin();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (loading || !overview) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Active Societies",
      value: overview.activeSocieties,
      sub: `+${overview.newThisMonth} this month`,
      icon: Building2,
      gradient: "from-violet-500 to-purple-700",
      glow: "shadow-[0_0_30px_-5px_oklch(0.55_0.22_280_/_0.3)]",
    },
    {
      label: "Total MRR",
      value: `₹${overview.totalMRR.toLocaleString("en-IN")}`,
      sub: "Monthly recurring revenue",
      icon: IndianRupee,
      gradient: "from-emerald-400 to-teal-600",
      glow: "shadow-[0_0_30px_-5px_oklch(0.66_0.17_152_/_0.3)]",
    },
    {
      label: "Total Users",
      value: overview.totalUsers.toLocaleString(),
      sub: `${overview.churnRate}% churn rate`,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-[0_0_30px_-5px_oklch(0.51_0.22_268_/_0.3)]",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Control Center</h2>
        <p className="text-sm text-muted-foreground">Real-time overview of your SaaS platform</p>
      </div>

      {/* Big Metric Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, type: "spring", bounce: 0.2 }}
            className={`relative overflow-hidden rounded-2xl p-6 text-white ${m.glow}`}
            style={{ background: `linear-gradient(135deg, var(--card), var(--card))` }}
          >
            {/* Gradient Accent Bar */}
            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${m.gradient}`} />
            <div
              className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${m.gradient} opacity-10`}
            />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                  <p className="mt-2 text-3xl font-black text-foreground tracking-tight">
                    {m.value}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{m.sub}</p>
                </div>
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${m.gradient} text-white`}
                >
                  <m.icon size={22} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-5"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
              <p className="text-lg font-bold text-foreground">+{overview.activeSocieties ? Math.round((overview.newThisMonth / overview.activeSocieties) * 100) : 0}%</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-border bg-card p-5"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">System Uptime</p>
              <p className="text-lg font-bold text-foreground">99.97%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
