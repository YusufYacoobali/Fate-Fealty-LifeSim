import { ActorSelector, PERSISTENT_STORY_TEMPLATES, STORY_TEMPLATE_BY_ID, StoryTemplate, storyEligibilityMet } from '@/content/persistentStories';
import { GameEvent, GameState, StoryInstance, WorldCharacter } from '@/types/game';
import { chance, pick, rnd } from './random';
import { eventById } from './eventPicker';
import { appendWorldHistory } from './gameState';

function selectorMatches(character: WorldCharacter, state: GameState, selector: ActorSelector): boolean {
  if (selector.excludePlayer && character.id === state.playerCharacterId) return false;
  if (selector.alive != null && character.alive !== selector.alive) return false;
  if (selector.minAge != null && character.age < selector.minAge) return false;
  if (selector.maxAge != null && character.age > selector.maxAge) return false;
  if (selector.kinds && !selector.kinds.includes(character.kind)) return false;
  if (selector.ambitions && (!character.ambition || !selector.ambitions.includes(character.ambition))) return false;
  if (selector.importance && (!character.importance || !selector.importance.includes(character.importance))) return false;
  return true;
}

function bindTemplate(state: GameState, template: StoryTemplate): Record<string, string> | null {
  const bindings: Record<string, string> = {};
  const used = new Set<string>([state.playerCharacterId]);
  for (const [role, definition] of Object.entries(template.roles)) {
    const candidates = Object.values(state.world.characters).filter(
      (character) => !used.has(character.id) && selectorMatches(character, state, definition.selector),
    );
    if (!candidates.length) return null;
    const actor = pick(candidates);
    bindings[role] = actor.id;
    used.add(actor.id);
    if (actor.importance === 'background') actor.importance = 'supporting';
  }
  return bindings;
}

function repairDeadActors(state: GameState, story: StoryInstance, template: StoryTemplate): boolean {
  for (const [role, definition] of Object.entries(template.roles)) {
    const actor = state.world.characters[story.bindings[role]];
    if (actor?.alive) continue;
    const policy = definition.missingActor;
    if (policy.type === 'continue_without_actor') delete story.bindings[role];
    else if (policy.type === 'branch' && template.beats[policy.beatId]) {
      story.currentBeatId = policy.beatId;
      story.nextEligibleYear = state.world.currentYear;
    } else if (policy.type === 'substitute') {
      const candidates = Object.values(state.world.characters).filter((candidate) =>
        !Object.values(story.bindings).includes(candidate.id) && selectorMatches(candidate, state, policy.selector),
      );
      if (candidates.length) story.bindings[role] = pick(candidates).id;
      else story.status = 'cancelled';
    } else story.status = 'cancelled';
    if (story.status === 'cancelled') {
      appendWorldHistory(state, { id: `history_story_cancel_${state.nextId++}`, year: state.world.currentYear, type: 'story_cancelled', participantIds: Object.values(story.bindings), familyIds: [], storyInstanceId: story.id, causes: ['A necessary participant died.'], summary: `The tale of ${story.templateId.replaceAll('_', ' ')} ended before its reckoning.`, salience: 2 });
      if (story.scale === 'major' && story.generationStarted === state.playerRun.generation) state.world.pacing.majorEventsThisLife = Math.max(0, state.world.pacing.majorEventsThisLife - 1);
      return false;
    }
  }
  return true;
}

function storyPreviouslyCompletedThisLife(state: GameState, templateId: string): boolean {
  return state.world.history.some((entry) =>
    entry.type === 'story_completed' && entry.causes.includes(templateId) && entry.year >= state.playerRun.startedYear,
  );
}

function templateOnCooldown(state: GameState, template: StoryTemplate): boolean {
  return state.world.activeStories.some((story) =>
    story.templateId === template.id
    && story.status !== 'cancelled'
    && state.world.currentYear - story.startedYear < template.cooldownYears,
  );
}

function templateEntitled(state: GameState, template: StoryTemplate): boolean {
  return !template.premium || state.lifetimeUnlocked;
}

