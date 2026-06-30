/**
 * State primitives: creating a fresh life, immutable-ish cloning, and the small
 * mutation helpers (feed/memory/money) the rest of the engine builds on.
 *
 * Convention: engine functions take a working copy of GameState and MUTATE it,
 * then return it. The caller (the reducer) always works on a fresh clone, so the
 * stored state object is never mutated in place.
 */

import {
  GameSettings,
  GameState,
  KinMember,
  Memory,
  PathProgress,
  Tone,
} from '@/types/game';
import { EPITHETS, FIRST_NAMES } from '@/data/names';
import { birthTraits, traitById } from '@/data/traits';
import { clamp, pick, rnd } from './random';
import { C } from '@/theme/theme';

export const DEFAULT_SETTINGS: GameSettings = {
  autoScroll: true,
  difficulty: 'Normal',
  permadeath: true,
  haptics: true,
};

function emptyPaths(): PathProgress {
  return { martial: 0, court: 0, church: 0, labour: 0, outlaw: 0 };
}

function startingKin(): KinMember[] {
  return [
    { id: 'mother', name: 'Maud', role: 'Thy Mother', emoji: '👩‍🌾', rel: 72, age: 44, trait: 'Stern but loving', bio: 'Raised you on turnips and tough love. Bakes a rye loaf that could fell an ox.', kind: 'mother', alive: true },
    { id: 'father', name: 'Old Cedric', role: 'Thy Father', emoji: '👨‍🌾', rel: 55, age: 51, trait: 'Perpetually weary', bio: 'A turnip farmer of forty years. Speaks mostly in grunts and weather complaints.', kind: 'father', alive: true },
    { id: 'goose', name: 'Sir Quackbeard', role: 'Goose & Best Friend', emoji: '🪿', rel: 95, age: 3, trait: 'Fiercely loyal', bio: 'A goose of uncommon dignity. Has bitten three tax collectors and a bishop.', kind: 'friend', alive: true },
    { id: 'roderick', name: 'Sir Roderick', role: 'The Apple Thief', emoji: '⚔️', rel: 8, age: 29, trait: 'Insufferably smug', bio: 'A knight who once called you peasant scum and stole your apple. You have not forgotten.', kind: 'foe', alive: true },
  ];
}

export interface FreshLifeOptions {
  settings?: GameSettings;
  lifeNo?: number;
  /** Player-chosen name (character creation); falls back to a random name. */
  firstName?: string;
  /** Player-chosen birth trait id; falls back to a random one. */
  birthTraitId?: string;
  /** Optional inheritance from a deceased forebear (heir continuation). */
  inherit?: { gold?: number; reputation?: number; tags?: string[] };
}

export function createLife(opts: FreshLifeOptions = {}): GameState {
  const first = opts.firstName?.trim() || pick(FIRST_NAMES);
  const epithet = pick(EPITHETS);
  const settings = opts.settings ?? DEFAULT_SETTINGS;
  const inherit = opts.inherit ?? {};

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
    for (const k of ['health', 'charm', 'wits', 'faith'] as const) {
      const d = birth.startStats[k];
      if (d != null) stats[k] = clamp(stats[k] + d);
    }
  }

  return {
    first,
    epithet,
    age: 0,
    gold: 8 + (inherit.gold ?? 0),
    income: 0,
    expenses: 0,
    rankIdx: 0,
    stats,
    rankProgress: 0,
    reputation: inherit.reputation ?? 0,
    paths: emptyPaths(),
    tags: [...(inherit.tags ?? []), `trait_${birth.id}`],
    traits: [birth.id],
    memories: [],
    activeArcs: [],
    firedOnce: [],
    kin: startingKin(),
    inventory: [],
    feed: [
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
        text: `${birth.emoji} From the cradle you are ${birth.name} — ${birth.blurb}`,
      },
    ],
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
    doCat: 'all',
    settings,
    nextId: 3,
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
    inventory: [...s.inventory],
    feed: s.feed.map((f) => ({ ...f })),
    settings: { ...s.settings },
  };
}

// ---------------------------------------------------------------------------
// Small mutation helpers
// ---------------------------------------------------------------------------

export function pushFeed(s: GameState, tag: string, tagColor: string, text: string, tone: Tone = 'plain'): GameState {
  s.feed = [...s.feed, { id: s.nextId++, age: s.age, tag, tagColor, text, tone }];
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
