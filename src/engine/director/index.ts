import {routineCourtScandal} from '../courtIncidents';
import { dueCourtEvent } from '../courtPolitics';
import { birthBindings } from '../birthCircumstances';
import { bindProfessionalEvent } from '../careerSpecializationEngine';
import { eventById } from '../eventPicker';
import { EDUCATION_EVENTS } from '@/content/educationEvents';
import { GameEvent, GameState } from '@/types/game';
import { bindEventActors, isEventPlayable, pickEvent } from '../eventPicker';
import { dueLegalEvent } from '../legalEngine';
import { BeatKind, chooseBeatKind, recordBeat } from './rhythm';

export * from './threads';
export * from './rhythm';

export interface DirectedYear {
  event: GameEvent | null;
  kind: BeatKind;
  /** Set when the event continues an open ambient thread. */
  threadId?: string;
  /** Set when the event is a persistent-story beat, for the legal charge hook. */
  isLegal: boolean;
}

/** One complete encounter per year; legal/court processes retain their own simulation. */
export function directYear(state: GameState): DirectedYear {
  // A trial in progress outranks the schedule; the player is mid-consequence.
  const legal = dueLegalEvent(state);
  if (legal) {
    recordBeat(state, 'thread');
    return { event: legal, kind: 'thread', isLegal: true };
  }

  const courtEvent = dueCourtEvent(state);
  if (courtEvent) { recordBeat(state,'thread'); return { event: eventById(courtEvent)!, kind: 'thread', isLegal: false }; }
  // Separate official scandals must not monopolise every year of a reign.
  // The existing court record survives reloads; manual audits remain available.
  if (routineCourtScandal(state)) {
    recordBeat(state, 'thread');
    return { event: eventById('royal_creative_accounts')!, kind: 'thread', isLegal: false };
  }

  const kind = chooseBeatKind(state, {hasDueThread:false,canOpen:false,nearingEnd:false});
  const education = state.world.characters[state.playerCharacterId].education;
  let event: GameEvent|null = null;
  if(kind !== 'quiet' && education?.track && state.world.currentYear % 3 === 0) {
    event = EDUCATION_EVENTS.find(e => e.id.startsWith(`education_${state.age >= 18 ? 'adult_' : ''}${education.track}_`) && isEventPlayable(state,e)) ?? null;
  }
  if(kind !== 'quiet') event ??= pickEvent(state);
  recordBeat(state,event ? kind : 'quiet');
  return {event,kind:event ? kind : 'quiet',isLegal:false};
}

/** Bind actors for the chosen event, reusing a thread's existing cast. */
export function bindDirectedEvent(state: GameState, directed: DirectedYear): Record<string, string> | undefined {
  if (directed.event && ['household_first_words','household_rainy_roof'].includes(directed.event.id)) return birthBindings(state,true);
  if (directed.event?.id.startsWith('origin_child_')) return birthBindings(state);
  if (directed.event?.id.startsWith('profession_') || directed.event?.id.startsWith('practice_')) return bindProfessionalEvent(state, directed.event.id);
  if (directed.event?.id.startsWith('education_')) {
    const e = state.world.characters[state.playerCharacterId].education;
    return e?.mentorId && (e.activeClassmateIds?.[0] ?? e.classmateIds[0]) ? { mentor: e.mentorId, classmate: (e.activeClassmateIds?.[0] ?? e.classmateIds[0]) } : undefined;
  }
  return directed.event ? bindEventActors(state, directed.event) : undefined;
}
