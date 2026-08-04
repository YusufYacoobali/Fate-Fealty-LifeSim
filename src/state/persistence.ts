import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, GameState, KinMember, Relationship } from '@/types/game';
import { freshHolding } from '@/data/holding';
import { defaultPronouns } from '@/data/identity';
import { ACTIONS_PER_YEAR, PREMIUM_ACTIONS_PER_YEAR } from '@/engine/actionClock';
import { recoverSavedContent } from '@/engine/contentRecovery';
import { CURRENT_CONTENT_VERSION } from '@/content/contentVersion';
import { syncPlayerFromWorld } from '@/engine/gameState';
import { createStateDefaults } from '@/engine/stateDefaults';

const SAVE_KEY = 'mls:world:v4';
const LEGACY_SAVE_KEY = 'mls:world:v3';

interface SaveEnvelopeV4 {
  schemaVersion: 4;
  savedAt: number;
  game: GameState;
}

/**
 * Persist only the durable parts of the state. Transient UI fields (open modals,
 * selected kin, the current event popup) are reset on load so a reload never
 * traps the player in a half-resolved popup.
 */
export async function saveGame(state: GameState): Promise<void> {
  try {
    const toSave: GameState = {
      ...state,
      settingsOpen: false,
      selectedKinId: null,
      // The canonical registry is saved once; kin is rebuilt as a projection.
      kin: [],
      pendingEvent: state.pendingEvent,
    };
    const envelope: SaveEnvelopeV4 = { schemaVersion: 4, savedAt: Date.now(), game: toSave };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
  } catch (e) {
    // Saving is best-effort; never crash the game over it.
    console.warn('[persistence] save failed', e);
  }
}

export interface LoadGameResult {
  state: GameState | null;
  blockedByFutureVersion: boolean;
}

export async function loadGame(): Promise<LoadGameResult> {
  try {
    const currentRaw = await AsyncStorage.getItem(SAVE_KEY);
    const legacyRaw = currentRaw ? null : await AsyncStorage.getItem(LEGACY_SAVE_KEY);
    const raw = currentRaw ?? legacyRaw;
    if (!raw) return { state: null, blockedByFutureVersion: false };
    const envelope = JSON.parse(raw) as { schemaVersion: number; savedAt: number; game: GameState };
    if (![3, 4].includes(envelope.schemaVersion) || ![3, 4].includes(envelope.game.schemaVersion as number)) return { state: null, blockedByFutureVersion: true };
    if (envelope.schemaVersion > 4 || (envelope.game.schemaVersion as number) > 4) return { state: null, blockedByFutureVersion: true };
    const parsed = normalizeGameState(envelope.game);
    if (parsed.world.contentVersion > CURRENT_CONTENT_VERSION) {
      console.warn('[persistence] save belongs to a newer content version; leaving it untouched');
      return { state: null, blockedByFutureVersion: true };
    }
    recoverSavedContent(parsed);
    if (legacyRaw) await saveGame(parsed);
    // Defensive reset of transient UI.
    parsed.settingsOpen = false;
    parsed.selectedKinId = null;
    parsed.lifetimeUnlocked = false;
    return { state: parsed, blockedByFutureVersion: false };
  } catch (e) {
    console.warn('[persistence] load failed', e);
    return { state: null, blockedByFutureVersion: false };
  }
}

