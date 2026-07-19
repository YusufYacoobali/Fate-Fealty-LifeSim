import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/state/GameContext';
import {
  currentRank,
  fullName,
  selectBio,
  selectFeed,
  selectKin,
  selectedKin,
  selectGoal,
  selectRankPath,
  selectStats,
  selectTraits,
} from '@/state/viewModel';
import { STAT_STYLES, C } from '@/theme/theme';
import { Header } from '@/components/Header';
import { StatStrip } from '@/components/StatStrip';
import { NavBar } from '@/components/NavBar';
import { AgeUpBar } from '@/components/AgeUpBar';
import { GoalBanner } from '@/components/GoalBanner';
import { LifeFeed } from '@/components/tabs/LifeFeed';
import { DoTab } from '@/components/tabs/DoTab';
import { KinTab } from '@/components/tabs/KinTab';
import { ShopTab } from '@/components/tabs/ShopTab';
import { MeTab } from '@/components/tabs/MeTab';
import { HoldingTab } from '@/components/tabs/HoldingTab';
import { EventModal } from '@/components/modals/EventModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { DeathScreen } from '@/components/modals/DeathScreen';
import { ReviewPrompt } from '@/components/modals/ReviewPrompt';
import { ShopPromoPrompt } from '@/components/modals/ShopPromoPrompt';
import { CharacterCreation } from '@/components/modals/CharacterCreation';
import { AchievementToast } from '@/components/modals/AchievementToast';
import { ChronicleScreen } from '@/components/modals/ChronicleScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { PremiumShopScreen } from '@/screens/PremiumShopScreen';
import { MIN_ANDROID_BOTTOM_NAV_GUARD } from '@/components/systemLayout';
import { useGameFeedback } from '@/state/hooks/useGameFeedback';
import { haptic } from '@/services/haptics';

