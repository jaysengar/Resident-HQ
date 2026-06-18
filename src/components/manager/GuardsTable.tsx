import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Phone, Mail, Trash2 } from "lucide-react";
import { useManager } from "@/context/ManagerContext";
import { AddGuardModal } from "../modals/AddGuardModal";

export function GuardsTable() {
  const { guards, loading, fetchGuards, handleDeleteGuard } = useManager();
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchGuards();
  }, [fetchGuards]);

  const filtered = guards.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      g.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Security Guards</h2>
          <p className="text-xs text-muted-foreground">{guards.length} total guards</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + Add Guard
        </button>
      </div>
      <AddGuardModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />

      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-xl border border-transparent bg-black/40 backdrop-blur-md border-white/10 px-4 py-2.5"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <Search size={16} className="text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
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
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Guard Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => (
                  <motion.tr
                    key={g.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-transparent/40 last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{g.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={10} />
                          {g.phone || "N/A"}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail size={10} />
                          {g.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        <Shield size={12} />
                        Guard
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${g.name} from the system?`)) {
                            handleDeleteGuard(g.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Guard"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No guards found matching "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
