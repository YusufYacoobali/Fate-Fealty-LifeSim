/**
 * Kin factory — the single place new family members are minted. Content only
 * needs to say `addKin: { kind: 'child' }`; this fills randomised, era-appropriate
 * defaults for everything else, keeping event data terse and consistent.
 */

import { GameState, KinKind, KinMember, NewKinSpec, WorldCharacter } from '@/types/game';
import { CHILD_NAMES, FIRST_NAMES } from '@/data/names';
import { pick, rnd } from './random';
import { defaultPronouns } from '@/data/identity';
import { ENTRY_CAREERS } from '@/data/careers';
import { makePlayerRelationship } from './relationshipEngine';
import { unlinkSpouse } from './characterState';

interface KindDefaults {
  name: () => string;
  role: string;
  emoji: string;
  trait: string;
  bio: string;
  rel: number;
  age: () => number;
}

const DEFAULTS: Record<KinKind, KindDefaults> = {
  spouse: {
    name: () => pick(FIRST_NAMES),
    role: 'Thy Spouse',
    emoji: '🧑',
    trait: 'Steadfast',
    bio: 'You were wed before God and village. They snore, but they are yours.',
    rel: 70,
    age: () => rnd(18, 30),
  },
  child: {
    name: () => pick(CHILD_NAMES),
    role: 'Thy Child',
    emoji: '🧒',
    trait: 'Small and loud',
    bio: 'A small, turnip-shaped continuation of your line. Bites when teething.',
    rel: 80,
    age: () => 0,
  },
  sibling: {
    name: () => pick(FIRST_NAMES),
    role: 'Thy Sibling',
    emoji: '🧑‍🌾',
    trait: 'Competitive',
    bio: 'Grew up beside you in the mud. Still owes you a turnip from years ago.',
    rel: 60,
    age: () => rnd(1, 12),
  },
  friend: {
    name: () => pick(FIRST_NAMES),
    role: 'Thy Friend',
    emoji: '🧑',
    trait: 'Loyal',
    bio: 'A friend made along the muddy road of life.',
    rel: 65,
    age: () => rnd(16, 40),
  },
  foe: {
    name: () => pick(FIRST_NAMES),
    role: 'Thy Rival',
    emoji: '⚔️',
    trait: 'Spiteful',
    bio: 'Someone who has decided, firmly, to be your enemy.',
    rel: 15,
    age: () => rnd(20, 45),
  },
  liege: {
    name: () => `Lord ${pick(FIRST_NAMES)}`,
    role: 'Thy Liege',
    emoji: '👑',
    trait: 'Demanding',
    bio: 'The lord to whom you owe service, taxes, and the occasional war.',
    rel: 50,
    age: () => rnd(35, 60),
  },
  acquaintance: {
    name: () => pick(FIRST_NAMES),
    role: 'Acquaintance',
    emoji: '🧑',
    trait: 'Unfamiliar',
    bio: 'A person of Swineford whose story is still unfolding.',
    rel: 50,
    age: () => rnd(16, 45),
  },
  mother: { name: () => pick(FIRST_NAMES), role: 'Thy Mother', emoji: '👩‍🌾', trait: 'Loving', bio: 'Thy mother.', rel: 75, age: () => rnd(40, 55) },
  father: { name: () => pick(FIRST_NAMES), role: 'Thy Father', emoji: '👨‍🌾', trait: 'Weary', bio: 'Thy father.', rel: 60, age: () => rnd(40, 60) },
};

/** Create and append a new kin member, returning it. Mutates `s`. */
export function spawnKin(s: GameState, spec: NewKinSpec): KinMember {
  const d = DEFAULTS[spec.kind];
  const gender = pick(['woman', 'man'] as const);
  const member: KinMember = {
    id: `kin_${s.nextId++}`,
    name: spec.name ?? d.name(),
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
    attraction: gender === 'woman' ? 'men' : 'women',
    stats: { health: rnd(45, 90), charm: rnd(25, 75), wits: rnd(25, 75), faith: rnd(15, 75) },
    traits: [spec.trait ?? d.trait],
    gold: rnd(0, 25),
    rankIdx: spec.kind === 'liege' ? Math.max(2, s.rankIdx) : spec.kind === 'foe' ? 2 : 0,
    occupation: { careerId: pick(ENTRY_CAREERS).id, experience: rnd(0, 45), performance: rnd(35, 75), workedThisYear: 0 },
    debts: [],
    healthTags: [],
    memories: [],
  };
  const player = s.world.characters[s.playerCharacterId];
  const playerHousehold = player?.householdId ?? 'house_player';
  const familyId = spec.kind === 'child' && player?.birthFamilyId
    ? player.birthFamilyId
    : `family_${member.id}`;
  const spouse = Object.values(s.world.characters).find((character) => character.spouseId === s.playerCharacterId && character.alive);
  Object.assign(member, {
    householdId: ['child', 'spouse'].includes(spec.kind) ? playerHousehold : `house_${member.id}`,
    birthFamilyId: familyId,
    parentIds: spec.kind === 'child' ? [s.playerCharacterId, ...(spouse ? [spouse.id] : [])] : [],
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
  s.kin = [...s.kin, member];
  s.world.characters[member.id] = member;
  if (!s.world.families[familyId]) {
    s.world.families[familyId] = { id: familyId, name: `${member.name}'s family`, memberIds: [], reputation: 0, wealthTier: 1, allyFamilyIds: [], enemyFamilyIds: [], inheritedMemories: [] };
  }
  s.world.families[familyId].memberIds.push(member.id);
  let household = s.world.households.find((item) => item.id === member.householdId);
  if (!household) {
    household = { id: member.householdId!, headId: member.id, memberIds: [], wealth: member.gold, foodSecurity: 50, status: 40 };
    s.world.households.push(household);
  }
  household.memberIds = Array.from(new Set([...household.memberIds, member.id]));
  if (spec.kind === 'child') {
    player?.childIds?.push(member.id);
    if (spouse) spouse.childIds = Array.from(new Set([...(spouse.childIds ?? []), member.id]));
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
  return target;
}
