import type { GameState, WorldCharacter } from '@/types/game';
import type { EducationState, SocialStatus } from '@/types/lifeDepth';

export function emptyEducation(): EducationState {
  return { track: null, classmateIds: [], progress: 0, misconduct: 0, actionsYear: -1, actionsUsed: 0, qualifications: [], history: [], encounters: [], scholarship: false, comingOfAge: false };
}
export function legacyStatus(rank: number): SocialStatus {
  return { estate: rank >= 5 ? 'royal' : rank >= 4 ? 'baronial' : rank >= 3 ? 'noble' : 'commoner', martialHonour: rank === 2 ? 'knight' : rank === 1 ? 'squire' : 'none', titles: rank >= 3 ? [rank >= 5 ? 'Monarch' : rank >= 4 ? 'Baron' : 'Noble'] : [], grants: rank > 0 ? ['legacy_grant'] : [] };
}
export function statusRank(character: WorldCharacter, rulerId?: string): number {
  const status = character.socialStatus;
  if (!status) return character.rankIdx;
  if (character.id === rulerId) return 5;
  if (status.estate === 'baronial') return 4;
  if (status.estate === 'noble' || status.estate === 'royal') return 3;
  return status.martialHonour === 'knight' ? 2 : status.martialHonour === 'squire' ? 1 : 0;
}
/** Additive, idempotent and deliberately RNG-free. Never infer purchases. */
export function initializeLifeDepth(state: GameState): void {
  for (const character of Object.values(state.world.characters)) {
    character.education ??= emptyEducation();
    if (character.id === state.playerCharacterId && state.memories.some(m => m.tag === 'lettered') && !character.education.qualifications.includes('literacy')) character.education.qualifications.push('literacy');
    character.professionalHistory ??= {};
    character.socialStatus ??= legacyStatus(character.rankIdx);
    character.background ??= {
      origin: character.rankIdx >= 5 ? 'royal' : character.rankIdx >= 3 ? 'noble' : 'peasant',
      familyId: character.birthFamilyId ?? '', guardianIds: [...(character.guardianIds?.length ? character.guardianIds : character.parentIds ?? [])],
      householdWealth: state.world.households.find(h => h.id === character.householdId)?.wealth ?? character.gold,
      inherited: true,
    };
  }
}
