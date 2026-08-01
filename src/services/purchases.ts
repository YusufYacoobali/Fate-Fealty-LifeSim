/**
 * RevenueCat adapter. RevenueCat's `pro` entitlement is the source of truth:
 * local state mirrors confirmed customer info, never a product id or local flag.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { entitlementActive, isProductionRevenueCatKey, PLAN_IDS, pickPackage, PlanId, PurchaseOutcome } from './purchasesLogic';

export { ENTITLEMENT_ID, PLAN_IDS, isProductionRevenueCatKey, mergeEntitlement } from './purchasesLogic';
export type { PlanId, PurchaseOutcome } from './purchasesLogic';

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

export interface PlanOffer {
  available: boolean;
  priceString: string | null;
  price: number | null;
  currencyCode: string | null;
}

export type PlanOffers = Record<PlanId, PlanOffer>;

/** Store prices for every plan in one offerings fetch; null when the store is unreachable. */
export async function getPremiumOffers(): Promise<PlanOffers | null> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const offers = {} as PlanOffers;
    for (const plan of PLAN_IDS) {
      const pack = pickPackage(offerings.current, plan);
      const product = (pack as { product?: { priceString?: string; price?: number; currencyCode?: string } } | null)?.product;
      offers[plan] = pack
        ? {
            available: true,
            priceString: product?.priceString ?? null,
            price: product?.price ?? null,
            currencyCode: product?.currencyCode ?? null,
          }
        : { available: false, priceString: null, price: null, currencyCode: null };
    }
    return offers;
  } catch {
    return null;
  }
}

export async function purchasePremium(plan: PlanId): Promise<PurchaseResult> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return { outcome: 'unavailable', unlocked: false };
  try {
    const offerings = await Purchases.getOfferings();
    const pack = pickPackage(offerings.current, plan);
    if (!pack) return { outcome: 'unavailable', unlocked: false };
    const { customerInfo } = await Purchases.purchasePackage(pack as Parameters<typeof Purchases.purchasePackage>[0]);
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
