/**
 * Regression coverage for the defects found in the v3 engine audit. Each block
 * pins the specific behaviour that was wrong, so a future refactor that
 * reintroduces it fails here rather than in a player's save.
 */

import { cloneState, createLife } from '@/engine/gameState';
import { ageUp } from '@/engine/lifeDirector';
import { runWithWorldRng } from '@/engine/random';
import { gameReducer } from '@/state/gameReducer';
import { activityAvailability, doActivity } from '@/engine/activityEngine';
import { findRelationship, relationshipWith } from '@/engine/relationshipEngine';
import { repairWorldIntegrity } from '@/engine/worldIntegrity';
import { beginLegalTrial, dueLegalEvent } from '@/engine/legalEngine';
import { selectKin } from '@/state/viewModel';
import { ALL_EVENTS, EVENTS_BY_ID } from '@/content/index';
import { HEALTH_CONDITION_BY_ID } from '@/content/healthConditions';
import { GameState, RelationFilter } from '@/types/game';

function advance(state: GameState, years: number): GameState {
  let current = state;
  for (let year = 0; year < years; year++) {
    if (current.dead) break;
    current.pendingEvent = null;
    const working = cloneState(current);
    current = runWithWorldRng(working.world, () => ageUp(working));
  }
  return current;
}

function playable(worldSeed: number): GameState {
  const state = createLife({ worldSeed, lifeNo: 1 });
  state.age = 30;
  state.world.characters[state.playerCharacterId].age = 30;
  state.actionClock = { ...state.actionClock, used: 0, cap: 99 };
  state.gold = 100;
  return state;
}

describe('family formation ownership', () => {
  it('never registers another household’s child as the player’s kin', () => {
    const impostors: string[] = [];
    for (let seed = 1; seed <= 8; seed++) {
      const state = advance(createLife({ worldSeed: seed, lifeNo: 1 }), 60);
      const player = state.world.characters[state.playerCharacterId];
      const owned = new Set(player?.childIds ?? []);
      for (const character of Object.values(state.world.characters)) {
        if (character.id === state.playerCharacterId || character.kind !== 'child') continue;
        const mine = owned.has(character.id)
          || character.parentIds?.includes(state.playerCharacterId)
          || character.guardianIds?.includes(state.playerCharacterId);
        if (!mine) impostors.push(`seed ${seed}: ${character.name} (${character.role})`);
      }
    }
    expect(impostors).toEqual([]);
  });

  it('does not charge household upkeep for children the player did not raise', () => {
    const state = advance(createLife({ worldSeed: 3, lifeNo: 1 }), 45);
    const owned = new Set(state.world.characters[state.playerCharacterId]?.childIds ?? []);
    const dependants = state.kin.filter((kin) => kin.alive && (kin.kind === 'spouse' || kin.kind === 'child'));
    for (const dependant of dependants) {
      if (dependant.kind === 'child') expect(owned.has(dependant.id)).toBe(true);
    }
  });

  it('still gives the player their own children', () => {
    const state = createLife({ worldSeed: 21, lifeNo: 1 });
    state.world.expectedChildren.push({
      id: 'expected_test', parentIds: [state.playerCharacterId], route: 'pregnancy',
      dueYear: state.world.currentYear, householdId: 'house_player', familyId: 'family_0', status: 'expected',
    });
    const after = advance(state, 1);
    const player = after.world.characters[after.playerCharacterId];
    const child = Object.values(after.world.characters).find((c) => c.parentIds?.includes(after.playerCharacterId) && c.age === 0);
    expect(child).toBeDefined();
    expect(child!.kind).toBe('child');
    expect(player.childIds).toContain(child!.id);
  });

  it('repairs mis-parented children in existing saves on load', () => {
    const state = createLife({ worldSeed: 5, lifeNo: 1 });
    const stranger = Object.values(state.world.characters).find((c) => c.id !== state.playerCharacterId)!;
    stranger.kind = 'child';
    stranger.role = 'Thy Child';
    stranger.parentIds = [];
    repairWorldIntegrity(state);
    expect(stranger.kind).toBe('acquaintance');
    expect(stranger.role).not.toBe('Thy Child');
  });
});

