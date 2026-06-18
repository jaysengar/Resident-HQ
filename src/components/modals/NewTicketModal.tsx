import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ModalShell } from "./ModalShell";
import { useApp } from "@/context/AppContext";

const CATEGORIES = ["Plumbing", "Electrical", "Carpentry", "Cleaning", "Pest Control", "Other"];

export function NewTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTicket } = useApp();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!description.trim()) {
      toast.error("Please add a description");
      return;
    }
    addTicket({ title: category, category, description });
    toast.success("Ticket raised", { description: `${category} request submitted` });
    setDescription("");
    setCategory(CATEGORIES[0]);
    onClose();
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Raise a Ticket">
      <label className="text-xs font-medium text-muted-foreground">Category</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-xs font-medium text-muted-foreground">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue…"
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        className="mt-4 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        Submit Ticket
      </motion.button>
    </ModalShell>
  );
}
