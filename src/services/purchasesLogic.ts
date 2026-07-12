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
}

/** Whether the Pro entitlement is currently active. */
export function entitlementActive(info: CustomerInfoLike | null | undefined): boolean {
  return !!info?.entitlements?.active?.[ENTITLEMENT_ID];
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'unavailable' | 'error';

/**
 * Merge a fresh entitlement reading into the locally cached unlock flag.
 *
 *  - `true`  -> unlock (a lifetime purchase or an active subscription).
 *  - `false` -> revoke (matters only for future lapsed subscriptions; a
 *               lifetime purchase always reads back `true`).
 *  - `null`  -> store unavailable: lock until RevenueCat can confirm access.
 */
export function mergeEntitlement(_cached: boolean, fresh: boolean | null): boolean | null {
  return fresh;
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
