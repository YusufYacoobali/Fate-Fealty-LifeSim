import { callbackSource } from './narrativeCallbacks';
import { startDuel } from './duelEngine';
/**
 * Story graph + choice resolution.
 *
 * A choice resolves to an Outcome. The outcome applies effects, writes to the
 * feed, and may point to a `next` node (another GameEvent in the same arc):
 *   - next + nextWhen 'now'      -> open the follow-up popup immediately.
 *   - next + nextWhen 'nextYear' -> queue it to fire on a later age-up.
 *
 * Queued arcs live in state.activeArcs and are checked first by the Life
 * Director, so a story always continues before a fresh random event fires.
 */

import { feedbackSnapshot, feedbackChanges } from './choiceFeedback';
import { Choice, GameEvent, GameState, Outcome } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { pushFeed } from './gameState';
import { eventById, isChoiceEnabled, recordEventResolution } from './eventPicker';
import { chance } from './random';
import { rollBonusFromTraits, grantAcquiredTraits } from './traitEngine';
import { checkLifeGoal } from './goalEngine';
import { C } from '@/theme/theme';
import { checkDeath } from './deathEngine';
import { onPersistentStoryChoiceResolved } from './persistentStoryEngine';
import { appendCharacterMemory, appendWorldHistory } from './worldJournal';
import { renderBoundText } from '@/content/persistentWorldEvents';
import { equipmentCheckBonus, skillLevel } from './rpgProgress';
import { SkillId } from '@/types/rpg';

function rollChance(s: GameState, ch: Choice): boolean {
  if (ch.successChance == null) return true;
  const base = typeof ch.successChance === 'function' ? ch.successChance(s) : ch.successChance;
  // Scripted extremes stay deterministic; traits only nudge genuine odds.
  if (base <= 0) return false;
  if (base >= 1) return true;
  const skill = Object.keys(ch.requires?.skillAtLeast ?? {})[0] as SkillId | undefined;
  const expertise = skill ? (skillLevel(s, skill) - 1) * 0.015 + equipmentCheckBonus(s, skill) : 0;
  const p = Math.max(0, Math.min(1, base + rollBonusFromTraits(s) + expertise));
  return chance(p);
}

function resolveOutcome(ch: Choice, s: GameState): Outcome | undefined {
  const chosen = ch.outcome ?? (ch.success || ch.failure ? (rollChance(s, ch) ? ch.success : ch.failure) : undefined);
  // Outcome text is the permanent record of what happened, so it names the
  // people it happened to. `Outcome.text` is a plain string, so the actor
  // tokens are substituted here rather than at authoring time.
  if (!chosen?.text.includes('{{')) return chosen;
  return { ...chosen, text: renderBoundText(s, chosen.text) };
}

export interface ChoiceResult {
  /** A follow-up event to open immediately, if the outcome chained 'now'. */
  openNow: GameEvent | null;
}

/**
 * Apply a chosen option. Mutates `s`. Returns whether a follow-up popup should
 * open immediately (multi-popup story continuing in the same turn).
 */
