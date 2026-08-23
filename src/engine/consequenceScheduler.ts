import { GameState, Relationship, ScheduledConsequence } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { clamp } from './random';
import { pushFeed } from './gameState';
import { appendCharacterMemory, appendWorldHistory } from './worldJournal';
import { C } from '@/theme/theme';

function conditionMet(state: GameState, item: ScheduledConsequence): boolean {
  if (!item.condition) return true;
  if (item.condition.kind === 'character_alive') return item.targetIds.every((id) => state.world.characters[id]?.alive);
  const key = item.condition.key;
  if (!key) return true;
  const value = state.world.conditions[key];
  if (item.condition.kind === 'condition_at_least') return value >= (item.condition.value ?? 0);
  return value <= (item.condition.value ?? 100);
}

function relationshipFor(state: GameState, aId: string, bId: string): Relationship | undefined {
  return Object.values(state.world.relationships).find((relation) =>
    (relation.aId === aId && relation.bId === bId) || (relation.aId === bId && relation.bId === aId),
  );
}

function addHistory(state: GameState, type: string, summary: string, salience: number, causes: string[], participantIds: string[]): void {
  appendWorldHistory(state, { id: `history_${state.nextId++}`, year: state.world.currentYear, type, participantIds, familyIds: [], causes, summary, salience });
}

export function resolveScheduledConsequences(state: GameState): GameState {
  const remaining: ScheduledConsequence[] = [];
  for (const item of state.world.scheduledConsequences) {
    if (item.dueYear > state.world.currentYear) {
      remaining.push(item);
      continue;
    }
    if (item.expiresYear != null && item.expiresYear < state.world.currentYear) continue;
    if (!conditionMet(state, item)) {
      if (item.expiresYear == null || item.expiresYear > state.world.currentYear) remaining.push(item);
      continue;
    }
    const resolution = item.resolution;
    if (resolution.type === 'effects') applyEffects(state, { ...resolution.effects, targetCharacterId: resolution.targetId });
    else if (resolution.type === 'condition') {
      state.world.conditions[resolution.condition] = clamp(state.world.conditions[resolution.condition] + resolution.delta);
      state.world.conditionModifiers.push({ id: `modifier_${state.nextId++}`, condition: resolution.condition, label: resolution.label, delta: resolution.delta, application: 'once', sourceId: item.id, expiresYear: state.world.currentYear });
    } else if (resolution.type === 'relationship') {
      const relation = relationshipFor(state, resolution.aId, resolution.bId);
      if (relation) {
        relation.aToB.affinity = clamp(relation.aToB.affinity + resolution.affinity);
        relation.bToA.affinity = clamp(relation.bToA.affinity + resolution.affinity);
        if (resolution.trust) {
          relation.aToB.trust = clamp(relation.aToB.trust + resolution.trust);
          relation.bToA.trust = clamp(relation.bToA.trust + resolution.trust);
        }
      }
    } else if (resolution.type === 'memory') {
      const target = state.world.characters[resolution.targetId];
      if (target) appendCharacterMemory(target, { id: `memory_${state.nextId++}`, year: state.world.currentYear, type: resolution.memoryType, actorIds: [state.playerCharacterId], sentiment: resolution.sentiment, salience: resolution.salience, inherited: false, summary: resolution.summary });
    } else if (resolution.type === 'history') addHistory(state, resolution.historyType, resolution.summary, resolution.salience, [item.explanation], item.targetIds);
    pushFeed(state, 'YEARS LATER', C.purpleDark, item.explanation, 'plain', {}, 'world', 'world');
  }
  state.world.scheduledConsequences = remaining;
  return state;
}
