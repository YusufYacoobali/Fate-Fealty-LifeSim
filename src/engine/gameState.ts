import { initializeCourt } from './courtEngine';
import { initializeBirthOrigin } from './birthOriginEngine';
import { initializeLifeDepth } from './lifeDepthState';
import { freshRpg, freshSkills } from '@/data/rpg';
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
  FamilyState,
  WorldCharacter,
  ConsequenceDescriptor,
} from '@/types/game';
import { EPITHETS, FIRST_NAMES, namesForGender } from '@/data/names';
import { availableBirthTraits, traitById } from '@/data/traits';
import { clamp, initialRngState, pick, rnd, runWithPersistedRng } from './random';
import { C } from '@/theme/theme';
import { freshHolding, holdingTitle } from '@/data/holding';
import { RANKS } from '@/data/ranks';
import { actionLimitForAccess } from './actionPolicy';
import { defaultPronouns } from '@/data/identity';
import { CURRENT_CONTENT_VERSION } from '@/content/contentVersion';
export { appendWorldHistory } from './worldJournal';
import { cloneWorldCharacter, kinCharacters as canonicalKinCharacters, rebuildKinProjection, syncControlledCharacterFromWorld, syncControlledCharacterToWorld } from './characterState';

export const DEFAULT_SETTINGS: GameSettings = {
  autoScroll: true,
  difficulty: 'Normal',
  liveForever: false,
  haptics: true,
  soundEffects: true,
  reducedMotion: false,
  villageCollapsed: false,
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
  gender: GenderIdentity = 'man',
  emoji = '🧑',
): KinMember {
  return {
    id, name, kind, role, age, rel, trait, emoji, alive: true,
    bio: `${name} is ${trait.toLowerCase()}, with a life and ambitions beyond your own.`,
    gender, pronouns: defaultPronouns(gender), attraction: gender === 'woman' ? 'men' : 'women',
    stats: { health: rnd(48, 92), charm: rnd(25, 78), wits: rnd(25, 78), faith: rnd(15, 75) },
    traits: [trait], gold: rnd(2, 35), rankIdx: kind === 'liege' ? 3 : kind === 'foe' ? 2 : 0,
    occupation: { careerId, experience: rnd(0, 55), performance: rnd(40, 78), workedThisYear: 0 },
    debts: [], healthTags: [], memories: [], householdId: `house_${id}`,
  };
}

