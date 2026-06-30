import { useEffect, useRef } from 'react';
import { GameState } from '@/types/game';
import { haptic } from '@/services/haptics';

/**
 * Fires haptics on meaningful ENGINE-driven transitions that the player didn't
 * tap for directly — a promotion (success) and death (error). Direct taps
 * (age-up, choices, purchases) are buzzed at their call sites instead, so this
 * hook stays focused on "things that happened to you".
 */
export function useGameFeedback(state: GameState) {
  const prevRank = useRef(state.rankIdx);
  const prevDead = useRef(state.dead);

  useEffect(() => {
    const on = state.settings.haptics;
    if (state.rankIdx > prevRank.current) haptic('success', on);
    if (state.dead && !prevDead.current) haptic('error', on);
    prevRank.current = state.rankIdx;
    prevDead.current = state.dead;
  }, [state.rankIdx, state.dead, state.settings.haptics]);
}
