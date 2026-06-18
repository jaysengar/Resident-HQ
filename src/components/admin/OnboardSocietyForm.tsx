import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Key,
  Mail,
  CheckCircle,
  Loader2,
  Building2,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PROVISIONING_STEPS = [
  { label: "Creating Database Tenant...", icon: Database, duration: 1200 },
  { label: "Generating Admin Credentials...", icon: Key, duration: 1000 },
  { label: "Sending Welcome Email...", icon: Mail, duration: 800 },
];

export function OnboardSocietyForm({ onComplete }: { onComplete: () => void }) {
  const { handleOnboard } = useAdmin();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [plan, setPlan] = useState<string>("Pro");
  const [provisioning, setProvisioning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    import("@/lib/api/api").then(({ getSubscriptionPlans }) => {
      getSubscriptionPlans().then((data) => {
        if (data && data.length > 0) {
          setPlans(data);
          setPlan(data[1]?.id || data[0].id); // default to Pro or first plan
        }
      });
    });
  }, []);

  const handleSubmit = async () => {
    if (!name || !address || !adminEmail || !plan || plans.length === 0) return;
    
    const selectedPlan = plans.find(p => p.id === plan);
    if (!selectedPlan) {
      toast.error("Invalid plan selected");
      return;
    }

    setProvisioning(true);

    try {
      const { createRazorpayOrder } = await import("@/lib/api/api");
      const { serverVerifyRazorpayPayment } = await import("@/lib/api/payment.functions");
      
      const amount = selectedPlan.price_inr;
      const orderData = await createRazorpayOrder(amount);

      const proceedWithOnboarding = async () => {
        // Animate provisioning steps
        for (let i = 0; i < PROVISIONING_STEPS.length; i++) {
          setCurrentStep(i);
          await new Promise((r) => setTimeout(r, PROVISIONING_STEPS[i].duration));
        }

        // Actually call the API
        await handleOnboard({
          name,
          address,
          totalFlats: selectedPlan.max_flats,
          adminEmail,
          subscriptionPlan: plan as any,
        });

        setDone(true);
        setTimeout(() => {
          setName("");
          setAddress("");
          setAdminEmail("");
          setPlan("Pro");
          setProvisioning(false);
          setCurrentStep(-1);
          setDone(false);
          onComplete();
        }, 2000);
      };


      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        throw new Error("Razorpay SDK failed to load");
      }

      const options = {
        key: orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Resident HQ",
        description: `Subscription: ${selectedPlan.id} Plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // Verify payment success on backend
          await serverVerifyRazorpayPayment({
            data: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }
          });
          await proceedWithOnboarding();
        },
        modal: {
          ondismiss: function() {
            setProvisioning(false);
            toast.error("Payment cancelled");
          }
        },
        prefill: {
          name: "Admin",
          email: adminEmail,
        },
        theme: {
          color: "#8b5cf6", // Violet color for admin
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (e: any) {
      toast.error("Failed to start onboarding", { description: e.message });
      setProvisioning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <h3 className="text-lg font-bold text-foreground mb-4">Onboard New Society</h3>

      {/* Provisioning Animation */}
      {provisioning ? (
        <div className="py-8 space-y-6">
          {PROVISIONING_STEPS.map((step, i) => {
            const isActive = currentStep === i;
            const isComplete = currentStep > i;
            const isPending = currentStep < i;

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-4"
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                    isComplete
                      ? "bg-success/20 text-success"
                      : isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle size={18} />
                  ) : isActive ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <step.icon size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isComplete
                        ? "text-success"
                        : isActive
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {isComplete ? step.label.replace("...", " ✓") : step.label}
                  </p>
                  {isActive && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: step.duration / 1000 }}
                      className="mt-1.5 h-1 w-full origin-left rounded-full bg-primary/30"
                    >
                      <div className="h-full rounded-full bg-primary animate-shimmer" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Done */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl bg-success/15 p-4"
              >
                <CheckCircle size={24} className="text-success" />
                <div>
                  <p className="text-sm font-bold text-success">Society Onboarded Successfully!</p>
                  <p className="text-xs text-success/80">"{name}" is now live on the platform.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Form */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Society Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Society Name</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Building2 size={14} className="text-muted-foreground shrink-0" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prestige Sunrise Park"
                  className="flex-1 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Address</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <MapPin size={14} className="text-muted-foreground shrink-0" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sector 12, Noida"
                  className="flex-1 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Admin Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Admin Email</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Mail size={14} className="text-muted-foreground shrink-0" />
                <input
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  type="email"
                  placeholder="admin@society.com"
                  className="flex-1 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subscription Plan</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {plans.map((p) => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPlan(p.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    plan === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-accent/30"
                  }`}
                >
                  <p
                    className={`text-sm font-bold ${plan === p.id ? "text-primary" : "text-foreground"}`}
                  >
                    {p.id}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">₹{p.price_inr.toLocaleString("en-IN")}/mo</p>
                  <p className="text-[10px] text-muted-foreground">Up to {p.max_flats} flats</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!name || !address || !adminEmail}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50 transition-shadow hover:shadow-xl"
          >
            {provisioning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CreditCard size={16} />
            )}
            Pay & Start Onboarding
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
