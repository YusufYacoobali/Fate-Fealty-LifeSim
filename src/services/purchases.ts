/**
 * RevenueCat adapter. RevenueCat's `pro` entitlement is the source of truth:
 * local state mirrors confirmed customer info, never a product id or local flag.
 */

import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { connectMetaPurchases } from './metaAds';
import { confirmPurchasedEntitlement, isProductionRevenueCatKey, PLAN_IDS, pickPackage, PlanId, PurchaseOutcome, premiumAccess, PremiumAccess, PremiumOwnership, ownedProductIdentifier, ownedPlan, upgradePlans } from './purchasesLogic';

export { ENTITLEMENT_ID, PLAN_IDS, isProductionRevenueCatKey, mergeEntitlement } from './purchasesLogic';
export type { PlanId, PurchaseOutcome, PremiumAccess, PremiumOwnership } from './purchasesLogic';

let configured = false;

/** Log SDK diagnostics without customer info, receipts, or attribution data. */
function reportStoreError(operation: string, error: unknown): void {
  const detail = error as { code?: string | number; message?: string; underlyingErrorMessage?: string } | null;
  console.warn(`[purchases] ${operation}`, {
    platform: Platform.OS,
    code: detail?.code,
    message: detail?.message,
    underlyingErrorMessage: detail?.underlyingErrorMessage,
  });
}

/** Retry reads only; a failed checkout must never start another transaction. */
async function readStore<T>(operation: string, read: () => Promise<T>): Promise<T | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await read();
    } catch (error) {
      reportStoreError(`${operation} (attempt ${attempt + 1})`, error);
      if (attempt < 2) await new Promise<void>((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  return null;
}

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
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;
  if (configured) return true;
  const Purchases = rc();
  const key = apiKey();
  if (!Purchases || !key) {
    console.warn('[purchases] SDK unavailable or platform API key missing', { platform: Platform.OS });
    return false;
  }
  try {
    Purchases.configure({ apiKey: key });
    configured = true;
    void connectMetaPurchases(Purchases);
    return true;
  } catch (error) {
    reportStoreError('configure', error);
    return false;
  }
}

/** Reads RevenueCat customer info, using the SDK cache when available offline. */
export async function getPremiumStatus(): Promise<boolean | null> {
  const access = await getPremiumAccess();
  return access?.unlocked ?? null;
}

export async function getPremiumAccess(): Promise<PremiumAccess | null> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return null;
  return readStore('customer info', async () => {
    const info = await Purchases.getCustomerInfo();
    return premiumAccess(info);
  });
}

export interface PurchaseResult {
  outcome: PurchaseOutcome;
  unlocked: boolean;
  ownership?: PremiumOwnership | null;
}

export interface PlanOffer {
  available: boolean;
  priceString: string | null;
  price: number | null;
  currencyCode: string | null;
  productIdentifier?: string | null;
}

export type PlanOffers = Record<PlanId, PlanOffer>;

/** Store prices for every plan, with bounded retries for failed/empty reads. */
export async function getPremiumOffers(): Promise<PlanOffers | null> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return null;
  return readStore('offerings', async () => {
    const offerings = await Purchases.getOfferings();
    const offers = {} as PlanOffers;
    for (const plan of PLAN_IDS) {
      const pack = pickPackage(offerings.current, plan);
      const product = (pack as { product?: { identifier?: string; priceString?: string; price?: number; currencyCode?: string } } | null)?.product;
      offers[plan] = pack
        ? {
            available: true,
            priceString: product?.priceString ?? null,
            price: product?.price ?? null,
            currencyCode: product?.currencyCode ?? null,
            productIdentifier: product?.identifier ?? null,
          }
        : { available: false, priceString: null, price: null, currencyCode: null };
    }
    if (!PLAN_IDS.some((plan) => offers[plan].available)) {
      throw new Error('No premium packages returned. Check the current RevenueCat offering and its Apple/Google product mappings.');
    }
    return offers;
  });
}

