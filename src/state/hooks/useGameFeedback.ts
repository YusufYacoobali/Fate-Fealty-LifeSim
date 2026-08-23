import { useEffect, useRef } from 'react';
import { GameState } from '@/types/game';
import { haptic } from '@/services/haptics';

/**
 * Fires restrained haptics for major engine-driven transitions. Direct taps
 * are buzzed at their call sites; this hook covers what the world did next.
 */
export function useGameFeedback(state: GameState) {
  const prevRank = useRef(state.rankIdx);
  const prevDead = useRef(state.dead);
  const prevPlayerId = useRef(state.playerCharacterId);
  const prevPendingId = useRef(state.pendingEvent?.eventId);
  const prevHistoryId = useRef(state.world.history.at(-1)?.id);

  useEffect(() => {
    const on = state.settings.haptics;
    if (state.rankIdx > prevRank.current) haptic('success', on);
    if (state.dead && !prevDead.current) haptic('error', on);
    if (state.playerCharacterId !== prevPlayerId.current) haptic('success', on);
    const pendingId = state.pendingEvent?.eventId;
    if (pendingId && pendingId !== prevPendingId.current) {
      const story = state.pendingEvent?.storyInstanceId ? state.world.activeStories.find((item) => item.id === state.pendingEvent?.storyInstanceId) : undefined;
      if (pendingId === 'system_legal_trial') haptic('warning', on);
      else if (story?.scale === 'major') haptic('heavy', on);
    }
    const latestHistory = state.world.history.at(-1);
    if (latestHistory && latestHistory.id !== prevHistoryId.current && ['pregnancy', 'adoption', 'wardship'].includes(latestHistory.type)) haptic('success', on);
    prevRank.current = state.rankIdx;
    prevDead.current = state.dead;
    prevPlayerId.current = state.playerCharacterId;
    prevPendingId.current = pendingId;
    prevHistoryId.current = latestHistory?.id;
  }, [state.rankIdx, state.dead, state.playerCharacterId, state.pendingEvent?.eventId, state.pendingEvent?.storyInstanceId, state.world.activeStories, state.world.history, state.settings.haptics]);
}
