import {QUALITY_CHAIN_SPECS} from './qualityAmbientEvents';
import {LEGACY_CALLBACK_EVENTS} from './legacyCallbackEvents';
import { ANNUAL_MESSAGES } from './annualMessages';
import { ACTIVITY_DEFS } from '@/data/activities';
import { CAREERS } from '@/data/careers';
import { ContentDomain, Effects, GameEvent } from '@/types/game';
import { ALL_EVENTS, AMBIENT_EVENTS, EVENTS_BY_ID } from './index';
import { HEALTH_CONDITIONS } from './healthConditions';
import { LEGACY_STORY_TEMPLATES, PERSISTENT_STORY_TEMPLATES } from './persistentStories';

export interface ContentValidationIssue {
  level: 'error' | 'warning';
  code: string;
  contentId: string;
  message: string;
}

/** Minimum authored events per domain. Floors, not caps — see content/index.ts. */
const DOMAIN_FLOORS: Record<ContentDomain, number> = {
  family: 30, health: 20, crime: 22, career: 25, politics: 28, household: 12, rare: 13,
};

const AMBIENT_FLOOR = 150;

/**
 * How many events may share one choice label or one outcome line before the
 * content counts as filler. This exists because the previous contract enforced
 * counts and nothing else, and bulk generation is the cheapest way to satisfy a
 * count: 97 events once shared the same two choices and the same two outcomes.
 * Some repetition is legitimate (a story's closing "accept the ending" beat), so
 * the bar is deliberately loose rather than zero.
 */
const MAX_SHARED_CHOICE_LABEL = 6;
const MAX_SHARED_OUTCOME_TEXT = 6;

const SIMPLE_STATS = new Set(['health', 'charm', 'wits', 'faith', 'gold', 'rankProgress', 'reputation']);

function outcomes(event: GameEvent): Effects[] {
  return event.choices.flatMap((choice) => [choice.outcome, choice.success, choice.failure])
    .map((outcome) => outcome?.effects)
    .filter((effects): effects is Effects => Boolean(effects));
}

function createsLastingChange(event: GameEvent): boolean {
  return outcomes(event).some((effects) => Object.keys(effects).some((key) => !SIMPLE_STATS.has(key)));
}

function circumstanceEvent(event: GameEvent): boolean {
  return Boolean(event.convertedFrom?.startsWith('callback:') || event.callback || event.requires?.hasWorldMemoryType?.length || event.requires?.hasKnownSecret || event.requires?.hasHealthCondition?.length);
}

function tokensFrom(event: GameEvent): string[] {
  const sources = [event.title, typeof event.text === 'string' ? event.text : event.text.toString(), ...event.choices.flatMap(c => [c.label,c.outcome?.text,c.success?.text,c.failure?.text])];
  return sources.flatMap(source => [...(source ?? '').matchAll(/\{\{(\w+)(?:\.(?:name|role|subject|object|possessive))?\}\}/g)].map(match => match[1]));
}

