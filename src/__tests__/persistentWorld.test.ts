import { createLife, cloneState } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { recoverSavedContent } from '@/engine/contentRecovery';
import { PERSISTENT_STORY_TEMPLATES, STORY_TEMPLATE_BY_ID } from '@/content/persistentStories';
import { eventById } from '@/engine/eventPicker';
import { spawnKin } from '@/engine/kinFactory';
import { resolveScheduledConsequences, tickWorldConditions, worldIntegrityIssues } from '@/engine/worldSimulation';
import { applyChoice } from '@/engine/storyGraph';
import { Relationship } from '@/types/game';
import { RENAMED_CONTENT_FIXTURE } from './fixtures/contentRecoveryFixtures';
import { isRomanceEligible } from '@/engine/relationshipEngine';
import { unlinkSpouse } from '@/engine/characterState';

describe('persistent deterministic world', () => {
  it('creates the same world and continuation from the same seed and actions', () => {
    let a = createLife({ worldSeed: 90210, firstName: 'Alda' });
    let b = createLife({ worldSeed: 90210, firstName: 'Alda' });
    expect(a.world.worldSeed).toBe(90210);
    expect(a.world.characters).toEqual(b.world.characters);
    expect(a.world.rngState).toEqual(b.world.rngState);

    for (const id of ['church', 'fields', 'fair']) {
      a = gameReducer(a, { type: 'DO_ACTIVITY', id });
      b = gameReducer(b, { type: 'DO_ACTIVITY', id });
    }
    a = gameReducer(a, { type: 'AGE_UP' });
    b = gameReducer(b, { type: 'AGE_UP' });
    expect(a.world.rngState).toEqual(b.world.rngState);
    expect(a.feed).toEqual(b.feed);
    expect(a.world.conditions).toEqual(b.world.conditions);
  });

  it('continues identically after a serialised save checkpoint', () => {
    let uninterrupted = createLife({ worldSeed: 4411 });
    uninterrupted = gameReducer(uninterrupted, { type: 'DO_ACTIVITY', id: 'church' });
    const resumed = normalizeGameState(JSON.parse(JSON.stringify(uninterrupted)));
    const nextA = gameReducer(uninterrupted, { type: 'DO_ACTIVITY', id: 'fair' });
    const nextB = gameReducer(resumed, { type: 'DO_ACTIVITY', id: 'fair' });
    expect(nextB.world.rngState).toEqual(nextA.world.rngState);
    expect(nextB.feed).toEqual(nextA.feed);
  });

  it('does not consume a random draw for an invalid action', () => {
    const state = createLife({ worldSeed: 71 });
    const draws = state.world.rngState.draws;
    const after = gameReducer(state, { type: 'DO_ACTIVITY', id: 'tournament' });
    expect(after.world.rngState.draws).toBe(draws);
  });

  it('deep clones every nested persistent character field', () => {
    const original = createLife({ worldSeed: 19 });
    const copy = cloneState(original);
    const id = 'mother';
    copy.world.characters[id].stats.health -= 20;
    copy.world.characters[id].occupation.experience += 10;
    copy.world.characters[id].personalityTraits!.push('changed');
    copy.world.characters[id].worldMemories!.push({ id: 'x', year: 1, type: 'x', actorIds: [], sentiment: 0, salience: 1, inherited: false, summary: 'x' });
    expect(original.world.characters[id].stats.health).not.toBe(copy.world.characters[id].stats.health);
    expect(original.world.characters[id].occupation.experience).not.toBe(copy.world.characters[id].occupation.experience);
    expect(original.world.characters[id].personalityTraits).not.toContain('changed');
    expect(original.world.characters[id].worldMemories).toHaveLength(0);
  });

  it('preserves the world, stories, seed and history when continuing as an heir', () => {
    const state = createLife({ worldSeed: 5050 });
    const child = spawnKin(state, { kind: 'child', age: 12, isHeir: true, name: 'Edith' });
    state.dead = true;
    state.deathCause = 'A test death.';
    state.world.history.push({ id: 'before', year: state.world.currentYear, type: 'test', participantIds: [], familyIds: [], causes: [], summary: 'Before succession', salience: 2 });
    const after = gameReducer(state, { type: 'CONTINUE_AS_HEIR', heirId: child.id });
    expect(after.playerCharacterId).toBe(child.id);
    expect(after.world.worldSeed).toBe(5050);
    expect(after.world.characters[state.playerCharacterId].alive).toBe(false);
    expect(after.world.history.some((entry) => entry.id === 'before')).toBe(true);
    expect(after.tags).toContain('regency');
  });

  it('preserves NPC relationships through two successions', () => {
    let state = createLife({ worldSeed: 6060 });
    const npcRelation: Relationship = {
      id: 'rel_agnes_edwin', aId: 'agnes', bId: 'edwin',
      aToB: { affinity: 77, trust: 64, respect: 55, attraction: 0 },
      bToA: { affinity: 69, trust: 62, respect: 58, attraction: 0 },
      flags: ['friend'], lastInteractionAge: 0, interactionsThisYear: 0, sharedMemories: ['old_oath'],
    };
    state.world.relationships[npcRelation.id] = npcRelation;
    const firstHeir = spawnKin(state, { kind: 'child', age: 20, isHeir: true, name: 'Edith' });
    state.dead = true;
    state = gameReducer(state, { type: 'CONTINUE_AS_HEIR', heirId: firstHeir.id });
    const secondHeir = spawnKin(state, { kind: 'child', age: 18, isHeir: true, name: 'Alda' });
    state.dead = true;
    state = gameReducer(state, { type: 'CONTINUE_AS_HEIR', heirId: secondHeir.id });
    expect(state.playerRun.generation).toBe(3);
    expect(state.world.relationships[npcRelation.id]).toEqual(npcRelation);
    expect(state.world.characters.agnes).toBeDefined();
  });

  it('does not cast married NPCs as romance candidates and unlinks both spouses atomically', () => {
    const state = createLife({ worldSeed: 6061 });
    state.age = 20;
    const a = spawnKin(state, { kind: 'acquaintance', age: 20, name: 'A' });
    const b = spawnKin(state, { kind: 'acquaintance', age: 20, name: 'B' });
    a.spouseId = b.id;
    b.spouseId = a.id;
    expect(isRomanceEligible(state, a)).toBe(false);
    unlinkSpouse(state, a.id);
    expect(a.spouseId).toBeUndefined();
    expect(b.spouseId).toBeUndefined();
  });
});

