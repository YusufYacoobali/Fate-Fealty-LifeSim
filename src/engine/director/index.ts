import { dueProfessionalEventId, bindProfessionalEvent } from '../careerSpecializationEngine';
import { eventById } from '../eventPicker';
import { EDUCATION_EVENTS } from '@/content/educationEvents';
import { GameEvent, GameState } from '@/types/game';
import { bindEventActors, isEventPlayable, pickEvent } from '../eventPicker';
import { popReadyArc } from '../storyGraph';
import { duePersistentStoryEvent, maybeStartMajorStory, maybeStartRelationshipStory, maybeStartSupportingStory } from '../persistentStoryEngine';
import { dueLegalEvent } from '../legalEngine';
import { MAX_LIFESPAN } from '../deathEngine';
import { BeatKind, RHYTHM, chooseBeatKind, recordBeat } from './rhythm';
import { MAX_OPEN_THREADS, dueThreads, hastenThreads, nextBeatOf, openThreads } from './threads';

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

/**
 * Roughly how near this character is to the end of their life.
 *
 * Used only to decide when to start closing threads rather than opening them.
 * It does not need to be accurate; it needs to be early enough that the last
 * beats of a story land while the player still cares about whose story it is.
 */
function nearingEnd(state: GameState): boolean {
  if (state.settings.liveForever) return state.age >= MAX_LIFESPAN - RHYTHM.CLOSING_WINDOW;
  // Old-age risk climbs steeply past seventy; treat that as the closing act.
  return state.age >= 62 || state.stats.health <= 22;
}

/** The beat that continues the longest-waiting open thread, if any is due. */
function threadBeat(state: GameState): { event: GameEvent; threadId: string } | null {
  for (const thread of dueThreads(state)) {
    const event = nextBeatOf(thread);
    // A thread beat bypasses the ordinary lottery but still has to be legal:
    // the actors it needs must be alive and the player old enough for it.
    if (event && isEventPlayable(state, event)) return { event, threadId: thread.id };
  }
  return null;
}

/**
 * Decide what happens to the player this year.
 *
 * This replaced a chain of `??` fallbacks that asked, in a fixed order, whether
 * each subsystem had something ready. That order was the whole design: stories
 * always won, so ambient content was starved, and nothing ever guaranteed the
 * player a payoff, a rest, or a good year. The director now picks the *shape*
 * of the year first and then finds content to fill it.
 */
export function directYear(state: GameState): DirectedYear {
  // A trial in progress outranks the schedule; the player is mid-consequence.
  const legal = dueLegalEvent(state);
  if (legal) {
    recordBeat(state, 'thread');
    return { event: legal, kind: 'thread', isLegal: true };
  }

  const professionalId = dueProfessionalEventId(state);
  const professionalEvent = professionalId ? eventById(professionalId) : undefined;
  if (professionalEvent) {
    state.activeArcs = state.activeArcs.filter(a => a.nextNodeId !== professionalId);
    recordBeat(state, 'thread');
    return { event: professionalEvent, kind: 'thread', isLegal: false };
  }

  const closing = nearingEnd(state);
  if (closing) hastenThreads(state);

  // Persistent stories only open when there is room for them; the cap counts
  // ambient threads too, so the two systems stop competing for the same year.
  const load = openThreads(state).length + state.world.activeStories.filter((story) => story.status === 'active').length;
  if (!closing && load < MAX_OPEN_THREADS) {
    maybeStartMajorStory(state);
    maybeStartSupportingStory(state);
    maybeStartRelationshipStory(state);
  }

  const thread = threadBeat(state);
  const storyDue = state.world.activeStories.some((story) => story.status === 'active' && story.nextEligibleYear <= state.world.currentYear);
  const kind = chooseBeatKind(state, {
    hasDueThread: Boolean(thread) || storyDue,
    canOpen: load < MAX_OPEN_THREADS,
    nearingEnd: closing,
  });

  const serve = (event: GameEvent | null, actual: BeatKind, threadId?: string): DirectedYear => {
    recordBeat(state, event ? actual : 'quiet');
    return { event, kind: event ? actual : 'quiet', threadId, isLegal: false };
  };

  const education = state.world.characters[state.playerCharacterId].education;
  if (kind !== 'thread' && education?.track && state.world.currentYear % 3 === 0) {
    const lesson = EDUCATION_EVENTS.find(event => event.id.startsWith(`education_${education.track}_`) && isEventPlayable(state, event));
    if (lesson) return serve(lesson, 'standalone');
  }

  switch (kind) {
    case 'thread': {
      // Ambient threads and story beats are both continuations; prefer whichever
      // has been waiting, ambient first so it stops being the starved one.
      if (thread) return serve(thread.event, 'thread', thread.threadId);
      const story = duePersistentStoryEvent(state);
      if (story) return serve(story, 'thread');
      return serve(popReadyArc(state) ?? pickEvent(state), 'standalone');
    }
    case 'reward':
    case 'opening':
    case 'standalone': {
      // The reward beat is a *scheduling* decision, not a separate content
      // bank: it reaches for a fresh opening, which is where the good outcomes
      // and new cast live. Falling back to a thread beat is fine — a payoff is
      // the best reward the game has.
      const fresh = pickEvent(state);
      if (fresh) return serve(fresh, kind);
      if (thread) return serve(thread.event, 'thread', thread.threadId);
      const story = duePersistentStoryEvent(state);
      if (story) return serve(story, 'thread');
      return serve(popReadyArc(state), 'standalone');
    }
    case 'quiet':
    default:
      return serve(null, 'quiet');
  }
}

/** Bind actors for the chosen event, reusing a thread's existing cast. */
export function bindDirectedEvent(state: GameState, directed: DirectedYear): Record<string, string> | undefined {
  if (directed.event?.id.startsWith('profession_')) return bindProfessionalEvent(state, directed.event.id);
  if (directed.event?.id.startsWith('education_')) {
    const e = state.world.characters[state.playerCharacterId].education;
    return e?.mentorId && e.classmateIds[0] ? { mentor: e.mentorId, classmate: e.classmateIds[0] } : undefined;
  }
  const thread = directed.threadId ? openThreads(state).find((item) => item.id === directed.threadId) : undefined;
  // A chain that changes its cast halfway through is not one story any more.
  if (thread?.bindings && directed.event?.actorRoles) {
    const stillValid = Object.values(thread.bindings).every((id) => state.world.characters[id]?.alive);
    if (stillValid) return thread.bindings;
  }
  return directed.event ? bindEventActors(state, directed.event) : undefined;
}
