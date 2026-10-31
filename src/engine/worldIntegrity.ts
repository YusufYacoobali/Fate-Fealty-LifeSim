import { GameState } from '@/types/game';
import { findRelationship } from './relationshipEngine';

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
    for (const guardianId of character.guardianIds ?? []) if (!characters[guardianId]) issues.push(`${character.id} has missing guardian ${guardianId}`);
    for (const secret of character.secrets ?? []) for (const witnessId of secret.knownByIds) if (!characters[witnessId]) issues.push(`${character.id} secret ${secret.id} has missing witness ${witnessId}`);
    for (const charge of character.legalState?.charges ?? []) {
      for (const victimId of charge.victimIds) if (!characters[victimId]) issues.push(`${character.id} charge ${charge.id} has missing victim ${victimId}`);
      for (const witnessId of charge.witnessIds) if (!characters[witnessId]) issues.push(`${character.id} charge ${charge.id} has missing witness ${witnessId}`);
    }
    if (character.birthFamilyId && !state.world.families[character.birthFamilyId]) issues.push(`${character.id} has missing family ${character.birthFamilyId}`);
    if (character.householdId && !state.world.households.some((household) => household.id === character.householdId)) issues.push(`${character.id} has missing household ${character.householdId}`);
  }
  for (const relationship of Object.values(state.world.relationships)) {
    if (!characters[relationship.aId] || !characters[relationship.bId]) issues.push(`${relationship.id} has a missing endpoint`);
    if (relationship.aId === relationship.bId) issues.push(`${relationship.id} is a self relationship`);
  }
  for (const family of Object.values(state.world.families)) {
    for (const memberId of family.memberIds) if (!characters[memberId]) issues.push(`${family.id} has missing member ${memberId}`);
    else if (characters[memberId].birthFamilyId !== family.id) issues.push(`${family.id}/${memberId} family membership is not reciprocal`);
  }
  for (const household of state.world.households) {
    if (!household.headId || !characters[household.headId]) issues.push(`${household.id} has missing head ${household.headId ?? 'none'}`);
    for (const memberId of household.memberIds) if (!characters[memberId]) issues.push(`${household.id} has missing member ${memberId}`);
    else if (characters[memberId].householdId !== household.id) issues.push(`${household.id}/${memberId} household membership is not reciprocal`);
  }
  for (const expected of state.world.expectedChildren) {
    for (const parentId of expected.parentIds) if (!characters[parentId]) issues.push(`${expected.id} has missing parent or guardian ${parentId}`);
    if (!state.world.households.some((household) => household.id === expected.householdId)) issues.push(`${expected.id} has missing household ${expected.householdId}`);
    if (!state.world.families[expected.familyId]) issues.push(`${expected.id} has missing family ${expected.familyId}`);
  }
  const court = state.world.court;
  if (court) {
    if (court.crisis && [court.crisis.rulerId, court.crisis.leaderId, court.crisis.challengerId].some(id => !characters[id])) issues.push('orphaned court crisis');
    if (!characters[court.rulerId]) issues.push('missing recognised ruler');
    const occupants = Object.values(court.offices);
    if (new Set(occupants).size !== occupants.length || occupants.includes(court.rulerId)) issues.push('incompatible council offices');
    for (const id of occupants) if (!characters[id!]?.alive) issues.push(`invalid council holder ${id}`);
    for (const claim of court.claims) if (!characters[claim.characterId] || !characters[claim.throughId]) issues.push('orphaned royal claim');
  }
  for (const c of Object.values(characters)) {
    for (const id of [...(c.education?.classmateIds ?? []), ...(c.education?.formerMentorIds ?? []), ...(c.education?.sponsorships ?? []).flatMap(s => s.sponsorId ? [s.sponsorId] : []), ...(c.education?.mentorId ? [c.education.mentorId] : [])]) if (!characters[id]) issues.push(`orphaned education reference ${id}`);
    for (const record of Object.values(c.professionalHistory ?? {})) for (const id of [...record.contactIds, ...(record.rivalId ? [record.rivalId] : []), ...record.matters.map(m => m.actorId), ...(record.adviserId ? [record.adviserId] : []), ...(record.patientCare ?? []).flatMap(c => [c.patientId,c.clinicianId,...(c.adviserId ? [c.adviserId] : [])])]) if (!characters[id]) issues.push(`orphaned professional reference ${id}`);
  }
  return Array.from(new Set(issues));
}