export function validateContent(): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const error = (code: string, contentId: string, message: string) => issues.push({ level: 'error', code, contentId, message });
  const warn = (code: string, contentId: string, message: string) => issues.push({ level: 'warning', code, contentId, message });

  if (AMBIENT_EVENTS.length < AMBIENT_FLOOR) error('ambient_total', 'ambient', `Expected at least ${AMBIENT_FLOOR} selectable ambient events, found ${AMBIENT_EVENTS.length}.`);
  for (const [domain, floor] of Object.entries(DOMAIN_FLOORS)) {
    const actual = AMBIENT_EVENTS.filter((event) => event.domain === domain).length;
    if (actual < floor) error('domain_quota', domain, `Expected at least ${floor}, found ${actual}.`);
  }
  const freeEvents = AMBIENT_EVENTS.filter((event) => !event.premium).length;
  if (freeEvents < 120) error('free_event_floor', 'ambient', `Only ${freeEvents} ambient events are free.`);
  const actorBound = AMBIENT_EVENTS.filter((event) => Object.keys(event.actorRoles ?? {}).length > 0).length;
  if (actorBound < 100) error('actor_binding_floor', 'ambient', `Only ${actorBound} events bind recurring actors.`);
  const lasting = AMBIENT_EVENTS.filter(createsLastingChange).length;
  if (lasting < 90) error('lasting_effect_floor', 'ambient', `Only ${lasting} events declare a lasting effect.`);
  const circumstances = AMBIENT_EVENTS.filter(circumstanceEvent).length;
  if (circumstances < 50) error('circumstance_floor', 'ambient', `Only ${circumstances} events deliberately respond to current world state.`);

  // Distinctiveness. A count contract alone rewards bulk generation, so the
  // shape of the writing is checked too: a choice the player is offered in forty
  // different situations is not a choice, it is a shrug.
  const choiceLabelUses = new Map<string, string[]>();
  const outcomeTextUses = new Map<string, string[]>();
  for (const event of ALL_EVENTS.filter(e=>!e.legacyNarrative)) {
    for (const choice of event.choices) {
      choiceLabelUses.set(choice.label, [...(choiceLabelUses.get(choice.label) ?? []), event.id]);
      for (const outcome of [choice.outcome, choice.success, choice.failure]) {
        if (!outcome?.text) continue;
        outcomeTextUses.set(outcome.text, [...(outcomeTextUses.get(outcome.text) ?? []), event.id]);
      }
    }
  }
  for (const [label, ids] of choiceLabelUses) {
    if (ids.length > MAX_SHARED_CHOICE_LABEL) error('shared_choice_label', ids[0], `Choice "${label}" is offered by ${ids.length} events (max ${MAX_SHARED_CHOICE_LABEL}).`);
  }
  for (const [text, ids] of outcomeTextUses) {
    if (ids.length > MAX_SHARED_OUTCOME_TEXT) error('shared_outcome_text', ids[0], `Outcome "${text.slice(0, 60)}…" is reused by ${ids.length} events (max ${MAX_SHARED_OUTCOME_TEXT}).`);
  }

  const seenEvents = new Set<string>();
  for (const event of ALL_EVENTS.filter(e=>!e.legacyNarrative)) {
    if (seenEvents.has(event.id)) error('duplicate_event', event.id, 'Duplicate event id.');
    seenEvents.add(event.id);
    if (!event.arcNodeOnly && (!event.cooldownYears || event.cooldownYears < 1)) error('missing_cooldown', event.id, 'Selectable events require a cooldown.');
    if (!event.arcNodeOnly && !event.repetitionGroup) error('missing_repetition_group', event.id, 'Selectable events require a repetition group.');
    const minimumChoices = event.arcNodeOnly ? 1 : 2;
    if (event.choices.length < minimumChoices || event.choices.length > 4) error('choice_count', event.id, `Expected ${minimumChoices}–4 choices, found ${event.choices.length}.`);
    if (!event.arcNodeOnly && !createsLastingChange(event)) error('no_lasting_outcome', event.id, 'Selectable events require an outcome beyond visible stat changes.');
    if (event.callback) {
      const spec = event.callback, source = EVENTS_BY_ID[spec.eventId];
      if (!source) error('missing_callback_source',event.id,`Missing source ${spec.eventId}.`);
      else {
        if (source.premium && !event.premium) error('callback_premium_bypass',event.id,'A Premium source needs a Premium callback.');
        for (const id of spec.choiceIds) if (!source.choices.some(c => c.id === id)) error('missing_callback_choice',event.id,`Missing source choice ${id}.`);
        for (const role of Object.keys(event.actorRoles ?? {})) if (!source.actorRoles?.[spec.roleMap?.[role] ?? role]) error('missing_callback_actor',event.id,`Source does not bind ${role}.`);
      }
      if ((spec.minYears ?? 1) < 1 || (spec.maxYears ?? 3) < (spec.minYears ?? 1)) error('invalid_callback_window',event.id,'Callback windows must follow the decision.');
      if (!spec.inherited && (spec.maxYears ?? 3) > 3) error('slow_callback',event.id,'Ordinary callbacks should resolve within three years.');
    }
    for (const effects of outcomes(event)) {
      if (effects.healthCondition && !HEALTH_CONDITIONS.some(c => c.id === effects.healthCondition!.conditionId)) error('unknown_health_condition',event.id,`Unknown condition ${effects.healthCondition.conditionId}.`);
      if (!event.arcNodeOnly) for (const role of [effects.bond?.role,effects.familyFeud?.role,effects.marryRole].filter((v):v is string=>!!v)) if (!event.actorRoles?.[role]) error('unbound_effect_actor',event.id,`Effect role ${role} is not bound.`);
    }
    const choiceIds = new Set<string>();
    for (const choice of event.choices) {
      if (!choice.id) error('missing_choice_id', event.id, 'Every choice requires a stable id.');
      else if (choiceIds.has(choice.id)) error('duplicate_choice_id', event.id, `Duplicate choice id ${choice.id}.`);
      else choiceIds.add(choice.id);
      if (!choice.outcome && (!choice.success || !choice.failure)) error('unsafe_choice', event.id, `Choice ${choice.id ?? choice.label} has no complete outcome.`);
      if (!choice.forecast) warn('missing_forecast', event.id, `Choice ${choice.id ?? choice.label} has no qualitative forecast.`);
      // Domain curation drops uncurated selectable events from the registry, so
      // a chain can be broken by rebalancing quotas rather than by editing it.
      for (const outcome of [choice.outcome, choice.success, choice.failure]) {
        if (outcome?.next && !EVENTS_BY_ID[outcome.next]) error('dangling_next', event.id, `Choice ${choice.id ?? choice.label} continues to missing event ${outcome.next}.`);
      }
    }
    if (!event.arcNodeOnly) {
      const directedRoles = event.id.startsWith('origin_child_') || ['household_first_words','household_rainy_roof'].includes(event.id) ? ['contact','guardian','mother','father'] : [];
      for (const token of tokensFrom(event)) if (!event.actorRoles?.[token] && !directedRoles.includes(token)) error('unbound_token', event.id, `Token role ${token} is not declared.`);
    }
  }

  if(PERSISTENT_STORY_TEMPLATES.length)error('active_story_templates','stories','Authored multi-year templates must remain retired.');
  for(const source of [...LEGACY_STORY_TEMPLATES.map(t=>t.id),...QUALITY_CHAIN_SPECS.map(c=>'chain:'+c.id),...LEGACY_CALLBACK_EVENTS.map(e=>'callback:'+e.id)]) {
    const converted=ALL_EVENTS.filter(e=>!e.legacyNarrative&&e.convertedFrom===source);
    if(!converted.length)error('missing_conversion',source,'Legacy content needs a reviewed standalone conversion.');
  }
  for(const event of ALL_EVENTS.filter(e=>!e.legacyNarrative)) {
    if(event.chain||event.callback)error('authored_chapter',event.id,'Live scenes cannot carry chapter or callback scheduling.');
    for(const choice of event.choices)for(const outcome of [choice.outcome,choice.success,choice.failure]) {
      if(outcome?.nextWhen==='nextYear')error('future_chapter',event.id,'No authored next-year continuation is allowed.');
      if(outcome?.next){
        const next=EVENTS_BY_ID[outcome.next];
        if(next?.legacyNarrative)error('legacy_continuation',event.id,'New play cannot open retired content.');
        if(next?.choices.some(c=>[c.outcome,c.success,c.failure].some(o=>!!o?.next)))error('long_immediate_chain',event.id,'At most one additional scene is allowed.');
      }
    }
  }

  const annualIds = new Set<string>();
  for (const message of ANNUAL_MESSAGES) {
    if (annualIds.has(message.id)) error('duplicate_annual',message.id,'Duplicate annual identifier.');
    annualIds.add(message.id);
    if (!message.theme) error('missing_annual_theme',message.id,'Annual observations need a shared theme.');
    const effects = message.effects;
    if (effects && (effects.death || effects.killKin || effects.prison || effects.exile || effects.endMarriage || effects.marryRole || effects.addKin || effects.employment)) error('irreversible_flavour',message.id,'Annual flavour cannot make an irreversible life decision.');
    for (const match of message.text.matchAll(/\{\{(\w+)\}\}/g)) if (!message.actors?.includes(match[1] as any)) error('unbound_annual_actor',message.id,`Annual role ${match[1]} is not declared.`);
  }

  if (ACTIVITY_DEFS.length !== 56) error('activity_total', 'activities', `Expected 56 activities, found ${ACTIVITY_DEFS.length}.`);
  if (CAREERS.filter((career) => !career.premium).length !== 30) error('career_total', 'careers', `Expected 30 free careers, found ${CAREERS.filter((career) => !career.premium).length}.`);
  if (CAREERS.filter((career) => career.premium && career.prestige).length !== 7) error('prestige_total', 'careers', `Expected 7 premium prestige careers, found ${CAREERS.filter((career) => career.premium && career.prestige).length}.`);
  if (HEALTH_CONDITIONS.length !== 16) error('health_total', 'health', `Expected 16 structured health conditions, found ${HEALTH_CONDITIONS.length}.`);

  for (const collection of [ACTIVITY_DEFS, CAREERS, HEALTH_CONDITIONS]) {
    const ids = new Set<string>();
    for (const item of collection) {
      if (ids.has(item.id)) error('duplicate_definition', item.id, 'Duplicate typed definition id.');
      ids.add(item.id);
    }
  }
  return issues;
}

export function assertValidContent(): void {
  const errors = validateContent().filter((issue) => issue.level === 'error');
  if (errors.length) throw new Error(errors.map((issue) => `[${issue.code}] ${issue.contentId}: ${issue.message}`).join('\n'));
}
