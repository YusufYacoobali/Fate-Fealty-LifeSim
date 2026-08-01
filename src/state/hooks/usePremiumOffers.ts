/**
 * Loads live store prices for all premium plans (one offerings fetch).
 * `offers === null` after loading means the store is unreachable.
 */

import { useEffect, useState } from 'react';
import { getPremiumOffers, PlanOffers } from '@/services/purchases';

export function usePremiumOffers(enabled: boolean) {
  const [offers, setOffers] = useState<PlanOffers | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);
    getPremiumOffers().then((fresh) => {
      if (!active) return;
      setOffers(fresh);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { offers, offersLoading: loading, storeUnavailable: !loading && enabled && offers === null };
}
