import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native';
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
import { EventModal } from '@/components/modals/EventModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { DeathScreen } from '@/components/modals/DeathScreen';
import { ReviewPrompt } from '@/components/modals/ReviewPrompt';
import { CharacterCreation } from '@/components/modals/CharacterCreation';
import { AchievementToast } from '@/components/modals/AchievementToast';
import { ChronicleScreen } from '@/components/modals/ChronicleScreen';
import { OnboardingModal } from '@/components/modals/OnboardingModal';
import { ComingSoonShop } from '@/components/modals/ComingSoonShop';
import { ANDROID_BOTTOM_NAV_GUARD } from '@/components/systemLayout';
import { useGameFeedback } from '@/state/hooks/useGameFeedback';
import { haptic } from '@/services/haptics';

export function GameScreen() {
  const {
    state,
    dispatch,
    reviewVisible,
    resolveReview,
    creating,
    requestNewLife,
    createCharacter,
    newAchievements,
    dismissAchievement,
    getProgress,
    onboardingVisible,
    completeOnboarding,
    restartOnboarding,
  } = useGame();
  const rank = currentRank(state);
  const stats = selectStats(state);
  const buzz = state.settings.haptics;
  const goal = selectGoal(state);
  const [chronicleOpen, setChronicleOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Promotion/death haptics ride on engine transitions.
  useGameFeedback(state);

  // Attributes for the ME tab need labels too.
  const meStats = stats.map((s) => ({ ...s, label: STAT_STYLES[s.key].label }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.blue }}>
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
          {state.tab === 'life' && <LifeFeed feed={selectFeed(state)} autoScroll={state.settings.autoScroll} />}
          {state.tab === 'do' && (
            <DoTab
              cat={state.doCat}
              onCat={(c) => dispatch({ type: 'SET_CAT', cat: c })}
              onActivity={(id) => {
                haptic('light', buzz);
                dispatch({ type: 'DO_ACTIVITY', id });
              }}
            />
          )}
          {state.tab === 'kin' && (
            <KinTab
              kin={selectKin(state)}
              detail={selectedKin(state)}
              onOpen={(id) => dispatch({ type: 'OPEN_KIN', id })}
              onBack={() => dispatch({ type: 'CLOSE_KIN' })}
              onInteract={(id, action) => dispatch({ type: 'KIN_INTERACT', id, action })}
            />
          )}
          {state.tab === 'shop' && <ShopTab />}
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
        />
        <View style={{ backgroundColor: C.blueDeep, paddingBottom: ANDROID_BOTTOM_NAV_GUARD }}>
          <NavBar active={state.tab} onTab={(t) => dispatch({ type: 'SET_TAB', tab: t })} />
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
            onSetSettings={(patch) => dispatch({ type: 'SET_SETTINGS', settings: patch })}
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
        {chronicleOpen && <ChronicleScreen progress={getProgress()} onClose={() => setChronicleOpen(false)} />}
        {cartOpen && <ComingSoonShop onClose={() => setCartOpen(false)} />}
        {onboardingVisible && !creating && !state.dead && !state.event && (
          <OnboardingModal onDone={completeOnboarding} />
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
