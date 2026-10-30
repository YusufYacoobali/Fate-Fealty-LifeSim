import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { eventById } from '@/engine/eventPicker';
import { practiceProspects, resolveProfessionalPractice, professionalRecord } from '@/engine/careerSpecializationEngine';
import { normalizeGameState } from '@/state/persistence';

function choose(s: ReturnType<typeof createLife>, n = 0) {
  return gameReducer(s, { type: 'CHOOSE', choice: eventById(s.pendingEvent!.eventId)!.choices[n] });
}
test('healthy consultations never invent illness or consume another action on resolution', () => {
  for (let seed = 1; seed < 30; seed++) {
    let s = createLife({ worldSeed: seed }); s.age = 30; s.gold = 100; s.occupation.careerId = 'herb_gatherer';
    Object.values(s.world.characters).forEach(c => { c.stats.health = 90; c.healthConditions = []; });
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'diagnose_patient' });
    const m = professionalRecord(s.world.characters[s.playerCharacterId], 'medicine').matters[0];
    const used = s.actionClock.used, health = s.world.characters[m.actorId].stats.health;
    s = choose(s);
    expect(s.actionClock.used).toBe(used); expect(s.world.characters[m.actorId].stats.health).toBe(health);
    expect(s.world.characters[m.actorId].healthConditions).toEqual([]);
    const saved = JSON.stringify(s); resolveProfessionalPractice(s, 'diagnose_patient', 0); expect(JSON.stringify(s)).toBe(saved);
  }
});
test('diagnosis selects actual illness and medical outcomes can recover or cause a complaint', () => {
  let recovered = 0, failed = 0;
  for (let seed = 1; seed <= 60; seed++) {
    let s = createLife({ worldSeed: seed }); s.age = 30; s.gold = 100; s.occupation.careerId = 'herb_gatherer';
    const target = s.world.characters.edwin; target.stats.health = 35;
    target.healthConditions = [{ id: 'actual_fever', conditionId: 'winter_fever', severity: 40, kind: 'illness', diagnosed: true, startedYear: s.world.currentYear, nextReviewYear: s.world.currentYear + 1 }];
    Object.values(s.world.characters).filter(c => c.id !== target.id).forEach(c => { c.stats.health = 95; c.healthConditions = []; });
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'treat_household' });
    const m = professionalRecord(s.world.characters[s.playerCharacterId], 'medicine').matters[0]; expect(m.actorId).toBe(target.id);
    s = normalizeGameState(JSON.parse(JSON.stringify(s))); s = choose(s, 1);
    if (s.world.characters[target.id].stats.health > 35) recovered++; else { failed++; expect(s.world.characters[s.playerCharacterId].legalState!.charges.some(c => c.offence === 'harmful treatment')).toBe(true); }
  }
  expect(recovered).toBeGreaterThan(0); expect(failed).toBeGreaterThan(0);
});
test('lawyers prepare evidence without pardoning genuine charges or ending a sentence', () => {
  let successes = 0;
  for (let seed = 1; seed <= 25; seed++) {
    let s = createLife({ worldSeed: seed }); s.age = 30; s.gold = 100; s.occupation.careerId = 'copyist';
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'defend_client' });
    const m = professionalRecord(s.world.characters[s.playerCharacterId], 'law').matters[0];
    const target = s.world.characters[m.actorId]; target.legalState!.status = 'imprisoned'; target.legalState!.sentenceYearsRemaining = 3;
    target.legalState!.charges.push({ id: 'genuine', offence: 'theft', severity: 30, evidence: 60, victimIds: [], witnessIds: [], year: s.world.currentYear, resolved: false });
    s = choose(s);
    const legal = s.world.characters[target.id].legalState!;
    expect(legal.status).toBe('imprisoned'); expect(legal.sentenceYearsRemaining).toBe(3); expect(legal.charges[0].resolved).toBe(false);
    if (legal.charges[0].evidence < 60) successes++;
  }
  expect(successes).toBeGreaterThan(0);
});
test('skill, qualifications, experience and contact competence change the prospects', () => {
  const s = createLife({ worldSeed: 3 }); s.age = 30; s.occupation.careerId = 'herb_gatherer';
  const client = s.world.characters.edwin;
  const first = practiceProspects(s, 'treat_household', 0, client).odds;
  s.occupation.experience = 150; s.world.characters[s.playerCharacterId].skills!.scholarship.level = 5;
  s.world.characters[s.playerCharacterId].education!.qualifications.push('clerical_learning');
  expect(practiceProspects(s, 'treat_household', 0, client).odds).toBeGreaterThan(first);
  client.stats.wits = 10; const weak = practiceProspects(s, 'treat_household', 2, client).odds;
  client.stats.wits = 90; expect(practiceProspects(s, 'treat_household', 2, client).odds).toBeGreaterThanOrEqual(weak);
});
test('rivals act infrequently, expose recorded misconduct and retain a named memory', () => {
  const { tickProfessionalStanding } = require('@/engine/careerSpecializationEngine');
  const { runWithWorldRng } = require('@/engine/random');
  const s = createLife({ worldSeed: 71,birthOrigin: 'merchant' }); s.age = 30;
  const record = professionalRecord(s.world.characters[s.playerCharacterId],'trade');
  record.rivalId = 'beatrice'; record.contactIds = ['edwin']; record.reputation = 60; record.milestones = ['commercial_legacy_ruthless'];
  s.world.characters.beatrice.rel = 20;
  let moves = 0;
  for (let year = 0; year < 50; year++) {
    s.world.currentYear++; record.lastWorkedYear = s.world.currentYear;
    const last = record.rivalryYear;
    runWithWorldRng(s.world,() => tickProfessionalStanding(s));
    if (last !== record.rivalryYear) { moves++; if (last) expect(record.rivalryYear! - last).toBeGreaterThanOrEqual(3); }
  }
  expect(moves).toBeGreaterThan(0); expect(moves).toBeLessThan(18);
  expect(s.world.characters.beatrice.worldMemories!.some(m => m.type === 'professional_rivalry')).toBe(true);
  expect(s.world.characters[s.playerCharacterId].legalState!.charges.some(c => c.offence === 'exposed professional misconduct')).toBe(true);
});