function startingKin(): KinMember[] {
  const cast: KinMember[] = [
    { ...person('mother', pick(namesForGender('woman')), 'mother', 'Thy Mother', 44, 72, 'Stern but loving', 'tenant_farmer', 'woman', '👩‍🌾'), bio: 'A guardian whose work and household duties shape your earliest years.' },
    { ...person('father', pick(namesForGender('man')), 'father', 'Thy Father', 51, 55, 'Perpetually weary', 'farmhand', 'man', '👨‍🌾'), bio: 'A parent with obligations, ambitions and a household to maintain.' },
    { ...person('goose', 'Sir Quackbeard', 'friend', 'Goose & Best Friend', 3, 95, 'Fiercely loyal', null, 'man', '🪿'), attraction: 'none', bio: 'A goose of uncommon dignity. Has bitten three tax collectors and a bishop.' },
    { ...person('roderick', 'Sir Roderick', 'foe', 'The Apple Thief', 29, 8, 'Insufferably smug', 'guard', 'man', '⚔️'), bio: 'A knight who once called you peasant scum and stole your apple. You have not forgotten.' },
    person('elswyth', 'Elswyth', 'acquaintance', 'A Distant Cousin', 12, 63, 'Competitive', 'apprentice', 'woman', '🧑‍🌾'),
    person('tomas', 'Tomas', 'acquaintance', 'Miller’s Child', 10, 58, 'Quick to laugh', 'farmhand', 'man'),
    person('aldric', 'Lord Aldric', 'acquaintance', 'Lord of Swineford', 47, 42, 'Exacting', 'steward', 'man', '👑'),
    person('agnes', 'Agnes', 'acquaintance', 'Herbalist’s Apprentice', 17, 50, 'Observant', 'acolyte', 'woman', '🌿'),
    person('edwin', 'Edwin', 'acquaintance', 'Smith’s Apprentice', 19, 48, 'Earnest', 'apprentice', 'man', '🔨'),
    person('merek', 'Merek', 'acquaintance', 'Market Hawker', 24, 45, 'Silver-tongued', 'hawker', 'man', '🧺'),
    person('joan', 'Joan', 'acquaintance', 'Village Guard', 27, 52, 'Resolute', 'guard', 'woman', '🛡️'),
    person('rowan', 'Rowan', 'acquaintance', 'Travelling Clerk', 22, 50, 'Bookish', 'clerk', 'man', '🪶'),
    person('beatrice', 'Beatrice', 'acquaintance', 'Guild Trader', 31, 46, 'Shrewd', 'trader', 'woman', '⚖️'),
    person('oswin', 'Brother Oswin', 'acquaintance', 'Parish Cleric', 38, 57, 'Pious', 'cleric', 'man', '⛪'),
    person('leofric', 'Leofric', 'acquaintance', 'Tenant Farmer', 34, 44, 'Patient', 'tenant_farmer', 'man', '🌾'),
    person('mab', 'Mab', 'acquaintance', 'Mysterious Poacher', 26, 39, 'Cagey', 'poacher_job', 'woman', '🦌'),
  ];
  const careers = ['farmhand', 'apprentice', 'hawker', 'acolyte', 'levy', 'clerk', 'poacher_job'];
  while (cast.length < 30) {
    const index = cast.length;
    const gender = pick(['woman', 'man'] as const);
    cast.push(person(
      `villager_${index}`,
      pick(namesForGender(gender)),
      'acquaintance',
      'A Swineford Villager',
      rnd(8, 55),
      rnd(35, 62),
      pick(['Patient', 'Ambitious', 'Devout', 'Cunning', 'Loyal', 'Proud']),
      careers[index % careers.length],
      gender,
    ));
  }
  return cast;
}

function initialRelationship(playerId: string, kin: KinMember): Relationship {
  const flags = ['mother', 'father', 'sibling', 'child'].includes(kin.kind)
    ? ['family'] as const
    : kin.kind === 'friend' ? ['friend'] as const : kin.kind === 'foe' ? ['rival'] as const : kin.kind === 'liege' ? ['authority'] as const : [];
  const view = { affinity: kin.rel, trust: kin.rel, respect: kin.kind === 'liege' ? 65 : kin.rel, attraction: 0 };
  return { id: `rel_${playerId}_${kin.id}`, aId: playerId, bId: kin.id, aToB: { ...view }, bToA: { ...view }, flags: [...flags], lastInteractionAge: 0, interactionsThisYear: 0, sharedMemories: [] };
}

export interface FreshLifeOptions {
  birthOrigin?: import('@/types/game').BirthOriginId;
  birthWeights?: Partial<Record<import('@/types/game').BirthOriginId, number>>;
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
  /** Explicit seed for tests/headless simulations. Production generates one. */
  worldSeed?: number;
}

export function createLife(opts: FreshLifeOptions = {}): GameState {
  const worldSeed = (opts.worldSeed ?? rnd(0, 0xffffffff)) >>> 0;
  const created = runWithPersistedRng(initialRngState(worldSeed), () => { const state = createLifeFromWorldSeed(opts, worldSeed); initializeBirthOrigin(state, opts.birthOrigin, opts.birthWeights); return state; });
  created.value.world.rngState = created.rngState;
  for (const person of Object.values(created.value.world.characters)) person.skills ??= freshSkills();
  initializeLifeDepth(created.value);
  initializeCourt(created.value);
  return created.value;
}

