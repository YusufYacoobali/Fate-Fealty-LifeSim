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
import { concludeDuel, respondToDuel, selectCombatMove, resolveCombatTiming, startDuel } from '@/engine/duelEngine';
import { RpgCommand, performRpgCommand, chooseMission, refreshWorkBoard, resumeMissionAfterDuel } from '@/engine/rpgEngine';
import { awardActivitySkill, grantSkillXp } from '@/engine/rpgProgress';
import { Attack, Defence } from '@/types/rpg';
import { careerById } from '@/data/careers';
import { shopItemById } from '@/data/shop';
import { applyEffects } from '@/engine/consequenceEngine';
import { checkLifeGoal } from '@/engine/goalEngine';
import { ForgeTask } from '@/types/rpg';
import { beginForge, closeForge, finishForge, startForge, strikeForge } from '@/engine/forgeEngine';
import { resolveTradeChoice } from '@/engine/tradeJourney';

export type GameAction =
  | { type: 'FORGE_START'; task: ForgeTask; revision: number }
  | { type: 'FORGE_BEGIN'; id: string }
  | { type: 'FORGE_STRIKE'; id: string; sequence: number; position: number }
  | { type: 'FORGE_QUICK'; id: string }
  | { type: 'FORGE_CLOSE'; id: string }
  | { type: 'TRADE_CHOOSE'; chapter: number; choiceId: string }
  | { type: 'RPG'; command: RpgCommand; revision?: number }
  | { type: 'MISSION_CHOOSE'; missionId: string; optionId: string }
  | { type: 'COMBAT_SELECT'; sequence: number; move: Defence | Attack; fightId?: string }
  | { type: 'COMBAT_TIMING'; sequence: number; offsetMs: number; fightId?: string }
  | { type: 'PRACTICE_DUEL' }
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
  | { type: 'CLAIM_DAILY_REWARD'; gold: number; streak: number; bonus?: DailyRewardBonus; bonusAmount?: number; itemId?: string }
  | { type: 'DUEL_RESPOND'; responseId: string }
  | { type: 'DUEL_CLOSE' }
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
  /**
   * Pro access for the life about to begin. Defaults to the outgoing life's
   * access; the caller overrides it when the free first-life sample starts or
   * ends at exactly this boundary.
   */
  lifetimeUnlocked?: boolean;
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
  if (state.dead) { state.rpg.forge = null; state.rpg.mission = null; state.rpg.expedition = null; }
  refreshWorkBoard(state);
  syncKinToWorld(state);
  return syncPlayerToWorld(state);
}

