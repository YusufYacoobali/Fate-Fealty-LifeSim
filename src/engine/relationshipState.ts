import {
  GameState,
  KinKind,
  KinMember,
  Relationship,
  RelationshipFlag,
  RelationshipPerspective,
} from '@/types/game';
import { clamp } from './random';

const neutral = (value = 50): RelationshipPerspective => ({ affinity: value, trust: value, respect: value, attraction: 0 });

function flagsFor(kind: KinKind): RelationshipFlag[] {
  if (['mother', 'father', 'sibling', 'child'].includes(kind)) return ['family'];
  if (kind === 'spouse') return ['spouse', 'family'];
  if (kind === 'friend') return ['friend'];
  if (kind === 'foe') return ['rival'];
  if (kind === 'liege') return ['authority'];
  return [];
}

export function makePlayerRelationship(playerId: string, kin: KinMember, age: number): Relationship {
  const attraction = kin.kind === 'spouse' ? 72 : 0;
  return {
    id: `rel_${playerId}_${kin.id}`,
    aId: playerId,
    bId: kin.id,
    aToB: { ...neutral(kin.rel), attraction },
    bToA: { ...neutral(kin.rel), attraction },
    flags: flagsFor(kin.kind),
    lastInteractionAge: age,
    interactionsThisYear: 0,
    sharedMemories: [],
  };
}

export function findRelationship(state: GameState, characterId: string): Relationship | undefined {
  return Object.values(state.world.relationships).find(
    (item) => (item.aId === state.playerCharacterId && item.bId === characterId)
      || (item.bId === state.playerCharacterId && item.aId === characterId),
  );
}

export function relationshipWith(state: GameState, characterId: string): Relationship {
  const existing = findRelationship(state, characterId);
  if (existing) return existing;
  const kin = state.world.characters[characterId];
  if (!kin) throw new Error(`Cannot create relationship with missing character ${characterId}`);
  const relation = makePlayerRelationship(state.playerCharacterId, kin, state.age);
  state.world.relationships[relation.id] = relation;
  return relation;
}

export function readRelationship(state: GameState, kin: KinMember): Relationship {
  return findRelationship(state, kin.id) ?? makePlayerRelationship(state.playerCharacterId, kin, state.age);
}

export function perspectives(
  state: GameState,
  relation: Relationship,
): { player: RelationshipPerspective; other: RelationshipPerspective } {
  return relation.aId === state.playerCharacterId
    ? { player: relation.aToB, other: relation.bToA }
    : { player: relation.bToA, other: relation.aToB };
}

export function syncLegacyBond(state: GameState, characterId: string): void {
  const kin = state.world.characters[characterId];
  if (!kin) return;
  const { player, other } = perspectives(state, relationshipWith(state, characterId));
  kin.rel = clamp(Math.round((player.affinity + other.affinity + player.trust + other.trust) / 4));
}

export function applyRelationshipShift(
  state: GameState,
  kinId: string,
  playerDelta: Partial<RelationshipPerspective>,
  otherDelta: Partial<RelationshipPerspective>,
): Relationship {
  const relation = relationshipWith(state, kinId);
  const views = perspectives(state, relation);
  for (const [key, value] of Object.entries(playerDelta)) {
    views.player[key as keyof RelationshipPerspective] = clamp(
      views.player[key as keyof RelationshipPerspective] + (value ?? 0),
    );
  }
  for (const [key, value] of Object.entries(otherDelta)) {
    views.other[key as keyof RelationshipPerspective] = clamp(
      views.other[key as keyof RelationshipPerspective] + (value ?? 0),
    );
  }
  relation.lastInteractionAge = state.age;
  relation.interactionsThisYear += 1;
  syncLegacyBond(state, kinId);
  return relation;
}