describe('persistent stories and update recovery', () => {
  it('ships five branching nine-beat flagship templates and seven role templates with valid events', () => {
    const flagshipIds = ['rivals_rise', 'lean_harvest', 'disputed_inheritance', 'war_swineford', 'ambitious_child'];
    for (const id of flagshipIds) {
      const template = STORY_TEMPLATE_BY_ID[id];
      expect(Object.keys(template.beats)).toHaveLength(9);
      expect(template.beats.beat_3.transitions).toHaveLength(2);
      for (const beat of Object.values(template.beats)) expect(eventById(beat.eventId)).toBeDefined();
    }
    expect(PERSISTENT_STORY_TEMPLATES.filter((template) => template.id.startsWith('role_'))).toHaveLength(7);
  });

  it('cancels a removed template safely without advancing RNG or removing world consequences', () => {
    const state = createLife({ worldSeed: 818 });
    state.world.activeStories.push({ id: 'removed_story', templateId: 'removed_template', scale: 'major', status: 'active', bindings: {}, variables: {}, currentBeatId: 'gone', startedYear: 1320, nextEligibleYear: 1321, lastBeatYear: 1320, generationStarted: 1 });
    state.world.scheduledConsequences.push(
      { id: 'private', sourceStoryInstanceId: 'removed_story', dueYear: 1400, scope: 'character', targetIds: [state.playerCharacterId], resolution: { type: 'history', historyType: 'x', summary: 'x', salience: 1 }, explanation: 'x' },
      { id: 'world', sourceStoryInstanceId: 'removed_story', dueYear: 1400, scope: 'world', targetIds: [], resolution: { type: 'history', historyType: 'x', summary: 'x', salience: 1 }, explanation: 'x' },
    );
    const before = { ...state.world.rngState };
    const result = recoverSavedContent(state);
    expect(result.recovered).toBe(true);
    expect(state.world.activeStories[0].status).toBe('cancelled');
    expect(state.world.scheduledConsequences.map((item) => item.id)).toEqual(['world']);
    expect(state.world.rngState).toEqual(before);
  });

  it('repairs a missing actor deterministically without consuming the RNG stream', () => {
    const state = createLife({ worldSeed: 8118 });
    state.world.activeStories.push({ id: 'rival_story', templateId: 'rivals_rise', scale: 'major', status: 'active', bindings: { rival: 'removed_actor', patron: 'aldric' }, variables: {}, currentBeatId: 'beat_2', startedYear: 1320, nextEligibleYear: 1321, lastBeatYear: 1320, generationStarted: 1 });
    const before = { ...state.world.rngState };
    recoverSavedContent(state);
    expect(state.world.activeStories[0].bindings.rival).not.toBe('removed_actor');
    expect(state.world.characters[state.world.activeStories[0].bindings.rival]).toBeDefined();
    expect(state.world.rngState).toEqual(before);
  });

  it('routes choices through distinct flagship branches and endings', () => {
    const state = createLife({ worldSeed: 9191 });
    state.age = 20;
    const story = { id: 'branch_story', templateId: 'rivals_rise', scale: 'major' as const, status: 'active' as const, bindings: { rival: 'roderick', patron: 'aldric' }, variables: {}, currentBeatId: 'beat_3', startedYear: 1320, nextEligibleYear: 1320, lastBeatYear: 1319, generationStarted: 1 };
    state.world.activeStories.push(story);
    state.pendingEvent = { eventId: 'story_rival_3', storyInstanceId: story.id, bindings: story.bindings };
    const branchEvent = eventById('story_rival_3')!;
    applyChoice(state, branchEvent, branchEvent.choices.find((choice) => choice.id === 'bold')!);
    expect(story.currentBeatId).toBe('beat_4_bold');

    story.currentBeatId = 'beat_5';
    state.pendingEvent = { eventId: 'story_rival_5', storyInstanceId: story.id, bindings: story.bindings };
    const decisionEvent = eventById('story_rival_5')!;
    applyChoice(state, decisionEvent, decisionEvent.choices.find((choice) => choice.id === 'reconcile')!);
    expect(story.currentBeatId).toBe('beat_6_reconciled');
  });

  it('recovers missing beats, pending events and unknown consequences without RNG draws', () => {
    const state = createLife({ worldSeed: 1776 });
    const story = { id: 'damaged_story', templateId: 'rivals_rise', scale: 'major' as const, status: 'active' as const, bindings: { rival: 'roderick', patron: 'aldric' }, variables: {}, currentBeatId: 'removed_beat', startedYear: 1320, nextEligibleYear: 1320, lastBeatYear: 1319, generationStarted: 1 };
    state.world.activeStories.push(story);
    state.pendingEvent = { eventId: 'removed_event', storyInstanceId: story.id };
    state.world.scheduledConsequences.push({ id: 'unknown', dueYear: 1321, scope: 'world', targetIds: [], resolution: { type: 'removed_type' } as never, explanation: 'old content' });
    const before = { ...state.world.rngState };
    recoverSavedContent(state);
    expect(state.pendingEvent).toBeNull();
    expect(story.currentBeatId).toBe('beat_6_hard');
    expect(state.world.scheduledConsequences).toHaveLength(0);
    expect(state.world.rngState).toEqual(before);
  });

  it('applies real rename fixtures before fallback recovery', () => {
    const state = createLife({ worldSeed: 187 });
    state.world.contentVersion = 1;
    state.world.activeStories.push(structuredClone(RENAMED_CONTENT_FIXTURE.story));
    state.pendingEvent = { ...RENAMED_CONTENT_FIXTURE.pendingEvent };
    state.world.scheduledConsequences.push(structuredClone(RENAMED_CONTENT_FIXTURE.consequence));
    recoverSavedContent(state);
    const story = state.world.activeStories.find((item) => item.id === RENAMED_CONTENT_FIXTURE.story.id)!;
    expect(story.templateId).toBe('rivals_rise');
    expect(story.currentBeatId).toBe('beat_5');
    expect(story.bindings.rival).toBe('roderick');
    expect(state.world.scheduledConsequences[0].resolution.type).toBe('history');
    expect(state.world.contentVersion).toBe(2);
  });

  it('resolves delayed consequences on their due year', () => {
    const state = createLife({ worldSeed: 22 });
    state.world.scheduledConsequences.push({ id: 'late', dueYear: state.world.currentYear + 2, scope: 'world', targetIds: [], resolution: { type: 'condition', condition: 'publicOrder', delta: -10, label: 'An old grievance' }, explanation: 'An old choice causes unrest.' });
    const before = state.world.conditions.publicOrder;
    resolveScheduledConsequences(state);
    expect(state.world.conditions.publicOrder).toBe(before);
    state.world.currentYear += 2;
    resolveScheduledConsequences(state);
    expect(state.world.conditions.publicOrder).toBe(before - 10);
    expect(state.world.scheduledConsequences).toHaveLength(0);
  });

  it('does not reapply one-time condition shocks on later annual ticks', () => {
    const state = createLife({ worldSeed: 404 });
    state.world.conditions.publicOrder = 50;
    state.world.scheduledConsequences.push({ id: 'shock', dueYear: state.world.currentYear, scope: 'world', targetIds: [], resolution: { type: 'condition', condition: 'publicOrder', delta: -10, label: 'A riot' }, explanation: 'A riot shakes the village.' });
    resolveScheduledConsequences(state);
    expect(state.world.conditions.publicOrder).toBe(40);
    state.world.currentYear += 1;
    tickWorldConditions(state);
    expect(state.world.conditions.publicOrder).toBeGreaterThanOrEqual(40);
  });

  it('starts a fresh world with strict referential integrity', () => {
    expect(worldIntegrityIssues(createLife({ worldSeed: 55 }))).toEqual([]);
  });
});