const PERSONALITIES = ['ambitious', 'loyal', 'cruel', 'devout', 'generous', 'envious', 'patient', 'cunning', 'proud', 'brave', 'merciful', 'bookish'];
const AMBITIONS = ['protect_family', 'gain_land', 'marry_well', 'join_clergy', 'gain_status', 'become_wealthy', 'avenge_family', 'master_craft', 'win_glory', 'seek_freedom'] as const;
const SECRETS = ['none', 'hidden_debt', 'forbidden_faith', 'illegitimate_child', 'cowardice_in_battle', 'stolen_property', 'secret_lover', 'false_lineage', 'criminal_contact', 'betrayed_friend'] as const;
const VULNERABILITIES = ['pride', 'poverty', 'sick_relative', 'disputed_birth', 'loneliness', 'greed', 'fear', 'envy'] as const;
const FAMILY_NAMES = ['of Swineford', 'Ashcombe', 'Fenwick', 'Thorne', 'Mere', 'Godwin', 'Wren', 'Blackbriar', 'Underhill', 'Vale'];

function enrichCharacter(character: WorldCharacter, index: number, familyId: string): WorldCharacter {
  const secret = pick(SECRETS);
  return {
    ...character,
    birthFamilyId: familyId,
    parentIds: [...(character.parentIds ?? [])],
    childIds: [...(character.childIds ?? [])],
    personalityTraits: Array.from(new Set([pick(PERSONALITIES), pick(PERSONALITIES), pick(PERSONALITIES)])).slice(0, 3),
    ambition: pick(AMBITIONS),
    secret,
    secretRevealed: false,
    vulnerability: pick(VULNERABILITIES),
    importance: index < 16 ? 'core' : 'background',
    worldMemories: [],
    healthConditions: [],
    legalState: { status: 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 },
    secrets: secret === 'none' ? [] : [{ id: `secret_${character.id}`, type: secret, knownByIds: [], revealed: false, severity: 35, createdYear: 1320 }],
    guardianIds: [],
    lineageStatus: 'marital',
    childDevelopment: { completedMilestones: [], education: 'none', investment: 0, favour: 0 },
    factionInfluence: 0,
  };
}

