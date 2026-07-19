/**
 * The reducer is the bridge between React and the pure engine. Every action
 * clones the current state, hands it to the relevant engine function(s), and
 * returns the new state. Engine functions mutate their working copy only.
 */

import { AttractionPreference, FeedFilter, GameEvent, GameSettings, GameState, GenderIdentity, PronounSet, RelationFilter, ShopItem, Tab } from '@/types/game';
import { ActivityCategory } from '@/types/game';
import { cloneState, createLife } from '@/engine/gameState';
import { ageUp } from '@/engine/lifeDirector';
import { applyChoice } from '@/engine/storyGraph';
import { activityAvailability, doActivity } from '@/engine/activityEngine';
import { buyItem, shopAvailability } from '@/engine/shopEngine';
import { interactKin, KinAction, kinActionAvailability } from '@/engine/kinEngine';
import { Choice } from '@/types/game';
import { buyHoldingUpgrade, holdingActionAvailability, holdingUpgradeAvailability, manageHolding } from '@/engine/holdingEngine';
import { resetActionClock, spendAction, timedActionAvailability } from '@/engine/actionClock';
import { CareerAction, careerActionAvailability, performCareerAction } from '@/engine/careerEngine';
import { checkDeath } from '@/engine/deathEngine';

export type GameAction =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'AGE_UP' }
  | { type: 'CHOOSE'; event: GameEvent; choice: Choice }
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
  | { type: 'NEW_LIFE'; options?: NewLifeOptions }
  | { type: 'CONTINUE_AS_HEIR' };

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
  if (!timedActionAvailability(state).available || !localAvailable(state)) return state;
  perform(state);
  spendAction(state);
  checkDeath(state);
  return state;
}

function proLockedSettings(settings: GameSettings, lifetimeUnlocked: boolean): GameSettings {
  return lifetimeUnlocked ? settings : { ...settings, permadeath: false };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.state, settings: proLockedSettings(action.state.settings, action.state.lifetimeUnlocked) };

    case 'AGE_UP': {
      const s = cloneState(state);
      const aged = ageUp(s);
      if (aged.age !== state.age) resetActionClock(aged);
      return aged;
    }

    case 'CHOOSE': {
      const s = cloneState(state);
      applyChoice(s, action.event, action.choice);
      return s;
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
      const s = cloneState(state);
      s.tab = action.tab;
      s.selectedKinId = null;
      return s;
    }

    case 'SET_CAT': {
      const s = cloneState(state);
      s.doCat = action.cat;
      return s;
    }

    case 'SET_REL_FILTER': {
      const s = cloneState(state);
      s.world.relationFilter = action.filter;
      s.selectedKinId = null;
      return s;
    }

    case 'SET_FEED_FILTER': {
      const s = cloneState(state);
      s.world.feedFilter = action.filter;
      return s;
    }

    case 'OPEN_KIN': {
      const s = cloneState(state);
      s.selectedKinId = action.id;
      return s;
    }

    case 'CLOSE_KIN': {
      const s = cloneState(state);
      s.selectedKinId = null;
      return s;
    }

    case 'OPEN_SETTINGS': {
      const s = cloneState(state);
      s.settingsOpen = true;
      return s;
    }

    case 'CLOSE_SETTINGS': {
      const s = cloneState(state);
      s.settingsOpen = false;
      return s;
    }

    case 'TOGGLE_AUTOSCROLL': {
      const s = cloneState(state);
      s.settings.autoScroll = !s.settings.autoScroll;
      return s;
    }

    case 'SET_SETTINGS': {
      const s = cloneState(state);
      s.settings = proLockedSettings({ ...s.settings, ...action.settings }, s.lifetimeUnlocked);
      return s;
    }

    case 'SET_LIFETIME_UNLOCKED': {
      const s = cloneState(state);
      s.lifetimeUnlocked = action.unlocked;
      s.settings = proLockedSettings(s.settings, action.unlocked);
      return s;
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
      // Hereditary station: carry rank, estate, and part of its resources.
      const inheritGold = Math.floor(state.gold / 2);
      return createLife({
        settings: proLockedSettings(state.settings, state.lifetimeUnlocked),
        lifeNo: state.lifeNo + 1,
        lifetimeUnlocked: state.lifetimeUnlocked,
        inherit: {
          gold: inheritGold,
          reputation: Math.floor(state.reputation / 2),
          tags: state.tags.includes('founder') ? ['noble_blood'] : [],
          rankIdx: state.rankIdx,
          holding: {
            stores: Math.floor(state.holding.stores * 0.75),
            security: Math.floor(state.holding.security * 0.75),
            loyalty: Math.floor(state.holding.loyalty * 0.75),
            population: Math.max(1, Math.floor((state.holding.population ?? 18) * 0.75)),
            upgrades: [...state.holding.upgrades],
            lastActionAge: null,
            criticalYears: 0,
          },
        },
      });
    }

    default:
      return state;
  }
}
