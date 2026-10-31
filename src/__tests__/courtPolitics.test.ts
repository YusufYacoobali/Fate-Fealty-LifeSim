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

test('alliances require a new, distinct, documented household and charge only a successful agreement', () => {
  let s = applicant(81);
  const p = s.world.characters[s.playerCharacterId];
  const { courtCandidatesFor } = require('@/engine/courtPolitics');
  const { performCourtAction } = require('@/engine/courtEngine');
  const own = s.world.families[p.birthFamilyId!];
  const target = Object.values(s.world.characters).find(c => c.alive && c.age >= 18 && c.birthFamilyId && c.birthFamilyId !== own.id && s.world.families[c.birthFamilyId])!;
  const other = s.world.families[target.birthFamilyId!];
  own.allyFamilyIds = []; other.allyFamilyIds = [];
  const invalid = (reason: RegExp) => {
    const before = JSON.stringify(s);
    expect(courtAvailability(s,'alliance',target.id)).toMatch(reason);
    expect(courtCandidatesFor(s,'alliance').some((c: { id: string }) => c.id === target.id)).toBe(false);
    expect(JSON.stringify(performCourtAction(s,'alliance',target.id))).toBe(before);
    expect(JSON.stringify(gameReducer(s,{ type: 'COURT', action: 'alliance', targetId: target.id }))).toBe(before);
  };
  const familyId = target.birthFamilyId;
  target.birthFamilyId = own.id; invalid(/own family/);
  target.birthFamilyId = undefined; invalid(/recognised family/);
  target.birthFamilyId = familyId; target.age = 17; invalid(/adult/); target.age = 30;
  own.allyFamilyIds = [other.id]; invalid(/already allied/);
  own.allyFamilyIds = []; other.allyFamilyIds = [own.id]; invalid(/already allied/);
  other.allyFamilyIds = [];
  const influence = p.factionInfluence!, used = s.actionClock.used;
  expect(courtCandidatesFor(s,'alliance').some((c: { id: string }) => c.id === target.id)).toBe(true);
  s = gameReducer(s,{ type: 'COURT', action: 'alliance', targetId: target.id });
  expect(s.world.characters[s.playerCharacterId].factionInfluence).toBe(influence + 6);
  expect(s.world.families[own.id].allyFamilyIds).toEqual([other.id]);
  expect(s.world.families[other.id].allyFamilyIds).toEqual([own.id]);
  expect(s.actionClock.used).toBe(used + 1);
  s.world.currentYear++; s.actionClock.used = 0;
  invalid(/already allied/);
});

