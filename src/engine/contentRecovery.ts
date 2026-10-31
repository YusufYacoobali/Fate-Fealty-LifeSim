import {recoverLegacyLegalHearing} from './legalEngine';
import {retireAuthoredState} from './singleYearNarrative';
import { GameState, StoryInstance, WorldCharacter, WorldHistoryEntry } from '@/types/game';
import { CONTENT_ALIASES, CONTENT_MIGRATIONS, CURRENT_CONTENT_VERSION } from '@/content/contentVersion';
import { ActorSelector, STORY_TEMPLATE_BY_ID } from '@/content/persistentStories';
import { eventById } from './eventPicker';
import { stableHash } from './random';
import { validateWorldIntegrity } from './worldSimulation';
import { appendWorldHistory } from './worldJournal';

export interface RecoveryResult {
  state: GameState;
  recovered: boolean;
  notices: string[];
}

function matchesSelector(character: WorldCharacter, playerId: string, selector: ActorSelector): boolean {
  if (selector.excludePlayer && character.id === playerId) return false;
  if (selector.alive != null && character.alive !== selector.alive) return false;
  if (selector.minAge != null && character.age < selector.minAge) return false;
  if (selector.maxAge != null && character.age > selector.maxAge) return false;
  if (selector.kinds && !selector.kinds.includes(character.kind)) return false;
  if (selector.ambitions && (!character.ambition || !selector.ambitions.includes(character.ambition))) return false;
  if (selector.importance && (!character.importance || !selector.importance.includes(character.importance))) return false;
  return true;
}

function deterministicSubstitute(state: GameState, story: StoryInstance, role: string, selector: ActorSelector): string | null {
  const candidates = Object.values(state.world.characters)
    .filter((character) => matchesSelector(character, state.playerCharacterId, selector))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (!candidates.length) return null;
  return candidates[stableHash(state.world.worldSeed, story.id, role) % candidates.length].id;
}

function recoveryHistory(state: GameState, story: StoryInstance, summary: string): WorldHistoryEntry {
  return {
    id: `history_recovery_${state.nextId++}`,
    year: state.world.currentYear,
    type: 'content_recovery',
    participantIds: Object.values(story.bindings),
    familyIds: [],
    storyInstanceId: story.id,
    causes: ['Game content changed after this tale began.'],
    summary,
    salience: 1,
  };
}

function cancelStory(state: GameState, story: StoryInstance, reason: string): void {
  story.status = 'cancelled';
  state.world.scheduledConsequences = state.world.scheduledConsequences.filter((item) =>
    item.sourceStoryInstanceId !== story.id || item.scope === 'family' || item.scope === 'world',
  );
  if (state.pendingEvent?.storyInstanceId === story.id) {
    state.pendingEvent = null;
  }
  appendWorldHistory(state, recoveryHistory(state, story, reason));
}

