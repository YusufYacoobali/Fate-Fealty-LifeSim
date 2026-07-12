import {
  agingMultiplierFromTraits,
  grantAcquiredTraits,
  grantTrait,
  hasTrait,
  rollBonusFromTraits,
  traitsOf,
} from '@/engine/traitEngine';
import { addMemory, createLife } from '@/engine/gameState';
import { meetsCondition } from '@/engine/eventPicker';
import { makeState } from './helpers';

describe('birth traits', () => {
  it('every new life has exactly one birth trait, mirrored as a tag', () => {
    for (let i = 0; i < 20; i++) {
      const s = createLife();
      expect(s.traits.length).toBe(1);
      expect(s.tags).toContain(`trait_${s.traits[0]}`);
      const t = traitsOf(s)[0];
      expect(t.kind).toBe('birth');
    }
  });

  it('a chosen birth trait applies its flat starting-stat shifts', () => {
    // Silver-Tongued grants +12 charm on top of the 25..55 base roll.
    const s = createLife({ birthTraitId: 'silver_tongue' });
    expect(s.traits).toEqual(['silver_tongue']);
    expect(s.tags).toContain('trait_silver_tongue');
    expect(s.stats.charm).toBeGreaterThanOrEqual(37);
    expect(s.stats.charm).toBeLessThanOrEqual(67);
  });
});

describe('passive trait modifiers', () => {
  it('Born Lucky adds a positive roll bonus; Ill-Starred subtracts', () => {
    const lucky = makeState();
    lucky.traits = ['lucky'];
    expect(rollBonusFromTraits(lucky)).toBeCloseTo(0.08);

    const cursed = makeState();
    cursed.traits = ['ill_starred'];
    expect(rollBonusFromTraits(cursed)).toBeLessThan(0);
  });

  it('Sickly raises and Hale lowers the aging multiplier', () => {
    const sickly = makeState();
    sickly.traits = ['sickly'];
    const hale = makeState();
    hale.traits = ['hale'];
    expect(agingMultiplierFromTraits(sickly)).toBeGreaterThan(1);
    expect(agingMultiplierFromTraits(hale)).toBeLessThan(1);
  });
});

describe('acquired traits', () => {
  it('grantTrait is idempotent and adds the mirror tag + feed beat', () => {
    const s = makeState();
    s.traits = [];
    expect(grantTrait(s, 'war_hero')).toBe(true);
    expect(grantTrait(s, 'war_hero')).toBe(false);
    expect(hasTrait(s, 'war_hero')).toBe(true);
    expect(s.tags).toContain('trait_war_hero');
  });

  it('grantAcquiredTraits awards War Hero once the memory exists', () => {
    const s = makeState();
    s.traits = [];
    grantAcquiredTraits(s);
    expect(hasTrait(s, 'war_hero')).toBe(false);
    addMemory(s, 'war_hero', 5);
    grantAcquiredTraits(s);
    expect(hasTrait(s, 'war_hero')).toBe(true);
  });
});

describe('hasTraits condition', () => {
  it('gates events on owned traits', () => {
    const s = makeState();
    s.traits = ['lucky'];
    expect(meetsCondition(s, { hasTraits: ['lucky'] })).toBe(true);
    expect(meetsCondition(s, { hasTraits: ['sickly'] })).toBe(false);
  });
});
