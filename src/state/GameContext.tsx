import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GameState } from '@/types/game';
import { GameAction } from './gameReducer';
import { usePersistentGame } from './hooks/usePersistentGame';
import { useAppMeta } from './hooks/useAppMeta';
import { useReviewGate } from './hooks/useReviewGate';
import { useScheduledReminders } from './hooks/useScheduledReminders';
import { useCharacterCreation } from './hooks/useCharacterCreation';
import { useMetaProgression, ProgressSnapshot } from './hooks/useMetaProgression';
import { usePremium } from './hooks/usePremium';
import { useShopPromoGate } from './hooks/useShopPromoGate';
import type { PremiumAccessState } from './hooks/usePremium';
import { NewLifeOptions } from './gameReducer';
import { PlanId, PurchaseOutcome } from '@/services/purchases';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  loaded: boolean;
  reviewVisible: boolean;
  resolveReview: () => void;
  shopPromoVisible: boolean;
  shopPromoMessageIndex: number;
  resolveShopPromo: () => void;
  creating: boolean;
  requestNewLife: () => void;
  createCharacter: (options: NewLifeOptions) => void;
  newAchievements: string[];
  dismissAchievement: () => void;
  getProgress: () => ProgressSnapshot;
  onboardingVisible: boolean;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  premiumUnlocked: boolean;
  premiumAccessState: PremiumAccessState;
  purchasePlan: (plan: PlanId) => Promise<PurchaseOutcome>;
  restorePremium: () => Promise<boolean>;
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
  const premium = usePremium(meta, game.loaded, game.dispatch);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    if (game.loaded && meta.ready && meta.metaRef.current.onboarded && !meta.metaRef.current.tutorialSeen) {
      setOnboardingVisible(true);
    }
  }, [game.loaded, meta.ready, meta.metaRef, game.state.lifeNo]);

  const shopPromo = useShopPromoGate(game.state, game.loaded, meta, {
    eligible: premium.premiumAccessState === 'inactive',
    blocked: creation.creating || onboardingVisible || progression.newAchievements.length > 0,
    reviewVisible: review.reviewVisible,
  });

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
      shopPromoVisible: shopPromo.shopPromoVisible,
      shopPromoMessageIndex: shopPromo.shopPromoMessageIndex,
      resolveShopPromo: shopPromo.resolveShopPromo,
      creating: creation.creating,
      requestNewLife: creation.requestNewLife,
      createCharacter: creation.createCharacter,
      newAchievements: progression.newAchievements,
      dismissAchievement: progression.dismissAchievement,
      getProgress: progression.getProgress,
      onboardingVisible,
      completeOnboarding,
      restartOnboarding,
      premiumUnlocked: premium.premiumUnlocked,
      premiumAccessState: premium.premiumAccessState,
      purchasePlan: premium.purchasePlan,
      restorePremium: premium.restorePremium,
    }),
    [
      game.state,
      game.dispatch,
      game.loaded,
      review.reviewVisible,
      review.resolveReview,
      shopPromo.shopPromoVisible,
      shopPromo.shopPromoMessageIndex,
      shopPromo.resolveShopPromo,
      creation.creating,
      creation.requestNewLife,
      creation.createCharacter,
      progression.newAchievements,
      progression.dismissAchievement,
      progression.getProgress,
      onboardingVisible,
      completeOnboarding,
      restartOnboarding,
      premium.premiumUnlocked,
      premium.premiumAccessState,
      premium.purchasePlan,
      premium.restorePremium,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
