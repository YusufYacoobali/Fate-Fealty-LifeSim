import React, { useCallback, useEffect, useState } from 'react';
import { GameState } from '@/types/game';
import { resolveProTrial } from '@/services/proTrialLogic';
import { GameAction } from '../gameReducer';
import { AppMetaApi } from './useAppMeta';

export interface ProAccess {
  /** Everything Pro gates on: a real entitlement OR the free sample life. */
  premiumUnlocked: boolean;
  /** True while the current life is running on the free sample. */
  trialActive: boolean;
  /** True while the one-off "thy sample has ended" notice is waiting. */
  trialNoticeVisible: boolean;
  dismissTrialNotice: () => void;
  /**
   * Whether the next life the player creates will carry Pro content. This is
   * NOT `premiumUnlocked`: during the sample life the answer is already no.
   */
  proForNextLife: boolean;
}

/**
 * Owns the free first-life Pro sample and, with it, the single source of truth
 * for `state.lifetimeUnlocked`. RevenueCat still decides the entitlement; this
 * hook decides whether the sample tops it up, and pushes the combined answer
 * into the game state.
 */
export function useProTrial(
  state: GameState,
  loaded: boolean,
  meta: AppMetaApi,
  entitled: boolean,
  dispatch: React.Dispatch<GameAction>,
): ProAccess {
  const { metaRef, ready, update } = meta;
  const [trialActive, setTrialActive] = useState(false);
  const [trialSpent, setTrialSpent] = useState(true);
  const [trialNoticeVisible, setTrialNoticeVisible] = useState(false);

  // Resolving and dispatching together matters: on the render where a new life
  // replaces the sample life, a separate effect would still be holding the old
  // answer and would briefly re-unlock the life that just lost access.
  useEffect(() => {
    if (!loaded || !ready) return;
    const current = metaRef.current;
    const resolution = resolveProTrial(current, state.lifeNo, current.onboarded);
    // `update` writes through the ref synchronously, so the spent flag below
    // reads the post-patch value.
    if (resolution.patch) update(resolution.patch);
    setTrialActive(resolution.active);
    setTrialSpent(metaRef.current.proTrialUsed);
    if (resolution.justEnded && !entitled && !current.proTrialNoticeSeen) {
      setTrialNoticeVisible(true);
    }

    // The game state mirrors the combined answer; every content gate reads it.
    const unlocked = entitled || resolution.active;
    const nextLifeUnlocked = entitled || (!resolution.active && !metaRef.current.proTrialUsed);
    if (state.lifetimeUnlocked !== unlocked || state.nextLifePremiumAccess !== nextLifeUnlocked) {
      dispatch({ type: 'SET_LIFETIME_UNLOCKED', unlocked, nextLifeUnlocked });
    }
  }, [state.lifeNo, state.lifetimeUnlocked, state.nextLifePremiumAccess, loaded, ready, entitled, metaRef, update, dispatch]);

  const premiumUnlocked = entitled || trialActive;

  const dismissTrialNotice = useCallback(() => {
    setTrialNoticeVisible(false);
    update({ proTrialNoticeSeen: true });
  }, [update]);

  // The sample covers the next life only while it is still unclaimed: the life
  // being created now is never the sample life once one is already running.
  const proForNextLife = entitled || (!trialActive && !trialSpent);

  return { premiumUnlocked, trialActive, trialNoticeVisible, dismissTrialNotice, proForNextLife };
}