function crisisMonarch(seed = 82) {
  const s = monarch(seed), c = s.world.court!;
  // Keep annual councillor rolls out of the crisis response contract.
  for (const id of Object.values(c.offices)) {
    s.world.characters[id!].personalityTraits = []; s.world.characters[id!].stats.wits = 50;
  }
  c.legitimacy = 0; s.world.conditions.publicOrder = 0; s.world.currentYear++;
  runWithWorldRng(s.world,() => tickCourt(s));
  return s;
}
test('critical annual updates preserve the ruler until an actual saved opposition response', () => {
  let s = crisisMonarch();
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId);
  expect(s.world.court!.crisis?.responseYear).toBeUndefined();
  const crisis = s.world.court!.crisis!;
  const q = s.world.court!.coalitions!.find(q => q.leaderId === crisis.leaderId)!;
  q.lastAudienceYear = s.world.currentYear; // Ordinary cooldown cannot hide a crisis.
  expect(dueCourtEvent(s)).toBe('court_opposition_audience');
  const { directYear } = require('@/engine/director');
  expect(directYear(s).event?.id).toBe('court_opposition_audience');
  expect(crisis.responseYear).toBeUndefined(); // Scheduling is not a response.
  s.pendingEvent = { eventId: 'court_opposition_audience' };
  syncPlayerToWorld(s);
  const rng = s.world.rngState;
  s = normalizeGameState(JSON.parse(JSON.stringify(s)));
  expect(s.world.rngState).toEqual(rng); expect(s.world.court!.crisis).toEqual(crisis);
  s.world.currentYear++;
  runWithWorldRng(s.world,() => tickCourt(s));
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId);
  expect(s.world.court!.crisis?.responseYear).toBeUndefined();
  s = choose(s,2);
  expect(s.world.court!.crisis?.responseYear).toBe(s.world.currentYear);
  syncPlayerToWorld(s); s = normalizeGameState(JSON.parse(JSON.stringify(s)));
  expect(s.world.court!.crisis?.responseYear).toBe(s.world.currentYear);
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId);
  runWithWorldRng(s.world,() => tickCourt(s));
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId);
  s.world.currentYear++;
  runWithWorldRng(s.world,() => tickCourt(s));
  expect(s.world.court!.rulerId).not.toBe(s.playerCharacterId);
  expect(s.world.characters[s.playerCharacterId].legalState!.status).toBe('exiled');
  expect(s.world.court!.crisis).toBeUndefined();
});
test('a crisis settlement can prevent deposition and recovery clears the answered crisis', () => {
  let s = crisisMonarch(83);
  s.pendingEvent = { eventId: 'court_opposition_audience' }; s = choose(s,0);
  expect(s.world.court!.coalitions![0].strength).toBe(30);
  s.world.currentYear++; runWithWorldRng(s.world,() => tickCourt(s));
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId); expect(s.world.court!.crisis).toBeUndefined();
  s = crisisMonarch(84);
  s.pendingEvent = { eventId: 'court_opposition_audience' }; s = choose(s,2);
  s.world.court!.legitimacy = 65;
  s.world.currentYear++; runWithWorldRng(s.world,() => tickCourt(s));
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId); expect(s.world.court!.crisis).toBeUndefined();
});
test('an unaffordable settlement cannot count as answering; ordinary audiences do not pre-answer a later crisis', () => {
  let s = monarch(85), c = s.world.court!;
  addCourtOpposition(s, c.offices.chancellor!, 50);
  s.pendingEvent = { eventId: 'court_opposition_audience' }; s = choose(s,1);
  c = s.world.court!; c.legitimacy = 0; s.world.conditions.publicOrder = 0;
  s.world.currentYear++; runWithWorldRng(s.world,() => tickCourt(s));
  expect(c.rulerId).toBe(s.playerCharacterId); expect(dueCourtEvent(s)).toBe('court_opposition_audience');
  c.treasury = 0;
  s.pendingEvent = { eventId: 'court_opposition_audience' };
  const result = choose(s,0);
  expect(result.world.court).toEqual(c);
  expect(result.pendingEvent?.eventId).toBe('court_opposition_audience');
  expect(result.world.court!.crisis?.responseYear).toBeUndefined();
});
test('a change of monarch invalidates a previous ruler’s crisis and NPC coups still occur', () => {
  const s = crisisMonarch(86), c = s.world.court!;
  const { addRoyalClaim, recogniseRuler } = require('@/engine/royalSuccessionEngine');
  const next = c.crisis!.challengerId;
  addRoyalClaim(s,next,c.rulerId,'takeover',60); recogniseRuler(s,next,'a recorded abdication');
  expect(c.crisis).toBeUndefined();
  c.legitimacy = 0; s.world.conditions.publicOrder = 0;
  s.world.currentYear++; runWithWorldRng(s.world,() => tickCourt(s));
  expect(c.rulerId).not.toBe(next); expect(c.crisis).toBeUndefined();
});


test('a trial can delay the crisis audience without allowing an unanswered annual deposition', () => {
  const s = crisisMonarch(87), legal = s.world.characters[s.playerCharacterId].legalState!;
  const { directYear } = require('@/engine/director');
  legal.suspicion = 50;
  legal.charges.push({ id: 'crisis_trial', offence: 'fraud', severity: 30, evidence: 40, victimIds: [], witnessIds: [], year: s.world.currentYear, resolved: false });
  expect(directYear(s).event?.id).toBe('system_legal_trial');
  s.world.currentYear++; runWithWorldRng(s.world,() => tickCourt(s));
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId);
  expect(s.world.court!.crisis?.responseYear).toBeUndefined();
  legal.charges[legal.charges.length - 1].resolved = true;
  expect(directYear(s).event?.id).toBe('court_opposition_audience');
});
