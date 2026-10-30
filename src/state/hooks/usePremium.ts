import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AppMetaApi } from './useAppMeta';
import {
  addPremiumListener,
  configurePurchases,
  getPremiumAccess,
  mergeEntitlement,
  purchasePremium,
  restorePremiumAccess,
  PlanId,
  PurchaseOutcome,
  PremiumAccess,
  PremiumOwnership,
} from '@/services/purchases';

export type PremiumAccessState = 'loading' | 'active' | 'inactive' | 'unavailable';

/**
 * Owns the Pro entitlement lifecycle. RevenueCat is the source of truth:
 * local state and app meta only mirror the latest confirmed `pro` entitlement,
 * whether it was granted by a subscription or the Lifetime Pass.
 *
 * Ownership metadata lets the shop offer subscription upgrades. Whether the
 * game's content gates are open is decided by `useProTrial`, which folds in
 * the free first-life sample and owns `SET_LIFETIME_UNLOCKED`.
 */
export function usePremium(meta: AppMetaApi, loaded: boolean) {
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [premiumOwnership, setPremiumOwnership] = useState<PremiumOwnership | null>(null);
  const [accessState, setAccessState] = useState<PremiumAccessState>('loading');
  const accessRevision = useRef(0);
  const { metaRef, ready, update } = meta;

  const applyEntitlement = useCallback(
    (fresh: PremiumAccess | null) => {
      accessRevision.current += 1;
      const merged = mergeEntitlement(metaRef.current.lifetimeUnlocked, fresh?.unlocked ?? null);
      if (fresh === null) {
        setAccessState('unavailable');
        // A transport/store failure is not evidence that a subscription ended.
        // Keep the last confirmed result, including across a relaunch; a real
        // RevenueCat `false` reading below still revokes expired access.
        setPremiumUnlocked(merged);
        return false;
      }
      setAccessState(merged ? 'active' : 'inactive');
      setPremiumOwnership(fresh.ownership);
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
    const refresh = async () => {
      const request = ++accessRevision.current;
      const fresh = await getPremiumAccess();
      if (active && request === accessRevision.current) applyEntitlement(fresh);
    };
    void refresh();
    const unsubscribe = addPremiumListener((unlocked, ownership) => {
      if (active) applyEntitlement({ unlocked, ownership });
    });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      active = false;
      unsubscribe();
      subscription.remove();
    };
  }, [loaded, ready, applyEntitlement]);

  const purchasePlan = useCallback(
    async (plan: PlanId): Promise<PurchaseOutcome> => {
      const { outcome, unlocked, ownership } = await purchasePremium(plan, { unlocked: premiumUnlocked, ownership: premiumOwnership });
      if (outcome === 'purchased') applyEntitlement({ unlocked, ownership: ownership ?? null });
      return outcome;
    },
    [applyEntitlement, premiumUnlocked, premiumOwnership],
  );

  const restorePremium = useCallback(async (): Promise<boolean> => {
    const fresh = await restorePremiumAccess();
    return applyEntitlement(fresh);
  }, [applyEntitlement]);

  return { premiumUnlocked, premiumOwnership, premiumAccessState: accessState, purchasePlan, restorePremium };
}
