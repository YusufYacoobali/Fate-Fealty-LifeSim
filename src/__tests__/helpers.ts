import { GameState, Difficulty } from '@/types/game';
import { createLife } from '@/engine/gameState';

/** A deterministic-ish base state for tests (overrides the random stats). */
export function makeState(overrides: Partial<GameState> = {}, difficulty: Difficulty = 'Normal'): GameState {
  const s = createLife({ settings: { autoScroll: true, difficulty, permadeath: true, haptics: false } });
  s.stats = { health: 60, charm: 50, wits: 50, faith: 50 };
  s.gold = 20;
  return { ...s, ...overrides, stats: { ...s.stats, ...(overrides.stats ?? {}) } };
}