export function maybeStartMajorStory(state: GameState): StoryInstance | null {
  if (state.world.activeStories.some((story) => story.scale === 'major' && ['active', 'paused'].includes(story.status))) return null;
  if (state.world.pacing.majorEventsThisLife > 0 || state.age < 8) return null;
  if (!chance(state.world.pacing.quietYearsSinceStory >= 3 ? 0.75 : 0.28)) return null;
  const eligible = PERSISTENT_STORY_TEMPLATES.filter((template) =>
    template.scale === 'major' && templateEntitled(state, template) && storyEligibilityMet(state, template.eligibility) && !storyPreviouslyCompletedThisLife(state, template.id) && !templateOnCooldown(state, template),
  );
  if (!eligible.length) return null;
  const shuffledStart = rnd(0, eligible.length - 1);
  for (let offset = 0; offset < eligible.length; offset++) {
    const template = eligible[(shuffledStart + offset) % eligible.length];
    const bindings = bindTemplate(state, template);
    if (!bindings) continue;
    const story: StoryInstance = {
      id: `story_${template.id}_${state.nextId++}`,
      templateId: template.id,
      scale: template.scale,
      status: 'active',
      bindings,
      variables: {},
      currentBeatId: template.initialBeatId,
      startedYear: state.world.currentYear,
      nextEligibleYear: state.world.currentYear,
      lastBeatYear: state.world.currentYear - 1,
      generationStarted: state.playerRun.generation,
    };
    state.world.activeStories.push(story);
    state.world.pacing.majorEventsThisLife += 1;
    return story;
  }
  return null;
}

export function maybeStartSupportingStory(state: GameState): StoryInstance | null {
  const activeMedium = state.world.activeStories.filter((story) => story.scale === 'medium' && ['active', 'paused'].includes(story.status)).length;
  if (activeMedium >= 2 || state.world.pacing.mediumStoriesStarted >= 3 || state.age < 14 || !chance(0.2)) return null;
  const eligible = PERSISTENT_STORY_TEMPLATES.filter((template) =>
    template.scale === 'medium' && templateEntitled(state, template) && storyEligibilityMet(state, template.eligibility) && !storyPreviouslyCompletedThisLife(state, template.id) && !templateOnCooldown(state, template),
  );
  if (!eligible.length) return null;
  const template = pick(eligible);
  const bindings = bindTemplate(state, template);
  if (!bindings) return null;
  const story: StoryInstance = {
    id: `story_${template.id}_${state.nextId++}`,
    templateId: template.id,
    scale: 'medium',
    status: 'active',
    bindings,
    variables: {},
    currentBeatId: template.initialBeatId,
    startedYear: state.world.currentYear,
    nextEligibleYear: state.world.currentYear,
    lastBeatYear: state.world.currentYear - 1,
    generationStarted: state.playerRun.generation,
  };
  state.world.activeStories.push(story);
  state.world.pacing.mediumStoriesStarted += 1;
  return story;
}

export function maybeStartRelationshipStory(state: GameState): StoryInstance | null {
  const active = state.world.activeStories.filter((story) => story.scale === 'relationship' && ['active', 'paused'].includes(story.status)).length;
  const completedThisLife = state.world.history.filter((entry) => entry.type === 'story_completed' && entry.year >= state.playerRun.startedYear && entry.causes.some((cause) => STORY_TEMPLATE_BY_ID[cause]?.scale === 'relationship')).length;
  if (active >= 3 || completedThisLife >= 4 || state.age < 12 || !chance(0.16)) return null;
  const eligible = PERSISTENT_STORY_TEMPLATES.filter((template) =>
    template.scale === 'relationship' && templateEntitled(state, template) && storyEligibilityMet(state, template.eligibility) && !storyPreviouslyCompletedThisLife(state, template.id) && !templateOnCooldown(state, template),
  );
  if (!eligible.length) return null;
  const template = pick(eligible);
  const bindings = bindTemplate(state, template);
  if (!bindings) return null;
  const story: StoryInstance = {
    id: `story_${template.id}_${state.nextId++}`,
    templateId: template.id,
    scale: 'relationship',
    status: 'active',
    bindings,
    variables: {},
    currentBeatId: template.initialBeatId,
    startedYear: state.world.currentYear,
    nextEligibleYear: state.world.currentYear,
    lastBeatYear: state.world.currentYear - 1,
    generationStarted: state.playerRun.generation,
  };
  state.world.activeStories.push(story);
  return story;
}

