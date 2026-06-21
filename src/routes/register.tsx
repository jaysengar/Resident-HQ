import { createFileRoute, Link } from "@tanstack/react-router";
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
  Users,
  Shield,
  Copy,
  ArrowRight,
  ShieldCheck,
  Zap,
  Crown,
  Lock,
  Check,
  Wallet,
  Bell,
  MessageSquare,
  FileText,
  Vote,
  Headphones,
  ClipboardList,
  ShoppingBag,
  Megaphone,
  Truck,
  DoorOpen,
  UserCheck,
  LayoutDashboard,
  Sparkles,
  Upload,
  Palette,
  Image,
  Phone,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { serverPublicOnboardSociety, serverSaveBranding } from "@/lib/api/admin.functions";

export const Route = createFileRoute("/register")({
  component: PublicRegisterPage,
});

const PROVISIONING_STEPS = [
  { label: "Provisioning SaaS Tenant...", icon: Database, duration: 1500 },
  { label: "Applying White-label Theme...", icon: Building2, duration: 1000 },
  { label: "Generating Admin Credentials...", icon: Key, duration: 1200 },
];

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Plan Data ───
const PLAN_DETAILS = [
  {
    id: "Basic",
    name: "Digital Security",
    tagline: "Safety & Communication First",
    price: 5000,
    maxFlats: 100,
    icon: ShieldCheck,
    color: "gray",
    gradient: "from-gray-600 to-gray-800",
    glowColor: "transparent",
    borderColor: "border-gray-200",
    bgColor: "bg-white",
    textColor: "text-gray-900",
    badgeBg: "bg-gray-50",
    features: [
      { icon: DoorOpen, text: "Guard App — Visitor Entry/Exit" },
      { icon: Truck, text: "Delivery & Cab Tracking" },
      { icon: Bell, text: "Gate Alerts — Approve / Deny" },
      { icon: UserCheck, text: "Pre-approve Visitors" },
      { icon: LayoutDashboard, text: "Basic Manager Dashboard" },
      { icon: Megaphone, text: "Digital Notice Board" },
    ],
    locked: [
      "Online Payment Collection",
      "Dues & Ledger Tracking",
      "Marketplace & Community Hub",
      "Helpdesk & Ticketing",
      "Bulk Reminders & SMS",
      "Elections & Polling",
    ],
  },
  {
    id: "Pro",
    name: "Smart Operations",
    tagline: "Financial Tracking & Issue Resolution",
    price: 10000,
    maxFlats: 300,
    icon: Zap,
    color: "red",
    gradient: "from-brand to-brand-hover",
    glowColor: "rgba(229,9,20,0.3)",
    borderColor: "border-brand/50",
    bgColor: "bg-white",
    textColor: "text-gray-900",
    badgeBg: "bg-brand/20",
    popular: true,
    features: [
      { icon: ShieldCheck, text: "Everything in Digital Security" },
      { icon: Wallet, text: "Razorpay Payment Integration" },
      { icon: ClipboardList, text: "Paid/Unpaid Ledger Dashboard" },
      { icon: Headphones, text: "Helpdesk Ticketing System" },
      { icon: ShoppingBag, text: "Buy/Sell Marketplace" },
      { icon: MessageSquare, text: "Resident-to-Resident Feed" },
      { icon: Bell, text: "1-Click Bulk SMS & Push Reminders" },
      { icon: Vote, text: "Secure In-App Elections & Polling" },
      { icon: FileText, text: "Document Vault — Bylaws, Audits" },
      { icon: Shield, text: "Full Audit Logs & Digital Footprint" },
    ],
    locked: [],
  },
];

