import { ACTIVITY_DEFS } from '@/data/activities';
import { CAREERS } from '@/data/careers';
import { ContentDomain, Effects, GameEvent } from '@/types/game';
import { ALL_EVENTS, AMBIENT_EVENTS, EVENTS_BY_ID } from './index';
import { HEALTH_CONDITIONS } from './healthConditions';
import { PERSISTENT_STORY_TEMPLATES } from './persistentStories';

export interface ContentValidationIssue {
  level: 'error' | 'warning';
  code: string;
  contentId: string;
  message: string;
}

const QUOTAS: Record<ContentDomain, number> = {
  family: 30, health: 20, crime: 22, career: 25, politics: 28, household: 12, rare: 13,
};

const SIMPLE_STATS = new Set(['health', 'charm', 'wits', 'faith', 'gold', 'rankProgress', 'reputation']);

function outcomes(event: GameEvent): Effects[] {
  return event.choices.flatMap((choice) => [choice.outcome, choice.success, choice.failure])
    .map((outcome) => outcome?.effects)
    .filter((effects): effects is Effects => Boolean(effects));
}

function createsLastingChange(event: GameEvent): boolean {
  return outcomes(event).some((effects) => Object.keys(effects).some((key) => !SIMPLE_STATS.has(key)));
}

function callbackEvent(event: GameEvent): boolean {
  return Boolean(event.requires?.hasWorldMemoryType?.length || event.requires?.hasKnownSecret || event.requires?.hasHealthCondition?.length);
}

function tokensFrom(event: GameEvent): string[] {
  const source = typeof event.text === 'string' ? event.text : event.text.toString();
  return [...source.matchAll(/\{\{(\w+)\.(?:name|role)\}\}/g)].map((match) => match[1]);
}

export function validateContent(): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const error = (code: string, contentId: string, message: string) => issues.push({ level: 'error', code, contentId, message });
  const warn = (code: string, contentId: string, message: string) => issues.push({ level: 'warning', code, contentId, message });

  if (AMBIENT_EVENTS.length !== 150) error('ambient_total', 'ambient', `Expected exactly 150 selectable ambient events, found ${AMBIENT_EVENTS.length}.`);
  for (const [domain, expected] of Object.entries(QUOTAS)) {
    const actual = AMBIENT_EVENTS.filter((event) => event.domain === domain).length;
    if (actual !== expected) error('domain_quota', domain, `Expected ${expected}, found ${actual}.`);
  }
  const freeEvents = AMBIENT_EVENTS.filter((event) => !event.premium).length;
  if (freeEvents < 120) error('free_event_floor', 'ambient', `Only ${freeEvents} ambient events are free.`);
  const actorBound = AMBIENT_EVENTS.filter((event) => Object.keys(event.actorRoles ?? {}).length > 0).length;
  if (actorBound < 100) error('actor_binding_floor', 'ambient', `Only ${actorBound} events bind recurring actors.`);
  const lasting = AMBIENT_EVENTS.filter(createsLastingChange).length;
  if (lasting < 90) error('lasting_effect_floor', 'ambient', `Only ${lasting} events declare a lasting effect.`);
  const callbacks = AMBIENT_EVENTS.filter(callbackEvent).length;
  if (callbacks < 50) error('callback_floor', 'ambient', `Only ${callbacks} events deliberately follow earlier state.`);
  for (const domain of Object.keys(QUOTAS) as ContentDomain[]) {
    const chainGroups = new Set(AMBIENT_EVENTS.filter((event) => event.domain === domain && (event.requires?.hasWorldMemoryType?.length || event.id.startsWith('quality_'))).map((event) => event.repetitionGroup));
    if (chainGroups.size < 3) error('domain_chain_floor', domain, `Only ${chainGroups.size} interconnected chains are present.`);
  }

  const seenEvents = new Set<string>();
  for (const event of ALL_EVENTS) {
    if (seenEvents.has(event.id)) error('duplicate_event', event.id, 'Duplicate event id.');
    seenEvents.add(event.id);
    if (!event.arcNodeOnly && (!event.cooldownYears || event.cooldownYears < 1)) error('missing_cooldown', event.id, 'Selectable events require a cooldown.');
    if (!event.arcNodeOnly && !event.repetitionGroup) error('missing_repetition_group', event.id, 'Selectable events require a repetition group.');
    const minimumChoices = event.arcNodeOnly ? 1 : 2;
    if (event.choices.length < minimumChoices || event.choices.length > 4) error('choice_count', event.id, `Expected ${minimumChoices}–4 choices, found ${event.choices.length}.`);
    if (!event.arcNodeOnly && !createsLastingChange(event)) error('no_lasting_outcome', event.id, 'Selectable events require an outcome beyond visible stat changes.');
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
      for (const token of tokensFrom(event)) if (!event.actorRoles?.[token]) error('unbound_token', event.id, `Token role ${token} is not declared.`);
    }
  }

  const freeStories = PERSISTENT_STORY_TEMPLATES.filter((story) => !story.premium);
  const count = (scale: 'major' | 'medium' | 'relationship') => freeStories.filter((story) => story.scale === scale).length;
  if (count('major') !== 8) error('major_story_total', 'stories', `Expected 8 free major stories, found ${count('major')}.`);
  if (count('medium') !== 12) error('medium_story_total', 'stories', `Expected 12 free medium stories, found ${count('medium')}.`);
  if (count('relationship') !== 6) error('relationship_story_total', 'stories', `Expected 6 free relationship stories, found ${count('relationship')}.`);
  const premiumStories = PERSISTENT_STORY_TEMPLATES.filter((story) => story.premium).length;
  if (premiumStories !== 3) error('premium_story_total', 'stories', `Expected 3 premium stories, found ${premiumStories}.`);

  const seenStories = new Set<string>();
  for (const story of PERSISTENT_STORY_TEMPLATES) {
    if (seenStories.has(story.id)) error('duplicate_story', story.id, 'Duplicate story id.');
    seenStories.add(story.id);
    if (!story.beats[story.initialBeatId]) error('missing_initial_beat', story.id, `Initial beat ${story.initialBeatId} does not exist.`);
    const reachable = new Set<string>();
    const queue = [story.initialBeatId];
    while (queue.length) {
      const id = queue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      const beat = story.beats[id];
      if (!beat) continue;
      if (beat.nextBeatId) queue.push(beat.nextBeatId);
      for (const transition of beat.transitions ?? []) queue.push(transition.beatId);
    }
    for (const beat of Object.values(story.beats)) {
      if (!EVENTS_BY_ID[beat.eventId]) error('missing_story_event', story.id, `Beat ${beat.id} references missing event ${beat.eventId}.`);
      if (!reachable.has(beat.id)) error('unreachable_beat', story.id, `Beat ${beat.id} is unreachable.`);
      if (beat.nextBeatId && !story.beats[beat.nextBeatId]) error('missing_next_beat', story.id, `Beat ${beat.id} points to ${beat.nextBeatId}.`);
      for (const transition of beat.transitions ?? []) if (!story.beats[transition.beatId]) error('missing_transition_beat', story.id, `Beat ${beat.id} points to ${transition.beatId}.`);
    }
    if (story.recovery.recoveryBeatId && !story.beats[story.recovery.recoveryBeatId]) error('invalid_recovery', story.id, `Recovery beat ${story.recovery.recoveryBeatId} does not exist.`);
  }

  if (ACTIVITY_DEFS.length !== 49) error('activity_total', 'activities', `Expected 49 activities, found ${ACTIVITY_DEFS.length}.`);
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
