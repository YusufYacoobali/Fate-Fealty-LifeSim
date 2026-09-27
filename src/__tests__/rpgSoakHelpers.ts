import { GameState } from '@/types/game';
import { missionDefinition, optionUnavailable, chooseMission, resumeMissionAfterDuel } from '@/engine/rpgEngine';
import { runWithWorldRng } from '@/engine/random';
import { concludeDuel, respondToDuel } from '@/engine/duelEngine';
import { checkDeath } from '@/engine/deathEngine';

/** Headless life simulations take peaceful approaches and yield event challenges. */
export function resolveRpgEncounter(state: GameState): GameState {
  for (let guard = 0; guard < 10 && !state.dead && (state.duel || state.rpg.mission); guard++) {
    runWithWorldRng(state.world, () => {
      if (state.duel) {
        if (!state.duel.outcome) respondToDuel(state, 'yield');
        if (!state.duel.outcome) throw new Error('Headless simulation encountered an unfinished timing input');
        const won = state.duel.outcome === 'won';
        concludeDuel(state);
        if (state.stats.health <= 0) checkDeath(state);
        resumeMissionAfterDuel(state, won);
      } else if (state.rpg.mission) {
        const mission = state.rpg.mission;
        const option = missionDefinition(state)?.options.find((o) => !o.combat && !optionUnavailable(state, o));
        if (!option) throw new Error('No safe way out of ' + mission.definitionId);
        chooseMission(state, mission.id, option.id);
      }
    });
  }
  if (!state.dead && (state.duel || state.rpg.mission)) throw new Error('Headless encounter did not settle');
  return state;
}
