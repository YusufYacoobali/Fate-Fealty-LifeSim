import { reconcileCourt } from './courtEngine';
import { GameState, WorldCharacter } from '@/types/game';
import { HEALTH_CONDITION_BY_ID } from '@/content/healthConditions';
import { chance, clamp, pick } from './random';
import { unlinkSpouse } from './characterState';
import { killPlayer } from './consequenceEngine';
import { appendWorldHistory } from './worldJournal';

function killCharacter(state: GameState, character: WorldCharacter, cause: string): void {
  character.alive = false;
  character.deathYear = state.world.currentYear;
  character.deathCause = cause;
  unlinkSpouse(state, character.id);
  if (state.world.court && (state.world.court.rulerId === character.id || Object.values(state.world.court.offices).includes(character.id))) reconcileCourt(state);
  appendWorldHistory(state, { id: `history_health_death_${state.nextId++}`, year: state.world.currentYear, type: 'death', participantIds: [character.id], familyIds: [character.birthFamilyId ?? ''].filter(Boolean), causes: [cause], summary: `${character.name} died from ${cause}.`, salience: character.importance === 'core' ? 4 : 2 });
}

function progressCharacterHealth(state: GameState, character: WorldCharacter): void {
  character.healthConditions ??= [];
  if (character.healthTags.includes('ill') && !character.healthConditions.length) {
    character.healthConditions.push({ id: `health_${state.nextId++}`, conditionId: 'winter_fever', kind: 'illness', severity: 30, diagnosed: false, startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear, sourceId: 'legacy_illness' });
    character.healthTags = character.healthTags.filter((tag) => tag !== 'ill');
  }
  for (const condition of [...character.healthConditions]) {
    if (condition.nextReviewYear > state.world.currentYear) continue;
    const definition = HEALTH_CONDITION_BY_ID[condition.conditionId];
    if (!definition) continue;
    const household = state.world.households.find((item) => item.id === character.householdId);
    const nourishment = household?.storedFood ?? household?.foodSecurity ?? 50;
    const pressure = definition.contagious ? Math.round((state.world.conditions.diseasePressure - 50) / 12) : 0;
    condition.severity = clamp(condition.severity + definition.baseProgression + pressure - Math.round((nourishment - 50) / 18));
    condition.nextReviewYear = state.world.currentYear + 1;
    character.stats.health = clamp(character.stats.health - Math.max(1, Math.round(condition.severity / 24)));
    const recovery = definition.recoveryChance + Math.max(0, nourishment - 50) / 250 + Math.max(0, character.stats.health - 60) / 300;
    if (recovery > 0 && chance(recovery)) {
      condition.severity = clamp(condition.severity - 32);
      if (condition.severity < 18 && definition.kind !== 'disability') character.healthConditions = character.healthConditions.filter((item) => item.id !== condition.id);
    }
    if (condition.severity >= definition.mortalityAtSeverity && chance(Math.min(0.65, (condition.severity - definition.mortalityAtSeverity + 8) / 70))) {
      if (character.id === state.playerCharacterId) {
        // Write through to the canonical character too: tickStructuredHealth
        // mirrors the registry back onto state.stats afterwards, so setting only
        // state.stats.health here would be silently undone. killPlayer keeps the
        // condition's name as the cause instead of a generic health collapse.
        character.stats.health = 0;
        state.stats.health = 0;
        if (!state.settings.liveForever) killPlayer(state, definition.name);
      } else killCharacter(state, character, definition.name);
      return;
    }
  }
}

function spreadDisease(state: GameState): void {
  if (state.world.conditions.diseasePressure < 55 || !chance((state.world.conditions.diseasePressure - 45) / 180)) return;
  const candidates = Object.values(state.world.characters).filter((character) => character.alive && !(character.healthConditions ?? []).some((condition) => HEALTH_CONDITION_BY_ID[condition.conditionId]?.contagious));
  if (!candidates.length) return;
  const character = pick(candidates);
  const conditionId = state.world.conditions.diseasePressure > 82 ? 'plague' : pick(['winter_fever', 'ague', 'gut_sickness', 'lung_fever']);
  character.healthConditions ??= [];
  character.healthConditions.push({ id: `health_${state.nextId++}`, conditionId, kind: 'illness', severity: 24, diagnosed: false, startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear + 1, sourceId: 'disease_pressure' });
}

export function tickStructuredHealth(state: GameState): GameState {
  for (const character of Object.values(state.world.characters)) if (character.alive) progressCharacterHealth(state, character);
  const player = state.world.characters[state.playerCharacterId];
  if (player) state.stats.health = player.stats.health;
  const contagious = Object.values(state.world.characters).reduce((total, character) => total + (character.healthConditions ?? []).filter((condition) => HEALTH_CONDITION_BY_ID[condition.conditionId]?.contagious).length, 0);
  state.world.conditions.diseasePressure = clamp(state.world.conditions.diseasePressure + Math.min(3, Math.floor(contagious / 5)));
  spreadDisease(state);
  return state;
}