export async function purchasePremium(plan: PlanId, knownAccess?: PremiumAccess): Promise<PurchaseResult> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return { outcome: 'unavailable', unlocked: false };
  try {
    const offerings = await Purchases.getOfferings();
    const pack = pickPackage(offerings.current, plan);
    if (!pack) return { outcome: 'unavailable', unlocked: false };
    // Verify ownership again at checkout so a stale screen cannot rebuy a plan
    // or create a second independent Google Play subscription.
    let current: PremiumAccess;
    try {
      current = premiumAccess(await Purchases.getCustomerInfo());
    } catch (error) {
      reportStoreError('checkout ownership', error);
      // StoreKit still protects non-consumables and subscriptions in the same
      // subscription group. Google needs a known old product for replacement.
      if (!knownAccess?.ownership && Platform.OS === 'android') return { outcome: 'unavailable', unlocked: false };
      current = knownAccess ?? { unlocked: false, ownership: null };
    }
    const products = Object.fromEntries(PLAN_IDS.map((id) => [id, {
      productIdentifier: (pickPackage(offerings.current, id) as { product?: { identifier?: string } } | null)?.product?.identifier,
    }]));
    if (current.unlocked && !upgradePlans(current.ownership, ownedPlan(current.ownership, products)).includes(plan)) {
      return { outcome: 'unavailable', unlocked: false };
    }
    // The store transaction carries the current attribution attributes to
    // RevenueCat; it owns all purchase/renewal events sent to Meta.
    await connectMetaPurchases(Purchases);
    const selectedPackage = pack as Parameters<typeof Purchases.purchasePackage>[0];
    const ownership = current.ownership;
    const changeProduct = Platform.OS === 'android' && plan === 'annual' && ownership?.kind === 'subscription';
    if (changeProduct && (ownership.store !== 'PLAY_STORE' || !ownedProductIdentifier(ownership))) {
      return { outcome: 'unavailable', unlocked: false };
    }
    const { customerInfo } = changeProduct
      ? await Purchases.purchasePackage(selectedPackage, null, {
          oldProductIdentifier: ownedProductIdentifier(ownership)!,
          replacementMode: Purchases.STORE_REPLACEMENT_MODE.WITHOUT_PRORATION,
        })
      : await Purchases.purchasePackage(selectedPackage);
    let confirmedInfo = customerInfo;
    const unlocked = await confirmPurchasedEntitlement(customerInfo, async () => {
      confirmedInfo = await Purchases.getCustomerInfo();
      return confirmedInfo;
    });
    return unlocked
      ? { outcome: 'purchased', unlocked: true, ownership: premiumAccess(confirmedInfo).ownership }
      : { outcome: 'activation_error', unlocked: false };
  } catch (e) {
    const cancelled = !!(e as { userCancelled?: boolean })?.userCancelled;
    if (!cancelled) reportStoreError('purchase', e);
    return { outcome: cancelled ? 'cancelled' : 'error', unlocked: false };
  }
}

export async function restorePremium(): Promise<boolean | null> {
  const access = await restorePremiumAccess();
  return access?.unlocked ?? null;
}

export async function restorePremiumAccess(): Promise<PremiumAccess | null> {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return null;
  try {
    await connectMetaPurchases(Purchases);
    const info = await Purchases.restorePurchases();
    return premiumAccess(info);
  } catch (error) {
    reportStoreError('restore', error);
    return null;
  }
}

export function addPremiumListener(onChange: (unlocked: boolean, ownership: PremiumOwnership | null) => void): () => void {
  const Purchases = rc();
  if (!Purchases || !configurePurchases()) return () => {};
  const listener = (info: unknown) => {
    const access = premiumAccess(info as Parameters<typeof premiumAccess>[0]);
    onChange(access.unlocked, access.ownership);
  };
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

export async function managePremiumSubscriptions(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const Purchases = rc();
      if (!Purchases || !configurePurchases()) return false;
      await Purchases.showManageSubscriptions();
    } else if (Platform.OS === 'android') {
      await Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else return false;
    return true;
  } catch (error) {
    reportStoreError('manage subscriptions', error);
    return false;
  }
}
