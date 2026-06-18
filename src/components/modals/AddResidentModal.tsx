import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2, CheckCircle2, Copy } from "lucide-react";
import { useManager } from "@/context/ManagerContext";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddResidentModal({ isOpen, onClose }: Props) {
  const { handleAddResident } = useManager();
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    flatNo: "",
    membersCount: 1,
    aadhaarNumber: "",
    flatType: "3 BHK",
    occupancyType: "Owner",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await handleAddResident(formData);
      if (res?.success && res.tempPassword) {
        setGeneratedPassword(res.tempPassword);
      } else if (res?.success) {
        handleClose();
      }
    } catch (e) {
      // Error is handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGeneratedPassword(null);
    setFormData({ 
      name: "", email: "", phone: "", flatNo: "", 
      membersCount: 1, aadhaarNumber: "", flatType: "3 BHK", occupancyType: "Owner" 
    });
    onClose();
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success("Password copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md sm:items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md overflow-hidden rounded-t-[2rem] bg-[#121212] border border-white/10 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/5">
          <h2 className="text-lg font-bold text-white">Add Resident</h2>
          <button
            onClick={handleClose}
            className="rounded-full bg-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {generatedPassword ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 text-center"
            >
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Resident Added!</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Share these temporary login details with the resident so they can access their account.
              </p>
              
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-left mb-6">
                <div className="mb-3">
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Email</p>
                  <p className="text-white font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Temporary Password</p>
                  <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <code className="text-violet-400 font-bold tracking-widest">{generatedPassword}</code>
                    <button 
                      onClick={copyPassword}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      title="Copy Password"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-white text-black font-bold py-3.5 hover:bg-zinc-200 transition-colors"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit} 
              className="px-6 py-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Full Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-zinc-600"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-zinc-600"
                    placeholder="e.g. rahul@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-zinc-600"
                      placeholder="10-digit number"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Flat Number</label>
                    <input
                      required
                      value={formData.flatNo}
                      onChange={(e) => setFormData({ ...formData, flatNo: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all uppercase placeholder:text-zinc-600"
                      placeholder="e.g. A-101"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Members Count</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.membersCount}
                      onChange={(e) => setFormData({ ...formData, membersCount: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Aadhaar Number</label>
                    <input
                      required
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-zinc-600"
                      placeholder="12-digit number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Flat Type</label>
                    <select
                      value={formData.flatType}
                      onChange={(e) => setFormData({ ...formData, flatType: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                    >
                      <option className="bg-zinc-900">1 BHK</option>
                      <option className="bg-zinc-900">2 BHK</option>
                      <option className="bg-zinc-900">3 BHK</option>
                      <option className="bg-zinc-900">4 BHK</option>
                      <option className="bg-zinc-900">Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Occupancy</label>
                    <select
                      value={formData.occupancyType}
                      onChange={(e) => setFormData({ ...formData, occupancyType: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                    >
                      <option className="bg-zinc-900">Owner</option>
                      <option className="bg-zinc-900">Tenant</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {loading ? "Creating Account..." : "Add Resident & Generate Password"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
