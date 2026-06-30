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

import { Choice, GameEvent, GameState, Outcome } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { pushFeed } from './gameState';
import { eventById } from './eventPicker';
import { chance } from './random';
import { rollBonusFromTraits, grantAcquiredTraits } from './traitEngine';
import { checkLifeGoal } from './goalEngine';
import { C } from '@/theme/theme';

function rollChance(s: GameState, ch: Choice): boolean {
  if (ch.successChance == null) return true;
  const base = typeof ch.successChance === 'function' ? ch.successChance(s) : ch.successChance;
  // Scripted extremes stay deterministic; traits only nudge genuine odds.
  if (base <= 0) return false;
  if (base >= 1) return true;
  const p = Math.max(0, Math.min(1, base + rollBonusFromTraits(s)));
  return chance(p);
}

function resolveOutcome(ch: Choice, s: GameState): Outcome | undefined {
  if (ch.outcome) return ch.outcome;
  if (ch.success || ch.failure) {
    return rollChance(s, ch) ? ch.success : ch.failure;
  }
  return undefined;
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
  // Mark the parent event as fired-once if applicable.
  if (event.once && !s.firedOnce.includes(event.id)) {
    s.firedOnce = [...s.firedOnce, event.id];
  }

  const outcome = resolveOutcome(ch, s);
  let openNow: GameEvent | null = null;

  if (outcome) {
    applyEffects(s, outcome.effects);
    pushFeed(
      s,
      outcome.tag ?? `AGE ${s.age} · CHOICE`,
      outcome.tagColor ?? C.purpleDark,
      outcome.text,
      outcome.tone ?? 'plain',
    );

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

  // The just-resolved event closes; the follow-up (if any) becomes the event.
  s.event = openNow;
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
