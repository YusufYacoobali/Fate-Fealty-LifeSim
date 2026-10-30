import { resolveRpgEncounter } from './rpgSoakHelpers';
import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { eventById, isChoiceEnabled } from '@/engine/eventPicker';
import { buildLifeChronicle } from '@/engine/deathEngine';
import { normalizeGameState } from '@/state/persistence';
import { spawnKin } from '@/engine/kinFactory';
import { worldIntegrityIssues } from '@/engine/worldIntegrity';
import { PERSISTENT_STORY_TEMPLATES, STORY_TEMPLATE_BY_ID } from '@/content/persistentStories';
import { applyChoice } from '@/engine/storyGraph';
import { runWithWorldRng } from '@/engine/random';
import { Difficulty, GameState, LifeRole } from '@/types/game';

const FULL = process.env.MLS_FULL_SOAK === '1';
const LIVES_PER_DIFFICULTY = FULL ? 500 : 1;
const DYNASTIES = FULL ? 100 : 1;
const LIVES_PER_ROLE = FULL ? 100 : 1;
const LIFE_GUARD = 130;

function resolvePending(state: GameState): GameState {
  resolveRpgEncounter(state);
  let guard = 0;
  while (state.pendingEvent && !state.dead && guard++ < 4) {
    const event = eventById(state.pendingEvent.eventId);
    if (!event) throw new Error(`missing pending event ${state.pendingEvent.eventId}`);
    const choice = event.choices.find((candidate) => isChoiceEnabled(state, candidate));
    if (!choice) throw new Error(`blocked event ${event.id}`);
    state = gameReducer(state, { type: 'CHOOSE', choice });
  }
  return state;
}

function assertBounds(state: GameState, context = 'soak world'): void {
  for (const value of Object.values(state.stats)) expect(value).toBeGreaterThanOrEqual(0);
  for (const value of Object.values(state.stats)) expect(value).toBeLessThanOrEqual(100);
  for (const value of Object.values(state.world.conditions)) expect(value).toBeGreaterThanOrEqual(0);
  for (const value of Object.values(state.world.conditions)) expect(value).toBeLessThanOrEqual(100);
  expect(state.feed.length).toBeLessThanOrEqual(500);
  expect(state.world.history.length).toBeLessThanOrEqual(400);
  const livingPopulation = Object.values(state.world.characters).filter((character) => character.alive).length;
  expect(livingPopulation).toBeGreaterThanOrEqual(30);
  expect(livingPopulation).toBeLessThanOrEqual(60);
  const integrity = worldIntegrityIssues(state);
  if (integrity.length) throw new Error(`${context}: ${integrity.join('; ')}`);
}

function configureRole(state: GameState, role: LifeRole): void {
  const player = state.world.characters[state.playerCharacterId];
  const careers: Partial<Record<LifeRole, string>> = {
    artisan_merchant: 'artisan', clergy: 'cleric', martial: 'guard', outlaw: 'poacher_job',
  };
  if (role === 'landed_noble') state.rankIdx = player.rankIdx = 3;
  else if (role === 'monarch') state.rankIdx = player.rankIdx = 5;
  else if (careers[role]) state.occupation.careerId = player.occupation.careerId = careers[role]!;
  if (role === 'outlaw') state.paths.outlaw = 30;
}

function runLife(seed: number, difficulty: Difficulty, role?: LifeRole): GameState {
  let state = createLife({ worldSeed: seed, settings: { autoScroll: false, difficulty, liveForever: false, haptics: false, soundEffects: false } });
  if (role) configureRole(state, role);
  for (let year = 0; year < LIFE_GUARD && !state.dead; year++) {
    state = resolvePending(state);
    if (!state.dead && !state.pendingEvent) state = gameReducer(state, { type: 'AGE_UP' });
  }
  state = resolvePending(state);
  assertBounds(state, `seed ${seed}, difficulty ${difficulty}, role ${role ?? 'natural'}`);
  expect(state.dead).toBe(true);
  return state;
}

