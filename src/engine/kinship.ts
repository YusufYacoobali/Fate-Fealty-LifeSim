/**
 * Who someone actually is to the player.
 *
 * There used to be two disagreeing answers to this. The kin list read
 * `character.kind` (a label set at spawn time), while the family tree walked
 * `parentIds` (the real genealogy). Anyone born in the world to the player's
 * parents had the blood but not the label, and anyone spawned as a `sibling`
 * had the label but no blood — so each view showed a family the other denied.
 *
 * This module derives the tie from the genealogy graph in a single pass, falls
 * back to the legacy `kind` only when there is no blood or marriage link, and is
 * the one source every view now reads.
 */

import { GameState, GenderIdentity, KinMember } from '@/types/game';

export type KinshipTie =
  | 'self'
  | 'spouse'
  | 'former_spouse'
  | 'mother'
  | 'father'
  | 'daughter'
  | 'son'
  | 'sister'
  | 'brother'
  | 'grandmother'
  | 'grandfather'
  | 'granddaughter'
  | 'grandson'
  | 'aunt'
  | 'uncle'
  | 'niece'
  | 'nephew'
  | 'cousin'
  | 'in_law'
  | 'ward'
  | 'guardian'
  | 'friend'
  | 'rival'
  | 'liege'
  | 'acquaintance';

/** Ties that make someone part of the player's family for filtering purposes. */
const FAMILY_TIES = new Set<KinshipTie>([
  'spouse', 'mother', 'father', 'daughter', 'son', 'sister', 'brother',
  'grandmother', 'grandfather', 'granddaughter', 'grandson',
  'aunt', 'uncle', 'niece', 'nephew', 'cousin', 'in_law', 'ward', 'guardian',
]);

export function isFamilyTie(tie: KinshipTie): boolean {
  return FAMILY_TIES.has(tie);
}

/** Ties close enough that romance would be unthinkable. */
const BLOOD_CLOSE = new Set<KinshipTie>([
  'mother', 'father', 'daughter', 'son', 'sister', 'brother',
  'grandmother', 'grandfather', 'granddaughter', 'grandson',
  'aunt', 'uncle', 'niece', 'nephew',
]);

export function isCloseBlood(tie: KinshipTie): boolean {
  return BLOOD_CLOSE.has(tie);
}

const LABELS: Record<KinshipTie, string> = {
  self: 'Thyself',
  spouse: 'Thy Spouse',
  former_spouse: 'Thy Former Spouse',
  mother: 'Thy Mother',
  father: 'Thy Father',
  daughter: 'Thy Daughter',
  son: 'Thy Son',
  sister: 'Thy Sister',
  brother: 'Thy Brother',
  grandmother: 'Thy Grandmother',
  grandfather: 'Thy Grandfather',
  granddaughter: 'Thy Granddaughter',
  grandson: 'Thy Grandson',
  aunt: 'Thy Aunt',
  uncle: 'Thy Uncle',
  niece: 'Thy Niece',
  nephew: 'Thy Nephew',
  cousin: 'Thy Cousin',
  in_law: 'Kin by Marriage',
  ward: 'Thy Ward',
  guardian: 'Thy Guardian',
  friend: 'Thy Friend',
  rival: 'Thy Rival',
  liege: 'Thy Liege',
  acquaintance: 'Known to Thee',
};

export function kinshipLabel(tie: KinshipTie): string {
  return LABELS[tie];
}

/** Which generation a tie sits in, relative to the player at 0. */
export function kinshipGeneration(tie: KinshipTie): number {
  if (tie === 'grandmother' || tie === 'grandfather') return -2;
  if (tie === 'mother' || tie === 'father' || tie === 'aunt' || tie === 'uncle' || tie === 'guardian') return -1;
  if (tie === 'daughter' || tie === 'son' || tie === 'niece' || tie === 'nephew' || tie === 'ward') return 1;
  if (tie === 'granddaughter' || tie === 'grandson') return 2;
  return 0;
}

function gendered(gender: GenderIdentity, feminine: KinshipTie, masculine: KinshipTie): KinshipTie {
  return gender === 'woman' ? feminine : masculine;
}

/**
 * Every tie to the player in one pass. Views call this once per render rather
 * than resolving each character separately.
 */
