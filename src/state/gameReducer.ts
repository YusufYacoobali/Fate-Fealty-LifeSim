/**
 * The reducer is the bridge between React and the pure engine. Every action
 * clones the current state, hands it to the relevant engine function(s), and
 * returns the new state. Engine functions mutate their working copy only.
 */

import { GameEvent, GameSettings, GameState, ShopItem, Tab } from '@/types/game';
import { ActivityCategory } from '@/types/game';
import { cloneState, createLife } from '@/engine/gameState';
import { ageUp } from '@/engine/lifeDirector';
import { applyChoice } from '@/engine/storyGraph';
import { doActivity } from '@/engine/activityEngine';
import { buyItem } from '@/engine/shopEngine';
import { interactKin, KinAction } from '@/engine/kinEngine';
import { Choice } from '@/types/game';

export type GameAction =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'AGE_UP' }
  | { type: 'CHOOSE'; event: GameEvent; choice: Choice }
  | { type: 'DO_ACTIVITY'; id: string }
  | { type: 'BUY'; item: ShopItem }
  | { type: 'KIN_INTERACT'; id: string; action: KinAction }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_CAT'; cat: ActivityCategory | 'all' }
  | { type: 'OPEN_KIN'; id: string }
  | { type: 'CLOSE_KIN' }
  | { type: 'OPEN_SHOP' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'TOGGLE_AUTOSCROLL' }
  | { type: 'SET_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'NEW_LIFE'; options?: NewLifeOptions }
  | { type: 'CONTINUE_AS_HEIR' };

/** Choices captured by the character-creation screen. */
export interface NewLifeOptions {
  firstName?: string;
  birthTraitId?: string;
  difficulty?: GameSettings['difficulty'];
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'AGE_UP': {
      const s = cloneState(state);
      return ageUp(s);
    }

    case 'CHOOSE': {
      const s = cloneState(state);
      applyChoice(s, action.event, action.choice);
      return s;
    }

    case 'DO_ACTIVITY': {
      const s = cloneState(state);
      return doActivity(s, action.id);
    }

    case 'BUY': {
      const s = cloneState(state);
      return buyItem(s, action.item);
    }

    case 'KIN_INTERACT': {
      const s = cloneState(state);
      return interactKin(s, action.id, action.action);
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

    case 'OPEN_SHOP': {
      const s = cloneState(state);
      s.tab = 'shop';
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
      s.settings = { ...s.settings, ...action.settings };
      return s;
    }

    case 'NEW_LIFE': {
      const opts = action.options ?? {};
      const settings = opts.difficulty ? { ...state.settings, difficulty: opts.difficulty } : state.settings;
      return createLife({
        settings,
        lifeNo: state.lifeNo + 1,
        firstName: opts.firstName,
        birthTraitId: opts.birthTraitId,
      });
    }

    case 'CONTINUE_AS_HEIR': {
      // Carry a fraction of wealth/reputation to the next generation.
      const inheritGold = Math.floor(state.gold / 2);
      return createLife({
        settings: state.settings,
        lifeNo: state.lifeNo + 1,
        inherit: {
          gold: inheritGold,
          reputation: Math.floor(state.reputation / 2),
          tags: state.tags.includes('founder') ? ['noble_blood'] : [],
        },
      });
    }

    default:
      return state;
  }
}
