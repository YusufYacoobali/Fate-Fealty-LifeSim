/**
 * RevenueCat adapter. RevenueCat's `pro` entitlement is the source of truth:
 * local state mirrors confirmed customer info, never a product id or local flag.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { entitlementActive, isProductionRevenueCatKey, mergeEntitlement, pickLifetimePackage, PurchaseOutcome } from './purchasesLogic';

export { ENTITLEMENT_ID, isProductionRevenueCatKey, mergeEntitlement } from './purchasesLogic';
export type { PurchaseOutcome } from './purchasesLogic';

let configured = false;

function rc(): typeof import('react-native-purchases').default | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-purchases').default ?? null;
  } catch {
    return null;
  }
}

function apiKey(): string | null {
  const extra = (Constants.expoConfig?.extra ?? {}) as { revenueCat?: { androidApiKey?: string; iosApiKey?: string } };
  const key = Platform.OS === 'android' ? extra.revenueCat?.androidApiKey : extra.revenueCat?.iosApiKey;
  if (!isProductionRevenueCatKey(key, Platform.OS === 'android' ? 'android' : 'ios')) return null;
  return key?.trim() ?? null;
}

export function configurePurchases(): boolean {
  if (configured) return true;
  const Purchases = rc();
  const key = apiKey();
  if (!Purchases || !key) return false;
  try {
    Purchases.configure({ apiKey: key });
    configured = true;
    return true;
  } catch {
    return false;
  }
}

/** Reads RevenueCat customer info, using the SDK cache when available offline. */
export async function getPremiumStatus(): Promise<boolean | null> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return null;
  try {
    const info = await Purchases.getCustomerInfo();
    return entitlementActive(info);
  } catch {
    return null;
  }
}

export interface PurchaseResult {
  outcome: PurchaseOutcome;
  unlocked: boolean;
}

export interface LifetimeOfferDetails {
  available: boolean;
  priceString: string | null;
}

export async function getLifetimeOfferDetails(): Promise<LifetimeOfferDetails | null> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const pack = pickLifetimePackage(offerings.current);
    if (!pack) return { available: false, priceString: null };
    const product = (pack as { product?: { priceString?: string } }).product;
    return { available: true, priceString: product?.priceString ?? null };
  } catch {
    return null;
  }
}

export async function purchasePremium(): Promise<PurchaseResult> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return { outcome: 'unavailable', unlocked: false };
  try {
    const offerings = await Purchases.getOfferings();
    const pack = pickLifetimePackage(offerings.current);
    if (!pack) return { outcome: 'unavailable', unlocked: false };
    const { customerInfo } = await Purchases.purchasePackage(pack);
    return { outcome: 'purchased', unlocked: entitlementActive(customerInfo) };
  } catch (e) {
    const cancelled = !!(e as { userCancelled?: boolean })?.userCancelled;
    return { outcome: cancelled ? 'cancelled' : 'error', unlocked: false };
  }
}

export async function restorePremium(): Promise<boolean | null> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return null;
  try {
    const info = await Purchases.restorePurchases();
    return entitlementActive(info);
  } catch {
    return null;
  }
}

export function addPremiumListener(onChange: (unlocked: boolean) => void): () => void {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return () => {};
  const listener = (info: unknown) => onChange(entitlementActive(info as Parameters<typeof entitlementActive>[0]));
  try {
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      try {
        Purchases.removeCustomerInfoUpdateListener(listener);
      } catch {
        /* already gone */
      }
    };
  } catch {
    return () => {};
  }
}
