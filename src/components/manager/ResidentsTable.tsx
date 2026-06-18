import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, Loader2, Phone, Mail, Trash2 } from "lucide-react";
import { useManager } from "@/context/ManagerContext";

import { AddResidentModal } from "../modals/AddResidentModal";

export function ResidentsTable() {
  const { residents, loading, fetchResidents, handleSendReminder, handleDeleteResident } = useManager();
  const [search, setSearch] = useState("");
  const [sendingFlat, setSendingFlat] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const filtered = residents.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.flatNo.toLowerCase().includes(search.toLowerCase()),
  );

  const handleReminder = async (flatNo: string) => {
    setSendingFlat(flatNo);
    await handleSendReminder(flatNo);
    setSendingFlat(null);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-success/10 text-success";
      case "Unpaid":
        return "bg-destructive/10 text-destructive";
      case "Partial":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Flats & Residents</h2>
          <p className="text-xs text-muted-foreground">{residents.length} total residents</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + Add Resident
        </button>
      </div>
      <AddResidentModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />

      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-xl border border-transparent bg-black/40 backdrop-blur-md border-white/10 px-4 py-2.5"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <Search size={16} className="text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or flat number..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border border-transparent bg-black/40 backdrop-blur-md border-white/10"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-transparent bg-secondary/50">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Flat</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Resident
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Dues</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-transparent/40 last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                        {r.flatNo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {r.flatType} • {r.occupancyType || "Owner"}
                          {r.membersCount && r.membersCount > 1 ? ` • ${r.membersCount} members` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone size={10} />
                          {r.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground">
                        {r.duesAmount > 0 ? `₹${r.duesAmount.toLocaleString("en-IN")}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(r.duesStatus)}`}
                      >
                        {r.duesStatus === "Paid"
                          ? "✅ Paid"
                          : r.duesStatus === "Partial"
                            ? "⚠️ Partial"
                            : "🔴 Unpaid"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.duesStatus !== "Paid" ? (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReminder(r.flatNo)}
                            disabled={sendingFlat === r.flatNo}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {sendingFlat === r.flatNo ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Send size={12} />
                            )}
                            {sendingFlat === r.flatNo ? "Sending..." : "Remind"}
                          </motion.button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground mr-2">No action</span>
                        )}
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${r.name} from flat ${r.flatNo}?`)) {
                              handleDeleteResident(r.id, r.flatNo);
                            }
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete Resident"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No residents found matching "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
