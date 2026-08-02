/**
 * The reducer is the bridge between React and the pure engine. Every action
 * clones the current state, hands it to the relevant engine function(s), and
 * returns the new state. Engine functions mutate their working copy only.
 */

import { AttractionPreference, FeedFilter, GameSettings, GameState, GenderIdentity, PronounSet, RelationFilter, ShopItem, Tab } from '@/types/game';
import { ActivityCategory } from '@/types/game';
import { addMoney, cloneState, createLife, pushFeed, syncKinToWorld, syncPlayerFromWorld, syncPlayerToWorld } from '@/engine/gameState';
import { ageUp } from '@/engine/lifeDirector';
import { applyChoice } from '@/engine/storyGraph';
import { activityAvailability, doActivity } from '@/engine/activityEngine';
import { buyItem, shopAvailability } from '@/engine/shopEngine';
import { interactKin, KinAction, kinActionAvailability } from '@/engine/kinEngine';
import { Choice } from '@/types/game';
import { buyHoldingUpgrade, holdingActionAvailability, holdingUpgradeAvailability, manageHolding } from '@/engine/holdingEngine';
import { resetActionClock, spendAction, syncActionLimit, timedActionAvailability } from '@/engine/actionClock';
import { CareerAction, careerActionAvailability, performCareerAction } from '@/engine/careerEngine';
import { checkDeath } from '@/engine/deathEngine';
import { runWithWorldRng } from '@/engine/random';
import { eventById } from '@/engine/eventPicker';
import { continueAsHeir } from '@/engine/successionEngine';
import { DailyRewardBonus } from '@/services/dailyRewards';

