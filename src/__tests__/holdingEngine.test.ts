import {
  buyHoldingUpgrade,
  holdingActionAvailability,
  holdingProsperity,
  isHoldingUpgradeActive,
  manageHolding,
  tickHoldingYear,
} from '@/engine/holdingEngine';
import { gameReducer } from '@/state/gameReducer';
import { spawnKin } from '@/engine/kinFactory';
import { normalizeGameState } from '@/state/persistence';
import { isEventEligible } from '@/engine/eventPicker';
import { NOBLE_EVENTS } from '@/content/nobleEvents';
import { makeState as makeBaseState } from './helpers';
import { Difficulty, GameState } from '@/types/game';

function makeState(overrides: Partial<GameState> = {}, difficulty: Difficulty = 'Normal'): GameState {
  return makeBaseState({ lifetimeUnlocked: true, ...overrides }, difficulty);
}

describe('holding management', () => {
  it('shows Prosperity as the weakest core Holding resource', () => {
    const s = makeState({
      holding: { stores: 82, security: 67, loyalty: 91, population: 18, upgrades: [], lastActionAge: null, criticalYears: 0 },
    });
    expect(holdingProsperity(s)).toBe(67);
  });

  it('unlocks at age 6 and permits only one action per age', () => {
    const young = makeState({ age: 5 });
    expect(holdingActionAvailability(young, 'work_land').available).toBe(false);

    const s = makeState({ age: 6, stats: { health: 60, charm: 50, wits: 50, faith: 50 } });
    manageHolding(s, 'work_land');
    expect(s.holding.stores).toBe(82);
    expect(s.stats.health).toBe(56);
    expect(s.holding.lastActionAge).toBe(6);
    const afterFirst = s.holding.stores;
    manageHolding(s, 'work_land');
    expect(s.holding.stores).toBe(afterFirst);
  });

  it('default Maintain exactly covers base Stores and Security upkeep', () => {
    const s = makeState({ age: 7 });
    tickHoldingYear(s);
    expect(s.holding.stores).toBe(60);
    expect(s.holding.security).toBe(60);
    expect(s.holding.loyalty).toBe(60);
  });

  it('applies upkeep after a deliberate outgoing-year action', () => {
    const s = makeState({ age: 6 });
    manageHolding(s, 'work_land');
    s.age = 7;
    tickHoldingYear(s);
    expect(s.holding.stores).toBe(74);
    expect(s.holding.security).toBe(54);
  });

  it('buys upgrades outside the annual action and applies their modifiers', () => {
    const s = makeState({ age: 20, gold: 100 });
    buyHoldingUpgrade(s, 'fenced_field');
    expect(s.gold).toBe(82);
    expect(s.holding.lastActionAge).toBeNull();
    manageHolding(s, 'work_land');
    expect(s.holding.stores).toBe(87);
    const goldAfterFirst = s.gold;
    buyHoldingUpgrade(s, 'fenced_field');
    expect(s.gold).toBe(goldAfterFirst);
  });

  it('applies the Stable, preservation, Watchtower, and Steward modifiers', () => {
    const stable = makeState({ age: 20, rankIdx: 1, holding: { stores: 60, security: 60, loyalty: 60, upgrades: ['stable'], lastActionAge: null, criticalYears: 0 } });
    manageHolding(stable, 'secure_bounds');
    expect(stable.stats.health).toBe(60);
    expect(stable.holding.security).toBe(84);

    const preserved = makeState({
      age: 7,
      rankIdx: 4,
      lifetimeUnlocked: true,
      holding: { stores: 60, security: 60, loyalty: 60, upgrades: ['smokehouse', 'granary', 'watchtower', 'stewards_hall'], lastActionAge: null, criticalYears: 0 },
    });
    tickHoldingYear(preserved);
    expect(preserved.holding).toMatchObject({ stores: 64, security: 62, loyalty: 63 });

    preserved.age = 8;
    preserved.holding.lastActionAge = null;
    preserved.holding.loyalty = 60;
    manageHolding(preserved, 'collect_dues');
    expect(preserved.holding.loyalty).toBe(50);
  });

  it('applies both Royal Road modifiers', () => {
    const trade = makeState({
      age: 50,
      rankIdx: 5,
      lifetimeUnlocked: true,
      gold: 100,
      holding: { stores: 60, security: 60, loyalty: 60, upgrades: ['royal_road'], lastActionAge: null, criticalYears: 0 },
    });
    manageHolding(trade, 'sell_surplus');
    expect(trade.gold).toBe(140);

    trade.age = 51;
    trade.holding.lastActionAge = null;
    manageHolding(trade, 'royal_progress');
    expect(trade.holding.stores).toBe(37); // 42 after trade, then 5 for the progress
  });

  it('keeps core Holding management free while high-rank orders stay premium', () => {
    const locked = makeState({ age: 20, rankIdx: 0, lifetimeUnlocked: false });
    expect(holdingActionAvailability(locked, 'work_land').available).toBe(true);
    locked.age = 21;
    tickHoldingYear(locked);
    expect(locked.holding.stores).toBe(60);
    locked.rankIdx = 4;
    expect(holdingActionAvailability(locked, 'muster_levy').available).toBe(false);
  });

  it('makes an owned upgrade dormant after demotion and active after promotion', () => {
    const s = makeState({ age: 20, rankIdx: 1, gold: 100 });
    buyHoldingUpgrade(s, 'stable');
    expect(isHoldingUpgradeActive(s, 'stable')).toBe(true);
    s.rankIdx = 0;
    expect(isHoldingUpgradeActive(s, 'stable')).toBe(false);
    s.rankIdx = 1;
    expect(isHoldingUpgradeActive(s, 'stable')).toBe(true);
  });

  it('warns on a first critical Stores year, then opens a harvest decision without duplicate famine damage', () => {
    const s = makeState({
      age: 7,
      holding: { stores: 10, security: 50, loyalty: 50, upgrades: [], lastActionAge: 6, criticalYears: 0 },
    });
    tickHoldingYear(s);
    expect(s.holding.criticalYears).toBe(1);
    expect(s.stats.health).toBe(52);
    s.age = 8;
    s.holding.lastActionAge = 7;
    tickHoldingYear(s);
    expect(s.holding.criticalYears).toBe(0);
    expect(s.holding.stores).toBe(20);
    expect(s.rpg.mission).toMatchObject({ kind: 'holding', skill: 'husbandry' });
    expect(s.stats.health).toBe(52);
  });

  it('destroys an active upgrade during a severe Security crisis', () => {
    const s = makeState({
      age: 7,
      holding: { stores: 50, security: 10, loyalty: 50, upgrades: ['fenced_field'], lastActionAge: 6, criticalYears: 1 },
    });
    tickHoldingYear(s);
    expect(s.holding.security).toBe(25);
    expect(s.holding.upgrades).not.toContain('fenced_field');
  });

  it('demotes a ranked ruler during revolt and imprisons a Peasant', () => {
    const ranked = makeState({
      age: 7,
      rankIdx: 2,
      gold: 100,
      holding: { stores: 50, security: 50, loyalty: 10, upgrades: [], lastActionAge: 6, criticalYears: 1 },
    });
    tickHoldingYear(ranked);
    expect(ranked.rankIdx).toBe(1);
    expect(ranked.gold).toBe(75);
    expect(ranked.holding.loyalty).toBe(25);

    const peasant = makeState({
      age: 7,
      rankIdx: 0,
      holding: { stores: 50, security: 50, loyalty: 10, upgrades: [], lastActionAge: 6, criticalYears: 1 },
    });
    tickHoldingYear(peasant);
    expect(peasant.tags).toContain('imprisoned');
    expect(peasant.rankIdx).toBe(0);
  });

  it('gives a flourishing bonus and Watermill bonus', () => {
    const s = makeState({
      age: 7,
      rankIdx: 3,
      gold: 100,
      holding: { stores: 90, security: 90, loyalty: 90, upgrades: ['watermill'], lastActionAge: 6, criticalYears: 0 },
    });
    tickHoldingYear(s);
    expect(s.gold).toBe(119); // Base, rank, population, and Watermill rewards.
    expect(s.reputation).toBe(2);
    expect(s.holding.population).toBe(20);
  });

  it('treats the visible 75 resource target as a flourishing year', () => {
    const s = makeState({
      age: 7,
      rankIdx: 0,
      gold: 100,
      holding: { stores: 75, security: 75, loyalty: 75, population: 18, upgrades: [], lastActionAge: 6, criticalYears: 0 },
    });
    tickHoldingYear(s);
    expect(s.gold).toBe(105);
    expect(s.reputation).toBe(2);
    expect(s.holding.population).toBe(20);
  });
});

