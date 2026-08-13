import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from '@/types/game';
import { ageUpsDelta, shouldPromptReview } from '@/services/reviewLogic';
import {
  shopPromoMessageIndex,
  shopPromoCadenceDue,
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
  const prevAge = useRef(state.age);
  const prevLifeNo = useRef(state.lifeNo);
  const trackingStarted = useRef(false);
  const promoQueued = useRef(false);
  const [shopPromoVisible, setShopPromoVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!loaded || !meta.ready) return;

    if (!trackingStarted.current) {
      prevAge.current = state.age;
      prevLifeNo.current = state.lifeNo;
      trackingStarted.current = true;
      return;
    }

    const ageUpDelta = ageUpsDelta(prevLifeNo.current, prevAge.current, state.lifeNo, state.age);
    prevAge.current = state.age;
    prevLifeNo.current = state.lifeNo;

    if (!options.eligible) {
      if (shopPromoVisible) setShopPromoVisible(false);
      return;
    }

    const currentMeta = meta.metaRef.current;
    if (ageUpDelta > 0 && shopPromoCadenceDue(currentMeta, state, false)) promoQueued.current = true;
    if (!promoQueued.current || shopPromoVisible || options.reviewVisible) return;

    // The review request wins when both cadences land together.
    if (shouldPromptReview(currentMeta, state)) return;

    promoQueued.current = false;
    setMessageIndex(shopPromoMessageIndex(currentMeta.shopPromoCount));
    meta.update({
      shopPromoLastEntry: currentMeta.totalEntries,
      shopPromoLastAgeUp: currentMeta.totalAgeUps,
      shopPromoCount: currentMeta.shopPromoCount + 1,
    });
    setShopPromoVisible(true);
    // meta is a stable api (ref + memoised update); intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loaded, meta.ready, options.eligible, options.reviewVisible, shopPromoVisible]);

  const resolveShopPromo = useCallback(() => setShopPromoVisible(false), []);

  return { shopPromoVisible, shopPromoMessageIndex: messageIndex, resolveShopPromo };
}
