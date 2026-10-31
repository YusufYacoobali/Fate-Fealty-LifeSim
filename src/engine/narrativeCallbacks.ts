import type { GameEvent, GameState, WorldHistoryEntry } from '@/types/game';

/** Optional echoes use the existing choice history, not a parallel quest database. */
export function callbackSource(state: GameState, event: GameEvent): WorldHistoryEntry | undefined {
  const spec = event.callback;
  if (!spec) return;
  const p = state.world.characters[state.playerCharacterId];
  return [...state.world.history].reverse().find(entry => {
    if (entry.eventId !== spec.eventId || !entry.resolvedChoiceId || !spec.choiceIds.includes(entry.resolvedChoiceId)) return false;
    const elapsed = state.world.currentYear - entry.year;
    if (elapsed < (spec.minYears ?? 1) || elapsed > (spec.maxYears ?? 3)) return false;
    if (entry.participantIds[0] !== p.id && !(spec.inherited && entry.familyIds.includes(p.birthFamilyId ?? ''))) return false;
    return !state.world.history.some(h => h.eventId === event.id && h.callbackForHistoryId === entry.id);
  });
}

export function callbackBindings(state: GameState, event: GameEvent): Record<string, string> | undefined {
  const source = callbackSource(state,event);
  if (!source) return;
  const result: Record<string,string> = {};
  for (const role of Object.keys(event.actorRoles ?? {})) {
    const sourceRole = event.callback?.roleMap?.[role] ?? role;
    const id = source.actorBindings?.[sourceRole];
    if (!id || !state.world.characters[id]) return;
    result[role] = id;
  }
  return result;
}
