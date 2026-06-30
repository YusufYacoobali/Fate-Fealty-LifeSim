/**
 * Content registry. Aggregates every event bank into a single list and a
 * by-id lookup map (used by the story graph to resolve `next` pointers).
 */

import { GameEvent } from '@/types/game';
import { CHILD_EVENTS } from './childEvents';
import { PEASANT_EVENTS } from './peasantEvents';
import { COURTIER_EVENTS } from './courtierEvents';
import { KNIGHT_EVENTS } from './knightEvents';
import { NOBLE_EVENTS } from './nobleEvents';
import { FAITH_EVENTS } from './faithEvents';
import { FAMILY_EVENTS } from './familyEvents';
import { PLAGUE_EVENTS } from './plagueEvents';
import { WAR_EVENTS } from './warEvents';
import { STORY_ARCS } from './storyArcs';

export const ALL_EVENTS: GameEvent[] = [
  ...CHILD_EVENTS,
  ...PEASANT_EVENTS,
  ...COURTIER_EVENTS,
  ...KNIGHT_EVENTS,
  ...NOBLE_EVENTS,
  ...FAITH_EVENTS,
  ...FAMILY_EVENTS,
  ...PLAGUE_EVENTS,
  ...WAR_EVENTS,
  ...STORY_ARCS,
];

export const EVENTS_BY_ID: Record<string, GameEvent> = ALL_EVENTS.reduce(
  (acc, e) => {
    if (acc[e.id]) {
      // Helps catch duplicate ids early in dev.
      console.warn(`[content] duplicate event id: ${e.id}`);
    }
    acc[e.id] = e;
    return acc;
  },
  {} as Record<string, GameEvent>,
);