describe('structured health mortality', () => {
  function terminallyIll(worldSeed: number): GameState {
    const state = createLife({ worldSeed, lifeNo: 1 });
    const player = state.world.characters[state.playerCharacterId];
    player.healthConditions = [{
      id: 'h1', conditionId: 'plague', kind: 'illness', severity: 95, diagnosed: true,
      startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear,
    }];
    state.stats.health = 40;
    player.stats.health = 40;
    return state;
  }

  it('lets a fatal condition actually kill the player', () => {
    const deaths = Array.from({ length: 30 }, (_, seed) => advance(terminallyIll(seed + 1), 1)).filter((s) => s.dead);
    expect(deaths.length).toBeGreaterThan(0);
    expect(deaths[0].deathCause).toBeTruthy();
  });

  it('names the condition as the cause rather than a generic collapse', () => {
    const expected = HEALTH_CONDITION_BY_ID.plague.name;
    const causes = Array.from({ length: 30 }, (_, seed) => advance(terminallyIll(seed + 1), 1))
      .filter((s) => s.dead)
      .map((s) => s.deathCause);
    expect(causes).toContain(expected);
  });

  it('never leaves a death cause on a living character', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const after = advance(terminallyIll(seed), 1);
      if (!after.dead) expect(after.deathCause).toBe('');
    }
  });

  it('respects Live Forever', () => {
    const state = terminallyIll(4);
    state.settings = { ...state.settings, liveForever: true };
    const after = advance(state, 3);
    expect(after.dead).toBe(false);
  });
});

describe('reducer state isolation', () => {
  const actions = ['care_relative', 'treat_patient', 'teach_child', 'gather_intelligence', 'tavern', 'rest'] as const;

  it.each(actions)('%s does not mutate the previous state', (id) => {
    let state = advance(playable(7), 20);
    state.pendingEvent = null;
    state.dead = false;
    state.gold = 100;
    state.actionClock = { ...state.actionClock, used: 0, cap: 99 };
    // Guarantee the handlers have a subject to act on.
    const subject = state.kin.find((kin) => kin.alive && kin.id !== 'goose')!;
    subject.kind = 'child';
    subject.age = 8;
    subject.stats.health = 40;
    subject.healthConditions = [{
      id: 'hc', conditionId: 'ague', kind: 'illness', severity: 40, diagnosed: false,
      startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear + 1,
    }];
    subject.secrets = [{ id: 'sc', type: 'hidden_debt', knownByIds: [], revealed: false, severity: 30, createdYear: 1320 }];
    state.kin = Object.values(state.world.characters).filter((c) => c.id !== state.playerCharacterId);

    const before = JSON.stringify(state);
    gameReducer(state, { type: 'DO_ACTIVITY', id });
    expect(JSON.stringify(state)).toBe(before);
  });

  it('KIN_INTERACT does not mutate the previous state', () => {
    const state = playable(9);
    const kin = state.kin.find((member) => member.alive && member.kind === 'mother')!;
    const before = JSON.stringify(state);
    gameReducer(state, { type: 'KIN_INTERACT', id: kin.id, action: 'time' });
    expect(JSON.stringify(state)).toBe(before);
  });

  it('keeps player actions inside a 50ms p95 budget', () => {
    let state = advance(createLife({ worldSeed: 73_500 }), 40);
    state.pendingEvent = null;
    state.dead = false;
    state.actionClock = { ...state.actionClock, used: 0, cap: 9999 };
    const timings: number[] = [];
    for (let sample = 0; sample < 60; sample++) {
      const started = performance.now();
      state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'fair' });
      timings.push(performance.now() - started);
    }
    timings.sort((a, b) => a - b);
    expect(timings[Math.ceil(timings.length * 0.95) - 1]).toBeLessThan(50);
  });
});