function createLifeFromWorldSeed(opts: FreshLifeOptions, worldSeed: number): GameState {
  const first = opts.firstName?.trim() || pick(FIRST_NAMES);
  const epithet = pick(EPITHETS);
  const settings = opts.settings ?? DEFAULT_SETTINGS;
  const inherit = opts.inherit ?? {};
  const gender = opts.gender ?? 'man';
  const pronouns = opts.pronouns ?? defaultPronouns(gender);
  const inheritedRankIdx = Math.max(0, Math.min(opts.lifetimeUnlocked ? RANKS.length - 1 : 3, inherit.rankIdx ?? 0));
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
  const requestedBirth = opts.birthTraitId ? traitById(opts.birthTraitId) : undefined;
  const canUseRequestedBirth = requestedBirth?.kind === 'birth' && (!requestedBirth.premium || opts.lifetimeUnlocked);
  const birth = canUseRequestedBirth ? requestedBirth : pick(availableBirthTraits(Boolean(opts.lifetimeUnlocked)));
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
      text: `Born in Swineford. They named you ${first}; your household has begun a new account of your life.`,
    },
    {
      id: 2,
      age: 0,
      tag: 'YEAR 0 · TRAIT',
      tagColor: C.purpleDark,
      tone: 'good',
      traitId: birth.id,
      text: `${birth.emoji} From the cradle you are ${birth.name}. ${birth.blurb}`,
    },
  ];
  feed.push({
    id: 3,
    age: 0,
    tag: 'WORLD · A NEW SWINEFORD',
    tagColor: C.blue,
    tone: 'plain',
    actorId: 'world',
    source: 'world',
    text: 'A persistent Swineford begins. Its families, rivalries, wars, and unfinished tales will outlive any single character.',
  });
  if (inheritedRankIdx > 0 || holding.upgrades.length > 0) {
    feed.push({
      id: 4,
      age: 0,
      tag: 'YEAR 0 · SUCCESSION',
      tagColor: C.charmDark,
      tone: 'good',
      text: `You inherit the rank of ${RANKS[inheritedRankIdx].key} and the ${holdingTitle(inheritedRankIdx)}. Regents hold it in trust until your sixth winter.`,
    });
  }

  const kin = startingKin();
  const playerId = `player_${opts.lifeNo ?? 1}`;
  const familyIds = FAMILY_NAMES.map((_, index) => `family_${index}`);
  for (let i = 0; i < kin.length; i++) {
    const familyId = i < 2 ? familyIds[0] : familyIds[1 + (i % (familyIds.length - 1))];
    kin[i] = enrichCharacter(kin[i], i, familyId);
  }
  kin.find((member) => member.id === 'mother')!.childIds = [playerId];
  kin.find((member) => member.id === 'father')!.childIds = [playerId];

  const playerCharacter = enrichCharacter({
    id: playerId,
    name: first,
    kind: 'acquaintance',
    role: 'Thyself',
    age: 0,
    rel: 100,
    trait: birth.name,
    emoji: '🧑',
    alive: true,
    bio: `Born in Swineford, ${first}'s story has only begun.`,
    gender,
    pronouns,
    attraction: opts.attraction ?? (gender === 'woman' ? 'men' : 'women'),
    stats: { ...stats },
    traits: [birth.id],
    gold: 8 + (inherit.gold ?? 0),
    rankIdx: inheritedRankIdx,
    occupation: { careerId: null, experience: 0, performance: 50, workedThisYear: 0 },
    debts: [],
    healthTags: [],
    memories: [],
    householdId: 'house_player',
    parentIds: ['mother', 'father'],
  }, 0, familyIds[0]);

  const characters: Record<string, WorldCharacter> = Object.fromEntries([
    [playerId, playerCharacter],
    ...kin.map((member) => [member.id, member] as const),
  ]);
  const families: Record<string, FamilyState> = Object.fromEntries(familyIds.map((id, index) => [id, {
    id,
    name: FAMILY_NAMES[index],
    memberIds: Object.values(characters).filter((character) => character.birthFamilyId === id).map((character) => character.id),
    reputation: 0,
    wealthTier: index === 0 ? 1 : rnd(0, 3),
    allyFamilyIds: [],
    enemyFamilyIds: [],
    inheritedMemories: [],
  }]));
  const households = familyIds.map((familyId, index) => {
    const memberIds = [...families[familyId].memberIds];
    return {
      id: index === 0 ? 'house_player' : `house_${index}`,
      headId: memberIds[0],
      memberIds,
      wealth: index === 0 ? 8 : rnd(3, 35),
      foodSecurity: rnd(40, 75),
      status: rnd(20, 65),
      residenceQuality: rnd(30, 65),
      capacity: Math.max(4, memberIds.length + 2),
      storedFood: rnd(30, 70),
    };
  });
  for (const household of households) for (const id of household.memberIds) characters[id].householdId = household.id;
  return {
    schemaVersion: 6,
    rpg: freshRpg(),
    playerCharacterId: playerId,
    playerRun: { startedYear: 1320, generation: opts.lifeNo ?? 1, roleProgress: {} },
    pendingEvent: null,
    duel: null,
    first,
    epithet,
    gender,
    pronouns,
    attraction: opts.attraction ?? (gender === 'woman' ? 'men' : 'women'),
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
      relationships: Object.fromEntries(kin.map((member) => {
        const relationship = initialRelationship(playerId, member);
        return [relationship.id, relationship];
      })),
      households,
      relationFilter: 'all',
      feedFilter: 'all',
      proposalFromId: null,
      recentNarrativeIds: [],
      currentYear: 1320,
      worldSeed,
      rngState: initialRngState(worldSeed),
      contentVersion: CURRENT_CONTENT_VERSION,
      characters,
      families,
      conditions: { foodSecurity: 58, prosperity: 48, publicOrder: 55, warThreat: 25, diseasePressure: 20, religiousTension: 30 },
      conditionModifiers: [],
      activeStories: [],
      scheduledConsequences: [],
      history: [],
      pacing: { lastMajorYear: null, lastImportantYear: null, quietYearsSinceStory: 0, majorEventsThisLife: 0, mediumStoriesStarted: 0, immediateChainDepth: 0 },
      recoveryNotice: false,
      contentLedger: {},
      repetitionLedger: {},
      recentDomains: [],
      expectedChildren: [],
      factions: {
        crown: { id: 'crown', name: 'The Crown', influence: 62, playerStanding: 0, leaderId: 'aldric', lastActionYear: 1319 },
        church: { id: 'church', name: 'The Church', influence: 58, playerStanding: 0, leaderId: 'oswin', lastActionYear: 1319 },
        guilds: { id: 'guilds', name: 'The Guilds', influence: 48, playerStanding: 0, leaderId: 'beatrice', lastActionYear: 1319 },
        commons: { id: 'commons', name: 'The Commons', influence: 54, playerStanding: 0, leaderId: 'leofric', lastActionYear: 1319 },
        outlaws: { id: 'outlaws', name: 'The Outlaws', influence: 22, playerStanding: 0, leaderId: 'mab', lastActionYear: 1319 },
      },
    },
    actionClock: { used: 0, cap: actionLimitForAccess(Boolean(opts.lifetimeUnlocked)), lifetimeUsed: 0, fullYears: 0 },
    occupation: { careerId: null, experience: 0, performance: 50, workedThisYear: 0 },
    debts: [],
    inventory: [],
    holding,
    feed,
    tab: 'life',
    selectedKinId: null,
    settingsOpen: false,
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
    bornYear: 1320,
    lifeNo: opts.lifeNo ?? 1,
  };
}

