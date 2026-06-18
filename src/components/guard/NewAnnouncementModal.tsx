import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, Send } from "lucide-react";
import { useGuard } from "@/context/GuardContext";
import { sendAnnouncement } from "@/lib/api/api";
import { toast } from "sonner";

export function NewAnnouncementModal() {
  const { modalOpen, modalType, setModalOpen } = useGuard();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = modalOpen && modalType === "Announcement";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    try {
      await sendAnnouncement({
        title,
        body,
        authorRole: "guard",
      });
      toast.success("Announcement sent to residents!");
      setModalOpen(false);
      setTitle("");
      setBody("");
    } catch (err) {
      toast.error("Failed to send announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[2rem] bg-background p-6 shadow-2xl max-w-[480px] mx-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-purple-500/10 text-purple-600">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">New Announcement</h3>
                  <p className="text-xs text-muted-foreground">Broadcast to all residents</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water Supply, Lost Item"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Message</label>
                <textarea
                  required
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the announcement details here..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-70"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Send size={18} />
                    Broadcast Now
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
