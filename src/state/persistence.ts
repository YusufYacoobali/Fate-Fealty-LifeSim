import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, GameState, KinMember, Relationship } from '@/types/game';
import { freshHolding } from '@/data/holding';
import { defaultPronouns } from '@/data/identity';
import { ACTIONS_PER_YEAR, PREMIUM_ACTIONS_PER_YEAR } from '@/engine/actionClock';

const SAVE_KEY = 'mls:save:v2';
const LEGACY_SAVE_KEY = 'mls:save:v1';

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
      // Keep an open event so a mid-popup reload still resolves it.
    };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // Saving is best-effort; never crash the game over it.
    console.warn('[persistence] save failed', e);
  }
}

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = (await AsyncStorage.getItem(SAVE_KEY)) ?? (await AsyncStorage.getItem(LEGACY_SAVE_KEY));
    if (!raw) return null;
    const parsed = normalizeGameState(JSON.parse(raw) as GameState);
    // Defensive reset of transient UI.
    parsed.settingsOpen = false;
    parsed.selectedKinId = null;
    parsed.lifetimeUnlocked = false;
    return parsed;
  } catch (e) {
    console.warn('[persistence] load failed', e);
    return null;
  }
}

/** Add durable fields introduced after the v1 save key without discarding a life. */
export function normalizeGameState(parsed: GameState): GameState {
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

  const oldKin = Array.isArray(parsed.kin) ? parsed.kin : [];
  const kin: KinMember[] = oldKin.map((member) => ({
    ...member,
    gender: member.gender ?? 'unspecified',
    pronouns: member.pronouns ?? defaultPronouns(member.gender ?? 'unspecified'),
    attraction: member.attraction ?? (member.id === 'goose' ? 'none' : 'any'),
    stats: member.stats ?? { health: 65, charm: 50, wits: 50, faith: 45 },
    traits: member.traits ?? [member.trait ?? 'Ordinary'],
    gold: typeof member.gold === 'number' ? member.gold : 5,
    rankIdx: typeof member.rankIdx === 'number' ? member.rankIdx : member.kind === 'liege' ? 3 : 0,
    occupation: member.occupation ?? { careerId: null, experience: 0, performance: 50, workedThisYear: 0 },
    debts: Array.isArray(member.debts) ? member.debts : [],
    healthTags: Array.isArray(member.healthTags) ? member.healthTags : [],
    memories: Array.isArray(member.memories) ? member.memories : [],
  }));
  const relationships: Relationship[] = parsed.world?.relationships?.length
    ? parsed.world.relationships
    : kin.map((member) => {
        const flags = ['mother', 'father', 'sibling', 'child'].includes(member.kind)
          ? ['family'] as const
          : member.kind === 'spouse' ? ['spouse', 'family'] as const
          : member.kind === 'friend' ? ['friend'] as const
          : member.kind === 'foe' ? ['rival'] as const
          : member.kind === 'liege' ? ['authority'] as const
          : [];
        const perspective = { affinity: member.rel, trust: member.rel, respect: member.rel, attraction: member.kind === 'spouse' ? 70 : 0 };
        return { id: `rel_player_${member.id}`, aId: 'player', bId: member.id, aToB: { ...perspective }, bToA: { ...perspective }, flags: [...flags], lastInteractionAge: parsed.age, interactionsThisYear: 0, sharedMemories: [] };
      });

  return {
    ...parsed,
    traits: Array.from(new Set((parsed.traits ?? []).map((id) => id === 'ill_starred' ? 'golden_child' : id))),
    tags: Array.from(new Set((parsed.tags ?? []).map((tag) => tag === 'trait_ill_starred' ? 'trait_golden_child' : tag))),
    feed: (parsed.feed ?? []).map((entry) => entry.traitId === 'ill_starred' ? { ...entry, traitId: 'golden_child' } : entry),
    settings: {
      autoScroll: savedSettings.autoScroll ?? true,
      difficulty: savedSettings.difficulty ?? 'Normal',
      liveForever,
      haptics: savedSettings.haptics ?? true,
      music: savedSettings.music ?? true,
      soundEffects: savedSettings.soundEffects ?? true,
    },
    gender: parsed.gender ?? 'unspecified',
    pronouns: parsed.pronouns ?? defaultPronouns(parsed.gender ?? 'unspecified'),
    attraction: parsed.attraction ?? 'any',
    kin,
    world: {
      relationships,
      households: parsed.world?.households ?? [{ id: 'house_player', memberIds: ['player'], wealth: parsed.gold ?? 0 }],
      relationFilter: parsed.world?.relationFilter ?? 'all',
      feedFilter: parsed.world?.feedFilter ?? 'all',
      proposalFromId: parsed.world?.proposalFromId ?? null,
      recentNarrativeIds: parsed.world?.recentNarrativeIds ?? [],
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
}

export async function clearSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
    await AsyncStorage.removeItem(LEGACY_SAVE_KEY);
  } catch (e) {
    console.warn('[persistence] clear failed', e);
  }
}
