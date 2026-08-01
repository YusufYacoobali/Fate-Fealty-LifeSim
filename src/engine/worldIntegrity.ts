import { GameState } from '@/types/game';

function createsAncestryCycle(state: GameState, childId: string, proposedParentId: string, visited = new Set<string>()): boolean {
  if (childId === proposedParentId) return true;
  if (visited.has(proposedParentId)) return false;
  visited.add(proposedParentId);
  return (state.world.characters[proposedParentId]?.parentIds ?? []).some((id) => createsAncestryCycle(state, childId, id, visited));
}

export function worldIntegrityIssues(state: GameState): string[] {
  const issues: string[] = [];
  const characters = state.world.characters;
  if (!characters[state.playerCharacterId]) issues.push(`missing player ${state.playerCharacterId}`);
  for (const character of Object.values(characters)) {
    for (const parentId of character.parentIds ?? []) {
      if (!characters[parentId]) issues.push(`${character.id} has missing parent ${parentId}`);
      else if (!(characters[parentId].childIds ?? []).includes(character.id)) issues.push(`${parentId}/${character.id} parent-child link is not reciprocal`);
      if (createsAncestryCycle(state, character.id, parentId)) issues.push(`${character.id}/${parentId} creates circular ancestry`);
    }
    for (const childId of character.childIds ?? []) {
      if (!characters[childId]) issues.push(`${character.id} has missing child ${childId}`);
      else if (!(characters[childId].parentIds ?? []).includes(character.id)) issues.push(`${character.id}/${childId} child-parent link is not reciprocal`);
    }
    if (character.spouseId && characters[character.spouseId]?.spouseId !== character.id) issues.push(`${character.id}/${character.spouseId} spouse link is not reciprocal`);
    if (character.birthFamilyId && !state.world.families[character.birthFamilyId]) issues.push(`${character.id} has missing family ${character.birthFamilyId}`);
    if (character.householdId && !state.world.households.some((household) => household.id === character.householdId)) issues.push(`${character.id} has missing household ${character.householdId}`);
  }
  for (const relationship of Object.values(state.world.relationships)) {
    if (!characters[relationship.aId] || !characters[relationship.bId]) issues.push(`${relationship.id} has a missing endpoint`);
    if (relationship.aId === relationship.bId) issues.push(`${relationship.id} is a self relationship`);
  }
  return Array.from(new Set(issues));
}

/** Repair is intentionally reserved for world creation/load recovery. */
export function repairWorldIntegrity(state: GameState): GameState {
  const characters = state.world.characters;
  for (const character of Object.values(characters)) {
    character.parentIds = Array.from(new Set(character.parentIds ?? [])).filter((id) => Boolean(characters[id]) && id !== character.id && !createsAncestryCycle(state, character.id, id));
    character.childIds = Array.from(new Set(character.childIds ?? [])).filter((id) => Boolean(characters[id]) && id !== character.id);
    for (const parentId of character.parentIds) characters[parentId].childIds = Array.from(new Set([...(characters[parentId].childIds ?? []), character.id]));
    for (const childId of character.childIds) characters[childId].parentIds = Array.from(new Set([...(characters[childId].parentIds ?? []), character.id]));
    if (character.spouseId && !characters[character.spouseId]) delete character.spouseId;
    if (character.spouseId) characters[character.spouseId].spouseId = character.id;
    if (character.birthFamilyId && state.world.families[character.birthFamilyId]) {
      const family = state.world.families[character.birthFamilyId];
      family.memberIds = Array.from(new Set([...family.memberIds, character.id]));
    }
    const household = state.world.households.find((item) => item.id === character.householdId);
    if (household) household.memberIds = Array.from(new Set([...household.memberIds, character.id]));
  }
  for (const family of Object.values(state.world.families)) family.memberIds = family.memberIds.filter((id) => Boolean(characters[id]));
  for (const household of state.world.households) household.memberIds = household.memberIds.filter((id) => Boolean(characters[id]));
  for (const [id, relationship] of Object.entries(state.world.relationships)) {
    if (!characters[relationship.aId] || !characters[relationship.bId] || relationship.aId === relationship.bId) delete state.world.relationships[id];
  }
  return state;
}

/** Backward-compatible name; callers should use repair only at trusted boundaries. */
export const validateWorldIntegrity = repairWorldIntegrity;
