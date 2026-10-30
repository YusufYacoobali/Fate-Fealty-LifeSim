import { createLife, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { eventById } from '@/engine/eventPicker';
import { courtAvailability, reconcileCourt, tickCourt } from '@/engine/courtEngine';
import { petitionProspects, councilAdvice, addCourtOpposition, dueCourtEvent } from '@/engine/courtPolitics';
import { normalizeGameState } from '@/state/persistence';
import { runWithWorldRng } from '@/engine/random';
import { worldIntegrityIssues } from '@/engine/worldIntegrity';

function applicant(seed: number) {
  const s = createLife({ worldSeed: seed, birthOrigin: 'peasant' }); s.age = 30; s.gold = 100;
  const p = s.world.characters[s.playerCharacterId]; p.factionInfluence = 70;
  p.education!.qualifications = ['court_education']; s.world.factions.crown.playerStanding = 30;
  return s;
}
function choose(s: ReturnType<typeof createLife>, n = 0) { return gameReducer(s, { type: 'CHOOSE',choice: eventById(s.pendingEvent!.eventId)!.choices[n] }); }
test('appointment is a saved, contested decision with successful and rejected outcomes', () => {
  let appointed = 0, retained = 0;
  for (let seed = 1; seed <= 60; seed++) {
    let s = applicant(seed); const holder = s.world.court!.offices.chancellor;
    s = gameReducer(s,{ type: 'COURT',action: 'petition',office: 'chancellor' });
    expect(s.world.court!.offices.chancellor).toBe(holder); expect(s.actionClock.used).toBe(1);
    const rng = s.world.rngState; syncPlayerToWorld(s); s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(s.world.rngState).toEqual(rng); expect(s.pendingEvent?.eventId).toBe('court_office_contest');
    s = choose(s); expect(s.actionClock.used).toBe(1);
    if (s.world.court!.offices.chancellor === s.playerCharacterId) appointed++; else retained++;
    expect(s.world.court!.petition!.resolved).toBe(true); expect(s.rankIdx).toBe(0); expect(worldIntegrityIssues(s)).toEqual([]);
  }
  expect(appointed).toBeGreaterThan(0); expect(retained).toBeGreaterThan(0);
});
test('vacancy and council support improve prospects; conditional service is an actual requirement', () => {
  let s = applicant(3); s = gameReducer(s,{ type: 'COURT',action: 'petition',office: 'chancellor' });
  const occupied = petitionProspects(s,'merit').odds; delete s.world.court!.offices.chancellor;
  expect(petitionProspects(s,'merit').odds).toBeGreaterThan(occupied);
  // Resolve against the original holder to exercise a lawful conditional request.
  s.world.court!.offices.chancellor = s.world.court!.petition!.incumbentId;
  s = choose(s,2); expect(s.world.court!.petition!.outcome).toBe('conditional');
  s.world.currentYear++; s.actionClock.used = 0;
  expect(courtAvailability(s,'petition',undefined,'chancellor')).toMatch(/conditional service/);
});
test('a change of ruler or office during a saved petition cannot overwrite the new appointment', () => {
  let s = applicant(5); s = gameReducer(s,{ type: 'COURT',action: 'petition',office: 'chancellor' });
  s.world.court!.offices.chancellor = 'edwin'; s = choose(s);
  expect(s.world.court!.offices.chancellor).toBe('edwin'); expect(s.world.court!.petition!.outcome).toBe('rejected');
});
function monarch(seed = 1) {
  const s = createLife({ worldSeed: seed,lifetimeUnlocked: true }); s.age = s.world.characters[s.playerCharacterId].age = 30;
  const c = s.world.court!; s.world.characters[c.rulerId].rankIdx = 3;
  c.rulerId = s.playerCharacterId; s.rankIdx = 5; reconcileCourt(s);
  return s;
}
test('councillors give actual contextual advice and ignored grievances build a paced coalition', () => {
  let s = monarch(6); s.world.conditions.foodSecurity = 20;
  const advice = councilAdvice(s,'tax_raise'); expect(advice.some(a => !a.support && a.text.includes('20'))).toBe(true);
  const former = s.world.court!.treasury;
  s = gameReducer(s,{ type: 'COURT',action: 'tax_raise',counsel: 'override' });
  expect(s.world.court!.treasury).toBeLessThanOrEqual(former + 25); expect(s.world.court!.treasury).toBeGreaterThanOrEqual(former + 17);
  expect(s.world.court!.coalitions!.some(q => q.strength >= 12)).toBe(true);
  const q = s.world.court!.coalitions![0]; addCourtOpposition(s,q.leaderId,40);
  expect(dueCourtEvent(s)).toBe('court_opposition_audience');
  s.pendingEvent = { eventId: dueCourtEvent(s)! }; s = choose(s,1);
  expect(dueCourtEvent(s)).toBeUndefined();
  const before = JSON.stringify(s.world.court!.coalitions); runWithWorldRng(s.world,() => tickCourt(s));
  expect(JSON.stringify(s.world.court!.coalitions)).toBe(before);
  s.lifetimeUnlocked = false; s.world.currentYear += 8; expect(dueCourtEvent(s)).toBeUndefined();
});
test('peace can fail or succeed while always charging the agreed embassy cost once', () => {
  let truce = 0, rejected = 0;
  for (let seed = 1; seed <= 35; seed++) {
    let s = monarch(seed); s.world.conditions.warThreat = 80; const funds = s.world.court!.treasury;
    s = gameReducer(s,{ type: 'COURT',action: 'peace' });
    expect(s.world.court!.treasury).toBe(funds - 15);
    if (s.world.conditions.warThreat < 80) truce++; else rejected++;
    expect(gameReducer(s,{ type: 'COURT',action: 'peace' })).toEqual(s);
  }
  expect(truce).toBeGreaterThan(0); expect(rejected).toBeGreaterThan(0);
});
test('councillors react to the advice given before a successful decree, not its improved conditions', () => {
  let s = monarch(21); s.world.court!.treasury = 70;
  expect(councilAdvice(s,'tax_relief').every(a => a.support)).toBe(true);
  s = gameReducer(s,{ type: 'COURT',action: 'tax_relief' });
  expect(s.world.court!.treasury).toBe(50);
  expect(s.world.court!.coalitions ?? []).toEqual([]);
  s = monarch(22); s.world.conditions.warThreat = 40;
  expect(councilAdvice(s,'mobilise').every(a => a.support)).toBe(true);
  s = gameReducer(s,{ type: 'COURT',action: 'mobilise' });
  expect(s.world.conditions.warThreat).toBeLessThan(40);
  expect(s.world.court!.coalitions ?? []).toEqual([]);
});