function proLockedSettings(settings: GameSettings, lifetimeUnlocked: boolean): GameSettings {
  return lifetimeUnlocked ? settings : { ...settings, liveForever: false };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'FORGE_START':
    case 'FORGE_BEGIN':
    case 'FORGE_STRIKE':
    case 'FORGE_QUICK':
    case 'FORGE_CLOSE':
    case 'TRADE_CHOOSE': {
      if (action.type === 'FORGE_START' && action.revision !== state.rpg.revision) return state;
      const s = cloneState(state);
      runWithWorldRng(s.world, () => {
        if (action.type === 'FORGE_START') { startForge(s, action.task); s.rpg.revision += 1; }
        if (action.type === 'FORGE_BEGIN') beginForge(s, action.id);
        if (action.type === 'FORGE_STRIKE') strikeForge(s, action.id, action.sequence, action.position);
        if (action.type === 'FORGE_QUICK') finishForge(s, action.id, true);
        if (action.type === 'FORGE_CLOSE') closeForge(s, action.id);
        if (action.type === 'TRADE_CHOOSE') resolveTradeChoice(s, action.chapter, action.choiceId);
        if (!s.dead && s.stats.health <= 0) checkDeath(s);
      });
      return finishEngineTransaction(s);
    }
    case 'RPG':
    case 'MISSION_CHOOSE':
    case 'COMBAT_SELECT':
    case 'COMBAT_TIMING':
    case 'PRACTICE_DUEL': {
      if (action.type === 'RPG' && action.revision !== undefined && action.revision !== state.rpg.revision) return state;
      if ((action.type === 'COMBAT_SELECT' || action.type === 'COMBAT_TIMING') && action.fightId !== undefined && action.fightId !== state.duel?.combat?.id) return state;
      const s = cloneState(state);
      runWithWorldRng(s.world, () => {
        if (action.type === 'RPG') performRpgCommand(s, action.command);
        if (action.type === 'MISSION_CHOOSE') chooseMission(s, action.missionId, action.optionId);
        if (action.type === 'COMBAT_SELECT') selectCombatMove(s, action.sequence, action.move);
        if (action.type === 'COMBAT_TIMING') resolveCombatTiming(s, action.sequence, action.offsetMs);
        if (action.type === 'PRACTICE_DUEL' && !s.dead && !s.duel && !s.pendingEvent && !s.rpg.mission && !s.rpg.forge && s.age >= 8 && !s.tags.includes('imprisoned')) {
          const opponent = Object.values(s.world.characters).find((p) => p.alive && p.age >= 18 && p.id !== s.playerCharacterId);
          if (opponent) startDuel(s, opponent.id, 'duel', true);
        }
        if (!s.duel && !s.dead && s.stats.health <= 0) checkDeath(s);
      });
      return finishEngineTransaction(s);
    }
    case 'HYDRATE': {
      const s = cloneState(action.state);
      syncPlayerFromWorld(s);
      s.settings = proLockedSettings(s.settings, s.lifetimeUnlocked);
      if (s.pendingEvent && !eventById(s.pendingEvent.eventId)) s.pendingEvent = null;
      if (s.world.recoveryNotice) {
        pushFeed(s, 'CHRONICLE · RECOVERED', '#7a4f9a', 'Some unfinished tales were safely concluded after the game was updated.', 'plain', {}, 'world', 'world');
        s.world.recoveryNotice = false;
      }
      refreshWorkBoard(s);
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
      if (action.id === 'run_caravan') return gameReducer(state, { type: 'RPG', command: { kind: 'caravan' } });
      return timed(state, (s) => activityAvailability(s, action.id).available, (s) => {
        doActivity(s, action.id);
        if (action.id === 'rest' && s.inventory.includes('cottage')) applyEffects(s, { health: 2 });
        return s;
      });
    }

    case 'BUY': {
      return timed(state, (s) => shopAvailability(s, action.item).available, (s) => buyItem(s, action.item));
    }

    case 'KIN_INTERACT': {
      return timed(state, (s) => kinActionAvailability(s, action.id, action.action).available, (s) => interactKin(s, action.id, action.action));
    }

    case 'MANAGE_HOLDING': {
      return timed(state, (s) => holdingActionAvailability(s, action.id).available, (s) => { manageHolding(s, action.id); awardActivitySkill(s, action.id); return s; });
    }

    case 'BUY_HOLDING_UPGRADE': {
      return timed(state, (s) => holdingUpgradeAvailability(s, action.id).available, (s) => { buyHoldingUpgrade(s, action.id); grantSkillXp(s, 'craftsmanship', 6, 'construction'); return s; });
    }

    case 'CAREER_ACTION': {
      if (action.action === 'craft') return { ...state, tab: 'do', doCat: 'work' };
      return timed(
        state,
        (s) => careerActionAvailability(s, action.action, action.careerId).available,
        (s) => {
          performCareerAction(s, action.action, action.careerId);
          return s;
        },
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
      const item = action.itemId ? shopItemById(action.itemId) : undefined;
      const receivedItem = Boolean(item && !s.inventory.includes(item.id));
      if (item && receivedItem) {
        applyEffects(s, item.eff);
        s.inventory = [...s.inventory, item.id];
        checkLifeGoal(s);
      }
      const extra = action.bonus === 'health' ? ' and restorative herbs'
        : action.bonus === 'stores' ? ' and grain for the household'
          : action.bonus === 'reputation' ? ' and the goodwill of the village' : '';
      const keepsake = receivedItem && item ? ` Within the chest lies ${item.name.toLowerCase()}, a possession that is thine forever.` : '';
      pushFeed(s, `DAILY GIFT · DAY ${action.streak}`, '#a36a1f', `The steward grants thee ${action.gold} gold${extra}.${keepsake}`, 'good');
      return finishEngineTransaction(s);
    }

    case 'DUEL_RESPOND': {
      if (!state.duel || state.duel.outcome) return state;
      const s = cloneState(state);
      runWithWorldRng(s.world, () => respondToDuel(s, action.responseId));
      return finishEngineTransaction(s);
    }

    case 'DUEL_CLOSE': {
      if (!state.duel?.outcome) return state;
      const s = cloneState(state);
      runWithWorldRng(s.world, () => {
          const won = s.duel?.outcome === 'won';
          concludeDuel(s);
          if (s.stats.health <= 0) checkDeath(s);
          resumeMissionAfterDuel(s, won);
        return s;
      });
      return finishEngineTransaction(s);
    }

    case 'NEW_LIFE': {
      const opts = action.options ?? {};
      const settings = opts.difficulty ? { ...state.settings, difficulty: opts.difficulty } : state.settings;
      const unlocked = opts.lifetimeUnlocked ?? state.lifetimeUnlocked;
      return createLife({
        settings: proLockedSettings(settings, unlocked),
        lifeNo: state.lifeNo + 1,
        firstName: opts.firstName,
        birthTraitId: opts.birthTraitId,
        gender: opts.gender,
        pronouns: opts.pronouns,
        attraction: opts.attraction,
        lifetimeUnlocked: unlocked,
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
