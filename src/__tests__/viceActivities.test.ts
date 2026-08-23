import { ACTIVITY_DEFS } from '@/data/activities';
import { gameReducer } from '@/state/gameReducer';
import { makeState } from './helpers';

describe('vice activities', () => {
  it('provides a dedicated, clearly warned section of destructive choices', () => {
    const vice = ACTIVITY_DEFS.filter((activity) => activity.cat === 'vice');
    expect(vice.map((activity) => activity.id)).toEqual(expect.arrayContaining([
      'ale_binge', 'poppy_draught', 'reckless_brawl', 'winter_exposure', 'monkshood_vial',
    ]));
    expect(vice.every((activity) => activity.danger === 'high' || activity.danger === 'extreme')).toBe(true);
  });

  it('makes the black vial a genuine immediate death-testing route', () => {
    const state = makeState({ age: 18, gold: 20, stats: { health: 100, charm: 50, wits: 50, faith: 50 } });
    const next = gameReducer(state, { type: 'DO_ACTIVITY', id: 'monkshood_vial' });
    expect(next.dead).toBe(true);
    expect(next.stats.health).toBe(0);
    expect(next.deathCause).toBeTruthy();
  });

  it('can catastrophically damage health without guaranteeing death', () => {
    const state = makeState({ age: 18, gold: 20, stats: { health: 100, charm: 50, wits: 50, faith: 50 } });
    const next = gameReducer(state, { type: 'DO_ACTIVITY', id: 'reckless_brawl' });
    expect(next.stats.health).toBeLessThanOrEqual(62);
    expect(next.world.characters[next.playerCharacterId].healthConditions?.length).toBeGreaterThan(0);
    expect(next.world.characters[next.playerCharacterId].legalState!.charges.length).toBeGreaterThan(0);
  });

  it('keeps the fatal shortcut locked until age eleven', () => {
    const state = makeState({ age: 10, gold: 20 });
    const next = gameReducer(state, { type: 'DO_ACTIVITY', id: 'monkshood_vial' });
    expect(next.dead).toBe(false);
    expect(next.actionClock.used).toBe(state.actionClock.used);
  });
});

describe('extreme crime', () => {
  it('adds crimes capable of wrecking health and legal standing together', () => {
    const crimes = ACTIVITY_DEFS.filter((activity) => activity.cat === 'crime');
    expect(crimes.map((activity) => activity.id)).toEqual(expect.arrayContaining(['torch_holding', 'bloody_raid']));

    const state = makeState({ age: 18, gold: 30, stats: { health: 100, charm: 50, wits: 0, faith: 50 } });
    const next = gameReducer(state, { type: 'DO_ACTIVITY', id: 'bloody_raid' });
    expect(next.stats.health).toBeLessThanOrEqual(82);
    expect(next.reputation).toBeLessThan(state.reputation);
    expect(next.world.characters[next.playerCharacterId].legalState!.charges.length).toBeGreaterThan(0);
  });
});
