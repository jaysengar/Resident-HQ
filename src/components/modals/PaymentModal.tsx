import { useState } from "react";
import { motion } from "framer-motion";
import { CircleNotch, QrCode, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ModalShell } from "./ModalShell";
import { useApp } from "@/context/AppContext";

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentModal({ open, onClose, bill }: { open: boolean; onClose: () => void; bill?: any }) {
  const { currentUser, setBalance, addTransaction, refreshBills } = useApp();
  const [processing, setProcessing] = useState(false);

  const confirm = async () => {
    setProcessing(true);
    try {
      const amount = bill ? Number(bill.amount) : currentUser.balance;
      const { createRazorpayOrder, payBill } = await import("@/lib/api/api");
      const { serverVerifyRazorpayPayment } = await import("@/lib/api/payment.functions");
      
      const orderData = await createRazorpayOrder(amount);

      const handleSuccess = async (response?: any) => {
        if (!orderData.mocked && response) {
          // Verify payment success on backend
          await serverVerifyRazorpayPayment({
            data: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              societyId: currentUser.society_id,
            }
          });
        }

        // Record payment
        if (bill) {
          await payBill(bill.id, amount, "Razorpay");
        }
        addTransaction({
          title: bill?.title || "Maintenance Dues",
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          method: "Razorpay",
          amount: amount.toLocaleString("en-IN"),
        });
        refreshBills();
        toast.success("Payment successful!");
        onClose();
      };

      if (orderData.mocked) {
        console.warn("⚠️ Mock mode active. Simulating payment without Razorpay popup.");
        await handleSuccess();
        return;
      }

      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        throw new Error("Razorpay SDK failed to load");
      }

      const options = {
        key: orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Resident HQ",
        description: bill?.title || "Payment Dues",
        order_id: orderData.orderId,
        handler: handleSuccess,
        prefill: {
          name: currentUser.name,
          email: "resident@example.com",
        },
        theme: {
          color: "#0f172a", // Primary brand color
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (e: any) {
      toast.error("Payment failed", { description: e.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Pay via UPI">
      <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
        <div className="mx-auto grid h-44 w-44 place-items-center rounded-2xl bg-gradient-to-br from-secondary to-accent">
          <QrCode size={120} weight="regular" className="text-foreground" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Scan with any UPI app or tap below</p>
        <p className="mt-2 text-2xl font-bold text-foreground">
          ₹{bill ? Number(bill.amount).toLocaleString("en-IN") : currentUser.balance.toLocaleString("en-IN")}
        </p>
        <p className="text-[11px] text-muted-foreground">residenthq@upi • Flat {currentUser.flat}</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={confirm}
        disabled={processing}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {processing ? (
          <>
            <CircleNotch size={16} className="animate-spin" /> Processing…
          </>
        ) : (
          <>
            <ShieldCheck size={16} weight="fill" /> Pay with Razorpay
          </>
        )}
      </motion.button>
    </ModalShell>
  );
}
