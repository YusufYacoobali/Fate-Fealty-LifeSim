import {personalNameError,PERSONAL_NAME_MAX_LENGTH} from './nameValidation';
import type {GameState} from '@/types/game';
import {namesForGender} from '@/data/names';

export const CHILD_NAME_MAX_LENGTH=PERSONAL_NAME_MAX_LENGTH;
export function childNameError(name:string):string|null {
 return personalNameError(name,{emptyMessage:'Enter a name or keep the suggestion.'});
}
/** Genealogy or legal wardship, never the old child label alone. Pure preview. */
export function canNameChild(s: GameState, id: string): boolean {
  const child=s.world.characters[id], player=s.world.characters[s.playerCharacterId];
  return !s.dead && Boolean(player?.alive && child?.alive && child.id !== player.id && child.age < 18 && (
    child.parentIds?.includes(player.id) || child.lineageStatus === 'ward' && child.guardianIds?.includes(player.id) && child.householdId === player.householdId
  ));
}
export function normalizeChildNaming(s: GameState): void {
  const previous=s.childNaming;
  if (!previous || previous.ownerId !== s.playerCharacterId) { s.childNaming={ownerId:s.playerCharacterId,pendingIds:[]}; return; }
  previous.pendingIds=[...new Set((Array.isArray(previous.pendingIds)?previous.pendingIds:[]).filter(id=>typeof id==='string' && canNameChild(s,id)))];
  if (previous.renameId && !canNameChild(s,previous.renameId)) delete previous.renameId;
  const relevant=new Set([...previous.pendingIds,...(previous.renameId?[previous.renameId]:[])]);
  for (const id of Object.keys(previous.arrivals??{})) if (!relevant.has(id)) delete previous.arrivals![id];
  if (previous.suggestion && (!relevant.has(previous.suggestion.childId) || childNameError(previous.suggestion.name) || !Number.isSafeInteger(previous.suggestion.attempt) || previous.suggestion.attempt < 0)) delete previous.suggestion;
}
export function queueChildNaming(s: GameState, id: string): void {
  normalizeChildNaming(s);
  if (canNameChild(s,id) && !s.childNaming!.pendingIds.includes(id)) s.childNaming!.pendingIds.push(id);
}
export function namingChildId(s: GameState): string | undefined {
  const n=s.childNaming;
  if (!n || n.ownerId!==s.playerCharacterId || s.dead) return;
  return [n.renameId,...n.pendingIds].find((id): id is string => Boolean(id && canNameChild(s,id)));
}
export function suggestedChildName(s: GameState, id: string): string {
  return s.childNaming?.suggestion?.childId===id ? s.childNaming.suggestion.name : s.world.characters[id]?.name??'';
}
export function namingBlocked(s: GameState): boolean {
  return s.dead || Boolean(s.pendingEvent || s.duel || s.rpg.mission || s.rpg.forge || s.settingsOpen);
}
/** Names have their own deterministic suggestions; gameplay RNG is untouched. */
export function anotherChildName(s: GameState, id: string): void {
  const child=s.world.characters[id]; if (namingBlocked(s) || namingChildId(s)!==id || !child) return;
  const attempt=(s.childNaming!.suggestion?.childId===id?s.childNaming!.suggestion.attempt:0)+1;
  const names=namesForGender(child.gender,true); let hash=2166136261;
  for (const c of id) hash=Math.imul(hash^c.charCodeAt(0),16777619);
  let name=names[((hash>>>0)+attempt)%names.length];
  if (name===suggestedChildName(s,id)) name=names[((hash>>>0)+attempt+1)%names.length];
  s.childNaming!.suggestion={childId:id,name,attempt};
}
export function confirmChildName(s: GameState, id: string, name: string): boolean {
  if (namingBlocked(s) || namingChildId(s)!==id || !canNameChild(s,id) || childNameError(name)) return false;
  const child=s.world.characters[id], arrival=s.childNaming!.arrivals?.[id];
  child.name=name.trim();
  // Only exact birth/placement announcements, never a global history replace.
  if (arrival) {
    const feed=s.feed.find(f=>f.id===arrival.feedId && f.actorId===id);
    const history=s.world.history.find(h=>h.id===arrival.historyId && h.participantIds.includes(id));
    if (feed) feed.text=child.name+arrival.feedSuffix;
    if (history) history.summary=child.name+arrival.historySuffix;
  }
  s.childNaming!.pendingIds=s.childNaming!.pendingIds.filter(x=>x!==id);
  delete s.childNaming!.renameId; delete s.childNaming!.suggestion;
  if (s.childNaming!.arrivals) delete s.childNaming!.arrivals[id];
  return true;
}
