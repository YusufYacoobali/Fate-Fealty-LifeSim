/**
 * Kin factory — the single place new family members are minted. Content only
 * needs to say `addKin: { kind: 'child' }`; this fills randomised, era-appropriate
 * defaults for everything else, keeping event data terse and consistent.
 */

import { GameState, KinKind, KinMember, NewKinSpec } from '@/types/game';
import { CHILD_NAMES, FIRST_NAMES } from '@/data/names';
import { pick, rnd } from './random';

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
  mother: { name: () => pick(FIRST_NAMES), role: 'Thy Mother', emoji: '👩‍🌾', trait: 'Loving', bio: 'Thy mother.', rel: 75, age: () => rnd(40, 55) },
  father: { name: () => pick(FIRST_NAMES), role: 'Thy Father', emoji: '👨‍🌾', trait: 'Weary', bio: 'Thy father.', rel: 60, age: () => rnd(40, 60) },
};

/** Create and append a new kin member, returning it. Mutates `s`. */
export function spawnKin(s: GameState, spec: NewKinSpec): KinMember {
  const d = DEFAULTS[spec.kind];
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
  };
  s.kin = [...s.kin, member];
  return member;
}

/**
 * Mark a kin member deceased. The selector is either a concrete id ("mother",
 * "kin_42") or a kind ("child") — for a kind we take the first living match.
 */
export function killKin(s: GameState, selector: string): KinMember | null {
  let target = s.kin.find((k) => k.id === selector && k.alive);
  if (!target) target = s.kin.find((k) => k.kind === (selector as KinKind) && k.alive);
  if (!target) return null;
  target.alive = false;
  return target;
}
