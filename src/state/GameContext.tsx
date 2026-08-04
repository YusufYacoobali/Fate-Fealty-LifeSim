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
import { useProTrial } from './hooks/useProTrial';
import { useShopPromoGate } from './hooks/useShopPromoGate';
import type { PremiumAccessState } from './hooks/usePremium';
import { NewLifeOptions } from './gameReducer';
import { PlanId, PurchaseOutcome } from '@/services/purchases';
import { useRetentionLoops } from './hooks/useRetentionLoops';
import type { DailyRewardProgress, DailyRewardStatus } from '@/services/dailyRewards';
import type { ReturnRumour } from '@/services/returnRumour';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  loaded: boolean;
  saveCompatibilityBlocked: boolean;
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
  /** Content gate: a paid entitlement OR the free first-life sample. */
  premiumUnlocked: boolean;
  /** The paid entitlement alone — what the storefront must reflect. */
  premiumEntitled: boolean;
  premiumAccessState: PremiumAccessState;
  purchasePlan: (plan: PlanId) => Promise<PurchaseOutcome>;
  restorePremium: () => Promise<boolean>;
  proTrialActive: boolean;
  proTrialNoticeVisible: boolean;
  dismissProTrialNotice: () => void;
  /** Pro access the life being created will have — what the creation screen shows. */
  premiumForNextLife: boolean;
  dailyRewardStatus: DailyRewardStatus | null;
  dailyRewardProgress: DailyRewardProgress | null;
  claimDailyReward: () => void;
  dismissDailyReward: () => void;
  returnRumour: ReturnRumour | null;
  followReturnRumour: () => void;
  dismissReturnRumour: () => void;
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
  const premium = usePremium(meta, game.loaded);
  const proAccess = useProTrial(game.state, game.loaded, meta, premium.premiumUnlocked, game.dispatch);
  const retention = useRetentionLoops(game.state, game.loaded, meta, game.dispatch);
  const updateMeta = meta.update;
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    if (game.loaded && meta.ready && meta.metaRef.current.onboarded && !meta.metaRef.current.tutorialSeen) {
      setOnboardingVisible(true);
    }
  }, [game.loaded, meta.ready, meta.metaRef, game.state.lifeNo]);

  const shopPromo = useShopPromoGate(game.state, game.loaded, meta, {
    // Never sell Pro to someone who currently has it, sample included.
    eligible: premium.premiumAccessState === 'inactive' && !proAccess.trialActive,
    blocked:
      creation.creating
      || onboardingVisible
      || progression.newAchievements.length > 0
      || !!retention.dailyRewardStatus
      || !!retention.returnRumour
      || proAccess.trialNoticeVisible,
    reviewVisible: review.reviewVisible,
  });

  // Character creation decides the NEXT life's access, which differs from the
  // outgoing life's at exactly the moment the free sample starts or is spent.
  const commitCharacter = creation.createCharacter;
  const proForNextLife = proAccess.proForNextLife;
  const createCharacter = useCallback(
    (options: NewLifeOptions) => {
      commitCharacter({ ...options, lifetimeUnlocked: proForNextLife });
    },
    [commitCharacter, proForNextLife],
  );

  const completeOnboarding = useCallback(() => {
    updateMeta({ tutorialSeen: true });
    setOnboardingVisible(false);
  }, [updateMeta]);

  const restartOnboarding = useCallback(() => {
    updateMeta({ tutorialSeen: false });
    setOnboardingVisible(true);
  }, [updateMeta]);

  const value = useMemo<GameContextValue>(
    () => ({
      state: game.state,
      dispatch: game.dispatch,
      loaded: game.loaded,
      saveCompatibilityBlocked: game.saveCompatibilityBlocked,
      reviewVisible: review.reviewVisible,
      resolveReview: review.resolveReview,
      shopPromoVisible: shopPromo.shopPromoVisible,
      shopPromoMessageIndex: shopPromo.shopPromoMessageIndex,
      resolveShopPromo: shopPromo.resolveShopPromo,
      creating: creation.creating,
      requestNewLife: creation.requestNewLife,
      createCharacter,
      newAchievements: progression.newAchievements,
      dismissAchievement: progression.dismissAchievement,
      getProgress: progression.getProgress,
      onboardingVisible,
      completeOnboarding,
      restartOnboarding,
      premiumUnlocked: proAccess.premiumUnlocked,
      premiumEntitled: premium.premiumUnlocked,
      premiumAccessState: premium.premiumAccessState,
      purchasePlan: premium.purchasePlan,
      restorePremium: premium.restorePremium,
      proTrialActive: proAccess.trialActive,
      proTrialNoticeVisible: proAccess.trialNoticeVisible,
      dismissProTrialNotice: proAccess.dismissTrialNotice,
      premiumForNextLife: proForNextLife,
      dailyRewardStatus: retention.dailyRewardStatus,
      dailyRewardProgress: retention.dailyRewardProgress,
      claimDailyReward: retention.claimDailyReward,
      dismissDailyReward: retention.dismissDailyReward,
      returnRumour: retention.returnRumour,
      followReturnRumour: retention.followReturnRumour,
      dismissReturnRumour: retention.dismissReturnRumour,
    }),
    [
      game.state,
      game.dispatch,
      game.loaded,
      game.saveCompatibilityBlocked,
      review.reviewVisible,
      review.resolveReview,
      shopPromo.shopPromoVisible,
      shopPromo.shopPromoMessageIndex,
      shopPromo.resolveShopPromo,
      creation.creating,
      creation.requestNewLife,
      createCharacter,
      progression.newAchievements,
      progression.dismissAchievement,
      progression.getProgress,
      onboardingVisible,
      completeOnboarding,
      restartOnboarding,
      proAccess.premiumUnlocked,
      premium.premiumUnlocked,
      premium.premiumAccessState,
      premium.purchasePlan,
      premium.restorePremium,
      proAccess.trialActive,
      proAccess.trialNoticeVisible,
      proAccess.dismissTrialNotice,
      proForNextLife,
      retention.dailyRewardStatus,
      retention.dailyRewardProgress,
      retention.claimDailyReward,
      retention.dismissDailyReward,
      retention.returnRumour,
      retention.followReturnRumour,
      retention.dismissReturnRumour,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
