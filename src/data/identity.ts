import { GenderIdentity, PronounId, PronounSet } from '@/types/game';

export const PRONOUNS: Record<PronounId, PronounSet> = {
  she: { id: 'she', subject: 'she', object: 'her', possessive: 'her' },
  he: { id: 'he', subject: 'he', object: 'him', possessive: 'his' },
  they: { id: 'they', subject: 'they', object: 'them', possessive: 'their' },
};

export function defaultPronouns(gender: GenderIdentity): PronounSet {
  if (gender === 'woman') return PRONOUNS.she;
  if (gender === 'man') return PRONOUNS.he;
  return PRONOUNS.they;
}

export function attractionAllows(preference: string, gender: GenderIdentity): boolean {
  if (preference === 'none') return false;
  if (preference === 'any') return true;
  return preference === 'women' ? gender === 'woman' : gender === 'man';
}
