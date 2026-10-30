import type { GameState, RoyalClaim, WorldCharacter } from '@/types/game';
import { legacyStatus } from './lifeDepthState';
import { appendWorldHistory } from './worldJournal';
import { pushFeed } from './gameState';

export function addRoyalClaim(state: GameState, characterId: string, throughId: string, basis: RoyalClaim['basis'], strength: number): boolean {
  const court = state.world.court, character = state.world.characters[characterId], through = state.world.characters[throughId];
  if (!court || !character?.alive || !through) return false;
  if (basis === 'birth' && (!(character.parentIds ?? []).includes(throughId) || ['ward', 'adopted', 'disputed', 'illegitimate'].includes(character.lineageStatus ?? 'marital'))) return false;
  if (basis === 'marriage' && character.spouseId !== throughId) return false;
  const existing = court.claims.find(c => c.characterId === characterId);
  if (existing) return !existing.disinherited;
  court.claims.push({ characterId, throughId, basis, strength, disinherited: false });
  return true;
}
export function royalCandidates(state: GameState, excludeIds: string[] = []): WorldCharacter[] {
  const court = state.world.court; if (!court) return [];
  return court.claims.filter(c => !c.disinherited && !excludeIds.includes(c.characterId) && c.characterId !== court.rulerId && state.world.characters[c.characterId]?.alive && (c.characterId !== state.playerCharacterId || state.lifetimeUnlocked))
    .sort((a, b) => Number(b.characterId === court.heirId) - Number(a.characterId === court.heirId) || b.strength - a.strength || state.world.characters[b.characterId].age - state.world.characters[a.characterId].age || a.characterId.localeCompare(b.characterId))
    .map(c => state.world.characters[c.characterId]);
}
export function recogniseRuler(state: GameState, characterId: string, reason: string): boolean {
  const court = state.world.court, ruler = state.world.characters[characterId];
  if (!court || !ruler?.alive || (characterId === state.playerCharacterId && !state.lifetimeUnlocked)) return false;
  const claim = court.claims.find(c => c.characterId === characterId && !c.disinherited);
  if (!claim) return false;
  const former = state.world.characters[court.rulerId];
  if (former && former.id !== characterId) {
    if (former.alive) former.rankIdx = 3;
    former.socialStatus ??= legacyStatus(3);
    former.socialStatus.estate = 'royal';
    former.socialStatus.titles = [...new Set([...former.socialStatus.titles.filter(t => t !== 'Monarch'), 'Former ruler'])];
    if (former.id === state.playerCharacterId && !state.dead) state.rankIdx = 3;
  }
  court.rulerId = ruler.id;
  ruler.rankIdx = 5;
  ruler.socialStatus ??= legacyStatus(5);
  ruler.socialStatus.estate = 'royal';
  ruler.socialStatus.titles = [...new Set([...ruler.socialStatus.titles, 'Monarch'])];
  for (const office of Object.keys(court.offices) as (keyof typeof court.offices)[]) if (court.offices[office] === ruler.id) delete court.offices[office];
  court.regentId = ruler.age < 16 ? Object.values(court.offices).map(id => state.world.characters[id!]).find(c => c?.alive && c.age >= 18)?.id : undefined;
  if (ruler.id === state.playerCharacterId) state.rankIdx = 5;
  court.heirId = undefined;
  court.records.push({ year: state.world.currentYear, kind: 'succession', actorId: ruler.id, targetId: former?.id, detail: reason });
  appendWorldHistory(state, { id: `royal_succession_${state.nextId++}`, year: state.world.currentYear, type: 'royal_succession', participantIds: [ruler.id, former?.id ?? ''].filter(Boolean), familyIds: [ruler.birthFamilyId ?? ''].filter(Boolean), causes: [reason], summary: `${ruler.name} is recognised as ruler: ${reason}.`, salience: 5 });
  pushFeed(state, 'THE CROWN', '#7a4f9a', `${ruler.name} is recognised as ruler. ${reason}.${court.regentId ? ` ${state.world.characters[court.regentId].name} serves as regent.` : ''}`, 'plain', {}, ruler.id, ruler.id === state.playerCharacterId ? 'player' : 'world');
  return true;
}
/** Called on deaths and control changes; no rolls or invented claims. */
export function settleRoyalSuccession(state: GameState, excludeIds: string[] = []): void {
  const court = state.world.court; if (!court) return;
  const ruler = state.world.characters[court.rulerId];
  if (ruler?.alive && !excludeIds.includes(ruler.id)) return;
  const candidate = royalCandidates(state, excludeIds)[0];
  if (candidate) { recogniseRuler(state, candidate.id, 'the documented succession'); return; }
  // A broken line is settled by the surviving council, not by the player's wealth.
  const council = Object.values(court.offices).map(id => state.world.characters[id!]).find(c => c?.alive && c.age >= 18 && c.id !== state.playerCharacterId && !excludeIds.includes(c.id))
    ?? Object.values(state.world.characters).find(c => c.alive && c.age >= 18 && c.id !== state.playerCharacterId && c.id !== 'goose' && !excludeIds.includes(c.id));
  if (council) { addRoyalClaim(state, council.id, court.rulerId, 'recognition', 25); recogniseRuler(state, council.id, 'recognition by the surviving council after the royal line failed'); }
}
