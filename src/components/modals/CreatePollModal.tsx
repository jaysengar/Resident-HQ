import { useState } from "react";
import { motion } from "framer-motion";
import { X, PieChart, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePollModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Please provide at least two valid options.");
      return;
    }

    setLoading(true);
    try {
      const { createPoll } = await import("@/lib/api/api");
      await createPoll(question, validOptions);
      toast.success("Poll created successfully!");
      onClose();
      setQuestion("");
      setOptions(["", ""]);
    } catch (err: any) {
      toast.error("Failed to create poll", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (idx: number, value: string) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(idx, 1);
    setOptions(newOptions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md overflow-hidden rounded-t-[2rem] bg-card shadow-2xl sm:rounded-2xl border border-border"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Create Community Poll</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Poll Question</label>
              <input
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="e.g. Should we open the pool an hour early?"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Options</label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      required
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder={`Option ${idx + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-glow"
                >
                  <Plus size={14} /> Add Option
                </button>
              )}
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <PieChart size={18} />}
            {loading ? "Publishing..." : "Publish Poll"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
