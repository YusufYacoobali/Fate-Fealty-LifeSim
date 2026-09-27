import { chance, pick, resetRandomSource, rnd, runWithWorldRng, seededSource, setRandomSource } from '@/engine/random';
import { createLife } from '@/engine/gameState';
import { ageUp } from '@/engine/lifeDirector';

afterEach(() => resetRandomSource());

describe('random RandomSource injection (DIP)', () => {
  it('a seeded source makes rnd/pick/chance reproducible', () => {
    setRandomSource(seededSource(1234));
    const a = [rnd(0, 100), rnd(0, 100), chance(0.5), pick(['x', 'y', 'z'])];
    setRandomSource(seededSource(1234));
    const b = [rnd(0, 100), rnd(0, 100), chance(0.5), pick(['x', 'y', 'z'])];
    expect(a).toEqual(b);
  });

  it('different seeds generally diverge', () => {
    setRandomSource(seededSource(1));
    const a = Array.from({ length: 10 }, () => rnd(0, 1_000_000));
    setRandomSource(seededSource(2));
    const b = Array.from({ length: 10 }, () => rnd(0, 1_000_000));
    expect(a).not.toEqual(b);
  });

  it('restores the previous source when a world RNG transaction throws', () => {
    setRandomSource(seededSource(777));
    const expected = rnd(0, 1_000_000);
    setRandomSource(seededSource(777));
    const world = createLife({ worldSeed: 12 }).world;
    expect(() => runWithWorldRng(world, () => {
      rnd(0, 10);
      throw new Error('fixture failure');
    })).toThrow('fixture failure');
    expect(rnd(0, 1_000_000)).toBe(expected);
  });

  it('the same seed yields identical whole lives (deterministic simulation)', () => {
    const run = () => {
      setRandomSource(seededSource(99));
      let s = createLife({ settings: { autoScroll: true, difficulty: 'Normal', liveForever: false, haptics: false, soundEffects: false } });
      // Advance a few years without events to keep it choice-free & deterministic.
      for (let i = 0; i < 5 && !s.pendingEvent && !s.dead; i++) ageUp(s);
      return { age: s.age, stats: s.stats, feedLen: s.feed.length };
    };
    expect(run()).toEqual(run());
  });
});