export function duePersistentStoryEvent(state: GameState): GameEvent | null {
  for (const story of state.world.activeStories) {
    if (story.status === 'active' && state.tags.includes('imprisoned')) story.status = 'paused';
    else if (story.status === 'paused' && !state.tags.includes('imprisoned')) {
      story.status = 'active';
      story.nextEligibleYear = Math.max(story.nextEligibleYear, state.world.currentYear);
    }
  }
  const candidates = state.world.activeStories
    .filter((story) => story.status === 'active' && story.nextEligibleYear <= state.world.currentYear)
    .sort((a, b) => ({ major: 0, medium: 1, relationship: 2 }[a.scale] - { major: 0, medium: 1, relationship: 2 }[b.scale]) || a.startedYear - b.startedYear);
  for (const story of candidates) {
    const template = STORY_TEMPLATE_BY_ID[story.templateId];
    if (!template || !repairDeadActors(state, story, template)) continue;
    const beat = template.beats[story.currentBeatId];
    if (!template || !beat) continue;
    if (beat.importance === 'major' && state.world.pacing.lastMajorYear != null && state.world.currentYear - state.world.pacing.lastMajorYear < 2) continue;
    const event = eventById(beat.eventId);
    if (!event) continue;
    state.pendingEvent = { eventId: event.id, storyInstanceId: story.id, bindings: { ...story.bindings } };
    state.world.pacing.quietYearsSinceStory = 0;
    if (beat.importance === 'major') state.world.pacing.lastMajorYear = state.world.currentYear;
    else state.world.pacing.lastImportantYear = state.world.currentYear;
    return event;
  }
  return null;
}

export function onPersistentStoryChoiceResolved(state: GameState, choiceId: string): void {
  const storyId = state.pendingEvent?.storyInstanceId;
  if (!storyId) return;
  const story = state.world.activeStories.find((item) => item.id === storyId);
  if (!story || story.status !== 'active') return;
  const template = STORY_TEMPLATE_BY_ID[story.templateId];
  const beat = template?.beats[story.currentBeatId];
  if (!template || !beat) return;
  story.variables.lastChoice = choiceId;
  story.lastBeatYear = state.world.currentYear;
  if (story.currentBeatId === 'beat_3') {
    state.world.scheduledConsequences.push({
      id: `consequence_story_${state.nextId++}`,
      sourceStoryInstanceId: story.id,
      dueYear: state.world.currentYear + 3,
      scope: 'world',
      targetIds: Object.values(story.bindings),
      resolution: {
        type: 'history',
        historyType: 'delayed_story_consequence',
        summary: `An old decision from ${story.templateId.replaceAll('_', ' ')} continued to shape Swineford.`,
        salience: 3,
      },
      explanation: `A choice made during ${story.templateId.replaceAll('_', ' ')} bears fruit three years later.`,
    });
  }
  if (beat.endsStory || !beat.nextBeatId) {
    story.status = 'completed';
    const approach = String(story.variables.approach ?? 'uncertain');
    const resolution = String(story.variables.resolution ?? 'unsettled');
    appendWorldHistory(state, {
      id: `history_story_${state.nextId++}`,
      year: state.world.currentYear,
      type: 'story_completed',
      participantIds: [state.playerCharacterId, ...Object.values(story.bindings)],
      familyIds: [],
      storyInstanceId: story.id,
      causes: [story.templateId],
      summary: `The tale of ${story.templateId.replaceAll('_', ' ')} ended through a ${approach} course and a ${resolution} resolution.`,
      salience: 5,
    });
    state.world.scheduledConsequences.push({
      id: `consequence_legacy_${state.nextId++}`,
      sourceStoryInstanceId: story.id,
      dueYear: state.world.currentYear + 5,
      scope: 'family',
      targetIds: [state.world.characters[state.playerCharacterId]?.birthFamilyId ?? ''],
      resolution: {
        type: 'history',
        historyType: 'story_legacy',
        summary: `The player's family still lives with the legacy of ${story.templateId.replaceAll('_', ' ')}.`,
        salience: 4,
      },
      explanation: `Five years on, the family legacy of ${story.templateId.replaceAll('_', ' ')} is still remembered.`,
    });
  } else {
    const transition = beat.transitions?.find(({ when }) => {
      const value = story.variables[when.variable];
      if (when.equals !== undefined) return value === when.equals;
      return when.truthy ? Boolean(value) : !value;
    });
    const nextBeatId = transition?.beatId ?? beat.nextBeatId;
    if (!nextBeatId || !template.beats[nextBeatId]) {
      story.status = 'cancelled';
      return;
    }
    story.currentBeatId = nextBeatId;
    const nextBeat = template.beats[nextBeatId];
    story.nextEligibleYear = state.world.currentYear + rnd(nextBeat.minDelay, nextBeat.maxDelay);
  }
}