function PublicRegisterPage() {
  const [step, setStep] = useState<"plans" | "form" | "branding" | "done">("plans");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<typeof PLAN_DETAILS[0] | null>(null);

  const [provisioning, setProvisioning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [brandingToken, setBrandingToken] = useState<string>("");

  // Branding state (Pro/Enterprise only)
  const [brandingLogo, setBrandingLogo] = useState("");
  const [brandingBanner, setBrandingBanner] = useState("");
  const [brandingTagline, setBrandingTagline] = useState("");
  const [brandingPrimaryColor, setBrandingPrimaryColor] = useState("#6d28d9");
  const [brandingSecondaryColor, setBrandingSecondaryColor] = useState("#4f46e5");
  const [brandingPhotos, setBrandingPhotos] = useState<string[]>([]);
  const [brandingPhone, setBrandingPhone] = useState("");
  const [brandingEmail, setBrandingEmail] = useState("");
  const [savingBranding, setSavingBranding] = useState(false);

  const handlePlanSelect = (plan: typeof PLAN_DETAILS[0]) => {
    setSelectedPlan(plan);
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !adminEmail || !selectedPlan) return;

    setProvisioning(true);

    try {
      const { createPublicRazorpayOrder } = await import("@/lib/api/payments");
      const orderData = await createPublicRazorpayOrder(selectedPlan.price);

      const proceedWithOnboarding = async () => {
        let stepInterval = setInterval(() => {
          setCurrentStep((prev) => {
            if (prev >= PROVISIONING_STEPS.length - 1) {
              clearInterval(stepInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 1500);

        const res = await serverPublicOnboardSociety({
          data: {
            name,
            address,
            totalFlats: selectedPlan.maxFlats,
            adminEmail,
            subscriptionPlan: selectedPlan.id,
          },
        });

        clearInterval(stepInterval);
        setCurrentStep(PROVISIONING_STEPS.length);
        setResult(res);
        if (res.brandingToken) {
          setBrandingToken(res.brandingToken);
        }

        if (selectedPlan.id === "Pro" || selectedPlan.id === "Enterprise") {
          setDone(false);
          setProvisioning(false);
          setStep("branding");
        } else {
          setProvisioning(false);
          setStep("done");
        }
      };

      const handleSuccess = async (response?: any) => {
        await proceedWithOnboarding();
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
        description: `Onboarding - ${selectedPlan.name} Plan`,
        order_id: orderData.orderId,
        handler: handleSuccess,
        prefill: {
          name: name,
          email: adminEmail,
        },
        theme: {
          color: "#8b5cf6",
        },
        modal: {
          ondismiss: () => {
            setProvisioning(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      toast.error(err.message || "Failed to start onboarding");
      setProvisioning(false);
      setCurrentStep(-1);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-gray-900 selection:bg-brand/30 font-sans">
      {/* Fixed Background */}
      <div className="fixed inset-0 pointer-events-none -z-10" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-3xl border-b border-gray-200 sticky top-0 z-50 bg-[#f0f4f8]/95 shadow-lg">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/textures/logo.png" alt="Resident HQ Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-black tracking-tight text-gray-900">Resident HQ</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
            Log in
          </Link>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {step === "plans" && (
          <motion.div
            key="plans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero */}
            <div className="text-center pt-16 pb-8 px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand mb-4">Pricing Plans</p>
                <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                  Choose Your{" "}
                  <span className="text-brand">
                    Growth Plan
                  </span>
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Start with security essentials, or unlock full automation. Every plan includes instant setup and dedicated infrastructure.
                </p>
              </motion.div>
            </div>

            {/* Plan Cards */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              {PLAN_DETAILS.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.15 }}
                  className={`relative rounded-3xl border ${p.borderColor} ${p.bgColor} backdrop-blur-xl overflow-hidden group`}
                  style={{ boxShadow: p.popular ? `0 0 60px ${p.glowColor}` : "none" }}
                >
                  {/* Popular Badge */}
                  {p.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-brand py-2 text-center">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-900">
                        ⚡ Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`p-8 ${p.popular ? "pt-14" : ""}`}>
                    {/* Plan Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${p.badgeBg} flex items-center justify-center border ${p.borderColor}`}>
                        <p.icon size={22} className={p.textColor} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${p.textColor} uppercase tracking-wider`}>{p.id}</p>
                        <p className="text-gray-900 font-black text-lg">{p.name}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-6">{p.tagline}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-gray-500 text-sm font-medium">/month</span>
                      </div>
                      <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold ${p.textColor} ${p.badgeBg} px-3 py-1.5 rounded-full border ${p.borderColor}`}>
                        <Users size={12} /> Up to {p.maxFlats} flats
                      </div>
                    </div>

                    {/* Included Features */}
                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">What's Included</p>
                      {p.features.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`w-7 h-7 rounded-lg ${p.badgeBg} flex items-center justify-center shrink-0`}>
                            <f.icon size={14} className={p.textColor} />
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{f.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Locked Features */}
                    {p.locked.length > 0 && (
                      <div className="space-y-2 mb-8 pt-4 border-t border-white/5">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-600 flex items-center gap-1.5">
                          <Lock size={10} /> Not Available
                        </p>
                        {p.locked.map((l, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                              <Lock size={12} className="text-gray-600" />
                            </div>
                            <span className="text-sm text-gray-600 font-medium line-through">{l}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {p.locked.length === 0 && (
                      <div className="mb-8 pt-4 border-t border-white/5">
                        <div className={`flex items-center gap-2 ${p.textColor} text-sm font-bold`}>
                          <Sparkles size={16} />
                          Everything unlocked — zero limits
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlanSelect(p)}
                      className={`w-full py-4 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all ${
                        p.popular
                          ? `bg-brand text-white shadow-lg hover:shadow-xl`
                          : "bg-[#1f1f1f] text-white hover:bg-[#2a2a2a] border border-gray-200"
                      }`}
                    >
                      Get Started
                      <ArrowRight size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center pb-16 px-6">
              <p className="text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-gray-900 font-bold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[calc(100vh-65px)]"
          >
            {/* Left Panel — Selected Plan Summary */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-gray-200">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />

              {selectedPlan && (
                <div className="relative z-10 w-full max-w-md p-8 mx-12 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-elevated">
                  <button
                    onClick={() => setStep("plans")}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-6 text-sm font-bold bg-white/50 px-3 py-1.5 rounded-full w-fit"
                  >
                    <ArrowRight size={16} className="rotate-180" />
                    Change Plan
                  </button>

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedPlan.gradient} flex items-center justify-center mb-5 shadow-[0_0_30px_${selectedPlan.glowColor}]`}>
                    <selectedPlan.icon size={24} className="text-white" />
                  </div>

                  <h2 className="text-3xl font-black mb-1">{selectedPlan.name}</h2>
                  <p className="text-brand font-bold text-base mb-1">{selectedPlan.id} Plan</p>
                  <p className="text-gray-700 text-sm mb-6">{selectedPlan.tagline}</p>

                  <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-black text-gray-900">₹{selectedPlan.price.toLocaleString("en-IN")}</span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedPlan.features.slice(0, 5).map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <Check size={14} className="text-brand" />
                          <span className="text-sm text-gray-700 font-medium">{f.text}</span>
                        </div>
                      ))}
                      {selectedPlan.features.length > 5 && (
                        <p className={`text-xs font-bold text-brand mt-3`}>
                          +{selectedPlan.features.length - 5} more features
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-gray-600 text-sm font-medium px-1">
                    <Users size={14} className="text-brand" />
                    Up to {selectedPlan.maxFlats} flats included
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex flex-col justify-center p-6 md:p-12 relative overflow-y-auto max-h-[calc(100vh-65px)]">
              {/* Mobile: show selected plan info */}
              {selectedPlan && (
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setStep("plans")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 text-sm font-bold"
                  >
                    <ArrowRight size={16} className="rotate-180" />
                    Change Plan
                  </button>
                  <div className={`p-4 rounded-2xl ${selectedPlan.bgColor} border ${selectedPlan.borderColor} flex items-center gap-4`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPlan.gradient} flex items-center justify-center shrink-0`}>
                      <selectedPlan.icon size={20} className="text-gray-900" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedPlan.name}</p>
                      <p className={`text-sm ${selectedPlan.textColor} font-bold`}>₹{selectedPlan.price.toLocaleString("en-IN")}/mo</p>
                    </div>
                  </div>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mx-auto relative z-10"
              >
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-black mb-2">Onboard Society</h2>
                  <p className="text-gray-600">Fill in your details to launch your workspace.</p>
                </div>

                {provisioning ? (
                  <div className="py-8 space-y-6">
                    {PROVISIONING_STEPS.map((s, i) => {
                      const isActive = currentStep === i;
                      const isComplete = currentStep > i;

                      return (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className="flex items-center gap-4"
                        >
                          <div
                            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors border ${
                              isComplete
                                ? "bg-brand/10 text-brand border-brand/20"
                                : isActive
                                  ? `${selectedPlan?.bgColor} ${selectedPlan?.textColor} ${selectedPlan?.borderColor}`
                                  : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle size={20} />
                            ) : isActive ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <s.icon size={20} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-base font-bold ${isComplete ? "text-brand" : isActive ? "text-gray-900" : "text-gray-500"}`}>
                              {isComplete ? s.label.replace("...", " ✓") : s.label}
                            </p>
                            {isActive && (
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: s.duration / 1000 }}
                                className={`mt-2 h-1.5 w-full origin-left rounded-full ${selectedPlan?.bgColor} overflow-hidden`}
                              >
                                <div className={`h-full w-full rounded-full bg-gradient-to-r ${selectedPlan?.gradient}`} />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    <AnimatePresence>
                      {done && result && step === "form" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-8 rounded-3xl border border-brand/30 bg-brand/5 p-8 text-center"
                        >
                           <Loader2 size={24} className="animate-spin text-brand mx-auto mb-4" />
                           <p className="text-brand font-bold">Redirecting...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Society Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Building2 size={18} className="text-gray-500" />
                          </div>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. Prestige Sunrise"
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Location</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MapPin size={18} className="text-gray-500" />
                          </div>
                          <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            placeholder="e.g. Sector 12, Noida"
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Admin Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-500" />
                        </div>
                        <input
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          type="email"
                          required
                          placeholder="admin@society.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!name || !address || !adminEmail}
                      className={`group w-full flex items-center justify-center gap-3 py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 bg-brand text-white shadow-lg`}
                    >
                      Pay ₹{selectedPlan?.price.toLocaleString("en-IN")} & Launch
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    <p className="text-center text-xs text-gray-600 mt-2">
                      Powered by Razorpay • Secure 256-bit encryption
                    </p>
                  </form>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === "branding" && result && (
          <motion.div
            key="branding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[calc(100vh-65px)] items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl relative overflow-hidden">
               {/* Decorative background */}
               <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${selectedPlan?.gradient} opacity-20 blur-3xl pointer-events-none`} />

               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                   <div>
                     <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                       <Sparkles className={selectedPlan?.textColor} /> Custom Branding
                     </h2>
                     <p className="text-gray-600">Set up your premium society page colors and details.</p>
                   </div>
                   <button
                     onClick={() => setStep("done")}
                     disabled={savingBranding}
                     className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                   >
                     Skip for now
                   </button>
                 </div>

                 <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-bold text-gray-600 mb-2">Tagline</label>
                       <input
                         value={brandingTagline}
                         onChange={(e) => setBrandingTagline(e.target.value)}
                         placeholder="A Premium Living Experience"
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-600 mb-2">Contact Phone</label>
                       <input
                         value={brandingPhone}
                         onChange={(e) => setBrandingPhone(e.target.value)}
                         placeholder="+91 98765 43210"
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                       />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-bold text-gray-600 mb-2">Primary Color</label>
                       <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                         <input
                           type="color"
                           value={brandingPrimaryColor}
                           onChange={(e) => setBrandingPrimaryColor(e.target.value)}
                           className="w-8 h-8 rounded cursor-pointer bg-transparent"
                         />
                         <input
                           value={brandingPrimaryColor}
                           onChange={(e) => setBrandingPrimaryColor(e.target.value)}
                           className="flex-1 bg-transparent text-sm font-mono focus:outline-none"
                         />
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-600 mb-2">Secondary Color</label>
                       <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                         <input
                           type="color"
                           value={brandingSecondaryColor}
                           onChange={(e) => setBrandingSecondaryColor(e.target.value)}
                           className="w-8 h-8 rounded cursor-pointer bg-transparent"
                         />
                         <input
                           value={brandingSecondaryColor}
                           onChange={(e) => setBrandingSecondaryColor(e.target.value)}
                           className="flex-1 bg-transparent text-sm font-mono focus:outline-none"
                         />
                       </div>
                     </div>
                   </div>

                   <button
                     onClick={async () => {
                       setSavingBranding(true);
                       try {
                         await serverSaveBranding({
                           data: {
                             brandingToken: brandingToken,
                             tagline: brandingTagline,
                             primary_color: brandingPrimaryColor,
                             secondary_color: brandingSecondaryColor,
                             contact_phone: brandingPhone,
                           }
                         });
                         toast.success("Branding saved!");
                         setStep("done");
                       } catch (e: any) {
                         toast.error("Failed to save branding");
                       } finally {
                         setSavingBranding(false);
                       }
                     }}
                     disabled={savingBranding}
                     className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${selectedPlan?.gradient} text-white mt-6`}
                   >
                     {savingBranding ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                     Save Branding & Continue
                   </button>
                 </div>
               </div>
            </div>
          </motion.div>
        )}

        {step === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[calc(100vh-65px)] items-center justify-center p-6"
          >
            <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 relative overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)]">
               <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-teal-500 flex items-center justify-center shadow-lg">
                  <CheckCircle size={28} className="text-gray-900" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">All Set! 🎉</p>
                  <p className="text-brand font-medium">Your workspace is ready.</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 space-y-5">
                <p className="text-xs font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Admin Credentials
                </p>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1 block">Manager Portal</span>
                    <span className="text-sm font-mono text-brand bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 break-all">
                      https://resident-nexus.com/{result.slug}/login
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1 block">Admin Email</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                      {result.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1 block">Account Setup</span>
                    <div className="flex items-start gap-3 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      <div className="mt-0.5"><ShieldCheck size={16} className="text-brand" /></div>
                      <p className="text-sm text-brand">
                        An invitation link has been sent to your email. Please check your inbox (and spam folder) to set your password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={`/${result.slug}/login`}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-sm font-bold text-white hover:bg-brand-hover transition-all shadow-[0_0_20px_rgba(0,102,204,0.2)]"
              >
                Go to Login <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