export function GameScreen() {
  const {
    state,
    dispatch,
    reviewVisible,
    resolveReview,
    shopPromoVisible,
    shopPromoMessageIndex,
    resolveShopPromo,
    creating,
    requestNewLife,
    createCharacter,
    newAchievements,
    dismissAchievement,
    getProgress,
    onboardingVisible,
    completeOnboarding,
    restartOnboarding,
    premiumUnlocked,
    premiumAccessState,
    purchasePlan,
    restorePremium,
  } = useGame();
  const rank = currentRank(state);
  const stats = selectStats(state);
  const buzz = state.settings.haptics;
  const goal = selectGoal(state);
  const [chronicleOpen, setChronicleOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomNavInset = Math.max(insets.bottom, MIN_ANDROID_BOTTOM_NAV_GUARD);

  // Promotion/death haptics ride on engine transitions.
  useGameFeedback(state);

  // Attributes for the ME tab need labels too.
  const meStats = stats.map((s) => ({ ...s, label: STAT_STYLES[s.key].label }));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.blue }}>
      <View style={{ flex: 1, backgroundColor: C.sky }}>
        <Header
          portrait={rank.portrait}
          fullName={fullName(state)}
          age={state.age}
          classRank={rank.key}
          gold={state.gold}
          onOpenShop={() => setCartOpen(true)}
          onOpenSettings={() => dispatch({ type: 'OPEN_SETTINGS' })}
        />

        <StatStrip stats={stats} />

        {/* content area */}
        <View style={{ flex: 1, position: 'relative' }}>
          {state.tab === 'life' && <LifeFeed feed={selectFeed(state)} autoScroll={state.settings.autoScroll} filter={state.world.feedFilter} onFilter={(filter) => dispatch({ type: 'SET_FEED_FILTER', filter })} />}
          {state.tab === 'do' && (
            <DoTab
              cat={state.doCat}
              age={state.age}
              state={state}
              onCat={(c) => dispatch({ type: 'SET_CAT', cat: c })}
              onActivity={(id) => {
                haptic('light', buzz);
                dispatch({ type: 'DO_ACTIVITY', id });
              }}
              onCareer={(action, careerId) => dispatch({ type: 'CAREER_ACTION', action, careerId })}
            />
          )}
          {state.tab === 'kin' && (
            <KinTab
              state={state}
              kin={selectKin(state)}
              detail={selectedKin(state)}
              filter={state.world.relationFilter}
              onFilter={(filter) => dispatch({ type: 'SET_REL_FILTER', filter })}
              onOpen={(id) => dispatch({ type: 'OPEN_KIN', id })}
              onBack={() => dispatch({ type: 'CLOSE_KIN' })}
              onInteract={(id, action) => dispatch({ type: 'KIN_INTERACT', id, action })}
            />
          )}
          {state.tab === 'hold' && (
            <HoldingTab
              state={state}
              onAction={(id) => {
                haptic('medium', buzz);
                dispatch({ type: 'MANAGE_HOLDING', id });
              }}
              onUpgrade={(id) => {
                haptic('success', buzz);
                dispatch({ type: 'BUY_HOLDING_UPGRADE', id });
              }}
            />
          )}
          {state.tab === 'shop' && (
            <ShopTab
              gold={state.gold}
              age={state.age}
              income={state.income}
              expenses={state.expenses}
              inventory={state.inventory}
              actionAvailable={state.actionClock.used < state.actionClock.cap}
              onBuy={(item) => {
                haptic('medium', buzz);
                dispatch({ type: 'BUY', item });
              }}
            />
          )}
          {state.tab === 'me' && (
            <MeTab
              portrait={rank.portrait}
              firstName={state.first}
              epithet={state.epithet}
              classRank={rank.key}
              age={state.age}
              stats={meStats}
              rankPath={selectRankPath(state)}
              traits={selectTraits(state)}
              goal={goal}
              bio={selectBio(state)}
              onLockedRankPress={() => {
                haptic('light', buzz);
                setCartOpen(true);
              }}
            />
          )}
        </View>

        {goal && !state.dead && <GoalBanner goal={goal} />}
        <AgeUpBar
          onAgeUp={() => {
            haptic('light', buzz);
            dispatch({ type: 'AGE_UP' });
          }}
          disabled={state.dead || !!state.event}
          actionsUsed={state.actionClock.used}
          actionCap={state.actionClock.cap}
        />
        <View style={{ backgroundColor: C.blueDeep, paddingBottom: bottomNavInset }}>
          <NavBar
            active={state.tab}
            lockedTabs={{}}
            onTab={(t) => {
              dispatch({ type: 'SET_TAB', tab: t });
            }}
          />
        </View>

        {/* overlays */}
        {state.event && !state.dead && (
          <EventModal
            state={state}
            event={state.event}
            onChoose={(event, choice) => {
              haptic('medium', buzz);
              dispatch({ type: 'CHOOSE', event, choice });
            }}
          />
        )}
        {state.settingsOpen && !state.dead && (
          <SettingsModal
            settings={state.settings}
            premiumUnlocked={premiumUnlocked}
            onSetSettings={(patch) => dispatch({ type: 'SET_SETTINGS', settings: patch })}
            onLockedFeaturePress={() => {
              haptic('light', buzz);
              dispatch({ type: 'CLOSE_SETTINGS' });
              setCartOpen(true);
            }}
            onToggleAutoScroll={() => dispatch({ type: 'TOGGLE_AUTOSCROLL' })}
            onRestart={() => {
              dispatch({ type: 'CLOSE_SETTINGS' });
              requestNewLife();
            }}
            onRestartOnboarding={() => {
              dispatch({ type: 'CLOSE_SETTINGS' });
              restartOnboarding();
            }}
            onClose={() => dispatch({ type: 'CLOSE_SETTINGS' })}
            onOpenChronicle={() => {
              dispatch({ type: 'CLOSE_SETTINGS' });
              setChronicleOpen(true);
            }}
            onOpenShop={() => {
              dispatch({ type: 'CLOSE_SETTINGS' });
              setCartOpen(true);
            }}
          />
        )}
        {state.dead && !creating && (
          <DeathScreen
            state={state}
            onNewLife={requestNewLife}
            onContinueHeir={() => dispatch({ type: 'CONTINUE_AS_HEIR' })}
          />
        )}
        {reviewVisible && !state.dead && !state.event && !state.settingsOpen && !creating && (
          <ReviewPrompt onResolved={resolveReview} />
        )}
        {shopPromoVisible &&
          !reviewVisible &&
          !state.dead &&
          !state.event &&
          !state.settingsOpen &&
          !creating &&
          !onboardingVisible &&
          !chronicleOpen &&
          !cartOpen && (
            <ShopPromoPrompt
              messageIndex={shopPromoMessageIndex}
              onExplore={() => {
                haptic('light', buzz);
                resolveShopPromo();
                setCartOpen(true);
              }}
              onDismiss={resolveShopPromo}
            />
          )}
        {chronicleOpen && <ChronicleScreen progress={getProgress()} onClose={() => setChronicleOpen(false)} />}
        {cartOpen && (
          <PremiumShopScreen
            unlocked={premiumUnlocked}
            accessState={premiumAccessState}
            onPurchase={purchasePlan}
            onRestore={restorePremium}
            onClose={() => setCartOpen(false)}
          />
        )}
        {onboardingVisible && !creating && !state.dead && !state.event && (
          <OnboardingScreen
            premiumUnlocked={premiumUnlocked}
            accessState={premiumAccessState}
            onPurchase={purchasePlan}
            onRestore={restorePremium}
            onDone={completeOnboarding}
          />
        )}
        {creating && (
          <CharacterCreation
            initialDifficulty={state.settings.difficulty}
            onBegin={(options) => {
              haptic('success', buzz);
              createCharacter(options);
            }}
          />
        )}
        <AchievementToast
          id={newAchievements[0] ?? null}
          onDone={() => {
            haptic('success', buzz);
            dismissAchievement();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
