import type {AdvancementDestination} from '@/engine/progressionRequirements';
import type {CourtAction} from '@/engine/courtEngine';
import {LifeEventNoticeModal} from '@/components/modals/LifeEventNoticeModal';
import {useFamilyOverlay} from '@/state/hooks/useFamilyOverlay';
import {ChildNamingModal} from '@/components/modals/ChildNamingModal';
import {suggestedChildName} from '@/engine/childNaming';
import React, { useEffect, useState } from 'react';
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
import { HoldingTab,type HoldingSection } from '@/components/tabs/HoldingTab';
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
import { PremiumShopContext } from '@/components/premium/PremiumShopContext';
import { MIN_ANDROID_BOTTOM_NAV_GUARD } from '@/components/systemLayout';
import { useGameFeedback } from '@/state/hooks/useGameFeedback';
import { GameAudioController } from '@/state/hooks/useGameAudio';
import { haptic } from '@/services/haptics';
import { WorldNotices } from '@/components/WorldNotices';
import { eventById } from '@/engine/eventPicker';
import { DailyRewardModal } from '@/components/modals/DailyRewardModal';
import { ProTrialEndedPrompt } from '@/components/modals/ProTrialEndedPrompt';
import { PromotionScreen } from '@/components/modals/PromotionScreen';
import { GoalAchievedScreen } from '@/components/modals/GoalAchievedScreen';
import { DuelModal } from '@/components/modals/InteractiveDuelModal';
import { usePromotionCelebration } from '@/state/hooks/usePromotionCelebration';
import { useGoalCelebration } from '@/state/hooks/useGoalCelebration';
import { ReturnRumourModal } from '@/components/modals/ReturnRumourModal';
import { ForgeModal } from '@/components/rpg/Workshop';
import { careerById } from '@/data/careers';
import { missionEvent } from '@/engine/rpgEngine';

