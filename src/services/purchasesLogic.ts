/**
 * PURE premium-entitlement logic — no native imports, fully unit-testable.
 *
 * The app gates on the RevenueCat ENTITLEMENT (`pro`), never on a specific
 * Google Play product id. The entitlement is granted by any premium plan:
 * monthly or yearly subscription, or the non-consumable Lifetime Pass.
 */

/** The RevenueCat entitlement identifier every product grants. */
export const ENTITLEMENT_ID = 'pro';

/**
 * The purchasable plans. Ids deliberately match RevenueCat's standard package
 * accessors on an offering (`offering.monthly` / `.annual` / `.lifetime`,
 * i.e. dashboard packages `$rc_monthly` / `$rc_annual` / `$rc_lifetime`).
 */
export type PlanId = 'monthly' | 'annual' | 'lifetime';

export const PLAN_IDS: PlanId[] = ['monthly', 'annual', 'lifetime'];

/** Minimal shape of RevenueCat's CustomerInfo that we rely on. */
export interface CustomerInfoLike {
  entitlements: { active: Record<string, unknown> };
  activeSubscriptions?: readonly string[];
}

export interface PremiumOwnership {
  kind: 'subscription' | 'lifetime' | 'unknown';
  productIdentifier: string | null;
  productPlanIdentifier: string | null;
  store: string | null;
  hasActiveSubscription: boolean;
}

export interface PremiumAccess {
  unlocked: boolean;
  ownership: PremiumOwnership | null;
}

/** Store-confirmed ownership only; the local unlock flag cannot identify a plan. */
export function premiumAccess(info: CustomerInfoLike | null | undefined): PremiumAccess {
  const entitlement = info?.entitlements?.active?.[ENTITLEMENT_ID] as {
    productIdentifier?: string; productPlanIdentifier?: string | null; expirationDate?: string | null; store?: string;
  } | undefined;
  if (!entitlement) return { unlocked: false, ownership: null };
  const kind = entitlement.expirationDate === null ? 'lifetime' : typeof entitlement.expirationDate === 'string' ? 'subscription' : 'unknown';
  return {
    unlocked: true,
    ownership: {
      kind,
      productIdentifier: entitlement.productIdentifier ?? null,
      productPlanIdentifier: entitlement.productPlanIdentifier ?? null,
      store: entitlement.store ?? null,
      hasActiveSubscription: kind === 'subscription' || !!info?.activeSubscriptions?.length,
    },
  };
}

/** Android base plans must be compared as product:basePlan, not product alone. */
export function ownedProductIdentifier(ownership: PremiumOwnership): string | null {
  const id = ownership.productIdentifier;
  return id && ownership.productPlanIdentifier && !id.includes(':') ? `${id}:${ownership.productPlanIdentifier}` : id;
}

export function ownedPlan(
  ownership: PremiumOwnership | null | undefined,
  products: Partial<Record<PlanId, { productIdentifier?: string | null }>> | null | undefined,
): PlanId | 'unknown' | null {
  if (!ownership) return null;
  if (ownership.kind === 'lifetime') return 'lifetime';
  const identifier = ownedProductIdentifier(ownership);
  if (!identifier) return 'unknown';
  return PLAN_IDS.find((plan) => products?.[plan]?.productIdentifier === identifier) ?? 'unknown';
}

export function upgradePlans(ownership: PremiumOwnership | null | undefined, plan: ReturnType<typeof ownedPlan>): PlanId[] {
  if (!ownership || ownership.kind !== 'subscription' || plan === 'lifetime') return [];
  // An old subscription absent from today's offering can still buy Lifetime.
  return plan === 'monthly' ? ['annual', 'lifetime'] : ['lifetime'];
}

/** Whether the Pro entitlement is currently active. */
export function entitlementActive(info: CustomerInfoLike | null | undefined): boolean {
  return !!info?.entitlements?.active?.[ENTITLEMENT_ID];
}

/**
 * A store transaction is not an unlock until RevenueCat confirms the `pro`
 * entitlement. CustomerInfo returned directly from the purchase normally has
 * it; one refresh covers delayed entitlement propagation without ever telling
 * the player that an unconfirmed purchase unlocked Premium.
 */
export async function confirmPurchasedEntitlement(
  purchasedInfo: CustomerInfoLike | null | undefined,
  refresh: () => Promise<CustomerInfoLike | null | undefined>,
): Promise<boolean> {
  if (entitlementActive(purchasedInfo)) return true;
  try {
    return entitlementActive(await refresh());
  } catch {
    return false;
  }
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'unavailable' | 'activation_error' | 'error';

export interface AnnualSubscriptionValue {
  perMonth: number;
  savingsPercent: number;
}

/** Compares one annual payment with twelve monthly payments. */
export function annualSubscriptionValue(annualPrice: number, monthlyPrice: number): AnnualSubscriptionValue | null {
  if (!Number.isFinite(annualPrice) || !Number.isFinite(monthlyPrice) || annualPrice <= 0 || monthlyPrice <= 0) {
    return null;
  }
  return {
    perMonth: annualPrice / 12,
    savingsPercent: Math.max(0, Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)),
  };
}

/**
 * Merge a fresh entitlement reading into the locally cached unlock flag.
 *
 *  - `true`  -> unlock (a lifetime purchase or an active subscription).
 *  - `false` -> revoke (matters only for future lapsed subscriptions; a
 *               lifetime purchase always reads back `true`).
 *  - `null`  -> store unavailable: retain the last confirmed access state.
 */
export function mergeEntitlement(cached: boolean, fresh: boolean | null): boolean {
  return fresh ?? cached;
}

/** Minimal shape of a RevenueCat offering that we rely on. */
export interface OfferingLike {
  monthly?: unknown;
  annual?: unknown;
  lifetime?: unknown;
}

/**
 * Pick a plan's package from RevenueCat's current offering. Never falls back
 * to a different package: a missing plan means that plan is not for sale.
 */
export function pickPackage(offering: OfferingLike | null | undefined, plan: PlanId): unknown | null {
  return offering?.[plan] ?? null;
}

export function isProductionRevenueCatKey(key: string | null | undefined, platform: 'android' | 'ios'): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length === 0) return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('test_') || lower.startsWith('rc_test_')) return false;
  return platform === 'android' ? trimmed.startsWith('goog_') : trimmed.startsWith('appl_');
}
