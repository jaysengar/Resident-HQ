import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Clock, X } from "lucide-react";
import { getSocietyPlan } from "@/lib/api/api";

interface SubscriptionGuardProps {
  children: ReactNode;
  colonySlug: string;
  role?: "manager" | "resident" | "guard";
}

export function SubscriptionGuard({
  children,
  colonySlug,
  role = "resident",
}: SubscriptionGuardProps) {
  const [status, setStatus] = useState<
    "loading" | "active" | "expiring_soon" | "expired"
  >("loading");
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [societyId, setSocietyId] = useState("");

  useEffect(() => {
    getSocietyPlan()
      .then((data) => {
        setSocietyId(data.id);
        if (!data.subscription_expires_at) {
          setStatus("active");
          return;
        }

        const expiryDate = new Date(data.subscription_expires_at);
        const now = new Date();
        const diffMs = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        setDaysUntilExpiry(diffDays);

        if (diffDays <= 0) {
          setStatus("expired");
        } else if (diffDays <= 7) {
          setStatus("expiring_soon");
        } else {
          setStatus("active");
        }
      })
      .catch(() => {
        // If we can't fetch plan data, let the user through
        setStatus("active");
      });
  }, [colonySlug]);

  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
        />
      </div>
    );
  }

  // Expired — full block
  if (status === "expired") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertTriangle size={36} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
            Subscription Expired
          </h1>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
            {role === "manager" ? (
              <>
                Your society's subscription has expired. Please renew to continue
                using the platform.
              </>
            ) : (
              <>
                Your society's subscription has expired. Please contact your
                society manager to renew the subscription.
              </>
            )}
          </p>

          {role === "manager" ? (
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Redirect to the payment/renewal flow
                  import("@/lib/api/payment.functions").then(
                    ({ initiateSubscriptionPayment }) => {
                      initiateSubscriptionPayment(societyId).catch(() => {});
                    }
                  );
                }}
                className="w-full max-w-xs mx-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold text-sm shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all"
              >
                Renew Subscription
              </button>
              <p className="text-xs text-zinc-600">
                You'll be redirected to our secure payment portal
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 max-w-sm mx-auto">
              <div className="flex items-center gap-3 text-left">
                <Shield size={20} className="text-violet-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Contact Manager
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Your society manager can renew the subscription from the
                    Manager Portal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Expiring soon — render children + warning banner
  return (
    <>
      <AnimatePresence>
        {status === "expiring_soon" && !bannerDismissed && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="sticky top-0 z-[70] bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-xl text-white px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <Clock size={16} className="shrink-0" />
            <span>
              Subscription expires in{" "}
              <strong>{daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}</strong>.
              {role === "manager"
                ? " Please renew to avoid service interruption."
                : " Contact your manager to renew."}
            </span>
            <button
              onClick={() => setBannerDismissed(true)}
              className="ml-auto shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
