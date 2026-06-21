// ─── Plan-Based Feature Gating ───
// Defines which features are available for each subscription plan.

export type PlanId = "basic" | "pro" | "enterprise";

export type FeatureId =
  | "dashboard"
  | "residents"
  | "guards"
  | "notices"
  | "dues"
  | "helpdesk"
  | "messages"
  | "marketplace"
  | "settings"
  | "branding"
  | "bulk_reminders"
  | "elections"
  | "documents"
  | "audit_logs"
  | "priority_support";

export interface FeatureMeta {
  id: FeatureId;
  label: string;
  description: string;
  requiredPlan: PlanId;
}

const PLAN_HIERARCHY: Record<PlanId, number> = {
  basic: 1,
  pro: 2,
  enterprise: 3,
};

// All features with their minimum required plan
export const FEATURE_REGISTRY: FeatureMeta[] = [
  // Basic (available to all)
  { id: "dashboard", label: "Dashboard", description: "Overview of your society", requiredPlan: "basic" },
  { id: "residents", label: "Flats & Residents", description: "Manage residents and flats", requiredPlan: "basic" },
  { id: "guards", label: "Security Guards", description: "Guard management & visitor tracking", requiredPlan: "basic" },
  { id: "notices", label: "Notice Board", description: "Digital announcements to residents", requiredPlan: "basic" },
  { id: "settings", label: "Settings", description: "Razorpay keys & basic settings", requiredPlan: "basic" },

  // Pro features
  { id: "dues", label: "Dues Collection", description: "Online payment collection with Razorpay", requiredPlan: "pro" },
  { id: "helpdesk", label: "Helpdesk Tickets", description: "Resident complaint & issue tracking", requiredPlan: "pro" },
  { id: "messages", label: "Direct Messaging", description: "1-on-1 chat with residents", requiredPlan: "pro" },
  { id: "marketplace", label: "Community Hub", description: "Buy/Sell marketplace & resident feed", requiredPlan: "pro" },
  { id: "branding", label: "Custom Branding", description: "Logo, colors, and branded colony page", requiredPlan: "pro" },

  // Enterprise features
  { id: "bulk_reminders", label: "Bulk Reminders", description: "1-click SMS & push to defaulters", requiredPlan: "enterprise" },
  { id: "elections", label: "Elections & Polling", description: "Secure in-app voting for RWA", requiredPlan: "enterprise" },
  { id: "documents", label: "Document Vault", description: "Upload bylaws, audits & meeting minutes", requiredPlan: "enterprise" },
  { id: "audit_logs", label: "Audit Logs", description: "Complete digital footprint of all actions", requiredPlan: "enterprise" },
  { id: "priority_support", label: "Priority Support", description: "Dedicated WhatsApp support line", requiredPlan: "enterprise" },
];

/**
 * Check if a feature is available for a given plan
 */
export function isFeatureAvailable(featureId: FeatureId, currentPlan: PlanId): boolean {
  const feature = FEATURE_REGISTRY.find((f) => f.id === featureId);
  if (!feature) return false;
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[feature.requiredPlan];
}

/**
 * Get the required plan for a feature
 */
export function getRequiredPlan(featureId: FeatureId): PlanId | null {
  const feature = FEATURE_REGISTRY.find((f) => f.id === featureId);
  return feature?.requiredPlan ?? null;
}

/**
 * Get all features available for a plan
 */
export function getAvailableFeatures(plan: PlanId): FeatureMeta[] {
  return FEATURE_REGISTRY.filter(
    (f) => PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[f.requiredPlan]
  );
}

/**
 * Get all locked features for a plan
 */
export function getLockedFeatures(plan: PlanId): FeatureMeta[] {
  return FEATURE_REGISTRY.filter(
    (f) => PLAN_HIERARCHY[plan] < PLAN_HIERARCHY[f.requiredPlan]
  );
}

/**
 * Get display name for a plan
 */
export function getPlanDisplayName(plan: PlanId): string {
  switch (plan) {
    case "basic": return "Digital Security";
    case "pro": return "Smart Operations";
    case "enterprise": return "Premium Automation";
    default: return plan;
  }
}

/**
 * Get plan price
 */
export function getPlanPrice(plan: PlanId): number {
  switch (plan) {
    case "basic": return 5000;
    case "pro": return 10000;
    case "enterprise": return 15000;
    default: return 0;
  }
}

/**
 * Normalize plan string from DB to PlanId
 */
export function normalizePlan(plan: string | undefined | null): PlanId {
  if (!plan) return "basic";
  const lower = plan.toLowerCase();
  if (lower === "pro" || lower === "smart operations") return "pro";
  if (lower === "enterprise" || lower === "premium automation") return "enterprise";
  return "basic";
}
