import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { DailyRewardProgress, DailyRewardStatus, evaluateDailyReward, progressAfterClaim } from '@/services/dailyRewards';
import { buildReturnRumour, RETURN_RUMOUR_AFTER_MS, ReturnRumour } from '@/services/returnRumour';
import { GameState } from '@/types/game';
import { GameAction } from '../gameReducer';
import { AppMetaApi } from './useAppMeta';

/**
 * TESTING SWITCH: re-open the daily gift at the start of every new life so the
 * popup can be inspected on demand. Set to false to restore the once-a-day rule.
 * While it is on, starting a life clears the last claim date, which also resets
 * the streak to one.
 */
export const DAILY_REWARD_ON_EVERY_NEW_LIFE = true;

/** Owns offline-only return loops. Neither path consumes game time or world RNG. */
export function useRetentionLoops(
  state: GameState,
  loaded: boolean,
  meta: AppMetaApi,
  dispatch: React.Dispatch<GameAction>,
) {
  const { metaRef, ready: metaReady, update: updateMeta } = meta;
  const stateRef = useRef(state);
  stateRef.current = state;
  const [dailyRewardStatus, setDailyRewardStatus] = useState<DailyRewardStatus | null>(null);
  const [dailyRewardProgress, setDailyRewardProgress] = useState<DailyRewardProgress | null>(null);
  const [returnRumour, setReturnRumour] = useState<ReturnRumour | null>(null);
  const previousLifeNo = useRef(state.lifeNo);

  const refreshForActiveApp = useCallback((now: number) => {
    if (!loaded || !metaReady) return;
    const currentMeta = metaRef.current;
    const elapsed = currentMeta.lastActiveAt == null ? 0 : now - currentMeta.lastActiveAt;
    const hasNewAwayPeriod = currentMeta.lastActiveAt != null && (currentMeta.lastRumourAt ?? 0) < currentMeta.lastActiveAt;
    if (elapsed >= RETURN_RUMOUR_AFTER_MS && hasNewAwayPeriod && !stateRef.current.dead) {
      setReturnRumour(buildReturnRumour(stateRef.current));
      updateMeta({ lastActiveAt: now, lastRumourAt: now });
    } else {
      updateMeta({ lastActiveAt: now });
    }
    const status = evaluateDailyReward(currentMeta.dailyReward, now);
    setDailyRewardProgress(currentMeta.dailyReward);
    setDailyRewardStatus(status.eligible ? status : null);
  }, [loaded, metaReady, metaRef, updateMeta]);

  useEffect(() => {
    if (!loaded || !metaReady) return;
    if (state.lifeNo === previousLifeNo.current) return;
    previousLifeNo.current = state.lifeNo;
    if (!DAILY_REWARD_ON_EVERY_NEW_LIFE) return;
    updateMeta({ dailyReward: { ...metaRef.current.dailyReward, lastClaimDate: null } });
    const status = evaluateDailyReward(metaRef.current.dailyReward, Date.now());
    setDailyRewardProgress(metaRef.current.dailyReward);
    setDailyRewardStatus(status.eligible ? status : null);
  }, [state.lifeNo, loaded, metaReady, metaRef, updateMeta]);

  useEffect(() => {
    if (!loaded || !metaReady) return;
    refreshForActiveApp(Date.now());
    const subscription = AppState.addEventListener('change', (nextState) => {
      const now = Date.now();
      if (nextState === 'active') refreshForActiveApp(now);
      else updateMeta({ lastActiveAt: now });
    });
    return () => subscription.remove();
  }, [loaded, metaReady, refreshForActiveApp, updateMeta]);

  const claimDailyReward = useCallback(() => {
    const progress = metaRef.current.dailyReward;
    const status = evaluateDailyReward(progress, Date.now());
    if (!status.eligible || stateRef.current.dead) return;
    // Persist the claim before dispatch so rapid double taps remain idempotent.
    updateMeta({ dailyReward: progressAfterClaim(progress, status) });
    setDailyRewardStatus(null);
    dispatch({
      type: 'CLAIM_DAILY_REWARD',
      gold: status.reward.gold,
      streak: status.nextStreak,
      bonus: status.reward.bonus,
      bonusAmount: status.reward.bonusAmount,
    });
  }, [dispatch, metaRef, updateMeta]);

  const followReturnRumour = useCallback(() => {
    if (returnRumour) dispatch({ type: 'SET_TAB', tab: returnRumour.tab });
    setReturnRumour(null);
  }, [dispatch, returnRumour]);

  const dismissDailyReward = useCallback(() => setDailyRewardStatus(null), []);
  const dismissReturnRumour = useCallback(() => setReturnRumour(null), []);

  return {
    dailyRewardStatus,
    dailyRewardProgress,
    claimDailyReward,
    dismissDailyReward,
    returnRumour,
    followReturnRumour,
    dismissReturnRumour,
  };
}