describe('holding succession and persistence', () => {
  it('inherits rank, upgrades, and 75% of resources', () => {
    const parent = makeState({
      rankIdx: 3,
      gold: 80,
      reputation: 40,
      holding: { stores: 80, security: 60, loyalty: 40, upgrades: ['fenced_field', 'watermill'], lastActionAge: 40, criticalYears: 1 },
    });
    const child = spawnKin(parent, { kind: 'child', age: 0, isHeir: true });
    child.gold = 8;
    const heir = gameReducer(parent, { type: 'CONTINUE_AS_HEIR', heirId: child.id });
    expect(heir.rankIdx).toBe(3);
    expect(heir.gold).toBe(48);
    expect(heir.reputation).toBe(20);
    expect(heir.holding).toEqual({
      stores: 60,
      security: 45,
      loyalty: 30,
      population: 13,
      upgrades: ['fenced_field', 'watermill'],
      lastActionAge: null,
      criticalYears: 0,
    });
  });

  it('starts an unrelated New Life with a fresh Peasant Holding', () => {
    const old = makeState({
      rankIdx: 3,
      holding: { stores: 90, security: 90, loyalty: 90, upgrades: ['watermill'], lastActionAge: 40, criticalYears: 1 },
    });
    const fresh = gameReducer(old, { type: 'NEW_LIFE' });
    expect(fresh.rankIdx).toBe(0);
    expect(fresh.holding.stores).toBe(60);
    expect(fresh.holding.upgrades).toEqual([]);
  });

  it('normalizes a pre-Holding save without changing its existing fields', () => {
    const old = makeState({ age: 33, gold: 77 });
    delete (old as Partial<typeof old>).holding;
    const migrated = normalizeGameState(old);
    expect(migrated.age).toBe(33);
    expect(migrated.gold).toBe(77);
    expect(migrated.holding).toEqual({
      stores: 60,
      security: 60,
      loyalty: 60,
      population: 18,
      upgrades: [],
      lastActionAge: null,
      criticalYears: 0,
    });
  });

  it('keeps adult noble events age-gated for an inherited noble child', () => {
    const child = makeState({ age: 8, rankIdx: 3 });
    for (const event of NOBLE_EVENTS) expect(isEventEligible(child, event)).toBe(false);
  });
});