function applyCharacterAliases(state: GameState): boolean {
  let changed = false;
  const redirect = (id: string) => {
    const redirected = CONTENT_ALIASES.characters[id] ?? id;
    if (redirected !== id) changed = true;
    return redirected;
  };
  for (const [oldId, newId] of Object.entries(CONTENT_ALIASES.characters)) {
    const oldCharacter = state.world.characters[oldId];
    if (!oldCharacter) continue;
    if (!state.world.characters[newId]) state.world.characters[newId] = { ...oldCharacter, id: newId };
    delete state.world.characters[oldId];
    if (state.playerCharacterId === oldId) state.playerCharacterId = newId;
    changed = true;
  }
  for (const character of Object.values(state.world.characters)) {
    character.parentIds = (character.parentIds ?? []).map(redirect);
    character.childIds = (character.childIds ?? []).map(redirect);
    character.guardianIds = (character.guardianIds ?? []).map(redirect);
    if (character.spouseId) character.spouseId = redirect(character.spouseId);
    for (const secret of character.secrets ?? []) secret.knownByIds = secret.knownByIds.map(redirect);
    for (const charge of character.legalState?.charges ?? []) {
      charge.victimIds = charge.victimIds.map(redirect);
      charge.witnessIds = charge.witnessIds.map(redirect);
    }
  }
  const relationships: typeof state.world.relationships = {};
  for (const relationship of Object.values(state.world.relationships)) {
    relationship.aId = redirect(relationship.aId);
    relationship.bId = redirect(relationship.bId);
    relationships[relationship.id] = relationship;
  }
  state.world.relationships = relationships;
  for (const family of Object.values(state.world.families)) family.memberIds = family.memberIds.map(redirect);
  for (const household of state.world.households) {
    household.memberIds = household.memberIds.map(redirect);
    if (household.headId) household.headId = redirect(household.headId);
  }
  for (const story of state.world.activeStories) for (const role of Object.keys(story.bindings)) story.bindings[role] = redirect(story.bindings[role]);
  if (state.pendingEvent?.bindings) for (const role of Object.keys(state.pendingEvent.bindings)) state.pendingEvent.bindings[role] = redirect(state.pendingEvent.bindings[role]);
  for (const consequence of state.world.scheduledConsequences) consequence.targetIds = consequence.targetIds.map(redirect);
  for (const entry of state.world.history) entry.participantIds = entry.participantIds.map(redirect);
  for (const expected of state.world.expectedChildren) expected.parentIds = expected.parentIds.map(redirect);
  for (const faction of Object.values(state.world.factions)) if (faction.leaderId) faction.leaderId = redirect(faction.leaderId);
  return changed;
}

function applyCareerAliases(state: GameState): boolean {
  let changed = false;
  for (const character of Object.values(state.world.characters)) {
    const careerId = character.occupation.careerId;
    const alias = careerId ? CONTENT_ALIASES.careers[careerId] : undefined;
    if (alias) { character.occupation.careerId = alias; changed = true; }
  }
  const playerCareer = state.occupation.careerId;
  const playerAlias = playerCareer ? CONTENT_ALIASES.careers[playerCareer] : undefined;
  if (playerAlias) { state.occupation.careerId = playerAlias; changed = true; }
  return changed;
}

