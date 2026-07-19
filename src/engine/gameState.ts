/**
 * State primitives: creating a fresh life, immutable-ish cloning, and the small
 * mutation helpers (feed/memory/money) the rest of the engine builds on.
 *
 * Convention: engine functions take a working copy of GameState and MUTATE it,
 * then return it. The caller (the reducer) always works on a fresh clone, so the
 * stored state object is never mutated in place.
 */

import {
  FeedEntry,
  GameSettings,
  GameState,
  HoldingState,
  KinKind,
  KinMember,
  Memory,
  PathProgress,
  STAT_KEYS,
  Tone,
  AttractionPreference,
  GenderIdentity,
  PronounSet,
  Relationship,
} from '@/types/game';
import { EPITHETS, FIRST_NAMES } from '@/data/names';
import { birthTraits, traitById } from '@/data/traits';
import { clamp, pick, rnd } from './random';
import { C } from '@/theme/theme';
import { freshHolding, holdingTitle } from '@/data/holding';
import { RANKS } from '@/data/ranks';
import { ACTIONS_PER_YEAR } from './actionClock';
import { defaultPronouns } from '@/data/identity';

export const DEFAULT_SETTINGS: GameSettings = {
  autoScroll: true,
  difficulty: 'Normal',
  permadeath: false,
  haptics: true,
};

function emptyPaths(): PathProgress {
  return { martial: 0, court: 0, church: 0, labour: 0, outlaw: 0 };
}

function person(
  id: string,
  name: string,
  kind: KinKind,
  role: string,
  age: number,
  rel: number,
  trait: string,
  careerId: string | null,
  gender: GenderIdentity = 'unspecified',
  emoji = '🧑',
): KinMember {
  return {
    id, name, kind, role, age, rel, trait, emoji, alive: true,
    bio: `${name} is ${trait.toLowerCase()}, with a life and ambitions beyond your own.`,
    gender, pronouns: defaultPronouns(gender), attraction: 'any',
    stats: { health: rnd(48, 92), charm: rnd(25, 78), wits: rnd(25, 78), faith: rnd(15, 75) },
    traits: [trait], gold: rnd(2, 35), rankIdx: kind === 'liege' ? 3 : kind === 'foe' ? 2 : 0,
    occupation: { careerId, experience: rnd(0, 55), performance: rnd(40, 78), workedThisYear: 0 },
    debts: [], healthTags: [], memories: [], householdId: `house_${id}`,
  };
}

function startingKin(): KinMember[] {
  return [
    { ...person('mother', 'Maud', 'mother', 'Thy Mother', 44, 72, 'Stern but loving', 'tenant_farmer', 'woman', '👩‍🌾'), bio: 'Raised you on turnips and tough love. Bakes a rye loaf that could fell an ox.' },
    { ...person('father', 'Old Cedric', 'father', 'Thy Father', 51, 55, 'Perpetually weary', 'farmhand', 'man', '👨‍🌾'), bio: 'A turnip farmer of forty years. Speaks mostly in grunts and weather complaints.' },
    { ...person('goose', 'Sir Quackbeard', 'friend', 'Goose & Best Friend', 3, 95, 'Fiercely loyal', null, 'unspecified', '🪿'), attraction: 'none', bio: 'A goose of uncommon dignity. Has bitten three tax collectors and a bishop.' },
    { ...person('roderick', 'Sir Roderick', 'foe', 'The Apple Thief', 29, 8, 'Insufferably smug', 'guard', 'man', '⚔️'), bio: 'A knight who once called you peasant scum and stole your apple. You have not forgotten.' },
    person('elswyth', 'Elswyth', 'acquaintance', 'A Distant Cousin', 12, 63, 'Competitive', 'apprentice', 'woman', '🧑‍🌾'),
    person('tomas', 'Tomas', 'acquaintance', 'Miller’s Child', 10, 58, 'Quick to laugh', 'farmhand', 'man'),
    person('aldric', 'Lord Aldric', 'acquaintance', 'Lord of Swineford', 47, 42, 'Exacting', 'steward', 'man', '👑'),
    person('agnes', 'Agnes', 'acquaintance', 'Herbalist’s Apprentice', 17, 50, 'Observant', 'acolyte', 'woman', '🌿'),
    person('edwin', 'Edwin', 'acquaintance', 'Smith’s Apprentice', 19, 48, 'Earnest', 'apprentice', 'man', '🔨'),
    person('merek', 'Merek', 'acquaintance', 'Market Hawker', 24, 45, 'Silver-tongued', 'hawker', 'man', '🧺'),
    person('joan', 'Joan', 'acquaintance', 'Village Guard', 27, 52, 'Resolute', 'guard', 'woman', '🛡️'),
    person('rowan', 'Rowan', 'acquaintance', 'Travelling Clerk', 22, 50, 'Bookish', 'clerk', 'nonbinary', '🪶'),
    person('beatrice', 'Beatrice', 'acquaintance', 'Guild Trader', 31, 46, 'Shrewd', 'trader', 'woman', '⚖️'),
    person('oswin', 'Brother Oswin', 'acquaintance', 'Parish Cleric', 38, 57, 'Pious', 'cleric', 'man', '⛪'),
    person('leofric', 'Leofric', 'acquaintance', 'Tenant Farmer', 34, 44, 'Patient', 'tenant_farmer', 'man', '🌾'),
    person('mab', 'Mab', 'acquaintance', 'Mysterious Poacher', 26, 39, 'Cagey', 'poacher_job', 'nonbinary', '🦌'),
  ];
}