/**
 * Deep-enough clone for safe mutation by engine functions, and the only clone
 * path the reducer uses.
 *
 * An earlier structural-sharing variant existed for "player-only" actions, but
 * it shared `world.relationships` and every non-player character — both of which
 * activity handlers legitimately mutate (nursing a relative, teaching a child,
 * gaining a tavern friend), so those actions wrote through to the previous
 * state. Keeping one honest clone is worth more than the microseconds saved.
 */
export function cloneState(s: GameState): GameState {
  const cloneCharacter = cloneWorldCharacter;
  const characters = Object.fromEntries(Object.entries(s.world.characters).map(([id, character]) => [id, cloneCharacter(character)]));
  const cloned = {
    ...s,
    rpg: JSON.parse(JSON.stringify(s.rpg ?? freshRpg())),
    stats: { ...s.stats },
    duel: s.duel ? { ...s.duel, log: [...s.duel.log], combat: s.duel.combat ? { ...s.duel.combat, ...(s.duel.combat.solo ? { solo: { ...s.duel.combat.solo } } : {}) } : undefined } : null,
    paths: { ...s.paths },
    tags: [...s.tags],
    traits: [...s.traits],
    memories: s.memories.map((m) => ({ ...m })),
    activeArcs: s.activeArcs.map((a) => ({ ...a })),
    firedOnce: [...s.firedOnce],
    // Compatibility projection: these entries are the same objects held by
    // world.characters, never independently writable character copies.
    kin: Object.values(characters).filter((character) => character.id !== s.playerCharacterId),
    world: {
      ...s.world,
      court: s.world.court ? JSON.parse(JSON.stringify(s.world.court)) : undefined,
      rngState: { ...s.world.rngState },
      conditions: { ...s.world.conditions },
      relationships: Object.fromEntries(Object.entries(s.world.relationships).map(([id, r]) => [id, ({ ...r, aToB: { ...r.aToB }, bToA: { ...r.bToA }, flags: [...r.flags], sharedMemories: [...r.sharedMemories] })])),
      households: s.world.households.map((h) => ({ ...h, memberIds: [...h.memberIds] })),
      characters,
      families: Object.fromEntries(Object.entries(s.world.families).map(([id, family]) => [id, {
        ...family,
        memberIds: [...family.memberIds],
        allyFamilyIds: [...family.allyFamilyIds],
        enemyFamilyIds: [...family.enemyFamilyIds],
        inheritedMemories: family.inheritedMemories.map((memory) => ({ ...memory })),
      }])),
      conditionModifiers: s.world.conditionModifiers.map((modifier) => ({ ...modifier })),
      activeStories: s.world.activeStories.map((story) => ({ ...story, bindings: { ...story.bindings }, variables: { ...story.variables } })),
      scheduledConsequences: s.world.scheduledConsequences.map((item) => ({
        ...item,
        targetIds: [...item.targetIds],
        condition: item.condition ? { ...item.condition } : undefined,
        resolution: cloneConsequence(item.resolution),
      })),
      history: s.world.history.map((entry) => ({ ...entry, participantIds: [...entry.participantIds], familyIds: [...entry.familyIds], causes: [...entry.causes] })),
      pacing: { ...s.world.pacing },
      recentNarrativeIds: [...s.world.recentNarrativeIds],
      contentLedger: Object.fromEntries(Object.entries(s.world.contentLedger).map(([id, entry]) => [id, { ...entry }])),
      repetitionLedger: { ...s.world.repetitionLedger },
      recentDomains: [...s.world.recentDomains],
      expectedChildren: s.world.expectedChildren.map((child) => ({ ...child, parentIds: [...child.parentIds] })),
      factions: Object.fromEntries(Object.entries(s.world.factions).map(([id, faction]) => [id, { ...faction }])) as typeof s.world.factions,
    },
    actionClock: { ...s.actionClock },
    occupation: { ...s.occupation },
    debts: s.debts.map((d) => ({ ...d })),
    inventory: [...s.inventory],
    holding: { ...s.holding, upgrades: [...s.holding.upgrades] },
    feed: s.feed.map((f) => ({ ...f })),
    settings: { ...s.settings },
    playerRun: { ...s.playerRun, roleProgress: { ...s.playerRun.roleProgress } },
    pendingEvent: s.pendingEvent ? { ...s.pendingEvent, bindings: s.pendingEvent.bindings ? { ...s.pendingEvent.bindings } : undefined } : null,
  };
  return cloned;
}

