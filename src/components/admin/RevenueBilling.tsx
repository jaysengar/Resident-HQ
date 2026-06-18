import { useEffect } from "react";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdmin } from "@/context/AdminContext";

const PIE_COLORS = ["oklch(0.55 0.2 268)", "oklch(0.55 0.22 280)", "oklch(0.65 0.2 40)"];

export function RevenueBilling() {
  const { revenueTrend, planBreakdown, loading, fetchRevenue } = useAdmin();

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    );
  }

  const totalRevenue = revenueTrend.reduce((sum, r) => sum + r.revenue, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Revenue & Billing</h2>
        <p className="text-sm text-muted-foreground">Financial health of your SaaS platform</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <IndianRupee size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Annual Revenue</p>
              <p className="text-xl font-bold text-foreground">
                ₹{(totalRevenue / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current MRR</p>
              <p className="text-xl font-bold text-foreground">
                ₹{planBreakdown.reduce((s, p) => s + p.revenue, 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <IndianRupee size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Revenue/Society</p>
              <p className="text-xl font-bold text-foreground">
                ₹
                {Math.round(
                  planBreakdown.reduce((s, p) => s + p.revenue, 0) /
                    Math.max(
                      planBreakdown.reduce((s, p) => s + p.count, 0),
                      1,
                    ),
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MRR Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-6"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">MRR Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="var(--muted-foreground)"
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="oklch(0.55 0.22 280)"
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Plan Breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={planBreakdown}
                dataKey="revenue"
                nameKey="plan"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={4}
              >
                {planBreakdown.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4">
            {planBreakdown.map((p, i) => (
              <div key={p.plan} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {p.plan} ({p.count})
              </div>
            ))}
          </div>
        </motion.div>

        {/* Invoices / Plan Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Plan Details</h3>
          <div className="space-y-3">
            {planBreakdown.map((p, i) => (
              <div
                key={p.plan}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-background p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.plan}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.count} {p.count === 1 ? "society" : "societies"}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground">
                  ₹{p.revenue.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