export function GameScreen() {
  const {
    state,
    dispatch,
    loaded,
    saveCompatibilityBlocked,
    reviewVisible,
    resolveReview,
    shopPromoVisible,
    shopPromoMessageIndex,
    resolveShopPromo,
    launchPaywallVisible,
    resolveLaunchPaywall,
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
    premiumEntitled,
    premiumForNextLife,
    premiumAccessState,
    premiumOwnership,
    purchasePlan,
    restorePremium,
    proTrialActive,
    proTrialNoticeVisible,
    dismissProTrialNotice,
    dailyRewardStatus,
    dailyRewardProgress,
    claimDailyReward,
    returnRumour,
    followReturnRumour,
    dismissReturnRumour,
  } = useGame();
  const rank = currentRank(state);
  const stats = selectStats(state);
  const buzz = state.settings.haptics;
  const goal = selectGoal(state);
  const [chronicleOpen, setChronicleOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [educationFocus,setEducationFocus]=useState<'martial'>();
  const [courtFocus,setCourtFocus]=useState<CourtAction>();
  const [holdingSection,setHoldingSection]=useState<HoldingSection>('estate');
  useEffect(()=>setHoldingSection('estate'),[state.playerCharacterId,state.lifeNo]);
  const navigateAdvancement=(destination:AdvancementDestination)=>{
    if(destination==='premium'){setCartOpen(true);return;}
    if(['court','patron','advice','barony','nobility','claim'].includes(destination)){setHoldingSection('court');setCourtFocus(destination==='claim'?'recognise_claim':destination==='patron'?'patron':destination==='advice'?'advise':destination==='barony'?'seek_barony':destination==='nobility'?'seek_nobility':'petition');dispatch({type:'SET_TAB',tab:'hold'});return;}
    if(destination==='life'){dispatch({type:'SET_TAB',tab:'life'});return;}
    setEducationFocus(destination==='martial_learning'?'martial':undefined);
    dispatch({type:'SET_CAT',cat:destination==='work'||destination==='career_promotion'?'work':destination==='activities'?'leisure':'practice'});dispatch({type:'SET_TAB',tab:'do'});
  };
  const insets = useSafeAreaInsets();
  const bottomNavInset = Math.max(insets.bottom, MIN_ANDROID_BOTTOM_NAV_GUARD);
  const currentEvent = state.pendingEvent ? eventById(state.pendingEvent.eventId) : undefined;
  const currentMission = missionEvent(state);
  const { promotedTo, dismissPromotion } = usePromotionCelebration(state, loaded);
  const promotionReason = promotedTo == null
    ? undefined
    : [...state.memories].reverse().find((memory) => memory.tag === `promoted_${rank.key.toLowerCase()}`)?.note;
  const { achievedGoalId, dismissGoal } = useGoalCelebration(state, loaded);
  const familyPromptsAllowed =
    !state.dead &&
    !state.pendingEvent &&
    !state.duel &&
    !state.rpg.mission &&
    !state.rpg.forge &&
    !state.settingsOpen &&
    !creating &&
    !onboardingVisible &&
    !chronicleOpen &&
    !cartOpen;
  const passivePromptsAllowed=familyPromptsAllowed &&
    promotedTo == null &&
    achievedGoalId == null &&
    newAchievements.length === 0;
  // Exactly one low-priority prompt may be visible. This prevents circular
  // "hide when the other is open" checks from leaving every prompt hidden.
  const familyOverlay=useFamilyOverlay(state,familyPromptsAllowed);
  const familyVisible=loaded&&familyPromptsAllowed&&Boolean(familyOverlay);
  const childId=familyOverlay?.kind==='naming'?familyOverlay.id:undefined;
  const lifeNotice=familyOverlay?.kind==='notice'?state.lifeEvents?.notices.find(n=>n.id===familyOverlay.id):undefined;
  const namingVisible=familyVisible&&Boolean(childId);
  const rewardsDeferred=Boolean(familyOverlay);
  const passivePrompt: 'trialEnded' | 'daily' | 'rumour' | 'review' | 'shop' | null = !passivePromptsAllowed || rewardsDeferred
    ? null
    : proTrialNoticeVisible
      ? 'trialEnded'
      : dailyRewardStatus
        ? 'daily'
        : returnRumour
          ? 'rumour'
          : reviewVisible
            ? 'review'
            : shopPromoVisible
              ? 'shop'
              : null;

  // The fifth-launch paywall is lower priority than gameplay, onboarding, and
  // existing return/review prompts. Once the screen is clear, consume the cue
  // and open the same Royal Shop the player can reach manually.
  useEffect(() => {
    if (!launchPaywallVisible || !passivePromptsAllowed || rewardsDeferred || passivePrompt !== null) return;
    resolveLaunchPaywall();
    setCartOpen(true);
  }, [launchPaywallVisible, passivePromptsAllowed, rewardsDeferred, passivePrompt, resolveLaunchPaywall]);

  // Promotion/death haptics ride on engine transitions.
  useGameFeedback(state);

  // Attributes for the ME tab need labels too.
  const meStats = stats.map((s) => ({ ...s, label: STAT_STYLES[s.key].label }));

  return (
    <PremiumShopContext.Provider value={() => setCartOpen(true)}>
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.blue }}>
      <GameAudioController state={state} loaded={loaded} />
      <View style={{ flex: 1, backgroundColor: C.sky }}>
        <Header
          portrait={rank.portrait}
          fullName={fullName(state)}
          age={state.age}
          classRank={rank.key}
          profession={careerById(state.occupation.careerId)?.title}
          gold={state.gold}
          onOpenShop={() => setCartOpen(true)}
          onOpenSettings={() => dispatch({ type: 'OPEN_SETTINGS' })}
        />

        <StatStrip stats={stats} />

        {/* content area */}
        <View style={{ flex: 1, position: 'relative' }}>
          {state.tab === 'life' && <View style={{ flex: 1 }}>
            <WorldNotices recoveryNotice={state.world.recoveryNotice} saveCompatibilityBlocked={saveCompatibilityBlocked} />
            <LifeFeed bornYear={state.bornYear} reducedMotion={!!state.settings.reducedMotion} feed={selectFeed(state)} autoScroll={state.settings.autoScroll} resultKey={state.rpg.mission?.id ?? state.rpg.forge?.id ?? 'life'} filter={state.world.feedFilter} onFilter={(filter) => dispatch({ type: 'SET_FEED_FILTER', filter })} />
          </View>}
          {state.tab === 'do' && (
            <DoTab
              educationFocus={educationFocus}
              cat={state.doCat}
              age={state.age}
              state={state}
              onCat={(c) => dispatch({ type: 'SET_CAT', cat: c })}
              onActivity={(id) => {
                haptic('light', buzz);
                dispatch({ type: 'DO_ACTIVITY', id });
              }}
              onCareer={(action, careerId) => dispatch({ type: 'CAREER_ACTION', action, careerId })}
              onOpenCourt={()=>{setHoldingSection('court');dispatch({type:'SET_TAB',tab:'hold'});}}
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
              onRenameChild={id=>dispatch({type:'OPEN_CHILD_NAMING',id})}
            />
          )}
          {state.tab === 'hold' && (
            <HoldingTab
              state={state} courtFocus={courtFocus} section={holdingSection} onSectionChange={setHoldingSection}
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
              state={state}
              gold={state.gold}
              income={state.income}
              expenses={state.expenses}
              inventory={state.inventory}
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
              onNavigateAdvancement={navigateAdvancement}
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
          disabled={state.dead || !!state.pendingEvent || !!state.duel || !!state.rpg.mission || !!state.rpg.forge}
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
        {familyVisible && lifeNotice && <LifeEventNoticeModal notice={lifeNotice} onContinue={()=>dispatch({type:'ACK_LIFE_EVENT',id:lifeNotice.id})} />}
        {namingVisible && childId && <ChildNamingModal key={childId}
          suggestedName={suggestedChildName(state,childId)} currentName={state.world.characters[childId].name}
          renaming={state.childNaming?.renameId===childId}
          onSuggest={()=>dispatch({type:'SUGGEST_CHILD_NAME',id:childId})}
          onConfirm={name=>dispatch({type:'CONFIRM_CHILD_NAME',id:childId,name})}
          onKeep={()=>dispatch({type:'CONFIRM_CHILD_NAME',id:childId,name:state.childNaming?.renameId===childId?state.world.characters[childId].name:suggestedChildName(state,childId)})} />}

        {state.rpg.forge && !state.dead && <ForgeModal />}
        {currentMission && !state.dead && !state.duel && <EventModal key={currentMission.id} state={state} event={currentMission} onChoose={(choice) => dispatch({ type: 'MISSION_CHOOSE', missionId: currentMission.id, optionId: choice.id! })} />}
        {currentEvent && !state.dead && (
          <EventModal
            state={state}
            event={currentEvent}
            onProfessionalClient={(characterId) => { haptic('light',buzz); dispatch({ type: 'PROFESSIONAL_CLIENT',characterId }); }}
            onChoose={(choice) => {
              haptic('medium', buzz);
              dispatch({ type: 'CHOOSE', choice });
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
            onContinueHeir={(heirId) => dispatch({ type: 'CONTINUE_AS_HEIR', heirId, lifetimeUnlocked: premiumForNextLife })}
          />
        )}
        {passivePrompt === 'trialEnded' && (
          <ProTrialEndedPrompt
            onExplore={() => {
              haptic('light', buzz);
              dismissProTrialNotice();
              setCartOpen(true);
            }}
            onDismiss={dismissProTrialNotice}
          />
        )}
        {passivePrompt === 'review' && <ReviewPrompt onResolved={resolveReview} />}
        {passivePrompt === 'shop' && (
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
        {passivePrompt === 'daily' && dailyRewardStatus && (
          <DailyRewardModal status={dailyRewardStatus} progress={dailyRewardProgress} onClaim={claimDailyReward} />
        )}
        {passivePrompt === 'rumour' && returnRumour && (
          <ReturnRumourModal rumour={returnRumour} onFollow={followReturnRumour} onDismiss={dismissReturnRumour} />
        )}
        {state.duel && (
          <DuelModal
            state={state}
            onRespond={(responseId) => {
              haptic(state.duel?.outcome ? 'success' : 'medium', buzz);
              dispatch({ type: 'DUEL_RESPOND', responseId });
            }}
            onClose={() => dispatch({ type: 'DUEL_CLOSE' })}
          />
        )}
        {promotedTo != null && familyPromptsAllowed && !rewardsDeferred && !state.rpg.forge && !state.dead && (
          <PromotionScreen
            rankIdx={promotedTo}
            reason={promotionReason}
            reducedMotion={!!state.settings.reducedMotion}
            onDone={() => {
              haptic('success', buzz);
              dismissPromotion();
            }}
          />
        )}
        {achievedGoalId && familyPromptsAllowed && !rewardsDeferred && promotedTo == null && !state.rpg.forge && !state.dead && (
          <GoalAchievedScreen
            goalId={achievedGoalId}
            reducedMotion={!!state.settings.reducedMotion}
            onDone={() => {
              haptic('success', buzz);
              dismissGoal();
            }}
          />
        )}
        {chronicleOpen && <ChronicleScreen progress={getProgress()} onClose={() => setChronicleOpen(false)} />}
        {cartOpen && (
          <PremiumShopScreen
            // The storefront reflects what was actually bought, never the sample.
            unlocked={premiumEntitled}
            ownership={premiumOwnership}
            accessState={premiumAccessState}
            onPurchase={purchasePlan}
            onRestore={restorePremium}
            onClose={() => setCartOpen(false)}
          />
        )}
        {onboardingVisible && !creating && !state.dead && !state.pendingEvent && (
          <OnboardingScreen
            premiumUnlocked={premiumEntitled}
            trialActive={proTrialActive}
            accessState={premiumAccessState}
            onPurchase={purchasePlan}
            onRestore={restorePremium}
            onDone={completeOnboarding}
          />
        )}
        {creating && (
          <CharacterCreation
            initialDifficulty={state.settings.difficulty}
            // Birth traits are chosen for the NEXT life, which may not be the
            // one the free sample is covering right now.
            premiumUnlocked={premiumForNextLife}
            onLockedTraitPress={() => {
              haptic('light', buzz);
              setCartOpen(true);
            }}
            onBegin={(options) => {
              haptic('success', buzz);
              createCharacter(options);
            }}
          />
        )}
        {familyPromptsAllowed && !rewardsDeferred && <AchievementToast
          id={state.rpg.forge ? null : newAchievements[0] ?? null}
          onDone={() => {
            haptic('success', buzz);
            dismissAchievement();
          }}
        />}
      </View>
    </SafeAreaView>
    </PremiumShopContext.Provider>
  );
}
