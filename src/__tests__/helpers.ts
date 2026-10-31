import { freshHolding } from '@/data/holding';
import { legacyStatus } from '@/engine/lifeDepthState';
import { GameState, Difficulty } from '@/types/game';
import { createLife } from '@/engine/gameState';

/** Stable ordinary birth with both parents; scenario tests can override it. */
export function makeState(overrides: Partial<GameState> = {}, difficulty: Difficulty = 'Normal'): GameState {
  const s = createLife({ worldSeed: 42, birthOrigin: 'peasant', settings: { autoScroll: true, difficulty, liveForever: false, haptics: false, soundEffects: false } });
  s.stats = { health: 60, charm: 50, wits: 50, faith: 50 };
  s.gold = 20;
  s.holding = freshHolding();
  if (overrides.rankIdx != null) { s.world.characters[s.playerCharacterId].rankIdx = overrides.rankIdx; s.world.characters[s.playerCharacterId].socialStatus = legacyStatus(overrides.rankIdx); }
  return { ...s, ...overrides, stats: { ...s.stats, ...(overrides.stats ?? {}) } };
}
