import { GenderIdentity } from '@/types/game';

export const MEN_NAMES = [
  'Aldric', 'Godwin', 'Bjorn', 'Cuthbert', 'Edmund', 'Wulfric', 'Osric',
  'Percival', 'Aelfric', 'Hugh', 'Leofric', 'Gilbert', 'Thomas', 'Ralf',
  'Simon', 'Walter',
];

export const WOMEN_NAMES = [
  'Rowena', 'Mathilda', 'Beatrix', 'Edith', 'Hilda', 'Agnes', 'Constance',
  'Isolde', 'Mabel', 'Joan', 'Alys', 'Cecily', 'Maud', 'Avice', 'Emma',
];

export const FIRST_NAMES = [...MEN_NAMES, ...WOMEN_NAMES];

export const EPITHETS = [
  'the Unready', 'the Bold', 'the Smelly', 'the Lucky', 'the Confused',
  'the Turnip', 'Goosefriend', 'the Pale', 'Two-Eyebrows', 'the Mild',
  'the Damp', 'the Mostly-Honest', 'the Twice-Fined', 'the Hungry',
];

export const EPITAPHS = [
  'Smelled of turnips. Will be missed by a goose.',
  'Came for the bread, stayed for the plague.',
  'Never did pay back that apple.',
  'Briefly magnificent, mostly muddy.',
  'Loved by few, owed by many.',
  'Here lies one who feared the leech-doctor most of all.',
  'Lived, schemed, died. The goose endures.',
  'Won a tourney once. Mentioned it daily thereafter.',
];

export const BOY_NAMES = ['Wat', 'Gilbert', 'Thomas', 'Ralf', 'Simon', 'Walter', 'Hugh', 'Edwin'];
export const GIRL_NAMES = ['Joan', 'Alys', 'Cecily', 'Maud', 'Avice', 'Emma', 'Agnes', 'Edith'];
export const CHILD_NAMES = [...BOY_NAMES, ...GIRL_NAMES];

export function namesForGender(gender: GenderIdentity, child = false): readonly string[] {
  if (child) return gender === 'woman' ? GIRL_NAMES : BOY_NAMES;
  return gender === 'woman' ? WOMEN_NAMES : MEN_NAMES;
}

/** Repair only names that are definitively listed for the opposite gender. */
export function correctedNpcName(name: string, gender: GenderIdentity, id: string, child = false): string {
  const bareName = name.replace(/^(Lord|Lady|Brother|Sister)\s+/, '');
  const wrongList = gender === 'woman' ? MEN_NAMES : WOMEN_NAMES;
  if (!wrongList.includes(bareName)) return name;
  const choices = namesForGender(gender, child);
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (Math.imul(hash, 31) + id.charCodeAt(index)) >>> 0;
  return choices[hash % choices.length];
}