function initialRelationship(kin: KinMember): Relationship {
  const flags = ['mother', 'father', 'sibling', 'child'].includes(kin.kind)
    ? ['family'] as const
    : kin.kind === 'friend' ? ['friend'] as const : kin.kind === 'foe' ? ['rival'] as const : kin.kind === 'liege' ? ['authority'] as const : [];
  const view = { affinity: kin.rel, trust: kin.rel, respect: kin.kind === 'liege' ? 65 : kin.rel, attraction: 0 };
  return { id: `rel_player_${kin.id}`, aId: 'player', bId: kin.id, aToB: { ...view }, bToA: { ...view }, flags: [...flags], lastInteractionAge: 0, interactionsThisYear: 0, sharedMemories: [] };
}

export interface FreshLifeOptions {
  settings?: GameSettings;
  lifeNo?: number;
  /** Player-chosen name (character creation); falls back to a random name. */
  firstName?: string;
  /** Player-chosen birth trait id; falls back to a random one. */
  birthTraitId?: string;
  gender?: GenderIdentity;
  pronouns?: PronounSet;
  attraction?: AttractionPreference;
  /** Optional inheritance from a deceased forebear (heir continuation). */
  inherit?: {
    gold?: number;
    reputation?: number;
    tags?: string[];
    rankIdx?: number;
    holding?: HoldingState;
  };
  /** Whether this save can access premium ranks and content. */
  lifetimeUnlocked?: boolean;
}

export function createLife(opts: FreshLifeOptions = {}): GameState {
  const first = opts.firstName?.trim() || pick(FIRST_NAMES);
  const epithet = pick(EPITHETS);
  const settings = opts.settings ?? DEFAULT_SETTINGS;
  const inherit = opts.inherit ?? {};
  const gender = opts.gender ?? 'unspecified';
  const pronouns = opts.pronouns ?? defaultPronouns(gender);
  const inheritedRankIdx = Math.max(0, Math.min(RANKS.length - 1, inherit.rankIdx ?? 0));
  const holding: HoldingState = inherit.holding
    ? {
        stores: clamp(inherit.holding.stores),
        security: clamp(inherit.holding.security),
        loyalty: clamp(inherit.holding.loyalty),
        population: Math.max(1, Math.floor(inherit.holding.population ?? 18)),
        upgrades: [...inherit.holding.upgrades],
        lastActionAge: null,
        criticalYears: 0,
      }
    : freshHolding();

  const stats = {
    health: 80 + rnd(0, 18),
    charm: rnd(25, 55),
    wits: rnd(25, 55),
    faith: rnd(15, 45),
  };

  // Use the chosen birth trait if valid, otherwise roll one. Fold its flat stat
  // shifts into the starting stats.
  const birth = (opts.birthTraitId && traitById(opts.birthTraitId)) || pick(birthTraits());
  if (birth.startStats) {
    for (const k of STAT_KEYS) {
      const d = birth.startStats[k];
      if (d != null) stats[k] = clamp(stats[k] + d);
    }
  }

  const feed: FeedEntry[] = [
    {
      id: 1,
      age: 0,
      tag: 'YEAR 0 · BORN',
      tagColor: '#a36a1f',
      tone: 'good',
      text: `Born in muddy Swineford to a turnip farmer. They named you ${first} and called it a beautiful, screaming miracle.`,
    },
    {
      id: 2,
      age: 0,
      tag: 'YEAR 0 · TRAIT',
      tagColor: C.purpleDark,
      tone: 'good',
      traitId: birth.id,
      text: `${birth.emoji} From the cradle you are ${birth.name} — ${birth.blurb}`,
    },
  ];
  if (inheritedRankIdx > 0 || holding.upgrades.length > 0) {
    feed.push({
      id: 3,
      age: 0,
      tag: 'YEAR 0 · SUCCESSION',
      tagColor: C.charmDark,
      tone: 'good',
      text: `You inherit the rank of ${RANKS[inheritedRankIdx].key} and the ${holdingTitle(inheritedRankIdx)}. Regents hold it in trust until your sixth winter.`,
    });
  }

  const kin = startingKin();
  return {
    first,
    epithet,
    gender,
    pronouns,
    attraction: opts.attraction ?? 'any',
    age: 0,
    gold: 8 + (inherit.gold ?? 0),
    income: 0,
    expenses: 0,
    rankIdx: inheritedRankIdx,
    stats,
    rankProgress: 0,
    reputation: inherit.reputation ?? 0,
    paths: emptyPaths(),
    tags: [...(inherit.tags ?? []), `trait_${birth.id}`],
    traits: [birth.id],
    memories: [],
    activeArcs: [],
    firedOnce: [],
    kin,
    world: {
      relationships: kin.map(initialRelationship),
      households: [{ id: 'house_player', memberIds: ['player', 'mother', 'father'], wealth: 8 }],
      relationFilter: 'all',
      feedFilter: 'all',
      proposalFromId: null,
      recentNarrativeIds: [],
    },
    actionClock: { used: 0, cap: ACTIONS_PER_YEAR, lifetimeUsed: 0, fullYears: 0 },
    occupation: { careerId: null, experience: 0, performance: 50, workedThisYear: 0 },
    debts: [],
    inventory: [],
    holding,
    feed,
    tab: 'life',
    selectedKinId: null,
    settingsOpen: false,
    event: null,
    goalId: null,
    goalDone: false,
    dead: false,
    deathCause: '',
    epitaph: '',
    heirContinued: false,
    lifetimeUnlocked: opts.lifetimeUnlocked ?? false,
    doCat: 'all',
    settings,
    nextId: feed.length + 1,
    bornYear: 1320 + rnd(0, 40),
    lifeNo: opts.lifeNo ?? 1,
  };
}