/**
 * Saves written before family formation distinguished whose child was whose can
 * contain villagers permanently flagged as the player's children, which inflates
 * household upkeep and offers parental actions on strangers. Demote anyone the
 * player neither fathered nor took in.
 */
function repairKinship(state: GameState): void {
  const player = state.world.characters[state.playerCharacterId];
  for (const character of Object.values(state.world.characters)) {
    if (character.id === state.playerCharacterId || character.kind !== 'child') continue;
    const isPlayerChild = Boolean(character.parentIds?.includes(state.playerCharacterId))
      || Boolean(character.guardianIds?.includes(state.playerCharacterId))
      || Boolean(player?.childIds?.includes(character.id));
    if (isPlayerChild) continue;
    character.kind = 'acquaintance';
    if (character.role === 'Thy Child') {
      const parentNames = (character.parentIds ?? [])
        .map((id) => state.world.characters[id]?.name)
        .filter((name): name is string => Boolean(name));
      character.role = parentNames.length ? `Child of ${parentNames.join(' and ')}` : 'A Swineford Villager';
    }
    character.isHeir = false;
    const relationship = findRelationship(state, character.id);
    if (relationship) relationship.flags = relationship.flags.filter((flag) => flag !== 'family');
  }
}

/** Repair is intentionally reserved for world creation/load recovery. */
export function repairWorldIntegrity(state: GameState): GameState {
  const characters = state.world.characters;
  repairKinship(state);
  for (const character of Object.values(characters)) {
    character.parentIds = Array.from(new Set(character.parentIds ?? [])).filter((id) => Boolean(characters[id]) && id !== character.id && !createsAncestryCycle(state, character.id, id));
    character.childIds = Array.from(new Set(character.childIds ?? [])).filter((id) => Boolean(characters[id]) && id !== character.id);
    for (const parentId of character.parentIds) characters[parentId].childIds = Array.from(new Set([...(characters[parentId].childIds ?? []), character.id]));
    for (const childId of character.childIds) characters[childId].parentIds = Array.from(new Set([...(characters[childId].parentIds ?? []), character.id]));
    if (character.spouseId && !characters[character.spouseId]) delete character.spouseId;
    if (character.spouseId) characters[character.spouseId].spouseId = character.id;
    character.guardianIds = Array.from(new Set(character.guardianIds ?? [])).filter((id) => Boolean(characters[id]) && id !== character.id);
    for (const secret of character.secrets ?? []) secret.knownByIds = Array.from(new Set(secret.knownByIds)).filter((id) => Boolean(characters[id]));
    for (const charge of character.legalState?.charges ?? []) {
      charge.victimIds = Array.from(new Set(charge.victimIds)).filter((id) => Boolean(characters[id]));
      charge.witnessIds = Array.from(new Set(charge.witnessIds)).filter((id) => Boolean(characters[id]));
    }
    if (character.birthFamilyId && state.world.families[character.birthFamilyId]) {
      const family = state.world.families[character.birthFamilyId];
      family.memberIds = Array.from(new Set([...family.memberIds, character.id]));
    }
    const household = state.world.households.find((item) => item.id === character.householdId);
    if (household) household.memberIds = Array.from(new Set([...household.memberIds, character.id]));
  }
  for (const family of Object.values(state.world.families)) family.memberIds = family.memberIds.filter((id) => Boolean(characters[id]));
  for (const family of Object.values(state.world.families)) for (const memberId of family.memberIds) characters[memberId].birthFamilyId = family.id;
  for (const household of state.world.households) {
    household.memberIds = Array.from(new Set(household.memberIds)).filter((id) => Boolean(characters[id]));
    if (!household.headId || !characters[household.headId]) household.headId = household.memberIds[0] ?? state.playerCharacterId;
    for (const memberId of household.memberIds) characters[memberId].householdId = household.id;
  }
  for (const [id, relationship] of Object.entries(state.world.relationships)) {
    if (!characters[relationship.aId] || !characters[relationship.bId] || relationship.aId === relationship.bId) delete state.world.relationships[id];
  }
  state.world.expectedChildren = state.world.expectedChildren.filter((expected) => expected.parentIds.every((id) => Boolean(characters[id])) && state.world.households.some((household) => household.id === expected.householdId) && Boolean(state.world.families[expected.familyId]));
  return state;
}

/** Backward-compatible name; callers should use repair only at trusted boundaries. */
export const validateWorldIntegrity = repairWorldIntegrity;
