import { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, IndianRupee, AlertCircle, TrendingUp, Users, CheckCircle, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useManager } from "@/context/ManagerContext";
import { CreatePollModal } from "@/components/modals/CreatePollModal";
import { getManagerPolls } from "@/lib/api/polls";

import { SkeletonCard, SkeletonTable } from "@/components/ui/SkeletonCard";

export function ManagerDashboard() {
  const { stats, monthlyData, loading, fetchDashboard } = useManager();
  const [pollOpen, setPollOpen] = useState(false);
  const [polls, setPolls] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
    getManagerPolls().then(setPolls).catch(console.error);
  }, [fetchDashboard]);

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
        <SkeletonTable rows={5} />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </div>
      </div>
    );
  }

  const currentMonthIdx = new Date().getMonth();
  const currentMonthData = monthlyData[currentMonthIdx];
  const prevMonthData = monthlyData[currentMonthIdx - 1];
  
  let growthPercent = 0;
  if (currentMonthData && prevMonthData) {
    if (prevMonthData.collected === 0) {
      growthPercent = currentMonthData.collected > 0 ? 100 : 0;
    } else {
      growthPercent = Math.round(((currentMonthData.collected - prevMonthData.collected) / prevMonthData.collected) * 100);
    }
  }

  const metrics = [
    {
      label: "Total Flats",
      value: stats.totalFlats,
      sub: `${stats.occupiedFlats} occupied`,
      icon: Building2,
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    },
    {
      label: "Pending Dues",
      value: `₹${stats.pendingDues.toLocaleString("en-IN")}`,
      sub: `${stats.collectionRate}% collected`,
      icon: IndianRupee,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      sub: "Needs attention",
      icon: AlertCircle,
      gradient: "from-rose-500 to-red-600",
      shadow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Society Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time metrics and financial health.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 relative backdrop-blur-md hover:bg-white/5 transition-colors"
          >
            <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${m.gradient} opacity-[0.08] blur-2xl`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">{m.label}</p>
                <p className="mt-2 text-3xl font-bold text-white tracking-tight">{m.value}</p>
                <p className="mt-1 text-xs text-zinc-500">{m.sub}</p>
              </div>
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${m.gradient} text-white ${m.shadow}`}
              >
                <m.icon size={22} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Collection Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Monthly Revenue</h3>
            <p className="text-xs text-zinc-400">Revenue vs pending dues per month</p>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${growthPercent >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            <TrendingUp size={14} className={growthPercent < 0 ? "rotate-180" : ""} /> {growthPercent >= 0 ? "+" : ""}{growthPercent}% vs last month
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} stroke="transparent" tickMargin={12} />
            <YAxis
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              stroke="transparent"
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tickMargin={12}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(12px)",
                fontSize: "13px",
                color: "#fff",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
              }}
              itemStyle={{ color: "#fff", fontWeight: "bold" }}
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "13px", color: "#a1a1aa", paddingTop: "20px" }} />
            <Bar
              dataKey="collected"
              name="Collected"
              fill="url(#colorCollected)"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="pending"
              name="Pending Dues"
              fill="url(#colorPending)"
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-6 cursor-pointer hover:border-violet-500/50 hover:bg-white/5 transition-all group flex flex-col justify-center items-center gap-3 backdrop-blur-md"
          onClick={() => setPollOpen(true)}
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 text-violet-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(109,40,217,0.3)] transition-all">
            <PieChart size={26} />
          </div>
          <p className="text-sm font-bold text-white">Create New Poll</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Collection Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.collectionRate}%</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Collected</p>
              <p className="text-2xl font-bold text-white mt-1">
                ₹{stats.totalCollection.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Polls Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Society Polls</h3>
            <p className="text-xs text-zinc-400">Recent polls and their results</p>
          </div>
        </div>
        
        {polls.length === 0 ? (
          <div className="text-center text-sm text-zinc-500 py-6">No polls created yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polls.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-semibold text-white leading-tight">{p.question}</h4>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0 ${p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                    {p.active ? 'Live' : 'Closed'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {p.results.map((r: any, idx: number) => {
                    const pct = p.total_votes > 0 ? Math.round((r.votes / p.total_votes) * 100) : 0;
                    return (
                      <div key={idx} className="relative">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-300 font-medium">{r.option}</span>
                          <span className="text-zinc-400">{r.votes} votes ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-violet-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                  <span>Total: {p.total_votes} votes</span>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <CreatePollModal isOpen={pollOpen} onClose={() => { setPollOpen(false); getManagerPolls().then(setPolls).catch(console.error); }} />
    </div>
  );
}
