export const FREE_PLAN_MAX_SHEETS = 3;
export const FREE_PLAN_MAX_LABELS = 20;

export function isProUser(subscriptionStatus?: string | null) {
  return subscriptionStatus === "active" || subscriptionStatus === "trialing";
}

export function getPlanName(subscriptionStatus?: string | null) {
  return isProUser(subscriptionStatus) ? "pro" : "free";
}