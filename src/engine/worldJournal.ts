import { CharacterMemory, FamilyMemory, GameState, WorldCharacter, WorldHistoryEntry } from '@/types/game';

export const HISTORY_LIMIT = 400;
export const CHARACTER_MEMORY_LIMIT = 60;
export const FAMILY_MEMORY_LIMIT = 100;

export function appendWorldHistory(state: GameState, entry: WorldHistoryEntry): void {
  state.world.history.push(entry);
  if (state.world.history.length > HISTORY_LIMIT) state.world.history.splice(0, state.world.history.length - HISTORY_LIMIT);
}

export function appendCharacterMemory(character: WorldCharacter, memory: CharacterMemory): void {
  character.worldMemories = [...(character.worldMemories ?? []), memory].slice(-CHARACTER_MEMORY_LIMIT);
}

export function appendFamilyMemory(memories: FamilyMemory[], memory: FamilyMemory): FamilyMemory[] {
  if (memories.some((item) => item.id === memory.id)) return memories;
  return [...memories, memory].slice(-FAMILY_MEMORY_LIMIT);
}
