import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, Clock, AlertTriangle, FileDown, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useManager } from "@/context/ManagerContext";
import { toast } from "sonner";
import { getOverdueAmount } from "@/lib/api/api";
import { CreateBillModal } from "@/components/modals/CreateBillModal";

export function DuesCollection() {
  const { stats, monthlyData, loading, fetchDashboard, handleBulkReminder } = useManager();
  const [overdue, setOverdue] = useState(0);
  const [billModalOpen, setBillModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
    getOverdueAmount().then(setOverdue).catch(() => {});
  }, [fetchDashboard]);

  if (loading || !stats) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    );
  }

  const totalCollected = stats.totalCollection;
  const totalPending = stats.pendingDues;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dues Collection</h2>
        <p className="text-xs text-muted-foreground">Financial overview for the society</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: "Total Collected",
            value: `₹${totalCollected.toLocaleString("en-IN")}`,
            icon: IndianRupee,
            gradient: "from-emerald-500 to-teal-600",
            sub: "This billing cycle",
          },
          {
            label: "Pending Dues",
            value: `₹${totalPending.toLocaleString("en-IN")}`,
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
            sub: `${Math.round((totalPending / (totalCollected + totalPending)) * 100)}% of total`,
          },
          {
            label: "Overdue",
            value: `₹${overdue.toLocaleString("en-IN")}`,
            icon: AlertTriangle,
            gradient: "from-rose-500 to-red-600",
            sub: "Past due date",
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-transparent bg-black/40 backdrop-blur-md border-white/10 p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{m.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{m.sub}</p>
              </div>
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${m.gradient} text-white`}
              >
                <m.icon size={18} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Collection Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-transparent bg-black/40 backdrop-blur-md border-white/10 p-6"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Collection Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData}>
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
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
            />
            <Bar
              dataKey="collected"
              name="Collected"
              fill="oklch(0.66 0.17 152)"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="pending"
              name="Pending"
              fill="oklch(0.62 0.23 25)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleBulkReminder}
          className="flex items-center gap-3 rounded-2xl border border-transparent bg-black/40 backdrop-blur-md border-white/10 p-4 text-left hover:bg-accent/50 transition-colors"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Send size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Send Bulk Reminder</p>
            <p className="text-[11px] text-muted-foreground">Notify all unpaid residents</p>
          </div>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setBillModalOpen(true)}
          className="flex items-center gap-3 rounded-2xl border border-transparent bg-black/40 backdrop-blur-md border-white/10 p-4 text-left hover:bg-accent/50 transition-colors"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <FileDown size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Generate Bills</p>
            <p className="text-[11px] text-muted-foreground">Add dues to all flats</p>
          </div>
        </motion.button>
      </div>

      <CreateBillModal 
        open={billModalOpen} 
        onClose={() => setBillModalOpen(false)} 
        onSuccess={fetchDashboard} 
      />
    </div>
  );
}
