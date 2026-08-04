import {
  canPromote,
  demote,
  dominantPath,
  promote,
  standingContributions,
  tickProgression,
  yearlyStandingDelta,
} from '@/engine/pathProgression';
import { makeState } from './helpers';

describe('pathProgression', () => {
  it('dominantPath returns the highest hidden path', () => {
    const s = makeState();
    s.paths = { martial: 5, court: 12, church: 0, labour: 3, outlaw: 1 };
    expect(dominantPath(s)).toBe('court');
  });

  it('canPromote respects age, progress and stat gates', () => {
    const s = makeState({ age: 11, rankProgress: 100, stats: { health: 60, charm: 50, wits: 50, faith: 50 } });
    // Squire needs age>=12 and wits>=48 and progress>=100.
    expect(canPromote(s)).toBe(false); // too young
    s.age = 12;
    expect(canPromote(s)).toBe(true);
    s.stats.wits = 40;
    expect(canPromote(s)).toBe(false); // wits too low
  });

  it('promote advances rank and resets progress; demote reverses', () => {
    const s = makeState({ age: 14, rankProgress: 100, stats: { health: 60, charm: 50, wits: 50, faith: 50 } });
    expect(promote(s)).toBe(true);
    expect(s.rankIdx).toBe(1);
    expect(s.rankProgress).toBe(0);
    expect(demote(s)).toBe(true);
    expect(s.rankIdx).toBe(0);
  });

  it('promote(force) ignores requirements', () => {
    const s = makeState({ age: 0, rankProgress: 0 });
    expect(promote(s, true)).toBe(true);
    expect(s.rankIdx).toBe(1);
  });

  it('locks Baron promotion behind the Lifetime Pass', () => {
    const ready = {
      age: 38,
      gold: 260,
      rankIdx: 3,
      rankProgress: 100,
      stats: { health: 80, charm: 84, wits: 76, faith: 80 },
    };
    expect(canPromote(makeState({ ...ready, lifetimeUnlocked: false }))).toBe(false);
    expect(canPromote(makeState({ ...ready, lifetimeUnlocked: true }))).toBe(true);
  });

  it('tickProgression nudges progress toward promotion for martial lives', () => {
    const s = makeState();
    s.paths = { martial: 20, court: 0, church: 0, labour: 0, outlaw: 0 };
    const before = s.rankProgress;
    tickProgression(s);
    expect(s.rankProgress).toBeGreaterThan(before);
  });

  it('tickProgression decays progress for outlaws', () => {
    const s = makeState({ rankProgress: 30 });
    s.paths = { martial: 0, court: 0, church: 0, labour: 0, outlaw: 20 };
    tickProgression(s);
    expect(s.rankProgress).toBeLessThan(30);
  });

  it('never drives progress below zero', () => {
    const s = makeState({ rankProgress: 1, reputation: -80 });
    s.paths = { martial: 0, court: 0, church: 0, labour: 0, outlaw: 20 };
    tickProgression(s);
    expect(s.rankProgress).toBe(0);
  });
});

describe('pathProgression standing', () => {
  function labelsOf(s: ReturnType<typeof makeState>): string[] {
    return standingContributions(s).map((item) => item.label);
  }

  it('climbs without any martial life at all', () => {
    const churchly = makeState({ reputation: 65, gold: 250, stats: { health: 60, charm: 50, wits: 50, faith: 85 } });
    churchly.paths = { martial: 0, court: 0, church: 20, labour: 0, outlaw: 0 };

    expect(yearlyStandingDelta(churchly)).toBeGreaterThan(0);
    expect(labelsOf(churchly)).toEqual(expect.arrayContaining(['a life in the Church', 'conspicuous wealth']));
  });

  it('charges every year against thee, so standing must be maintained', () => {
    const idle = makeState();
    // A drifting labourer with nothing to show earns nothing and loses ground.
    idle.paths = { martial: 0, court: 0, church: 0, labour: 1, outlaw: 0 };
    idle.holding = { ...idle.holding, stores: 10, security: 10, loyalty: 10 };

    expect(yearlyStandingDelta(idle)).toBeLessThan(0);
  });

  it('counts a flourishing holding and powerful friends', () => {
    const lord = makeState();
    lord.holding = { ...lord.holding, stores: 80, security: 80, loyalty: 80 };
    lord.world.factions.crown.playerStanding = 25;

    expect(labelsOf(lord)).toEqual(expect.arrayContaining(['a flourishing holding', 'powerful friends']));
  });

  it('counts debt, notoriety and imprisonment against thee', () => {
    const wretch = makeState();
    wretch.debts = [{ id: 'd1', principal: 80, interestRate: 0.2 }];
    wretch.tags = [...wretch.tags, 'imprisoned'];
    const legal = wretch.world.characters[wretch.playerCharacterId].legalState;
    if (legal) legal.notoriety = 45;

    expect(labelsOf(wretch)).toEqual(
      expect.arrayContaining(['debts everyone has heard about', 'imprisonment', 'a name known to the law']),
    );
    expect(yearlyStandingDelta(wretch)).toBeLessThan(-8);
  });
});
