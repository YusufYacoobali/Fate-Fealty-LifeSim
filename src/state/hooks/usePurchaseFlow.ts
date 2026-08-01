/**
 * Shared buy/restore flow for premium plans. Owns the busy flag and the
 * user-facing status message so every sales surface (paywall, shop, future
 * placements) behaves identically.
 */

import { useCallback, useState } from 'react';
import { PlanId, PurchaseOutcome } from '@/services/purchases';

export const OUTCOME_MESSAGES: Record<PurchaseOutcome, string> = {
  purchased: 'Premium unlocked. Long may you reign!',
  cancelled: 'Purchase cancelled.',
  unavailable: 'The royal treasury is unreachable. Try again later.',
  error: 'Something went awry. No coin was taken. Try again.',
};

export function usePurchaseFlow(
  onPurchase: (plan: PlanId) => Promise<PurchaseOutcome>,
  onRestore: () => Promise<boolean>,
) {
  const [message, setMessage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const buy = useCallback(
    async (plan: PlanId): Promise<PurchaseOutcome | null> => {
      if (busy) return null;
      setBusy(true);
      setMessage('Summoning the royal treasury...');
      try {
        const outcome = await onPurchase(plan);
        setMessage(OUTCOME_MESSAGES[outcome]);
        return outcome;
      } finally {
        setBusy(false);
      }
    },
    [busy, onPurchase],
  );

  const restore = useCallback(async (): Promise<boolean> => {
    if (busy) return false;
    setBusy(true);
    setMessage('Consulting the ledgers...');
    try {
      const restored = await onRestore();
      setMessage(restored ? 'Premium restored.' : 'No previous purchase was found.');
      return restored;
    } finally {
      setBusy(false);
    }
  }, [busy, onRestore]);

  return { message, busy, buy, restore };
}
