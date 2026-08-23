import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState } from '@/types/game';

/**
 * Watches for a rise in station. Promotion is the single biggest thing that can
 * happen in a life and it previously passed by as one line in the feed, so the
 * screen now stops for it.
 *
 * A new life resets the rank to whatever was inherited, and continuing as an
 * heir can raise it — neither is an earned promotion, so both are ignored.
 */
export function usePromotionCelebration(state: GameState, loaded: boolean) {
  const previousRank = useRef(state.rankIdx);
  const previousLife = useRef(state.lifeNo);
  const previousPlayer = useRef(state.playerCharacterId);
  const [promotedTo, setPromotedTo] = useState<number | null>(null);

  useEffect(() => {
    if (!loaded) return;
    const sameCharacter = state.lifeNo === previousLife.current && state.playerCharacterId === previousPlayer.current;
    if (sameCharacter && state.rankIdx > previousRank.current && !state.dead) {
      setPromotedTo(state.rankIdx);
    }
    previousRank.current = state.rankIdx;
    previousLife.current = state.lifeNo;
    previousPlayer.current = state.playerCharacterId;
  }, [state.rankIdx, state.lifeNo, state.playerCharacterId, state.dead, loaded]);

  const dismissPromotion = useCallback(() => setPromotedTo(null), []);

  return { promotedTo, dismissPromotion };
}
