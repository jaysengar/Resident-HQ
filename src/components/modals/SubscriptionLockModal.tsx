import { motion } from "framer-motion";
import { Lock, CreditCard, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { createRazorpayOrder } from "@/lib/api/api";
import { serverRenewSubscription } from "@/lib/api/payment.functions";
import { toast } from "sonner";

interface Props {
  societyId: string;
  onRenewSuccess: (newExpiry: string) => void;
}

export function SubscriptionLockModal({ societyId, onRenewSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRenew = async () => {
    setLoading(true);
    try {
      // 1. Create order for 5000 (example fixed renewal rate)
      const orderData = await createRazorpayOrder(5000);

      // TEMPORARILY BYPASSING RAZORPAY FOR TESTING
      const { newExpiry } = await serverRenewSubscription({ data: { societyId } });
      toast.success("Subscription Renewed!");
      onRenewSuccess(newExpiry);
      
      /* UNCOMMENT FOR REAL RAZORPAY
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Resident HQ",
        description: "Subscription Renewal",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // In a real app, verify first: await serverVerifyRazorpayPayment(...)
          const { newExpiry } = await serverRenewSubscription({ data: { societyId } });
          toast.success("Subscription Renewed Successfully!");
          onRenewSuccess(newExpiry);
        },
        theme: { color: "#6d28d9" }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      */
    } catch (err: any) {
      toast.error(err.message || "Failed to renew subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-[#111] shadow-2xl shadow-rose-900/20"
      >
        <div className="bg-rose-500/10 p-8 text-center border-b border-white/5">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
            <ShieldAlert size={32} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Subscription Expired</h2>
          <p className="text-rose-200/70 text-sm">
            Your 1-month validity has ended. Manager Dashboard access has been temporarily blocked.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Lock size={16} className="text-zinc-400" />
              <span className="text-sm font-bold text-white">Features Locked</span>
            </div>
            <ul className="text-xs text-zinc-500 space-y-1 ml-7">
              <li>• Resident & Flat Management</li>
              <li>• Helpdesk Ticketing</li>
              <li>• Dues & Collection Automation</li>
            </ul>
          </div>

          <button
            onClick={handleRenew}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <CreditCard size={18} />
                Renew for ₹5,000 / month
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
