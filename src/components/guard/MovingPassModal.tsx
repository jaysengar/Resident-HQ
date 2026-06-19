import { motion, AnimatePresence } from "framer-motion";
import { Truck, X, Search, CheckCircle2 } from "lucide-react";
import { useGuard } from "@/context/GuardContext";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MovingPassModal({ open, onClose }: Props) {
  const { nocRequests } = useGuard();
  const [searchQuery, setSearchQuery] = useState("");

  const approvedNocs = nocRequests.filter(req => req.status === "Approved");

  const filteredNocs = approvedNocs.filter(
    (n) =>
      n.flat_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck size={24} className="text-emerald-500" />
              Verified Moving Passes
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search flat number or resident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[50vh]">
            {filteredNocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <Truck size={48} className="mb-4 opacity-20" />
                <p>No verified moving passes found today.</p>
              </div>
            ) : (
              filteredNocs.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3">
                     <CheckCircle2 size={24} className="text-emerald-500 opacity-20" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      {req.type}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} /> APPROVED
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Flat {req.flat_number}</h3>
                  <p className="text-sm text-zinc-400">
                    {req.user_name} • {req.user_phone || "No phone"}
                  </p>
                  
                  <div className="mt-3 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/50">
                     <p className="text-xs text-zinc-400 font-medium">Scheduled Date & Time:</p>
                     <p className="text-sm text-white font-bold">{new Date(req.moving_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                     {req.reason && (
                       <>
                         <p className="text-xs text-zinc-400 font-medium mt-2">Truck / Agency Details:</p>
                         <p className="text-sm text-zinc-300 italic">"{req.reason}"</p>
                       </>
                     )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
