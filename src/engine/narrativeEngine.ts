import { GameState } from '@/types/game';
import { pick } from './random';

/** Pick a repeatable line without immediately reusing recently seen variants. */
export function pickNarrative(state: GameState, namespace: string, lines: readonly string[]): string {
  const choices = lines.map((text, index) => ({ id: `${namespace}_${index}`, text }));
  const fresh = choices.filter((choice) => !state.world.recentNarrativeIds.includes(choice.id));
  const selected = pick(fresh.length ? fresh : choices);
  state.world.recentNarrativeIds = [...state.world.recentNarrativeIds.filter((id) => id !== selected.id), selected.id].slice(-12);
  return selected.text;
}
