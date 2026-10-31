import {SOCIAL_COMEDY_EVENTS} from './socialComedyEvents';
import {CHILDHOOD_DEPTH_EVENTS} from './childhoodDepthEvents';
import {SINGLE_YEAR_STORIES} from './singleYearStories';
import {SINGLE_YEAR_VILLAGE,SALVAGED_VILLAGE_SCENES} from './singleYearVillage';
import {CIRCUMSTANCE_EVENTS} from './circumstanceEvents';
import {LEGACY_CALLBACK_EVENTS} from './legacyCallbackEvents';
import {completeForecast} from '@/engine/choiceRisk';
import { singleYearTheme, legacyNarrativeTheme } from './narrativeThemes';
import {sharedNarrativeTheme} from './sharedNarrativeThemes';
import { NARRATIVE_RARE_EVENTS } from './narrativeRareEvents';
import { NARRATIVE_HEALTH_EVENTS } from './narrativeHealthEvents';
import { NARRATIVE_FAITH_EVENTS } from './narrativeFaithEvents';
import { NARRATIVE_POLITICS_EVENTS } from './narrativePoliticsEvents';
import { NARRATIVE_WORK_EVENTS } from './narrativeWorkEvents';
import { NARRATIVE_CRIME_EVENTS } from './narrativeCrimeEvents';
import { NARRATIVE_ROMANCE_EVENTS } from './narrativeRomanceEvents';
import { NARRATIVE_FAMILY_EVENTS } from './narrativeFamilyEvents';
import { ROYAL_COURT_EVENTS } from './royalCourtEvents';
import { CAREER_SPECIALIZATION_EVENTS } from './careerSpecializationEvents';
import { EDUCATION_EVENTS, ORIGIN_CHILDHOOD_EVENTS } from './educationEvents';
import { COMBAT_EVENTS } from './combatEvents';
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
import { POSSESSION_EVENTS } from './possessionEvents';
import { ACTIVITY_CONSEQUENCE_EVENTS } from './activityConsequenceEvents';
import { LEGAL_SYSTEM_EVENTS } from '@/engine/legalEngine';

const RAW_EVENTS: GameEvent[] = [
  ...SOCIAL_COMEDY_EVENTS,
  ...CHILDHOOD_DEPTH_EVENTS, ...LEGACY_CALLBACK_EVENTS, ...CIRCUMSTANCE_EVENTS, ...SINGLE_YEAR_STORIES, ...SINGLE_YEAR_VILLAGE, ...SALVAGED_VILLAGE_SCENES,
  ...NARRATIVE_FAMILY_EVENTS, ...NARRATIVE_ROMANCE_EVENTS, ...NARRATIVE_CRIME_EVENTS, ...NARRATIVE_WORK_EVENTS, ...NARRATIVE_POLITICS_EVENTS, ...NARRATIVE_FAITH_EVENTS, ...NARRATIVE_HEALTH_EVENTS, ...NARRATIVE_RARE_EVENTS,
  ...ROYAL_COURT_EVENTS,
  ...CAREER_SPECIALIZATION_EVENTS,
  ...EDUCATION_EVENTS, ...ORIGIN_CHILDHOOD_EVENTS,
  ...COMBAT_EVENTS,
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
  ...POSSESSION_EVENTS,
  ...ACTIVITY_CONSEQUENCE_EVENTS,
  ...LEGAL_SYSTEM_EVENTS,
];

/**
 * Minimum authored events per domain. These are FLOORS, not caps.
 *
 * They used to be caps, and the registry curated down to exactly 150 by sorting
 * on `editorialScore`. Because the bulk chain generator hardcoded the top score,
 * that sort quietly evicted 49 of the 77 hand-written free events — the whole
 * noble, faith and courtier banks among them — and replaced them with events
 * that all shared two choices. Nothing hand-authored is dropped now; the picker
 * balances domains at selection time instead (see `eventWeight`).
 */
const DOMAIN_FLOORS: Record<ContentDomain, number> = {
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
    legacyNarrative: event.legacyNarrative || event.id.startsWith('story_') || !!event.chain || ['arc_marriage_2','arc_war_1'].includes(event.id),
    domain,
    rarity: event.rarity ?? (event.premium ? 'rare' : 'common'),
    cooldownYears: event.cooldownYears ?? 15,
    repetitionGroup: sharedNarrativeTheme(event.id,typeof event.text==='string'?event.text:'') ?? singleYearTheme(event.id) ?? event.repetitionGroup ?? legacyNarrativeTheme(event.id) ?? `${domain}:${event.arc ?? event.id}`,
    actorRoles,
    editorialScore: event.editorialScore ?? (event.once || event.arc ? 4 : 3),
    choices: event.choices.map((choice, index) => ({
      ...choice,
      id: choice.id ?? `${event.id}_choice_${index + 1}`,
      forecast: completeForecast(choice),
    })),
  };
}

const NORMALISED_EVENTS = RAW_EVENTS.map(normaliseEvent);
const selectable = NORMALISED_EVENTS.filter((event) => !event.arcNodeOnly && !event.legacyNarrative);
const internal = NORMALISED_EVENTS.filter((event) => event.arcNodeOnly || event.legacyNarrative);

for (const [domain, floor] of Object.entries(DOMAIN_FLOORS) as Array<[ContentDomain, number]>) {
  const count = selectable.filter((event) => event.domain === domain).length;
  if (count < floor) throw new Error(`[content] ${domain} has ${count}/${floor} selectable events`);
}

export const AMBIENT_EVENTS: GameEvent[] = selectable;
export const ALL_EVENTS: GameEvent[] = [...selectable, ...internal];

/** Pool sizes, so the picker can give each domain a fair share of the year. */
export const DOMAIN_EVENT_COUNTS: Record<ContentDomain, number> = (Object.keys(DOMAIN_FLOORS) as ContentDomain[])
  .reduce((acc, domain) => {
    acc[domain] = selectable.filter((event) => event.domain === domain).length;
    return acc;
  }, {} as Record<ContentDomain, number>);

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