/** Deep-enough clone for safe mutation by engine functions. */
export function cloneState(s: GameState): GameState {
  return {
    ...s,
    stats: { ...s.stats },
    paths: { ...s.paths },
    tags: [...s.tags],
    traits: [...s.traits],
    memories: s.memories.map((m) => ({ ...m })),
    activeArcs: s.activeArcs.map((a) => ({ ...a })),
    firedOnce: [...s.firedOnce],
    kin: s.kin.map((k) => ({ ...k })),
    world: {
      ...s.world,
      relationships: s.world.relationships.map((r) => ({ ...r, aToB: { ...r.aToB }, bToA: { ...r.bToA }, flags: [...r.flags], sharedMemories: [...r.sharedMemories] })),
      households: s.world.households.map((h) => ({ ...h, memberIds: [...h.memberIds] })),
      recentNarrativeIds: [...s.world.recentNarrativeIds],
    },
    actionClock: { ...s.actionClock },
    occupation: { ...s.occupation },
    debts: s.debts.map((d) => ({ ...d })),
    inventory: [...s.inventory],
    holding: { ...s.holding, upgrades: [...s.holding.upgrades] },
    feed: s.feed.map((f) => ({ ...f })),
    settings: { ...s.settings },
  };
}

// ---------------------------------------------------------------------------
// Small mutation helpers
// ---------------------------------------------------------------------------

export function pushFeed(
  s: GameState,
  tag: string,
  tagColor: string,
  text: string,
  tone: Tone = 'plain',
  meta: Pick<FeedEntry, 'traitId'> = {},
  actorId = 'player',
  source: FeedEntry['source'] = 'player',
): GameState {
  if (s.dead && source === 'player' && !tag.includes('THE END')) return s;
  s.feed = [...s.feed, { id: s.nextId++, age: s.age, tag, tagColor, text, tone, actorId, source, ...meta }];
  return s;
}

export function addMoney(s: GameState, delta: number): GameState {
  const before = s.gold;
  s.gold = Math.max(0, before + delta);
  const actual = s.gold - before;
  if (actual > 0) s.income += actual;
  else if (actual < 0) s.expenses += -actual;
  return s;
}

export function addMemory(s: GameState, tag: string, weight = 1, note?: string): GameState {
  const mem: Memory = { id: s.nextId++, age: s.age, tag, weight, note };
  s.memories = [...s.memories, mem];
  return s;
}

export function hasTag(s: GameState, tag: string): boolean {
  return s.tags.includes(tag);
}

export function addTag(s: GameState, tag: string): GameState {
  if (!s.tags.includes(tag)) s.tags = [...s.tags, tag];
  return s;
}

export function removeTag(s: GameState, tag: string): GameState {
  s.tags = s.tags.filter((t) => t !== tag);
  return s;
}

export function countMemories(s: GameState, tag: string): number {
  return s.memories.filter((m) => m.tag === tag).length;
}

export function countLivingKin(s: GameState, kind: KinKind): number {
  return s.kin.filter((k) => k.alive && k.kind === kind).length;
}

export function hasLivingKin(s: GameState, kind: KinKind): boolean {
  return s.kin.some((k) => k.alive && k.kind === kind);
}
