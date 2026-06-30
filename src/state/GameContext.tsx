import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GameState } from '@/types/game';
import { GameAction } from './gameReducer';
import { usePersistentGame } from './hooks/usePersistentGame';
import { useAppMeta } from './hooks/useAppMeta';
import { useReviewGate } from './hooks/useReviewGate';
import { useScheduledReminders } from './hooks/useScheduledReminders';
import { useCharacterCreation } from './hooks/useCharacterCreation';
import { useMetaProgression, ProgressSnapshot } from './hooks/useMetaProgression';
import { NewLifeOptions } from './gameReducer';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  loaded: boolean;
  reviewVisible: boolean;
  resolveReview: () => void;
  creating: boolean;
  requestNewLife: () => void;
  createCharacter: (options: NewLifeOptions) => void;
  newAchievements: string[];
  dismissAchievement: () => void;
  getProgress: () => ProgressSnapshot;
  onboardingVisible: boolean;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Thin composition root: each concern (game persistence, app meta, review
 * gating, reminder scheduling) is owned by its own single-responsibility hook.
 * This provider just wires them together and exposes the combined value.
 */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const game = usePersistentGame();
  const meta = useAppMeta();
  useScheduledReminders(meta);
  const review = useReviewGate(game.state, game.loaded, meta);
  const creation = useCharacterCreation(meta, game.loaded, game.dispatch);
  const progression = useMetaProgression(game.state, meta, game.loaded);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    if (game.loaded && meta.ready && meta.metaRef.current.onboarded && !meta.metaRef.current.tutorialSeen) {
      setOnboardingVisible(true);
    }
  }, [game.loaded, meta.ready, meta.metaRef, game.state.lifeNo]);

  const completeOnboarding = useCallback(() => {
    meta.update({ tutorialSeen: true });
    setOnboardingVisible(false);
  }, [meta]);

  const restartOnboarding = useCallback(() => {
    meta.update({ tutorialSeen: false });
    setOnboardingVisible(true);
  }, [meta]);

  const value = useMemo<GameContextValue>(
    () => ({
      state: game.state,
      dispatch: game.dispatch,
      loaded: game.loaded,
      reviewVisible: review.reviewVisible,
      resolveReview: review.resolveReview,
      creating: creation.creating,
      requestNewLife: creation.requestNewLife,
      createCharacter: creation.createCharacter,
      newAchievements: progression.newAchievements,
      dismissAchievement: progression.dismissAchievement,
      getProgress: progression.getProgress,
      onboardingVisible,
      completeOnboarding,
      restartOnboarding,
    }),
    [
      game.state,
      game.dispatch,
      game.loaded,
      review.reviewVisible,
      review.resolveReview,
      creation.creating,
      creation.requestNewLife,
      creation.createCharacter,
      progression.newAchievements,
      progression.dismissAchievement,
      progression.getProgress,
      onboardingVisible,
      completeOnboarding,
      restartOnboarding,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
