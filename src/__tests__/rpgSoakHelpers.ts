import { GameState } from '@/types/game';
import { missionDefinition, optionUnavailable, chooseMission } from '@/engine/rpgEngine';
import { runWithWorldRng } from '@/engine/random';

/** Resolve optional annual estate encounters before continuing legacy life simulations. */
export function resolveRpgEncounter(state: GameState): GameState {
  const mission = state.rpg.mission;
  if (mission && !state.dead) {
    const option = missionDefinition(state)?.options.find((o) => !o.combat && !optionUnavailable(state, o));
    if (!option) throw new Error(`No safe way out of ${mission.definitionId}`);
    runWithWorldRng(state.world, () => chooseMission(state, mission.id, option.id));
  }
  return state;
}
