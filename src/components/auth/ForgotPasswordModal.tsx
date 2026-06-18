import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, KeyRound, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function ForgotPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setProcessing(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      
      if (error) throw error;
      
      setSent(true);
      toast.success("Password reset email sent!");
    } catch (e: any) {
      toast.error("Failed to send reset email", { description: e.message });
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative z-50 w-full max-w-sm rounded-[2rem] bg-card p-6 shadow-2xl border border-border"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X size={18} />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound size={24} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {sent 
              ? "Check your email for the reset link."
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={processing || !email}
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {processing ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
            </motion.button>
          </form>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-sm font-semibold text-foreground"
          >
            Close
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
