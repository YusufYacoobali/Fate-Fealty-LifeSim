import { reconcileCourt } from './courtEngine';
import { emptyEducation, legacyStatus } from './lifeDepthState';
/**
 * Kin factory — the single place new family members are minted. Content only
 * needs to say `addKin: { kind: 'child' }`; this fills randomised, era-appropriate
 * defaults for everything else, keeping event data terse and consistent.
 */

import { GameState, GenderIdentity, KinKind, KinMember, NewKinSpec, WorldCharacter } from '@/types/game';
import { namesForGender } from '@/data/names';
import { pick, rnd } from './random';
import { defaultPronouns } from '@/data/identity';
import { ENTRY_CAREERS } from '@/data/careers';
import { makePlayerRelationship } from './relationshipState';
import { unlinkSpouse } from './characterState';
import { freshSkills } from '@/data/rpg';

interface KindDefaults {
  name: (gender: GenderIdentity) => string;
  role: string;
  emoji: string;
  trait: string;
  bio: string;
  rel: number;
  age: () => number;
}

const DEFAULTS: Record<KinKind, KindDefaults> = {
  spouse: {
    name: (gender) => pick(namesForGender(gender)),
    role: 'Thy Spouse',
    emoji: '🧑',
    trait: 'Steadfast',
    bio: 'You were wed before God and village. They snore, but they are yours.',
    rel: 70,
    age: () => rnd(18, 30),
  },
  child: {
    name: (gender) => pick(namesForGender(gender, true)),
    role: 'Thy Child',
    emoji: '🧒',
    trait: 'Small and loud',
    bio: 'A small, turnip-shaped continuation of your line. Bites when teething.',
    rel: 80,
    age: () => 0,
  },
  sibling: {
    name: (gender) => pick(namesForGender(gender)),
    role: 'Thy Sibling',
    emoji: '🧑‍🌾',
    trait: 'Competitive',
    bio: 'Grew up beside you in the mud. Still owes you a turnip from years ago.',
    rel: 60,
    age: () => rnd(1, 12),
  },
  friend: {
    name: (gender) => pick(namesForGender(gender)),
    role: 'Thy Friend',
    emoji: '🧑',
    trait: 'Loyal',
    bio: 'A friend made along the muddy road of life.',
    rel: 65,
    age: () => rnd(16, 40),
  },
  foe: {
    name: (gender) => pick(namesForGender(gender)),
    role: 'Thy Rival',
    emoji: '⚔️',
    trait: 'Spiteful',
    bio: 'Someone who has decided, firmly, to be your enemy.',
    rel: 15,
    age: () => rnd(20, 45),
  },
  liege: {
    name: (gender) => `${gender === 'woman' ? 'Lady' : 'Lord'} ${pick(namesForGender(gender))}`,
    role: 'Thy Liege',
    emoji: '👑',
    trait: 'Demanding',
    bio: 'The lord to whom you owe service, taxes, and the occasional war.',
    rel: 50,
    age: () => rnd(35, 60),
  },
  acquaintance: {
    name: (gender) => pick(namesForGender(gender)),
    role: 'Acquaintance',
    emoji: '🧑',
    trait: 'Unfamiliar',
    bio: 'A person of Swineford whose story is still unfolding.',
    rel: 50,
    age: () => rnd(16, 45),
  },
  mother: { name: () => pick(namesForGender('woman')), role: 'Thy Mother', emoji: '👩‍🌾', trait: 'Loving', bio: 'Thy mother.', rel: 75, age: () => rnd(40, 55) },
  father: { name: () => pick(namesForGender('man')), role: 'Thy Father', emoji: '👨‍🌾', trait: 'Weary', bio: 'Thy father.', rel: 60, age: () => rnd(40, 60) },
};