export function kinshipMap(state: GameState): Record<string, KinshipTie> {
  const ties: Record<string, KinshipTie> = {};
  const player = state.world.characters[state.playerCharacterId];
  if (!player) return ties;

  const characters = Object.values(state.world.characters);
  const genderOf = (id: string): GenderIdentity => state.world.characters[id]?.gender ?? 'man';

  // A parent -> children index, so the walks below stay cheap.
  const childrenOf = new Map<string, string[]>();
  for (const character of characters) {
    for (const parentId of character.parentIds ?? []) {
      const bucket = childrenOf.get(parentId);
      if (bucket) bucket.push(character.id);
      else childrenOf.set(parentId, [character.id]);
    }
  }
  // `childIds` is maintained separately in places, so merge both directions.
  for (const character of characters) {
    for (const childId of character.childIds ?? []) {
      const bucket = childrenOf.get(character.id);
      if (!bucket) childrenOf.set(character.id, [childId]);
      else if (!bucket.includes(childId)) bucket.push(childId);
    }
  }
  const kids = (id: string): string[] => childrenOf.get(id) ?? [];
  const parentsOf = (id: string): string[] => state.world.characters[id]?.parentIds ?? [];

  // Assign from the outside in, so nearer ties overwrite more distant ones.
  const set = (id: string, tie: KinshipTie) => {
    if (id && id !== player.id) ties[id] = tie;
  };

  const playerParents = parentsOf(player.id);

  // Cousins: children of the player's aunts and uncles.
  const auntsUncles = new Set<string>();
  for (const parentId of playerParents) {
    for (const grandparentId of parentsOf(parentId)) {
      for (const id of kids(grandparentId)) {
        if (id !== parentId && !playerParents.includes(id)) auntsUncles.add(id);
      }
    }
  }
  for (const auntId of auntsUncles) {
    for (const id of kids(auntId)) set(id, 'cousin');
  }

  // Grandparents and grandchildren.
  for (const parentId of playerParents) {
    for (const id of parentsOf(parentId)) set(id, gendered(genderOf(id), 'grandmother', 'grandfather'));
  }
  for (const childId of kids(player.id)) {
    for (const id of kids(childId)) set(id, gendered(genderOf(id), 'granddaughter', 'grandson'));
  }

  for (const id of auntsUncles) set(id, gendered(genderOf(id), 'aunt', 'uncle'));

  // Siblings: anyone sharing at least one parent.
  const siblings = new Set<string>();
  for (const parentId of playerParents) {
    for (const id of kids(parentId)) {
      if (id !== player.id) siblings.add(id);
    }
  }
  for (const id of siblings) {
    for (const nieceId of kids(id)) set(nieceId, gendered(genderOf(nieceId), 'niece', 'nephew'));
  }

  // Marriage ties, before blood so blood can override an odd overlap.
  const spouseId = player.spouseId;
  if (spouseId) {
    for (const id of parentsOf(spouseId)) set(id, 'in_law');
    for (const parentId of parentsOf(spouseId)) {
      for (const id of kids(parentId)) if (id !== spouseId) set(id, 'in_law');
    }
  }
  for (const id of [...siblings, ...kids(player.id)]) {
    const theirSpouse = state.world.characters[id]?.spouseId;
    if (theirSpouse) set(theirSpouse, 'in_law');
  }

  for (const id of siblings) set(id, gendered(genderOf(id), 'sister', 'brother'));
  for (const id of kids(player.id)) set(id, gendered(genderOf(id), 'daughter', 'son'));
  for (const id of playerParents) set(id, gendered(genderOf(id), 'mother', 'father'));

  // Guardianship, which is not blood but is unambiguous.
  for (const character of characters) {
    if (character.guardianIds?.includes(player.id)) set(character.id, ties[character.id] ?? 'ward');
  }
  for (const id of player.guardianIds ?? []) set(id, ties[id] ?? 'guardian');

  if (spouseId) set(spouseId, 'spouse');

  // Anyone with no blood or marriage link falls back to their legacy kind.
  // The former-spouse flag needs the relationship record, so index those once
  // rather than scanning them per character.
  const formerSpouses = new Set<string>();
  for (const relation of Object.values(state.world.relationships)) {
    if (!relation.flags.includes('former_spouse')) continue;
    if (relation.aId === player.id) formerSpouses.add(relation.bId);
    else if (relation.bId === player.id) formerSpouses.add(relation.aId);
  }
  for (const character of characters) {
    if (character.id === player.id || ties[character.id]) continue;
    ties[character.id] = formerSpouses.has(character.id) ? 'former_spouse' : fallbackTie(character);
  }

  return ties;
}

