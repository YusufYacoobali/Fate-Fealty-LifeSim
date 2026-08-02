/**
 * Content registry. Aggregates every event bank into a single list and a
 * by-id lookup map (used by the story graph to resolve `next` pointers).
 */

import { ContentDomain, GameEvent } from '@/types/game';
import { CHILD_EVENTS } from './childEvents';
import { PEASANT_EVENTS } from './peasantEvents';
import { COURTIER_EVENTS } from './courtierEvents';
import { KNIGHT_EVENTS } from './knightEvents';
import { NOBLE_EVENTS } from './nobleEvents';
import { FAITH_EVENTS } from './faithEvents';
import { FAMILY_EVENTS } from './familyEvents';
import { COMPANION_EVENTS } from './companionEvents';
import { PLAGUE_EVENTS } from './plagueEvents';
import { WAR_EVENTS } from './warEvents';
import { STORY_ARCS } from './storyArcs';
import { BASE_EXPANSION_EVENTS } from './baseExpansionEvents';
import { PREMIUM_EVENTS } from './premiumEvents';
import { PERSISTENT_WORLD_EVENTS } from './persistentWorldEvents';
import { QUALITY_AMBIENT_EVENTS } from './qualityAmbientEvents';
import { LEGAL_SYSTEM_EVENTS } from '@/engine/legalEngine';

const RAW_EVENTS: GameEvent[] = [
  ...CHILD_EVENTS,
  ...PEASANT_EVENTS,
  ...COURTIER_EVENTS,
  ...KNIGHT_EVENTS,
  ...NOBLE_EVENTS,
  ...FAITH_EVENTS,
  ...FAMILY_EVENTS,
  ...COMPANION_EVENTS,
  ...PLAGUE_EVENTS,
  ...WAR_EVENTS,
  ...BASE_EXPANSION_EVENTS,
  ...PREMIUM_EVENTS,
  ...STORY_ARCS,
  ...PERSISTENT_WORLD_EVENTS,
  ...QUALITY_AMBIENT_EVENTS,
  ...LEGAL_SYSTEM_EVENTS,
];

const DOMAIN_QUOTAS: Record<ContentDomain, number> = {
  family: 30, health: 20, crime: 22, career: 25, politics: 28, household: 12, rare: 13,
};

function inferDomain(event: GameEvent): ContentDomain {
  if (event.domain) return event.domain;
  const id = event.id.toLowerCase();
  if (/plague|fever|sick|ill|physic|healer|wound|injur|doctor|herb/.test(id)) return 'health';
  if (/crime|thief|steal|rob|poach|bandit|prison|trial|smuggl|blackmail|murder|outlaw/.test(id)) return 'crime';
  if (/house|roof|rent|granary|store|fire|estate|holding|harvest|winter/.test(id)) return 'household';
  if (event.category === 'child' || event.category === 'family') return 'family';
  if (event.category === 'plague') return 'health';
  if (event.category === 'peasant') return 'career';
  if (['court', 'knight', 'noble', 'faith', 'war'].includes(event.category)) return 'politics';
  return event.premium ? 'rare' : 'career';
}

function normaliseEvent(event: GameEvent): GameEvent {
  const domain = inferDomain(event);
  const actorRoles = event.actorRoles ?? (!event.arcNodeOnly ? {
    other: { minAge: 12, alive: true, excludePlayer: true, importance: ['core', 'supporting'] as const, missingActor: 'substitute' as const },
  } : undefined);
  return {
    ...event,
    domain,
    rarity: event.rarity ?? (event.premium ? 'rare' : 'common'),
    cooldownYears: event.cooldownYears ?? 15,
    repetitionGroup: event.repetitionGroup ?? `${domain}:${event.arc ?? event.id}`,
    actorRoles,
    editorialScore: event.editorialScore ?? (event.once || event.arc ? 4 : 3),
    choices: event.choices.map((choice, index) => ({
      ...choice,
      id: choice.id ?? `${event.id}_choice_${index + 1}`,
      forecast: choice.forecast ?? { risk: choice.successChance != null ? 'medium' : 'low', positive: ['A distinct response'], negative: choice.costGold ? [`Costs ${choice.costGold} gold`] : ['The outcome may be remembered'] },
    })),
  };
}

const NORMALISED_EVENTS = RAW_EVENTS.map(normaliseEvent);
const selectable = NORMALISED_EVENTS.filter((event) => !event.arcNodeOnly);
const internal = NORMALISED_EVENTS.filter((event) => event.arcNodeOnly);

// These established entry points are referenced by chronicles, tests and
// immediate legacy chains. They remain inside the curated 150, never as an
// invisible compatibility-only pool.
const COMPATIBILITY_EVENT_IDS = new Set(['knight_oath', 'knight_liege_oath', 'peasant_jealous_rival']);

const curatedAmbient = (Object.keys(DOMAIN_QUOTAS) as ContentDomain[]).flatMap((domain) => {
  const candidates = selectable
    .filter((event) => event.domain === domain)
    .sort((a, b) => Number(b.premium) - Number(a.premium) || (b.editorialScore ?? 0) - (a.editorialScore ?? 0) || a.id.localeCompare(b.id));
  const required = candidates.filter((event) => COMPATIBILITY_EVENT_IDS.has(event.id));
  const selected = [...required, ...candidates.filter((event) => !COMPATIBILITY_EVENT_IDS.has(event.id))].slice(0, DOMAIN_QUOTAS[domain]);
  if (selected.length !== DOMAIN_QUOTAS[domain]) throw new Error(`[content] ${domain} has ${selected.length}/${DOMAIN_QUOTAS[domain]} selectable events`);
  return selected;
});

// Existing paid content remains available after curation. Replace the weakest
// free item in the same domain rather than expanding the 150-event ceiling.
for (const premium of selectable.filter((event) => event.premium && !curatedAmbient.some((selected) => selected.id === event.id))) {
  let replaceIndex = curatedAmbient.findLastIndex((event) => event.domain === premium.domain && !event.premium && !event.id.startsWith('quality_') && !COMPATIBILITY_EVENT_IDS.has(event.id));
  if (replaceIndex < 0) replaceIndex = curatedAmbient.findLastIndex((event) => event.domain === premium.domain && !event.premium && !COMPATIBILITY_EVENT_IDS.has(event.id)
    && curatedAmbient.filter((candidate) => candidate.domain === event.domain && candidate.repetitionGroup === event.repetitionGroup).length > 1);
  if (replaceIndex >= 0) curatedAmbient[replaceIndex] = premium;
}

export const AMBIENT_EVENTS: GameEvent[] = curatedAmbient;
export const ALL_EVENTS: GameEvent[] = [...curatedAmbient, ...internal];

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