export function applyChoice(s: GameState, event: GameEvent, ch: Choice): ChoiceResult {
  if (!isChoiceEnabled(s, ch)) return { openNow: null };
  // Mark the parent event as fired-once if applicable.
  if (event.once && !s.firedOnce.includes(event.id)) {
    s.firedOnce = [...s.firedOnce, event.id];
  }

  const challengeOpponent = ch.challenge ? s.pendingEvent?.bindings?.[ch.challenge.role] : undefined;
  const outcome = resolveOutcome(ch, s);
  recordEventResolution(s, event, ch.id ?? ch.label);
  let openNow: GameEvent | null = null;

  if (outcome) {
    const before = feedbackSnapshot(s);
    applyEffects(s, outcome.effects);
    if (s.dead || s.stats.health <= 0) {
      checkDeath(s);
      s.pendingEvent = null;
      return { openNow: null };
    }
    pushFeed(
      s,
      outcome.tag ?? `AGE ${s.age} · CHOICE`,
      outcome.tagColor ?? C.purpleDark,
      outcome.text,
      outcome.tone ?? 'plain',
      { changes: feedbackChanges(before, s) },
    );
    const participantIds = [s.playerCharacterId, ...Object.values(s.pendingEvent?.bindings ?? {})];
    const source = callbackSource(s,event);
    appendWorldHistory(s, {
      eventId: event.id, resolvedChoiceId: ch.id, actorBindings: { ...s.pendingEvent?.bindings }, callbackForHistoryId: source?.id,
      id: `history_choice_${s.nextId++}`,
      year: s.world.currentYear,
      type: outcome.tone === 'bad' ? 'failure' : 'choice',
      participantIds,
      familyIds: [s.world.characters[s.playerCharacterId]?.birthFamilyId ?? ''].filter(Boolean),
      storyInstanceId: s.pendingEvent?.storyInstanceId,
      choiceId: `${event.id}:${ch.label}`,
      causes: [event.title],
      summary: outcome.text,
      salience: s.pendingEvent?.storyInstanceId ? 4 : 2,
    });
    for (const actorId of Object.values(s.pendingEvent?.bindings ?? {})) {
      const actor = s.world.characters[actorId];
      const persistentStory = s.world.activeStories.find((item) => item.id === s.pendingEvent?.storyInstanceId);
      if (actor) appendCharacterMemory(actor, {
        id: `memory_choice_${s.nextId++}`,
        year: s.world.currentYear,
        type: `choice_${event.id}`,
        actorIds: [s.playerCharacterId],
        storyInstanceId: s.pendingEvent?.storyInstanceId,
        choiceId: ch.label,
        sentiment: outcome.tone === 'bad' ? -30 : outcome.tone === 'good' ? 25 : 0,
        salience: s.pendingEvent?.storyInstanceId ? 4 : 2,
        inherited: persistentStory?.scale === 'major',
        summary: outcome.text,
      });
    }

    if (outcome.next) {
      const nextNode = eventById(outcome.next);
      if (nextNode) {
        if (outcome.nextWhen === 'nextYear') {
          queueArc(s, nextNode.arc ?? nextNode.id, nextNode.id);
        } else {
          openNow = nextNode;
        }
      }
    }
  } else {
    // A bare choice with no outcome (rare) — still log a beat.
    pushFeed(s, `AGE ${s.age} · CHOICE`, C.purpleDark, ch.label, 'plain');
  }

  // A choice may have just earned an acquired trait (e.g. War Hero) or
  // completed the player's life goal (gold/children/stats/etc.).
  grantAcquiredTraits(s);
  checkLifeGoal(s);
  onPersistentStoryChoiceResolved(s, ch.id ?? ch.label);

  // Definitions remain static content; only the follow-up id enters state.
  if (openNow) s.pendingEvent = { eventId: openNow.id };
  else s.pendingEvent = null;
  if (ch.challenge && challengeOpponent && !openNow && !s.dead) startDuel(s, challengeOpponent, 'duel', false, ch.challenge.stakes);
  return { openNow };
}

export function queueArc(s: GameState, arc: string, nextNodeId: string): GameState {
  // Replace any existing entry for this arc.
  s.activeArcs = [
    ...s.activeArcs.filter((a) => a.arc !== arc),
    { arc, nextNodeId, startedAge: s.age },
  ];
  return s;
}

/**
 * If a queued arc is ready to continue, pop it and return its node. Called by
 * the Life Director before picking a fresh random event.
 */
export function popReadyArc(s: GameState): GameEvent | null {
  if (s.activeArcs.length === 0) return null;
  // Continue the oldest queued arc that started before this year.
  const ready = s.activeArcs.find((a) => a.startedAge < s.age);
  if (!ready) return null;
  s.activeArcs = s.activeArcs.filter((a) => a.arc !== ready.arc);
  return eventById(ready.nextNodeId) ?? null;
}