export function recoverSavedContent(state: GameState): RecoveryResult {
  const notices: string[] = [];
  let recovered = false;
  if (state.world.contentVersion > CURRENT_CONTENT_VERSION) {
    throw new Error(`This save uses content version ${state.world.contentVersion}, but this build supports ${CURRENT_CONTENT_VERSION}.`);
  }

  if (applyCharacterAliases(state) || applyCareerAliases(state)) recovered = true;

  recoverLegacyLegalHearing(state);
  while (state.world.contentVersion < CURRENT_CONTENT_VERSION) {
    const migration = CONTENT_MIGRATIONS[state.world.contentVersion];
    if (migration) {
      const result = migration(state.world);
      state.world = result.world;
      notices.push(...result.notices);
    }
    state.world.contentVersion += 1;
    recovered = true;
  }

  const hadAuthoredQueue=state.activeArcs.length>0||!!state.world.threads?.length||state.world.activeStories.some(s=>['active','paused'].includes(s.status));
  retireAuthoredState(state);
  if(hadAuthoredQueue)recovered=true;
  if (state.pendingEvent) {
    state.pendingEvent.eventId = CONTENT_ALIASES.events[state.pendingEvent.eventId] ?? state.pendingEvent.eventId;
    if (!eventById(state.pendingEvent.eventId)) {
      const story = state.pendingEvent.storyInstanceId
        ? state.world.activeStories.find((item) => item.id === state.pendingEvent!.storyInstanceId)
        : undefined;
      state.pendingEvent = null;
      if (story && ['active','paused'].includes(story.status)) {
        const template = STORY_TEMPLATE_BY_ID[story.templateId];
        if (template?.recovery.recoveryBeatId && template.beats[template.recovery.recoveryBeatId]) story.currentBeatId = template.recovery.recoveryBeatId;
        story.nextEligibleYear = state.world.currentYear;
      }
      recovered = true;
    }
  }

  for (const story of state.world.activeStories) {
    story.templateId = CONTENT_ALIASES.templates[story.templateId] ?? story.templateId;
    story.currentBeatId=CONTENT_ALIASES.beats[story.templateId]?.[story.currentBeatId]??story.currentBeatId;
    for(const role of Object.keys(story.bindings))story.bindings[role]=CONTENT_ALIASES.characters[story.bindings[role]]??story.bindings[role];
    if (!['active', 'paused'].includes(story.status)) continue;
    const template = STORY_TEMPLATE_BY_ID[story.templateId];
    if (!template) {
      cancelStory(state, story, 'An unfinished tale faded from Swineford history.');
      recovered = true;
      continue;
    }

    const beatAlias = CONTENT_ALIASES.beats[story.templateId]?.[story.currentBeatId];
    if (beatAlias) story.currentBeatId = beatAlias;
    if (!template.beats[story.currentBeatId]) {
      if (template.recovery.recoveryBeatId && template.beats[template.recovery.recoveryBeatId]) {
        story.currentBeatId = template.recovery.recoveryBeatId;
        story.nextEligibleYear = state.world.currentYear;
      } else {
        cancelStory(state, story, 'An unfinished tale ended quietly after the chronicles changed.');
      }
      recovered = true;
      continue;
    }

    for (const [role, definition] of Object.entries(template.roles)) {
      let actorId = story.bindings[role];
      actorId = CONTENT_ALIASES.characters[actorId] ?? actorId;
      story.bindings[role] = actorId;
      if (state.world.characters[actorId]) continue;
      const policy = definition.missingActor;
      if (policy.type === 'continue_without_actor') {
        delete story.bindings[role];
      } else if (policy.type === 'branch' && template.beats[policy.beatId]) {
        story.currentBeatId = policy.beatId;
        story.nextEligibleYear = state.world.currentYear;
      } else if (policy.type === 'substitute') {
        const replacement = deterministicSubstitute(state, story, role, policy.selector);
        if (replacement) story.bindings[role] = replacement;
        else cancelStory(state, story, `The tale of ${template.id.replaceAll('_', ' ')} ended when its people could no longer be found.`);
      } else {
        cancelStory(state, story, `The tale of ${template.id.replaceAll('_', ' ')} could no longer continue.`);
      }
      recovered = true;
      if (story.status === 'cancelled') break;
    }
  }

  if (state.pendingEvent?.storyInstanceId) {
    const story = state.world.activeStories.find((item) => item.id === state.pendingEvent!.storyInstanceId);
    const beat = story ? STORY_TEMPLATE_BY_ID[story.templateId]?.beats[story.currentBeatId] : undefined;
    if (story?.status === 'retired') {
      // Keep the already-visible, validated passage and its saved cast. The
      // historical beat pointer cannot reopen or replace it after retirement.
    } else if (!story || story.status !== 'active' || !beat || !eventById(beat.eventId)) {
      state.pendingEvent = null;
      recovered = true;
    } else if (state.pendingEvent.eventId !== beat.eventId) {
      state.pendingEvent = { eventId: beat.eventId, storyInstanceId: story.id, bindings: { ...story.bindings } };
      recovered = true;
    }
  }

  state.world.scheduledConsequences = state.world.scheduledConsequences.filter((item) => {
    const resolution = item.resolution as { type: string };
    resolution.type = CONTENT_ALIASES.consequences[resolution.type] ?? resolution.type;
    const known = ['effects', 'relationship', 'condition', 'memory', 'history'].includes(item.resolution.type);
    const targetsExist = item.scope !== 'character' || item.targetIds.every((id) => Boolean(state.world.characters[id]));
    if (!known || !targetsExist) recovered = true;
    return known && targetsExist;
  });

  if (recovered) {
    state.world.recoveryNotice = true;
    notices.push('Earlier choices were preserved; unfinished tales were closed without assuming an ending.');
  }
  validateWorldIntegrity(state);
  return { state, recovered, notices };
}
