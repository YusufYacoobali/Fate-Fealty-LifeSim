import { canPromote, demote, dominantPath, promote, tickProgression } from '@/engine/pathProgression';
import { makeState } from './helpers';

describe('pathProgression', () => {
  it('dominantPath returns the highest hidden path', () => {
    const s = makeState();
    s.paths = { martial: 5, court: 12, church: 0, labour: 3, outlaw: 1 };
    expect(dominantPath(s)).toBe('court');
  });

  it('canPromote respects age, progress and stat gates', () => {
    const s = makeState({ age: 10, rankProgress: 100, stats: { health: 60, charm: 50, wits: 50, faith: 50 } });
    // Squire needs age>=12 and wits>=40 and progress>=100.
    expect(canPromote(s)).toBe(false); // too young
    s.age = 13;
    expect(canPromote(s)).toBe(true);
    s.stats.wits = 30;
    expect(canPromote(s)).toBe(false); // wits too low
  });

  it('promote advances rank and resets progress; demote reverses', () => {
    const s = makeState({ age: 13, rankProgress: 100, stats: { health: 60, charm: 50, wits: 50, faith: 50 } });
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
});