describe('persistent-world full soak matrix', () => {
  jest.setTimeout(FULL ? 30 * 60_000 : 120_000);

  it('retains expected-child household references when an artisan household moves', () => {
    runLife(71_043, 'Normal', 'artisan_merchant');
  });

  it('completes the configured life count per difficulty', () => {
    for (const [difficultyIndex, difficulty] of (['Merciful', 'Normal', 'Brutal'] as Difficulty[]).entries()) {
      for (let index = 0; index < LIVES_PER_DIFFICULTY; index++) runLife(10_000 + difficultyIndex * 10_000 + index, difficulty);
    }
  });

  it('runs three-generation dynasties without replacing the world or social graph', () => {
    for (let index = 0; index < DYNASTIES; index++) {
      let state = createLife({ worldSeed: 50_000 + index });
      const seed = state.world.worldSeed;
      const foundingRelationshipIds = Object.keys(state.world.relationships);
      for (let generation = 1; generation < 3; generation++) {
        for (let year = 0; year < 8 && !state.dead; year++) {
          state = resolvePending(state);
          if (!state.pendingEvent) state = gameReducer(state, { type: 'AGE_UP' });
        }
        const heir = spawnKin(state, { kind: 'child', age: 18, isHeir: true, name: `Heir ${generation}` });
        state.dead = true;
        state.deathCause = 'Dynasty soak succession.';
        state = gameReducer(state, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
      }
      expect(state.world.worldSeed).toBe(seed);
      expect(state.playerRun.generation).toBe(3);
      for (const relationshipId of foundingRelationshipIds) expect(state.world.relationships[relationshipId]).toBeDefined();
      assertBounds(state);
    }
  });

  it('completes lives for every life role', () => {
    const roles: LifeRole[] = ['commoner', 'artisan_merchant', 'clergy', 'martial', 'landed_noble', 'monarch', 'outlaw'];
    for (const [roleIndex, role] of roles.entries()) {
      for (let index = 0; index < LIVES_PER_ROLE; index++) runLife(70_000 + roleIndex * 1_000 + index, 'Normal', role);
    }
  });

  it('covers every persistent story route and ending with fixed seeds', () => {
    for (const [templateIndex, template] of PERSISTENT_STORY_TEMPLATES.entries()) {
      const makeStoryAt = (beatId: string, routeIndex: number) => {
        const state = createLife({ worldSeed: 90_000 + templateIndex * 100 + routeIndex });
        state.lifetimeUnlocked = true;
        const actors = Object.values(state.world.characters).filter((character) => character.id !== state.playerCharacterId);
        const bindings = Object.fromEntries(Object.keys(template.roles).map((role, index) => [role, actors[index % actors.length].id]));
        const story = { id: `soak_${template.id}_${beatId}_${routeIndex}`, templateId: template.id, scale: template.scale, status: 'active' as const, bindings, variables: {}, currentBeatId: beatId, startedYear: state.world.currentYear, nextEligibleYear: state.world.currentYear, lastBeatYear: state.world.currentYear - 1, generationStarted: 1 };
        state.world.activeStories.push(story);
        const event = eventById(template.beats[beatId].eventId)!;
        state.pendingEvent = { eventId: event.id, storyInstanceId: story.id, bindings };
        return { state, story, event };
      };

      for (const beat of Object.values(template.beats).filter((candidate) => candidate.transitions?.length)) {
        for (const [routeIndex, transition] of beat.transitions!.entries()) {
          const { state, story, event } = makeStoryAt(beat.id, routeIndex);
          const choice = event.choices.find((candidate) => {
            const value = candidate.outcome?.effects?.storyVariables?.[transition.when.variable];
            return transition.when.truthy ? Boolean(value) : value === transition.when.equals;
          });
          expect(choice).toBeDefined();
          runWithWorldRng(state.world, () => applyChoice(state, event, choice!));
          expect(story.currentBeatId).toBe(transition.beatId);
        }
        if (beat.nextBeatId) {
          const { state, story, event } = makeStoryAt(beat.id, 50);
          const fallback = event.choices.find((candidate) => !(beat.transitions ?? []).some((transition) => {
            const value = candidate.outcome?.effects?.storyVariables?.[transition.when.variable];
            return transition.when.truthy ? Boolean(value) : value === transition.when.equals;
          }));
          expect(fallback).toBeDefined();
          runWithWorldRng(state.world, () => applyChoice(state, event, fallback!));
          expect(story.currentBeatId).toBe(beat.nextBeatId);
        }
      }

      for (const [endingIndex, ending] of Object.values(template.beats).filter((beat) => beat.endsStory).entries()) {
        const { state, story, event } = makeStoryAt(ending.id, 70 + endingIndex);
        runWithWorldRng(state.world, () => applyChoice(state, event, event.choices[0]));
        expect(story.status).toBe('completed');
        expect(STORY_TEMPLATE_BY_ID[template.id].beats[ending.id]).toBeDefined();
      }
    }
  });

  it('matches uninterrupted play across deterministic reload checkpoints', () => {
    let uninterrupted = createLife({ worldSeed: 123_456 });
    let reloaded = createLife({ worldSeed: 123_456 });
    for (let year = 0; year < 35 && !uninterrupted.dead; year++) {
      uninterrupted = resolvePending(uninterrupted);
      reloaded = resolvePending(reloaded);
      if (!uninterrupted.pendingEvent) uninterrupted = gameReducer(uninterrupted, { type: 'AGE_UP' });
      if (!reloaded.pendingEvent) reloaded = gameReducer(reloaded, { type: 'AGE_UP' });
      if (year % 7 === 3) reloaded = normalizeGameState(JSON.parse(JSON.stringify(reloaded)));
    }
    expect(reloaded.world.rngState).toEqual(uninterrupted.world.rngState);
    expect(reloaded.world.history).toEqual(uninterrupted.world.history);
    expect(buildLifeChronicle(reloaded)).toEqual(buildLifeChronicle(uninterrupted));
  });
});