describe('activity contracts', () => {
  it('teaching a child grants the relationship gain it advertises', () => {
    const state = playable(11);
    const child = state.kin.find((kin) => kin.alive && kin.id !== 'goose')!;
    child.kind = 'child';
    child.age = 8;
    const before = relationshipWith(state, child.id).aToB.affinity;
    doActivity(state, 'teach_child');
    expect(relationshipWith(state, child.id).aToB.affinity).toBe(before + 3);
  });

  it('offers every priced activity at exactly the gold it charges', () => {
    const priced: Array<[string, number]> = [
      ['tavern', 2], ['dice', 3], ['feast', 4], ['pilgrimage', 3],
      ['tournament', 5], ['leech', 3], ['bathhouse', 2], ['herbalist', 4],
    ];
    for (const [id, price] of priced) {
      const affordable = playable(13);
      affordable.gold = price;
      expect(activityAvailability(affordable, id)).toEqual({ available: true });

      const broke = playable(13);
      broke.gold = price - 1;
      expect(activityAvailability(broke, id).available).toBe(false);
    }
  });

  it('charges the advertised price and no more', () => {
    for (const [id, price] of [['leech', 3], ['bathhouse', 2], ['herbalist', 4]] as const) {
      const state = playable(17);
      state.gold = price;
      doActivity(state, id);
      expect(state.gold).toBe(0);
    }
  });
});

describe('selectors are read-only', () => {
  const filters: RelationFilter[] = ['all', 'family', 'romance', 'friends', 'acquaintances', 'rivals', 'authority', 'deceased'];

  it.each(filters)('filtering kin by %s does not write to state', (filter) => {
    const state = playable(19);
    state.world.relationships = {};
    state.world.relationFilter = filter;
    selectKin(state);
    expect(Object.keys(state.world.relationships)).toHaveLength(0);
  });

  it('still reads real relationship data when a record exists', () => {
    const state = playable(19);
    const mother = state.kin.find((kin) => kin.kind === 'mother')!;
    state.world.relationFilter = 'family';
    expect(selectKin(state).map((kin) => kin.id)).toContain(mother.id);
    expect(findRelationship(state, mother.id)).toBeDefined();
  });
});

describe('legal trials', () => {
  function accused(): GameState {
    const state = playable(23);
    const legal = state.world.characters[state.playerCharacterId].legalState!;
    legal.suspicion = 60;
    legal.charges.push({ id: 'c1', offence: 'poaching', severity: 30, evidence: 40, victimIds: [], witnessIds: [], year: state.world.currentYear, resolved: false });
    return state;
  }

  it('does not consume the charge merely by asking whether a trial is due', () => {
    const state = accused();
    expect(dueLegalEvent(state)).not.toBeNull();
    expect(dueLegalEvent(state)).not.toBeNull();
    expect(state.world.characters[state.playerCharacterId].legalState!.charges[0].resolved).toBe(false);
  });

  it('consumes the charge once the trial is actually opened', () => {
    const state = accused();
    beginLegalTrial(state);
    const legal = state.world.characters[state.playerCharacterId].legalState!;
    expect(legal.charges[0].resolved).toBe(true);
    expect(legal.status).toBe('awaiting_trial');
    expect(dueLegalEvent(state)).toBeNull();
  });

  it('reaches the player as a resolvable event', () => {
    const state = advance(accused(), 1);
    expect(state.pendingEvent?.eventId).toBe('system_legal_trial');
    expect(EVENTS_BY_ID[state.pendingEvent!.eventId]).toBeDefined();
  });
});

describe('content registry integrity', () => {
  it('resolves every choice continuation', () => {
    const dangling = ALL_EVENTS.flatMap((event) =>
      event.choices.flatMap((choice) =>
        [choice.outcome, choice.success, choice.failure]
          .filter((outcome) => outcome?.next && !EVENTS_BY_ID[outcome.next])
          .map((outcome) => `${event.id} -> ${outcome!.next}`)));
    expect(dangling).toEqual([]);
  });
});