function cloneConsequence(resolution: ConsequenceDescriptor): ConsequenceDescriptor {
  switch (resolution.type) {
    case 'effects': return { ...resolution, effects: { ...resolution.effects } };
    case 'relationship': return { ...resolution };
    case 'condition': return { ...resolution };
    case 'memory': return { ...resolution };
    case 'history': return { ...resolution };
  }
}

/** Keep the registry's controlled-character snapshot aligned with legacy UI fields. */
export function syncPlayerToWorld(s: GameState): GameState {
  return syncControlledCharacterToWorld(s);
}

/** Project the canonical controlled character into legacy player-facing fields. */
export function syncPlayerFromWorld(s: GameState): GameState {
  return syncControlledCharacterFromWorld(s);
}

/** Rebuild the compatibility roster with canonical registry object references. */
export function syncKinToWorld(s: GameState): GameState {
  return rebuildKinProjection(s);
}

export function kinCharacters(s: GameState): WorldCharacter[] {
  return canonicalKinCharacters(s);
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
  meta: Pick<FeedEntry, 'traitId' | 'changes'> = {},
  actorId = 'player',
  source: FeedEntry['source'] = 'player',
): GameState {
  if (s.dead && source === 'player' && !tag.includes('THE END')) return s;
  s.feed = [...s.feed, { id: s.nextId++, age: s.age, tag, tagColor, text, tone, actorId, source, ...meta }].slice(-500);
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
  s.memories = [...s.memories, mem].slice(-200);
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
  return Object.values(s.world.characters).filter((k) => k.id !== s.playerCharacterId && k.alive && k.kind === kind).length;
}

export function hasLivingKin(s: GameState, kind: KinKind): boolean {
  return Object.values(s.world.characters).some((k) => k.id !== s.playerCharacterId && k.alive && k.kind === kind);
}
