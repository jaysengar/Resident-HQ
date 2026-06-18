import { motion, AnimatePresence } from "framer-motion";
import { Lock, Crown, Zap, ArrowRight, X, ShieldCheck } from "lucide-react";
import type { PlanId, FeatureMeta } from "@/lib/planGating";
import { getPlanDisplayName, getPlanPrice } from "@/lib/planGating";

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
  feature: FeatureMeta;
  currentPlan: PlanId;
}

const PLAN_ICONS: Record<PlanId, typeof ShieldCheck> = {
  basic: ShieldCheck,
  pro: Zap,
  enterprise: Crown,
};

const PLAN_COLORS: Record<PlanId, { text: string; bg: string; border: string; gradient: string }> = {
  basic: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", gradient: "from-emerald-500 to-teal-600" },
  pro: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", gradient: "from-blue-500 to-indigo-600" },
  enterprise: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", gradient: "from-amber-500 to-orange-600" },
};

export function UpgradePlanModal({ open, onClose, feature, currentPlan }: UpgradePlanModalProps) {
  const requiredPlan = feature.requiredPlan;
  const PlanIcon = PLAN_ICONS[requiredPlan];
  const colors = PLAN_COLORS[requiredPlan];
  const currentColors = PLAN_COLORS[currentPlan];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${colors.gradient} p-6 pb-10`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Lock size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Feature Locked</p>
                  <p className="text-white text-xl font-black">{feature.label}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 -mt-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <p className="text-gray-400 text-sm">
                  This feature requires the <span className={`font-bold ${colors.text}`}>{getPlanDisplayName(requiredPlan)}</span> plan.
                </p>
              </div>

              {/* Plan comparison */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex-1 p-4 rounded-2xl border ${currentColors.border} ${currentColors.bg}`}>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Current</p>
                  <p className={`font-bold ${currentColors.text}`}>{getPlanDisplayName(currentPlan)}</p>
                  <p className="text-white font-black text-lg">₹{getPlanPrice(currentPlan).toLocaleString("en-IN")}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
                </div>

                <ArrowRight size={20} className="text-gray-500 shrink-0" />

                <div className={`flex-1 p-4 rounded-2xl border ${colors.border} ${colors.bg} relative`}>
                  <div className={`absolute -top-2 -right-2 ${colors.bg} ${colors.text} text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${colors.border}`}>
                    Upgrade
                  </div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Required</p>
                  <p className={`font-bold ${colors.text}`}>{getPlanDisplayName(requiredPlan)}</p>
                  <p className="text-white font-black text-lg">₹{getPlanPrice(requiredPlan).toLocaleString("en-IN")}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
                </div>
              </div>

              <button
                onClick={() => {
                  window.open("https://wa.me/919999999999?text=I%20want%20to%20upgrade%20my%20society%20plan", "_blank");
                  onClose();
                }}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 bg-gradient-to-r ${colors.gradient} text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]`}
              >
                <PlanIcon size={18} />
                Contact Sales to Upgrade
              </button>

              <p className="text-center text-xs text-gray-600 mt-3">
                Our team will help you upgrade seamlessly
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