export type GameAction =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'AGE_UP' }
  | { type: 'CHOOSE'; choice: Choice }
  | { type: 'DO_ACTIVITY'; id: string }
  | { type: 'BUY'; item: ShopItem }
  | { type: 'KIN_INTERACT'; id: string; action: KinAction }
  | { type: 'MANAGE_HOLDING'; id: string }
  | { type: 'BUY_HOLDING_UPGRADE'; id: string }
  | { type: 'CAREER_ACTION'; action: CareerAction; careerId?: string }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_CAT'; cat: ActivityCategory | 'all' }
  | { type: 'SET_REL_FILTER'; filter: RelationFilter }
  | { type: 'SET_FEED_FILTER'; filter: FeedFilter }
  | { type: 'OPEN_KIN'; id: string }
  | { type: 'CLOSE_KIN' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'TOGGLE_AUTOSCROLL' }
  | { type: 'SET_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'SET_LIFETIME_UNLOCKED'; unlocked: boolean }
  | { type: 'CLAIM_DAILY_REWARD'; gold: number; streak: number; bonus?: DailyRewardBonus; bonusAmount?: number }
  | { type: 'NEW_LIFE'; options?: NewLifeOptions }
  | { type: 'CONTINUE_AS_HEIR'; heirId?: string };

/** Choices captured by the character-creation screen. */
export interface NewLifeOptions {
  firstName?: string;
  birthTraitId?: string;
  difficulty?: GameSettings['difficulty'];
  gender?: GenderIdentity;
  pronouns?: PronounSet;
  attraction?: AttractionPreference;
}

function timed(
  original: GameState,
  localAvailable: (state: GameState) => boolean,
  perform: (state: GameState) => GameState,
): GameState {
  const state = cloneState(original);
  return runWithWorldRng(state.world, () => {
    if (!timedActionAvailability(state).available || !localAvailable(state)) return state;
    perform(state);
    spendAction(state);
    checkDeath(state);
    return finishEngineTransaction(state);
  });
}

function finishEngineTransaction(state: GameState): GameState {
  syncKinToWorld(state);
  return syncPlayerToWorld(state);
}

function proLockedSettings(settings: GameSettings, lifetimeUnlocked: boolean): GameSettings {
  return lifetimeUnlocked ? settings : { ...settings, liveForever: false };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE': {
      const s = cloneState(action.state);
      syncPlayerFromWorld(s);
      s.settings = proLockedSettings(s.settings, s.lifetimeUnlocked);
      if (s.pendingEvent && !eventById(s.pendingEvent.eventId)) s.pendingEvent = null;
      if (s.world.recoveryNotice) {
        pushFeed(s, 'CHRONICLE · RECOVERED', '#7a4f9a', 'Some unfinished tales were safely concluded after the game was updated.', 'plain', {}, 'world', 'world');
        s.world.recoveryNotice = false;
      }
      return s;
    }

    case 'AGE_UP': {
      const s = cloneState(state);
      const aged = runWithWorldRng(s.world, () => ageUp(s));
      if (aged.age !== state.age) resetActionClock(aged);
      return finishEngineTransaction(aged);
    }

    case 'CHOOSE': {
      const s = cloneState(state);
      const event = s.pendingEvent ? eventById(s.pendingEvent.eventId) : undefined;
      if (!event || !event.choices.includes(action.choice)) return s;
      runWithWorldRng(s.world, () => applyChoice(s, event, action.choice));
      return finishEngineTransaction(s);
    }

    case 'DO_ACTIVITY': {
      return timed(state, (s) => activityAvailability(s, action.id).available, (s) => doActivity(s, action.id));
    }

    case 'BUY': {
      return timed(state, (s) => shopAvailability(s, action.item).available, (s) => buyItem(s, action.item));
    }

    case 'KIN_INTERACT': {
      return timed(state, (s) => kinActionAvailability(s, action.id, action.action).available, (s) => interactKin(s, action.id, action.action));
    }

    case 'MANAGE_HOLDING': {
      return timed(state, (s) => holdingActionAvailability(s, action.id).available, (s) => manageHolding(s, action.id));
    }

    case 'BUY_HOLDING_UPGRADE': {
      return timed(state, (s) => holdingUpgradeAvailability(s, action.id).available, (s) => buyHoldingUpgrade(s, action.id));
    }

    case 'CAREER_ACTION': {
      return timed(
        state,
        (s) => careerActionAvailability(s, action.action, action.careerId).available,
        (s) => performCareerAction(s, action.action, action.careerId),
      );
    }

    case 'SET_TAB': {
      return { ...state, tab: action.tab, selectedKinId: null };
    }

    case 'SET_CAT': {
      return { ...state, doCat: action.cat };
    }

    case 'SET_REL_FILTER': {
      return { ...state, selectedKinId: null, world: { ...state.world, relationFilter: action.filter } };
    }

    case 'SET_FEED_FILTER': {
      return { ...state, world: { ...state.world, feedFilter: action.filter } };
    }

    case 'OPEN_KIN': {
      return { ...state, selectedKinId: action.id };
    }

    case 'CLOSE_KIN': {
      return { ...state, selectedKinId: null };
    }

    case 'OPEN_SETTINGS': {
      return { ...state, settingsOpen: true };
    }

    case 'CLOSE_SETTINGS': {
      return { ...state, settingsOpen: false };
    }

    case 'TOGGLE_AUTOSCROLL': {
      return { ...state, settings: { ...state.settings, autoScroll: !state.settings.autoScroll } };
    }

    case 'SET_SETTINGS': {
      return { ...state, settings: proLockedSettings({ ...state.settings, ...action.settings }, state.lifetimeUnlocked) };
    }

    case 'SET_LIFETIME_UNLOCKED': {
      const s = cloneState(state);
      s.lifetimeUnlocked = action.unlocked;
      s.settings = proLockedSettings(s.settings, action.unlocked);
      return syncActionLimit(s);
    }

    case 'CLAIM_DAILY_REWARD': {
      if (state.dead) return state;
      const s = cloneState(state);
      addMoney(s, Math.max(0, Math.floor(action.gold)));
      const amount = Math.max(0, Math.floor(action.bonusAmount ?? 0));
      if (action.bonus === 'health') s.stats.health = Math.min(100, s.stats.health + amount);
      if (action.bonus === 'stores') s.holding.stores = Math.min(100, s.holding.stores + amount);
      if (action.bonus === 'reputation') s.reputation = Math.min(100, s.reputation + amount);
      const extra = action.bonus === 'health' ? ' and restorative herbs'
        : action.bonus === 'stores' ? ' and grain for the household'
          : action.bonus === 'reputation' ? ' and the goodwill of the village' : '';
      pushFeed(s, `DAILY GIFT · DAY ${action.streak}`, '#a36a1f', `The steward grants thee ${action.gold} gold${extra}.`, 'good');
      return finishEngineTransaction(s);
    }

    case 'NEW_LIFE': {
      const opts = action.options ?? {};
      const settings = opts.difficulty ? { ...state.settings, difficulty: opts.difficulty } : state.settings;
      return createLife({
        settings: proLockedSettings(settings, state.lifetimeUnlocked),
        lifeNo: state.lifeNo + 1,
        firstName: opts.firstName,
        birthTraitId: opts.birthTraitId,
        gender: opts.gender,
        pronouns: opts.pronouns,
        attraction: opts.attraction,
        lifetimeUnlocked: state.lifetimeUnlocked,
      });
    }

    case 'CONTINUE_AS_HEIR': {
      const s = cloneState(state);
      return runWithWorldRng(s.world, () => continueAsHeir(s, action.heirId));
    }

    default:
      return state;
  }
}