/** Create and append a new kin member, returning it. Mutates `s`. */
export function spawnKin(s: GameState, spec: NewKinSpec): KinMember {
  const d = DEFAULTS[spec.kind];
  // A spouse arriving through an event must still be someone the player could
  // plausibly have married; a random roll produced marriages that contradicted
  // the character's own stated attraction.
  const spouseGender: GenderIdentity | undefined = spec.kind === 'spouse' && s.attraction !== 'none'
    ? (s.attraction === 'women' ? 'woman' : 'man')
    : undefined;
  const gender = spec.gender ?? spouseGender ?? pick(['woman', 'man'] as const);
  const member: KinMember = {
    id: `kin_${s.nextId++}`,
    name: spec.name ?? d.name(gender),
    role: spec.role ?? d.role,
    emoji: spec.emoji ?? d.emoji,
    trait: spec.trait ?? d.trait,
    bio: spec.bio ?? d.bio,
    rel: spec.rel ?? d.rel,
    age: spec.age ?? d.age(),
    kind: spec.kind,
    alive: true,
    isHeir: spec.isHeir,
    gender,
    pronouns: defaultPronouns(gender),
    attraction: spec.attraction ?? (gender === 'woman' ? 'men' : 'women'),
    stats: { health: rnd(45, 90), charm: rnd(25, 75), wits: rnd(25, 75), faith: rnd(15, 75) },
    skills: freshSkills(),
    traits: [spec.trait ?? d.trait],
    gold: rnd(0, 25),
    rankIdx: spec.kind === 'liege' ? Math.max(2, s.rankIdx) : spec.kind === 'foe' ? 2 : 0,
    occupation: { careerId: pick(ENTRY_CAREERS).id, experience: rnd(0, 45), performance: rnd(35, 75), workedThisYear: 0 },
    debts: [],
    healthTags: [],
    memories: [],
  };
  const assigned = ENTRY_CAREERS.find(c => c.id === member.occupation.careerId);
  if (assigned && member.age < assigned.minAge) member.occupation = { careerId:null, experience:0, performance:50, workedThisYear:0 };
  const player = s.world.characters[s.playerCharacterId];
  const playerHousehold = player?.householdId ?? 'house_player';
  const familyId = ['child', 'sibling'].includes(spec.kind) && player?.birthFamilyId
    ? player.birthFamilyId
    : `family_${member.id}`;
  const spouse = Object.values(s.world.characters).find((character) => character.spouseId === s.playerCharacterId && character.alive);
  // Genealogy has to match the label. A `sibling` with no parents used to be
  // family in the kin list and a stranger in the family tree.
  const parentIds = spec.kind === 'child'
    ? [s.playerCharacterId, ...(spouse ? [spouse.id] : [])]
    : spec.kind === 'sibling'
      ? [...(player?.parentIds ?? [])]
      : [];
  Object.assign(member, {
    householdId: ['child', 'spouse', 'sibling'].includes(spec.kind) ? playerHousehold : `house_${member.id}`,
    birthFamilyId: familyId,
    parentIds,
    childIds: [],
    personalityTraits: Array.from(new Set([pick(['loyal', 'ambitious', 'devout', 'cunning']), pick(['patient', 'proud', 'brave', 'generous'])])),
    ambition: pick(['protect_family', 'gain_land', 'marry_well', 'gain_status', 'become_wealthy'] as const),
    secret: pick(['none', 'hidden_debt', 'stolen_property', 'secret_lover'] as const),
    secretRevealed: false,
    vulnerability: pick(['pride', 'poverty', 'loneliness', 'envy'] as const),
    importance: spec.kind === 'child' || spec.kind === 'spouse' ? 'core' : 'supporting',
    worldMemories: [],
    healthConditions: [],
    legalState: { status: 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 },
    secrets: [], guardianIds: [], lineageStatus: spec.kind === 'child' ? 'marital' : 'acknowledged',
    childDevelopment: { completedMilestones: [], education: 'none', investment: 0, favour: 0 },
    factionInfluence: 0,
  } satisfies Partial<WorldCharacter>);
  member.education = emptyEducation();
  member.professionalHistory = {};
  member.socialStatus = legacyStatus(member.rankIdx);
  if (spec.kind === 'child' && player) {
    const estate = player.socialStatus?.estate ?? 'commoner';
    member.socialStatus = { estate, martialHonour: 'none', titles: estate === 'royal' ? ['Royal kin'] : estate === 'noble' || estate === 'baronial' ? ['Noble'] : [], grants: ['birthright'] };
    member.rankIdx = estate === 'commoner' ? 0 : 3;
    member.occupation = { careerId: null, experience: 0, performance: 50, workedThisYear: 0 };
    member.background = { origin: estate === 'royal' ? 'royal' : estate !== 'commoner' ? 'noble' : player.background?.origin ?? 'peasant', familyId, guardianIds: [...parentIds], householdWealth: s.world.households.find(h => h.id === playerHousehold)?.wealth ?? 0, inherited: false };
  }
  s.kin = [...s.kin, member];
  s.world.characters[member.id] = member;
  if (!s.world.families[familyId]) {
    s.world.families[familyId] = { id: familyId, name: `${member.name}'s family`, memberIds: [], reputation: 0, wealthTier: 1, allyFamilyIds: [], enemyFamilyIds: [], inheritedMemories: [] };
  }
  s.world.families[familyId].memberIds.push(member.id);
  let household = s.world.households.find((item) => item.id === member.householdId);
  if (!household) {
    household = { id: member.householdId!, headId: member.id, memberIds: [], wealth: member.gold, foodSecurity: 50, status: 40, residenceQuality: 45, capacity: 4, storedFood: 50 };
    s.world.households.push(household);
  }
  household.memberIds = Array.from(new Set([...household.memberIds, member.id]));
  if (spec.kind === 'child') {
    player?.childIds?.push(member.id);
    if (spouse) spouse.childIds = Array.from(new Set([...(spouse.childIds ?? []), member.id]));
  }
  if (spec.kind === 'spouse' && player && !player.spouseId) {
    // Without this link the marriage existed only as a label: family planning,
    // inheritance and the kinship graph all read `spouseId`, not `kind`.
    player.spouseId = member.id;
    member.spouseId = player.id;
    member.attraction = s.gender === 'woman' ? 'women' : 'men';
    if (!s.tags.includes('married')) s.tags = [...s.tags, 'married'];
  }
  if (spec.kind === 'sibling') {
    for (const parentId of parentIds) {
      const parent = s.world.characters[parentId];
      if (parent) parent.childIds = Array.from(new Set([...(parent.childIds ?? []), member.id]));
    }
  }
  const relationship = makePlayerRelationship(s.playerCharacterId, member, s.age);
  s.world.relationships[relationship.id] = relationship;
  return member;
}

/**
 * Mark a kin member deceased. The selector is either a concrete id ("mother",
 * "kin_42") or a kind ("child") — for a kind we take the first living match.
 */
export function killKin(s: GameState, selector: string): KinMember | null {
  let target = Object.values(s.world.characters).find((k) => k.id !== s.playerCharacterId && k.id === selector && k.alive);
  if (!target) target = Object.values(s.world.characters).find((k) => k.id !== s.playerCharacterId && k.kind === (selector as KinKind) && k.alive);
  if (!target) return null;
  unlinkSpouse(s, target.id);
  target.alive = false;
  target.deathYear = s.world.currentYear;
  const worldTarget = s.world.characters[target.id];
  if (worldTarget) {
    worldTarget.alive = false;
    worldTarget.healthTags = Array.from(new Set([...worldTarget.healthTags, 'deceased']));
  }
  if (s.world.court && (s.world.court.rulerId === target.id || Object.values(s.world.court.offices).includes(target.id))) reconcileCourt(s);
  return target;
}
