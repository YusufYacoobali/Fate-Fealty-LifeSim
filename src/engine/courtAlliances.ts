import type { GameState } from '@/types/game';

/** The UI and action boundary must agree on whether a new alliance can be recorded. */
export function allianceUnavailable(state: GameState, targetId?: string): string | null {
  const target = state.world.characters[targetId ?? ''];
  if (!target?.alive || target.age < 18) return 'Choose a living adult household representative';
  const player = state.world.characters[state.playerCharacterId];
  const family = state.world.families[player.birthFamilyId ?? ''];
  const other = state.world.families[target.birthFamilyId ?? ''];
  if (!family || !other) return 'Both households need a recognised family';
  if (family.id === other.id) return 'Choose a household outside your own family';
  if (family.allyFamilyIds.includes(other.id) || other.allyFamilyIds.includes(family.id)) return 'These households are already allied';
  return null;
}
