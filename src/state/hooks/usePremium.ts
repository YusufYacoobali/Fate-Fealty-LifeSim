import React, { useCallback, useEffect, useState } from 'react';
import { GameAction } from '../gameReducer';
import { AppMetaApi } from './useAppMeta';
import {
  addPremiumListener,
  configurePurchases,
  getPremiumStatus,
  mergeEntitlement,
  purchasePremium,
  restorePremium,
  PurchaseOutcome,
} from '@/services/purchases';

export type PremiumAccessState = 'loading' | 'active' | 'inactive' | 'unavailable';

/**
 * Owns the Pro entitlement lifecycle. RevenueCat is the source of truth:
 * local state and app meta only mirror the latest confirmed `pro` entitlement.
 */
export function usePremium(meta: AppMetaApi, loaded: boolean, dispatch: React.Dispatch<GameAction>) {
  const [lifetimeUnlocked, setLifetimeUnlocked] = useState(false);
  const [accessState, setAccessState] = useState<PremiumAccessState>('loading');
  const { metaRef, ready, update } = meta;

  const applyEntitlement = useCallback(
    (fresh: boolean | null) => {
      const merged = mergeEntitlement(metaRef.current.lifetimeUnlocked, fresh);
      if (merged === null) {
        setAccessState('unavailable');
        setLifetimeUnlocked((prev) => (prev ? false : prev));
        dispatch({ type: 'SET_LIFETIME_UNLOCKED', unlocked: false });
        return false;
      }
      setAccessState(merged ? 'active' : 'inactive');
      setLifetimeUnlocked((prev) => (prev === merged ? prev : merged));
      if (metaRef.current.lifetimeUnlocked !== merged) {
        update({ lifetimeUnlocked: merged });
      }
      dispatch({ type: 'SET_LIFETIME_UNLOCKED', unlocked: merged });
      return merged;
    },
    [metaRef, update, dispatch],
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

  const purchaseLifetime = useCallback(async (): Promise<PurchaseOutcome> => {
    const { outcome, unlocked } = await purchasePremium();
    if (outcome === 'purchased') applyEntitlement(unlocked);
    return outcome;
  }, [applyEntitlement]);

  const restoreLifetime = useCallback(async (): Promise<boolean> => {
    const fresh = await restorePremium();
    return applyEntitlement(fresh);
  }, [applyEntitlement]);

  return { lifetimeUnlocked, premiumAccessState: accessState, purchaseLifetime, restoreLifetime };
}
