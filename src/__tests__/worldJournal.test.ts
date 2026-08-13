import { appendCharacterMemory } from '@/engine/worldJournal';
import { createLife } from '@/engine/gameState';

describe('character memory journal', () => {
  it('refreshes repeated summaries instead of displaying duplicate memories', () => {
    const state = createLife({ worldSeed: 950 });
    const character = Object.values(state.world.characters).find((item) => item.id !== state.playerCharacterId)!;
    const base = {
      year: state.world.currentYear,
      type: 'ambition_become_wealthy',
      actorIds: [] as string[],
      sentiment: 10,
      salience: 2 as const,
      inherited: false,
      summary: `${character.name} pursued the ambition to become wealthy.`,
    };

    appendCharacterMemory(character, { ...base, id: 'memory_a' });
    appendCharacterMemory(character, { ...base, id: 'memory_b', year: base.year + 1 });

    expect(character.worldMemories!.filter((memory) => memory.summary === base.summary)).toHaveLength(1);
    expect(character.worldMemories!.at(-1)?.id).toBe('memory_b');
  });
});
