import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, PieChart } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { useApp } from "@/context/AppContext";

export function ActivePollModal() {
  const { activePoll, submitVote } = useApp();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If there's no active poll, we just don't render the modal open
  if (!activePoll) return null;

  const handleVote = async () => {
    if (selectedOption === null) return;
    setIsSubmitting(true);
    await submitVote(selectedOption);
    setIsSubmitting(false);
  };

  return (
    <ModalShell open={!!activePoll} onClose={() => {}} title="Community Poll">
      <div className="flex flex-col items-center py-2 text-center">
        <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <PieChart size={28} />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-foreground">{activePoll.question}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Please cast your vote to help the society make a decision.
        </p>

        <div className="mt-5 w-full space-y-2.5">
          {activePoll.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full rounded-2xl border p-3.5 text-sm font-medium transition-colors ${
                selectedOption === idx
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/60 bg-card text-foreground hover:border-border"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleVote}
          disabled={selectedOption === null || isSubmitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit Vote"}
        </motion.button>
      </div>
    </ModalShell>
  );
}