function fallbackTie(character: KinMember): KinshipTie {
  if (character.kind === 'friend') return 'friend';
  if (character.kind === 'foe') return 'rival';
  if (character.kind === 'liege') return 'liege';
  return 'acquaintance';
}

/**
 * The tie to ONE character, resolved directly.
 *
 * This deliberately does not build the full map: the engine calls it once per
 * kin member during an age-up, and doing a whole-world pass each time cost more
 * than doubling the age-up budget. Every lookup below walks a handful of ids.
 */
export function kinshipTo(state: GameState, characterId: string): KinshipTie {
  if (characterId === state.playerCharacterId) return 'self';
  const player = state.world.characters[state.playerCharacterId];
  const target = state.world.characters[characterId];
  if (!player || !target) return 'acquaintance';

  const genderOf = (id: string): GenderIdentity => state.world.characters[id]?.gender ?? 'man';
  const parentsOf = (id: string): string[] => state.world.characters[id]?.parentIds ?? [];
  const childrenOf = (id: string): string[] => state.world.characters[id]?.childIds ?? [];

  if (player.spouseId === characterId) return 'spouse';

  const playerParents = parentsOf(player.id);
  if (playerParents.includes(characterId)) return gendered(genderOf(characterId), 'mother', 'father');

  const targetParents = parentsOf(characterId);
  if (targetParents.includes(player.id) || childrenOf(player.id).includes(characterId)) {
    return gendered(genderOf(characterId), 'daughter', 'son');
  }
  if (playerParents.some((id) => targetParents.includes(id))) {
    return gendered(genderOf(characterId), 'sister', 'brother');
  }

  // Grandparents and grandchildren.
  if (playerParents.some((id) => parentsOf(id).includes(characterId))) {
    return gendered(genderOf(characterId), 'grandmother', 'grandfather');
  }
  if (childrenOf(player.id).some((id) => childrenOf(id).includes(characterId))) {
    return gendered(genderOf(characterId), 'granddaughter', 'grandson');
  }

  // Aunts and uncles share a parent with one of the player's parents.
  const grandparents = playerParents.flatMap(parentsOf);
  if (grandparents.some((id) => childrenOf(id).includes(characterId)) && !playerParents.includes(characterId)) {
    return gendered(genderOf(characterId), 'aunt', 'uncle');
  }

  // Nieces, nephews and cousins are one step further out.
  const siblings = playerParents.flatMap(childrenOf).filter((id) => id !== player.id);
  if (targetParents.some((id) => siblings.includes(id))) {
    return gendered(genderOf(characterId), 'niece', 'nephew');
  }
  const auntsUncles = grandparents.flatMap(childrenOf).filter((id) => !playerParents.includes(id) && id !== player.id);
  if (targetParents.some((id) => auntsUncles.includes(id))) return 'cousin';

  if (player.spouseId) {
    const spouseParents = parentsOf(player.spouseId);
    if (spouseParents.includes(characterId)) return 'in_law';
    if (spouseParents.some((id) => childrenOf(id).includes(characterId))) return 'in_law';
  }
  if ([...siblings, ...childrenOf(player.id)].some((id) => state.world.characters[id]?.spouseId === characterId)) {
    return 'in_law';
  }

  if (target.guardianIds?.includes(player.id)) return 'ward';
  if (player.guardianIds?.includes(characterId)) return 'guardian';

  return fallbackTie(target);
}

/** The role line shown on a kin card: the tie, plus their standing in the world. */
export function kinRoleLine(kin: KinMember, tie: KinshipTie): string {
  const label = kinshipLabel(tie);
  // Keep the flavour role when it says something the tie does not.
  if (tie === 'acquaintance' || tie === 'friend' || tie === 'rival' || tie === 'liege') return kin.role;
  return `${label} · ${kin.role}`;
}
