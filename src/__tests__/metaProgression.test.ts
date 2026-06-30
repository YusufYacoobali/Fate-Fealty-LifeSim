import { evaluateAchievements, recordLifeEnd } from '@/engine/metaProgression';
import { DEFAULT_META, DYNASTY_CAP, DynastyRecord } from '@/state/appMeta';
import { ACHIEVEMENTS } from '@/data/achievements';
import { makeState } from './helpers';

const baseMeta = () => ({ ...DEFAULT_META, stats: { ...DEFAULT_META.stats }, achievements: [], dynasty: [] });

describe('evaluateAchievements', () => {
  it('unlocks rank achievements when the rank is reached', () => {
    const s = makeState({ rankIdx: 2 });
    const { newly } = evaluateAchievements(baseMeta(), s, false);
    expect(newly).toContain('squired');
    expect(newly).toContain('knighted');
    expect(newly).not.toContain('ennobled');
  });

  it('only unlocks the death achievement at death', () => {
    const s = makeState({ age: 25 });
    expect(evaluateAchievements(baseMeta(), s, false).newly).not.toContain('the_reaper');
    expect(evaluateAchievements(baseMeta(), s, true).newly).toContain('the_reaper');
  });

  it('does not re-award an already-unlocked achievement', () => {
    const meta = { ...baseMeta(), achievements: ['coming_of_age'] };
    const s = makeState({ age: 30 });
    const { newly, unlocked } = evaluateAchievements(meta, s, false);
    expect(newly).not.toContain('coming_of_age');
    expect(unlocked).toContain('coming_of_age');
  });

  it('respects lifetime-stat thresholds (livesLived)', () => {
    const meta = { ...baseMeta(), stats: { ...DEFAULT_META.stats, livesLived: 4 } };
    const s = makeState();
    expect(evaluateAchievements(meta, s, false).newly).toContain('reincarnated');
  });

  it('every achievement id is unique', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('recordLifeEnd', () => {
  it('increments lives lived and updates the maxima', () => {
    const s = makeState({ age: 55, rankIdx: 2, gold: 120 });
    s.income = 200;
    s.deathCause = 'a bad oyster';
    const m = recordLifeEnd(baseMeta(), s);
    expect(m.stats.livesLived).toBe(1);
    expect(m.stats.oldestAge).toBe(55);
    expect(m.stats.highestRankIdx).toBe(2);
    expect(m.stats.mostGold).toBe(120);
    expect(m.stats.totalGoldEarned).toBe(200);
    expect(m.stats.bestLegacy).toBeGreaterThan(0);
  });

  it('prepends a dynasty record and caps the hall of legends', () => {
    const old: DynastyRecord[] = Array.from({ length: DYNASTY_CAP }, (_, i) => ({
      lifeNo: i,
      name: `Old ${i}`,
      rank: 'Peasant',
      age: 40,
      cause: 'turnips',
      legacy: 1,
      bornYear: 1300,
    }));
    const meta = { ...baseMeta(), dynasty: old };
    const s = makeState({ age: 60 });
    s.deathCause = 'glory';
    const m = recordLifeEnd(meta, s);
    expect(m.dynasty.length).toBe(DYNASTY_CAP);
    expect(m.dynasty[0].cause).toBe('glory'); // newest first
  });

  it('keeps maxima when a worse life is recorded', () => {
    const meta = { ...baseMeta(), stats: { ...DEFAULT_META.stats, oldestAge: 80, mostGold: 500 } };
    const s = makeState({ age: 20, gold: 5 });
    const m = recordLifeEnd(meta, s);
    expect(m.stats.oldestAge).toBe(80);
    expect(m.stats.mostGold).toBe(500);
  });
});
