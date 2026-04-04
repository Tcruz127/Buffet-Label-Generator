export const FREE_PLAN_MAX_SHEETS = 3;
export const FREE_PLAN_MAX_LABELS = 20;

export function isProUser(subscriptionStatus?: string | null) {
  return subscriptionStatus === "active" || subscriptionStatus === "trialing";
}

export function getPlanName(subscriptionStatus?: string | null) {
  return isProUser(subscriptionStatus) ? "pro" : "free";
}

type MembershipWithOwner = {
  role: string;
  organization: {
    members: {
      role: string;
      user: { subscriptionStatus?: string | null };
    }[];
  };
};

/**
 * Returns true if the user has Pro access either through their own
 * subscription or through an org whose owner has an active subscription.
 */
export function isOrgProUser(
  subscriptionStatus?: string | null,
  memberships?: MembershipWithOwner[]
) {
  if (isProUser(subscriptionStatus)) return true;

  if (!memberships || memberships.length === 0) return false;

  return memberships.some((membership) =>
    membership.organization.members.some(
      (m) => m.role === "owner" && isProUser(m.user.subscriptionStatus)
    )
  );
}