import { useEffect, useState } from "react";
import { X, Calendar, Clock, Loader2 } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { getVisitorHistory } from "@/lib/api/visitors";
import { ActiveEntry } from "@/lib/types";

export function VisitorHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<ActiveEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getVisitorHistory()
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <ModalShell open={open} onClose={onClose} title="Visitor History">
      <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground p-6">No past visitors found.</p>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-border/50 bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.type} {entry.company && `• ${entry.company}`}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  entry.status === 'approved' ? 'bg-success/20 text-success' :
                  entry.status === 'denied' ? 'bg-destructive/20 text-destructive' :
                  entry.status === 'exited' ? 'bg-secondary text-muted-foreground' :
                  'bg-primary/20 text-primary'
                }`}>
                  {entry.status}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(entry.enteredAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(entry.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </ModalShell>
  );
}
