import { createLife } from '@/engine/gameState';
import { BIRTH_ORIGINS, birthWeights } from '@/data/birthOrigins';
import { chooseBirthOrigin } from '@/engine/birthOriginEngine';
import { initialRngState, runWithPersistedRng } from '@/engine/random';

describe('birth origins', () => {
  it.each(BIRTH_ORIGINS.map(o => [o.id, o.wealth] as const))('%s creates a coherent distinct household', (origin, wealth) => {
    const s = createLife({ birthOrigin: origin, lifetimeUnlocked: true, worldSeed: 77 });
    const p = s.world.characters[s.playerCharacterId];
    expect(p.background?.origin).toBe(origin);
    expect(s.gold).toBeGreaterThan(0);
    expect(s.gold).toBe(p.background!.householdWealth);
    expect(p.parentIds).toEqual(['mother', 'father']);
    for (const id of p.parentIds!) {
      const parent = s.world.characters[id];
      expect(parent.childIds).toContain(p.id);
      expect(parent.householdId).toBe(p.householdId);
      expect(s.feed[0].text).toContain(parent.name);
    }
    expect(s.world.characters[p.background!.contactId!]).toBeDefined();
    expect(s.rankIdx).toBeLessThan(4);
    expect(s.feed[0].text).not.toMatch(/\{(mother|father|player)\}/);
  });
  it('keeps custom royalty gated at the engine boundary', () => {
    for (let seed = 1; seed <= 100; seed++) expect(createLife({ birthOrigin: 'royal', worldSeed: seed }).world.characters.player_1.background?.origin).not.toBe('royal');
  });
  it('uses configurable proportional weights and a 0.5% entitled royal share', () => {
    const weights = birthWeights(true);
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(weights.royal / total).toBeCloseTo(0.005, 8);
    const { value: counts } = runWithPersistedRng(initialRngState(930), () => {
      const counts: Record<string, number> = {};
      for (let i = 0; i < 20000; i++) { const origin = chooseBirthOrigin(false); counts[origin] = (counts[origin] ?? 0) + 1; }
      return counts;
    });
    expect(counts.peasant / 20000).toBeCloseTo(0.45, 1);
    expect(counts.artisan / 20000).toBeCloseTo(0.18, 1);
    expect(counts.royal).toBeUndefined();
    expect(runWithPersistedRng(initialRngState(1), () => chooseBirthOrigin(false, undefined, { peasant: 0, artisan: 0, merchant: 0, church: 0, military: 0, noble: 10 })).value).toBe('noble');
  });
  it('custom selection overrides weights and seeded births replay exactly', () => {
    const opts = { birthOrigin: 'merchant' as const, worldSeed: 23 };
    expect(createLife(opts)).toEqual(createLife(opts));
    expect(createLife(opts).world.characters.player_1.background?.origin).toBe('merchant');
  });
});

it('seeded households vary without losing genealogy, and every origin has three childhood encounters', () => {
  const { ORIGIN_CHILDHOOD_EVENTS } = require('@/content/educationEvents');
  const { worldIntegrityIssues } = require('@/engine/worldIntegrity');
  const seen = new Set<string>();
  const careers = new Set<string>();
  for (const origin of BIRTH_ORIGINS) {
    expect(ORIGIN_CHILDHOOD_EVENTS.filter((e: any) => e.requires?.birthOrigins?.includes(origin.id))).toHaveLength(3);
    for (let seed = 1; seed <= 100; seed++) {
      const s = createLife({ worldSeed: seed, birthOrigin: origin.id, lifetimeUnlocked: true });
      const p = s.world.characters[s.playerCharacterId];
      seen.add(p.background!.circumstance!); careers.add(s.world.characters.mother.occupation.careerId!);
      expect(p.parentIds).toEqual(['mother', 'father']);
      expect(p.guardianIds!.every(id => s.world.characters[id].alive)).toBe(true);
      expect(worldIntegrityIssues(s)).toEqual([]);
      if (origin.id === 'royal') expect(s.world.court!.rulerId).toBe('father');
    }
  }
  expect([...seen]).toEqual(expect.arrayContaining(['struggling_trade', 'thriving_workshop', 'cash_poor_estate', 'disgraced_service', 'divided_palace', 'surviving_parent', 'relative_guardians']));
  expect(careers.size).toBeGreaterThan(8);
});
