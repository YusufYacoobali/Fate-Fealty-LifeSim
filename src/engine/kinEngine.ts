/** Contextual relationship interactions backed by the mutual relationship graph. */

import { GameState } from '@/types/game';
import {
  contextualActions,
  performSystemicRelationshipAction,
  SystemicKinAction,
} from './relationshipEngine';
import { checkLifeGoal } from './goalEngine';
import { ADOPTION_COST } from './familyFormationEngine';

export type KinAction = SystemicKinAction;

export interface KinActionAvailability {
  available: boolean;
  reason?: string;
}

export function kinActionAvailability(state: GameState, id: string, action: KinAction): KinActionAvailability {
  if (state.dead) return { available: false, reason: 'Thy life is ended' };
  if (state.pendingEvent) return { available: false, reason: 'Resolve the current event' };
  if (state.duel) return { available: false, reason: 'Finish the fight first' };
  if (state.actionClock.used >= state.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  const kin = state.kin.find((member) => member.id === id);
  if (!kin || !kin.alive) return { available: false, reason: 'This person is no longer living' };
  if (!contextualActions(state, kin).includes(action)) return { available: false, reason: 'That action is not available for this relationship' };
  if (action === 'gift' && state.gold < 5) return { available: false, reason: 'Needs 5 gold' };
  if (action === 'adopt_child' && state.gold < ADOPTION_COST) return { available: false, reason: `Needs ${ADOPTION_COST} gold` };
  return { available: true };
}

export function interactKin(state: GameState, id: string, action: KinAction): GameState {
  state.tab = 'kin';
  state.selectedKinId = id;
  const availability = kinActionAvailability(state, id, action);
  if (!availability.available) return state;
  const kin = state.kin.find((member) => member.id === id)!;
  performSystemicRelationshipAction(state, kin, action);
  checkLifeGoal(state);
  return state;
}
