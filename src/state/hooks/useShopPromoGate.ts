import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from '@/types/game';
import { entriesDelta, shouldPromptReview } from '@/services/reviewLogic';
import {
  shopPromoMessageIndex,
  shouldPromptShopPromo,
} from '@/services/shopPromoLogic';
import type { AppMetaApi } from './useAppMeta';

interface Options {
  /** Only promote when entitlement lookup confirms this is a free player. */
  eligible: boolean;
  /** The review prompt wins when both cadences land together. */
  reviewVisible: boolean;
}

/** Independent recurring gate for the in-game premium shop promotion. */
export function useShopPromoGate(state: GameState, loaded: boolean, meta: AppMetaApi, options: Options) {
  const prevFeedLen = useRef(state.feed.length);
  const trackingStarted = useRef(false);
  const [shopPromoVisible, setShopPromoVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!loaded || !meta.ready) return;

    if (!trackingStarted.current) {
      prevFeedLen.current = state.feed.length;
      trackingStarted.current = true;
      return;
    }

    const delta = entriesDelta(prevFeedLen.current, state.feed.length);
    prevFeedLen.current = state.feed.length;

    if (!options.eligible) {
      if (shopPromoVisible) setShopPromoVisible(false);
      return;
    }

    // Require a fresh gameplay beat. This prevents the promo from following a
    // dismissed review prompt immediately on the exact same positive moment.
    if (delta <= 0 || shopPromoVisible || options.reviewVisible) return;

    const currentMeta = meta.metaRef.current;
    // The review request wins when both cadences land together.
    if (shouldPromptReview(currentMeta, state)) return;
    if (!shouldPromptShopPromo(currentMeta, state, false)) return;

    setMessageIndex(shopPromoMessageIndex(currentMeta.shopPromoCount));
    meta.update({
      shopPromoLastEntry: currentMeta.totalEntries,
      shopPromoCount: currentMeta.shopPromoCount + 1,
    });
    setShopPromoVisible(true);
    // meta is a stable api (ref + memoised update); intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loaded, meta.ready, options.eligible, options.reviewVisible, shopPromoVisible]);

  const resolveShopPromo = useCallback(() => setShopPromoVisible(false), []);

  return { shopPromoVisible, shopPromoMessageIndex: messageIndex, resolveShopPromo };
}
