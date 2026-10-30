/**
 * Event nodes for the persistent story graph.
 *
 * These were previously generated from their own titles. Beat one of every
 * domain story read `${title.toLowerCase()}` dropped into a sentence about
 * public duty and private loyalty; beats two and three were the same two
 * strings for all eleven of them; and thirty-three nodes shared one set of
 * three choices. The relationship and vocation stories were built the same way.
 *
 * The graph is unchanged — ids, arcs, branch variables and endings all match
 * `persistentStories.ts` exactly. What changed is that every node now has copy
 * written for that story and that beat, which lives in `./stories`.
 */

import { GameEvent, GameState } from '@/types/game';
import { StoryChoice, StoryCopy, StoryNode } from './stories/types';
import { FLAGSHIP_STORY_COPY } from './stories/flagship';
import { ROLE_STORY_COPY } from './stories/roles';
import { RELATIONSHIP_STORY_COPY } from './stories/relationships';
import { DOMAIN_STORY_COPY } from './stories/domains';

/** Both `{{role}}` and `{{role.name}}` name the saved actor; `.role` reads their role. */
export function renderBoundText(state: GameState, source: string): string {
  const bindings = state.pendingEvent?.bindings ?? {};
  return source.replace(/\{\{(\w+)(?:\.(name|role))?\}\}/g, (_match, role: string, field?: 'name' | 'role') => {
    const character = state.world.characters[role === 'player' ? state.playerCharacterId : bindings[role]];
    return character?.[field ?? 'name'] ?? 'someone once known in Swineford';
  });
}

function choiceFor(choice: StoryChoice): GameEvent['choices'][number] {
  return {
    id: choice.id,
    label: choice.label,
    costGold: choice.costGold,
    outcome: { text: choice.text, effects: choice.effects, tone: choice.tone ?? 'plain' },
  };
}

function nodeToEvent(id: string, arc: string, node: StoryNode, premium: boolean): GameEvent {
  return {
    id,
    category: 'arc',
    arc,
    arcNodeOnly: true,
    premium,
    title: node.title,
    text: (state: GameState) => renderBoundText(state, node.text),
    choices: node.choices.map(choiceFor),
  };
}

/**
 * Turns one story's copy into its event nodes. `idFor` maps a copy key (`1`,
 * `4_bold`, `5_mend`) onto the event id the story graph expects.
 */
function eventsFor(arc: string, copy: StoryCopy, idFor: (key: string) => string, premium = false): GameEvent[] {
  return Object.entries(copy).map(([key, node]) => nodeToEvent(idFor(key), arc, node, premium));
}

/** Flagship stories use a short prefix rather than their template id. */
const FLAGSHIP_PREFIX: Record<string, string> = {
  rivals_rise: 'rival',
  lean_harvest: 'harvest',
  disputed_inheritance: 'inheritance',
  war_swineford: 'war',
  ambitious_child: 'child',
};

const PREMIUM_STORIES = new Set(['royal_bastard', 'relic_hunter', 'secret_brotherhood']);

const FLAGSHIP_EVENTS: GameEvent[] = Object.entries(FLAGSHIP_STORY_COPY).flatMap(([templateId, copy]) =>
  eventsFor(templateId, copy, (key) => `story_${FLAGSHIP_PREFIX[templateId]}_${key === '6_reconciled' || key === '6_hard' ? key : key}`),
);

const ROLE_EVENTS: GameEvent[] = Object.entries(ROLE_STORY_COPY).flatMap(([role, copy]) =>
  eventsFor(`role_${role}`, copy, (key) => `story_role_${role}_${key}`),
);

const RELATIONSHIP_EVENTS: GameEvent[] = Object.entries(RELATIONSHIP_STORY_COPY).flatMap(([id, copy]) =>
  eventsFor(id, copy, (key) => `story_${id}_${key}`),
);

const DOMAIN_EVENTS: GameEvent[] = Object.entries(DOMAIN_STORY_COPY).flatMap(([id, copy]) =>
  eventsFor(id, copy, (key) => `story_${id}_${key}`, PREMIUM_STORIES.has(id)),
);

export const PERSISTENT_WORLD_EVENTS: GameEvent[] = [
  ...FLAGSHIP_EVENTS,
  ...ROLE_EVENTS,
  ...RELATIONSHIP_EVENTS,
  ...DOMAIN_EVENTS,
];
