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

it('relative guardians are actual aunts or uncles in the family tree, with reciprocal genealogy and romance protection', () => {
  const { kinshipTo } = require('@/engine/kinship');
  const { courtshipUnavailableReason } = require('@/engine/relationshipEngine');
  const { worldIntegrityIssues } = require('@/engine/worldIntegrity');
  const { normalizeGameState } = require('@/state/persistence');
  let checked = 0;
  for (let seed = 1; seed <= 250; seed++) {
    const s = createLife({ worldSeed: seed,birthOrigin: 'peasant' });
    const p = s.world.characters[s.playerCharacterId];
    if (p.background!.circumstance !== 'relative_guardians') continue;
    const relativeId = p.guardianIds!.find(id => !p.parentIds!.includes(id))!, relative = s.world.characters[relativeId];
    const parent = p.parentIds!.map(id => s.world.characters[id]).find(c => c.alive)!;
    const grandparentId = relative.parentIds!.find(id => parent.parentIds!.includes(id))!;
    expect(s.world.characters[grandparentId].childIds).toEqual(expect.arrayContaining([relative.id,parent.id]));
    const grandparent = s.world.characters[grandparentId], bornYear = (grandparent.deathYear ?? s.world.currentYear) - grandparent.age;
    for (const child of [parent,relative]) { const ageAtBirth = s.world.currentYear - child.age - bornYear; expect(ageAtBirth).toBeGreaterThanOrEqual(16); expect(ageAtBirth).toBeLessThanOrEqual(45); }
    expect(relative.birthFamilyId).toBe(parent.birthFamilyId); expect(relative.householdId).toBe(p.householdId);
    expect(kinshipTo(s,relativeId)).toMatch(/aunt|uncle/);
    s.age = 20; expect(courtshipUnavailableReason(s,relative)).toMatch(/close relative/);
    expect(worldIntegrityIssues(s)).toEqual([]);
    const loaded = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(kinshipTo(loaded,relativeId)).toBe(kinshipTo(s,relativeId));
    expect(loaded.world.rngState).toEqual(s.world.rngState);
    checked++;
  }
  expect(checked).toBeGreaterThan(0);
});
it('early childhood narration never has a deceased guardian perform present-day care', () => {
  const { eventById } = require('@/engine/eventPicker');
  const s = createLife({ worldSeed: 301,birthOrigin: 'peasant' }); s.age = 2;
  s.world.characters.mother.name = 'Deceased Mother'; s.world.characters.mother.alive = false;
  s.world.characters.father.name = 'Deceased Father'; s.world.characters.father.alive = false;
  s.world.characters[s.playerCharacterId].guardianIds = ['mother','father'];
  const event = eventById('household_first_words')!;
  expect(event.text(s)).not.toMatch(/Deceased Mother|Deceased Father/);
});
