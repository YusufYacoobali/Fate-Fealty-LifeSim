import { useCallback, useEffect, useState } from 'react';
import { AppMetaApi } from './useAppMeta';
import {
  addPremiumListener,
  configurePurchases,
  getPremiumStatus,
  mergeEntitlement,
  purchasePremium,
  restorePremium as restorePremiumPurchases,
  PlanId,
  PurchaseOutcome,
} from '@/services/purchases';

export type PremiumAccessState = 'loading' | 'active' | 'inactive' | 'unavailable';

/**
 * Owns the Pro entitlement lifecycle. RevenueCat is the source of truth:
 * local state and app meta only mirror the latest confirmed `pro` entitlement,
 * whether it was granted by a subscription or the Lifetime Pass.
 *
 * This hook reports the ENTITLEMENT only. Whether the game's content gates are
 * open is decided by `useProTrial`, which folds in the free first-life sample
 * and owns the resulting `SET_LIFETIME_UNLOCKED` dispatch.
 */
export function usePremium(meta: AppMetaApi, loaded: boolean) {
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [accessState, setAccessState] = useState<PremiumAccessState>('loading');
  const { metaRef, ready, update } = meta;

  const applyEntitlement = useCallback(
    (fresh: boolean | null) => {
      const merged = mergeEntitlement(metaRef.current.lifetimeUnlocked, fresh);
      if (merged === null) {
        setAccessState('unavailable');
        setPremiumUnlocked((prev) => (prev ? false : prev));
        return false;
      }
      setAccessState(merged ? 'active' : 'inactive');
      setPremiumUnlocked((prev) => (prev === merged ? prev : merged));
      if (metaRef.current.lifetimeUnlocked !== merged) {
        update({ lifetimeUnlocked: merged });
      }
      return merged;
    },
    [metaRef, update],
  );

  useEffect(() => {
    if (!loaded || !ready) return;
    configurePurchases();
    setAccessState('loading');
    let active = true;
    getPremiumStatus().then((fresh) => {
      if (active) applyEntitlement(fresh);
    });
    const unsubscribe = addPremiumListener((unlocked) => {
      if (active) applyEntitlement(unlocked);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [loaded, ready, applyEntitlement]);

  const purchasePlan = useCallback(
    async (plan: PlanId): Promise<PurchaseOutcome> => {
      const { outcome, unlocked } = await purchasePremium(plan);
      if (outcome === 'purchased') applyEntitlement(unlocked);
      return outcome;
    },
    [applyEntitlement],
  );

  const restorePremium = useCallback(async (): Promise<boolean> => {
    const fresh = await restorePremiumPurchases();
    return applyEntitlement(fresh);
  }, [applyEntitlement]);

  return { premiumUnlocked, premiumAccessState: accessState, purchasePlan, restorePremium };
}
