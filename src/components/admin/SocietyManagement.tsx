import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Building2, MapPin, Trash2, Key } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { OnboardSocietyForm } from "./OnboardSocietyForm";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function SocietyManagement() {
  const { societies, loading, fetchSocieties, handleToggleAccess, handleDeleteSociety } = useAdmin();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  const planBadge: Record<string, string> = {
    Basic: "bg-blue-500/20 text-blue-400",
    Pro: "bg-violet-500/20 text-violet-400",
    Enterprise: "bg-amber-500/20 text-amber-400",
  };

  const handleChangePassword = async (email: string) => {
    const newPassword = window.prompt(`Enter new password for manager (${email}):`);
    if (!newPassword) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("admin-change-password", {
        body: { email, newPassword }
      });
      
      if (error) {
        console.error("Full invoke error:", error);
        throw new Error(error.message || JSON.stringify(error));
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      toast.success("Manager password changed successfully!");
    } catch (err: any) {
      console.error("Password change error catch block:", err);
      toast.error(err.message || "Failed to change password. Check console.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manage Societies</h2>
          <p className="text-sm text-muted-foreground">
            {societies.length} total societies onboarded
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus size={16} />
          Onboard New Society
        </motion.button>
      </div>

      {/* Onboard Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <OnboardSocietyForm onComplete={() => setShowForm(false)} />
        </motion.div>
      )}

      {/* Society Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border border-border bg-card"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Society</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                    Address
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Flats</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Access</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {societies.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/40 last:border-0 hover:bg-accent/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 text-violet-400">
                          <Building2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.adminEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={10} /> {s.address}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground">{s.totalFlats}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${planBadge[s.subscriptionPlan]}`}
                      >
                        {s.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          s.status === "active"
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {s.status === "active" ? "● Active" : "● Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        checked={s.status === "active"}
                        onChange={() => handleToggleAccess(s.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleChangePassword(s.adminEmail)}
                          className="p-2 text-muted-foreground hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
                          title="Change Manager Password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSociety(s.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                          title="Delete Society"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-success" : "bg-muted"
      }`}
    >
      <motion.div
        layout
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
      />
    </button>
  );
}
