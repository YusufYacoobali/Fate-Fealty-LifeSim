/**
 * PURE premium-entitlement logic — no native imports, fully unit-testable.
 *
 * The app gates on the RevenueCat ENTITLEMENT (`pro`), never on a specific
 * Google Play product id. Today that entitlement is granted by the
 * non-consumable Lifetime Pass.
 */

/** The RevenueCat entitlement identifier every product grants. */
export const ENTITLEMENT_ID = 'pro';

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

/**
 * Pick the lifetime package from RevenueCat's current offering. The dashboard
 * package must be `$rc_lifetime`, exposed by the SDK as `offering.lifetime`.
 */
export function pickLifetimePackage<T extends { lifetime?: unknown; availablePackages?: unknown }>(offering: T | null | undefined): T['lifetime'] | null {
  return (offering?.lifetime as T['lifetime'] | null | undefined) ?? null;
}

export function isProductionRevenueCatKey(key: string | null | undefined, platform: 'android' | 'ios'): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length === 0) return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('test_') || lower.startsWith('rc_test_')) return false;
  return platform === 'android' ? trimmed.startsWith('goog_') : trimmed.startsWith('appl_');
}
