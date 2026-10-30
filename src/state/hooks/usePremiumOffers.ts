/**
 * Loads live store prices for all premium plans (one offerings fetch).
 * `offers === null` after loading means the store is unreachable.
 */

import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getPremiumOffers, PlanOffers } from '@/services/purchases';

export function usePremiumOffers(enabled: boolean) {
  const [offers, setOffers] = useState<PlanOffers | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [reload, setReload] = useState(0);
  const retryOffers = useCallback(() => {
    setLoading(true);
    setReload((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const load = async () => {
      const fresh = await getPremiumOffers();
      if (!active) return;
      setOffers(fresh);
      setLoading(false);
    };
    void load();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') retryOffers();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [enabled, reload, retryOffers]);

  return { offers, offersLoading: loading, retryOffers, storeUnavailable: !loading && enabled && offers === null };
}
