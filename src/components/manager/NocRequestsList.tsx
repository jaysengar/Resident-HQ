import { motion, AnimatePresence } from "framer-motion";
import { Truck, CheckCircle2, XCircle } from "lucide-react";
import { useManager } from "@/context/ManagerContext";
import { useEffect } from "react";

export function NocRequestsList() {
  const { nocRequests, handleUpdateNocStatus, fetchNocRequests, loading } = useManager();

  useEffect(() => {
    fetchNocRequests();
  }, [fetchNocRequests]);

  if (loading && nocRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Moving NOCs</h1>
          <p className="text-sm text-zinc-400 mt-1">Approve or reject Move-In and Move-Out requests.</p>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {nocRequests.length === 0 && (
            <div className="text-center py-12 rounded-3xl border border-white/5 bg-black/40">
              <Truck size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium">No NOC requests found.</p>
            </div>
          )}

          {nocRequests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">
                      {req.type}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      req.status === "Approved" ? "text-emerald-400 bg-emerald-400/10" : 
                      req.status === "Rejected" ? "text-rose-400 bg-rose-400/10" : "text-amber-400 bg-amber-400/10"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">Flat {req.flat_number}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {req.user_name} • {req.user_phone || "No phone"}
                  </p>
                  <p className="text-sm font-medium text-white/80 mt-2">
                    <span className="text-zinc-500 text-xs">Date:</span> {new Date(req.moving_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {req.reason && (
                    <p className="text-xs text-zinc-400 mt-1 italic max-w-md line-clamp-2">"{req.reason}"</p>
                  )}
                </div>
              </div>

              {req.status === "Pending" && (
                <div className="flex items-center gap-2 sm:ml-auto">
                  <button
                    onClick={() => handleUpdateNocStatus(req.id, "Rejected")}
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-zinc-300 transition-colors hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateNocStatus(req.id, "Approved")}
                    className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-violet-500/25"
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
