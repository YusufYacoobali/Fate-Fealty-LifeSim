import { GameState } from '@/types/game';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';

export const ACTIONS_PER_YEAR = 24;

export interface ActionAvailability {
  available: boolean;
  reason?: string;
}

export function timedActionAvailability(state: GameState): ActionAvailability {
  if (state.dead) return { available: false, reason: 'Thy life is ended' };
  if (state.event) return { available: false, reason: 'Resolve the current event' };
  if (state.tags.includes('imprisoned')) return { available: false, reason: 'Imprisoned' };
  if (state.actionClock.used >= state.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  return { available: true };
}

export function spendAction(state: GameState): GameState {
  state.actionClock.used = Math.min(state.actionClock.cap, state.actionClock.used + 1);
  state.actionClock.lifetimeUsed += 1;
  return state;
}

export function resetActionClock(state: GameState): GameState {
  if (state.actionClock.used >= state.actionClock.cap) state.actionClock.fullYears += 1;
  state.actionClock.used = 0;
  return state;
}

export function rejectTimedAction(state: GameState, reason: string): GameState {
  if (!state.dead) pushFeed(state, 'TIME', C.amber, reason, 'plain');
  return state;
}