/** Add durable fields introduced after the v1 save key without discarding a life. */
export function normalizeGameState(parsed: GameState): GameState {
  // v3 saves are additive-normalised against deterministic defaults. Active
  // v1/v2 saves intentionally do not enter this function after the world reset.
  const worldSeed = parsed.world?.worldSeed ?? 1;
  const stateDefaults = createStateDefaults(worldSeed, parsed.world?.currentYear ?? parsed.bornYear + parsed.age);
  const playerCharacterId = parsed.playerCharacterId ?? `player_${parsed.lifeNo ?? 1}`;
  const defaults = freshHolding();
  const saved = parsed.holding as Partial<GameState['holding']> | undefined;
  const savedSettings = (parsed.settings ?? {}) as Partial<GameSettings> & { permadeath?: boolean };
  const liveForever = typeof savedSettings.liveForever === 'boolean'
    ? savedSettings.liveForever
    : typeof savedSettings.permadeath === 'boolean'
      ? !savedSettings.permadeath
      : false;
  const clampResource = (value: number | undefined, fallback: number) =>
    Math.max(0, Math.min(100, typeof value === 'number' ? value : fallback));
  const normalizeGender = (value: unknown, id: string): 'woman' | 'man' => {
    if (value === 'woman' || value === 'man') return value;
    let hash = 0;
    for (let index = 0; index < id.length; index++) hash = ((hash * 31) + id.charCodeAt(index)) >>> 0;
    return hash % 2 === 0 ? 'woman' : 'man';
  };

  const oldKin = Array.isArray(parsed.kin) ? parsed.kin : [];
  const normalizedTraits = Array.from(new Set((parsed.traits ?? []).map((id) => id === 'ill_starred' ? 'golden_child' : id)));
  const normalizedTags = Array.from(new Set((parsed.tags ?? []).map((tag) => tag === 'trait_ill_starred' ? 'trait_golden_child' : tag)));
  const kin: KinMember[] = oldKin.map((member) => {
    const gender = normalizeGender(member.gender, member.id);
    return ({
    ...member,
    gender,
    pronouns: defaultPronouns(gender),
    attraction: member.id === 'goose' ? 'none' : gender === 'woman' ? 'men' : 'women',
    stats: member.stats ?? { health: 65, charm: 50, wits: 50, faith: 45 },
    traits: member.traits ?? [member.trait ?? 'Ordinary'],
    gold: typeof member.gold === 'number' ? member.gold : 5,
    rankIdx: typeof member.rankIdx === 'number' ? member.rankIdx : member.kind === 'liege' ? 3 : 0,
    occupation: member.occupation ?? { careerId: null, experience: 0, performance: 50, workedThisYear: 0 },
    debts: Array.isArray(member.debts) ? member.debts : [],
    healthTags: Array.isArray(member.healthTags) ? member.healthTags : [],
    memories: Array.isArray(member.memories) ? member.memories : [],
    healthConditions: member.healthConditions ?? [],
    legalState: member.legalState ?? { status: member.healthTags?.includes('imprisoned') ? 'imprisoned' : 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: member.healthTags?.includes('imprisoned') ? 1 : 0 },
    secrets: member.secrets ?? (member.secret && member.secret !== 'none' ? [{ id: `secret_${member.id}`, type: member.secret, knownByIds: [], revealed: Boolean(member.secretRevealed), severity: 35, createdYear: parsed.world?.currentYear ?? 1320 }] : []),
    guardianIds: member.guardianIds ?? [], lineageStatus: member.lineageStatus ?? 'marital',
    childDevelopment: member.childDevelopment ?? { completedMilestones: [], education: 'none', investment: 0, favour: 0 },
    factionInfluence: member.factionInfluence ?? 0,
  }); });
  const savedRelationships = parsed.world?.relationships as unknown;
  const relationshipList: Relationship[] = Array.isArray(savedRelationships)
    ? savedRelationships
    : savedRelationships && typeof savedRelationships === 'object'
      ? Object.values(savedRelationships as Record<string, Relationship>)
      : kin.map((member) => {
        const flags = ['mother', 'father', 'sibling', 'child'].includes(member.kind)
          ? ['family'] as const
          : member.kind === 'spouse' ? ['spouse', 'family'] as const
          : member.kind === 'friend' ? ['friend'] as const
          : member.kind === 'foe' ? ['rival'] as const
          : member.kind === 'liege' ? ['authority'] as const
          : [];
        const perspective = { affinity: member.rel, trust: member.rel, respect: member.rel, attraction: member.kind === 'spouse' ? 70 : 0 };
        return { id: `rel_${playerCharacterId}_${member.id}`, aId: playerCharacterId, bId: member.id, aToB: { ...perspective }, bToA: { ...perspective }, flags: [...flags], lastInteractionAge: parsed.age, interactionsThisYear: 0, sharedMemories: [] };
      });
  const relationships = Object.fromEntries(relationshipList.map((relationship) => {
    const normalized = {
      ...relationship,
      aId: relationship.aId === 'player' ? playerCharacterId : relationship.aId,
      bId: relationship.bId === 'player' ? playerCharacterId : relationship.bId,
    };
    normalized.id = `rel_${[normalized.aId, normalized.bId].sort().join('_')}`;
    return [normalized.id, normalized];
  }));

  const fallbackGender = normalizeGender(parsed.gender, playerCharacterId);
  const fallbackPlayer: KinMember = {
    id: playerCharacterId, name: parsed.first, role: 'Thyself', emoji: '🧑', rel: 100,
    trait: normalizedTraits[0] ?? 'Ordinary', bio: `${parsed.first}'s life in Swineford.`, kind: 'acquaintance',
    age: parsed.age, alive: !parsed.dead, gender: fallbackGender,
    pronouns: defaultPronouns(fallbackGender), attraction: fallbackGender === 'woman' ? 'men' : 'women',
    stats: { ...parsed.stats }, traits: normalizedTraits, gold: parsed.gold, rankIdx: parsed.rankIdx,
    occupation: { ...(parsed.occupation ?? { careerId: null, experience: 0, performance: 50, workedThisYear: 0 }) },
    debts: [...(parsed.debts ?? [])], healthTags: [], memories: [], parentIds: [], childIds: [], worldMemories: [],
    healthConditions: [], legalState: { status: 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 },
    secrets: [], guardianIds: [], lineageStatus: 'marital', childDevelopment: { completedMilestones: [], education: 'none', investment: 0, favour: 0 }, factionInfluence: 0,
  };
  const characters = parsed.world?.characters && Object.keys(parsed.world.characters).length
    ? parsed.world.characters
    : Object.fromEntries([[playerCharacterId, fallbackPlayer], ...kin.map((member) => [member.id, member] as const)]);
  if (!characters[playerCharacterId]) characters[playerCharacterId] = fallbackPlayer;
  else Object.assign(characters[playerCharacterId], {
    name: fallbackPlayer.name, age: fallbackPlayer.age, alive: fallbackPlayer.alive,
    gender: fallbackPlayer.gender, pronouns: fallbackPlayer.pronouns, attraction: fallbackPlayer.attraction,
    stats: fallbackPlayer.stats, traits: fallbackPlayer.traits, gold: fallbackPlayer.gold,
    rankIdx: fallbackPlayer.rankIdx, occupation: fallbackPlayer.occupation, debts: fallbackPlayer.debts,
  });
  for (const character of Object.values(characters)) {
    character.gender = normalizeGender(character.gender, character.id);
    character.pronouns = defaultPronouns(character.gender);
    character.attraction = character.id === 'goose' ? 'none' : character.gender === 'woman' ? 'men' : 'women';
    character.healthConditions ??= [];
    character.legalState ??= { status: character.healthTags?.includes('imprisoned') ? 'imprisoned' : 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 };
    character.secrets ??= character.secret && character.secret !== 'none' ? [{ id: `secret_${character.id}`, type: character.secret, knownByIds: [], revealed: Boolean(character.secretRevealed), severity: 35, createdYear: parsed.world?.currentYear ?? 1320 }] : [];
    character.guardianIds ??= [];
    character.lineageStatus ??= 'marital';
    character.childDevelopment ??= { completedMilestones: [], education: 'none', investment: 0, favour: 0 };
    character.factionInfluence ??= 0;
  }
  const canonicalKin = Object.values(characters).filter((character) => character.id !== playerCharacterId);

  const normalized: GameState = {
    ...parsed,
    schemaVersion: 4,
    playerCharacterId,
    playerRun: parsed.playerRun
      ? { ...parsed.playerRun, roleProgress: { ...(parsed.playerRun.roleProgress ?? {}) } }
      : { startedYear: parsed.world?.currentYear ?? parsed.bornYear + parsed.age, generation: parsed.lifeNo ?? 1, roleProgress: {} },
    pendingEvent: parsed.pendingEvent ?? null,
    // A half-fought duel is not worth restoring: the player would return to an
    // exchange with no memory of how they got there.
    duel: null,
    traits: normalizedTraits,
    tags: normalizedTags,
    feed: (parsed.feed ?? []).map((entry) => entry.traitId === 'ill_starred' ? { ...entry, traitId: 'golden_child' } : entry),
    settings: {
      autoScroll: savedSettings.autoScroll ?? true,
      difficulty: savedSettings.difficulty ?? 'Normal',
      liveForever,
      haptics: savedSettings.haptics ?? true,
      music: savedSettings.music ?? true,
      soundEffects: savedSettings.soundEffects ?? true,
      reducedMotion: savedSettings.reducedMotion ?? false,
    },
    gender: fallbackGender,
    pronouns: defaultPronouns(fallbackGender),
    attraction: fallbackGender === 'woman' ? 'men' : 'women',
    kin: canonicalKin,
    world: {
      relationships,
      households: (parsed.world?.households ?? [{ id: 'house_player', memberIds: [playerCharacterId], wealth: parsed.gold ?? 0 }]).map((household) => ({ ...household, residenceQuality: household.residenceQuality ?? 45, capacity: household.capacity ?? Math.max(4, household.memberIds.length + 2), storedFood: household.storedFood ?? household.foodSecurity ?? 50 })),
      relationFilter: parsed.world?.relationFilter ?? 'all',
      feedFilter: parsed.world?.feedFilter ?? 'all',
      proposalFromId: parsed.world?.proposalFromId ?? null,
      recentNarrativeIds: parsed.world?.recentNarrativeIds ?? [],
      currentYear: stateDefaults.currentYear,
      worldSeed,
      rngState: parsed.world?.rngState ?? stateDefaults.rngState,
      contentVersion: parsed.world?.contentVersion ?? stateDefaults.contentVersion,
      characters,
      families: parsed.world?.families ?? {},
      conditions: parsed.world?.conditions ?? stateDefaults.conditions,
      conditionModifiers: parsed.world?.conditionModifiers ?? [],
      activeStories: parsed.world?.activeStories ?? [],
      scheduledConsequences: parsed.world?.scheduledConsequences ?? [],
      history: parsed.world?.history ?? [],
      pacing: parsed.world?.pacing ?? stateDefaults.pacing,
      recoveryNotice: parsed.world?.recoveryNotice ?? false,
      contentLedger: parsed.world?.contentLedger ?? stateDefaults.contentLedger,
      repetitionLedger: parsed.world?.repetitionLedger ?? stateDefaults.repetitionLedger,
      recentDomains: parsed.world?.recentDomains ?? stateDefaults.recentDomains,
      expectedChildren: parsed.world?.expectedChildren ?? stateDefaults.expectedChildren,
      factions: parsed.world?.factions ?? stateDefaults.factions,
    },
    actionClock: {
      // Keep Premium progress above 24 while RevenueCat rechecks access. The
      // reducer restores the correct cap as soon as entitlement status arrives.
      used: Math.max(0, Math.min(PREMIUM_ACTIONS_PER_YEAR, parsed.actionClock?.used ?? 0)),
      cap: ACTIONS_PER_YEAR,
      lifetimeUsed: parsed.actionClock?.lifetimeUsed ?? 0,
      fullYears: parsed.actionClock?.fullYears ?? 0,
    },
    occupation: parsed.occupation ?? { careerId: null, experience: 0, performance: 50, workedThisYear: 0 },
    debts: Array.isArray(parsed.debts) ? parsed.debts : [],
    holding: {
      stores: clampResource(saved?.stores, defaults.stores),
      security: clampResource(saved?.security, defaults.security),
      loyalty: clampResource(saved?.loyalty, defaults.loyalty),
      population: Math.max(1, Math.floor(saved?.population ?? defaults.population ?? 18)),
      upgrades: Array.isArray(saved?.upgrades) ? [...saved.upgrades] : [],
      lastActionAge: typeof saved?.lastActionAge === 'number' ? saved.lastActionAge : null,
      criticalYears: typeof saved?.criticalYears === 'number' ? Math.max(0, saved.criticalYears) : 0,
    },
  };
  return syncPlayerFromWorld(normalized);
}

export async function clearSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
    await AsyncStorage.removeItem(LEGACY_SAVE_KEY);
  } catch (e) {
    console.warn('[persistence] clear failed', e);
  }
}
