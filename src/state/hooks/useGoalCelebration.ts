import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState } from '@/types/game';

const completedGoalIds = (tags: string[]) =>
  new Set(tags.filter((tag) => tag.startsWith('goal_done_')).map((tag) => tag.slice('goal_done_'.length)));

/**
 * Watches for a life's ambition being fulfilled.
 *
 * Completing the goal a character has carried since coming of age used to
 * produce a single line in the feed, scrolled past in the same breath as a
 * remark about turnips. The screen stops for it now, as it does for a rise in
 * station.
 *
 * A new life or a continuation as an heir clears the flag rather than
 * celebrating it, so the popup only ever fires on the year it was earned.
 */
export function useGoalCelebration(state: GameState, loaded: boolean) {
  const previousCompleted = useRef(completedGoalIds(state.tags));
  const previousLife = useRef(state.lifeNo);
  const previousPlayer = useRef(state.playerCharacterId);
  const [achievedGoalId, setAchievedGoalId] = useState<string | null>(null);

  useEffect(() => {
    const completed = completedGoalIds(state.tags);
    if (!loaded) {
      previousCompleted.current = completed;
      return;
    }
    const sameCharacter = state.lifeNo === previousLife.current && state.playerCharacterId === previousPlayer.current;
    if (sameCharacter && !state.dead) {
      const newlyCompleted = [...completed].find((id) => !previousCompleted.current.has(id));
      if (newlyCompleted) setAchievedGoalId(newlyCompleted);
    }
    previousCompleted.current = completed;
    previousLife.current = state.lifeNo;
    previousPlayer.current = state.playerCharacterId;
  }, [state.tags, state.lifeNo, state.playerCharacterId, state.dead, loaded]);

  const dismissGoal = useCallback(() => setAchievedGoalId(null), []);

  return { achievedGoalId, dismissGoal };
}
