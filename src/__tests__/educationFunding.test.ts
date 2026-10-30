import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { educationHousehold, tuitionDue, sponsorshipEligibility } from '@/engine/educationFunding';
import { recoverEducationActors } from '@/engine/educationEngine';
import { EDUCATION_EVENTS } from '@/content/educationEvents';
import { isEventPlayable } from '@/engine/eventPicker';

test('household support consumes real resources once and covers only the chosen tuition', () => {
  let s = createLife({ worldSeed: 33, birthOrigin: 'artisan' }); s.age = 10;
  const before = educationHousehold(s)!.wealth;
  s = gameReducer(s, { type: 'EDUCATION', action: 'scholarship', funding: 'household', track: 'guild' });
  expect(educationHousehold(s)!.wealth).toBe(before - 12);
  expect(tuitionDue(s, 'guild')).toBe(0); expect(tuitionDue(s, 'noble')).toBe(20);
  const saved = JSON.stringify(s);
  expect(JSON.stringify(gameReducer(s, { type: 'EDUCATION', action: 'scholarship', funding: 'household', track: 'guild' }))).toBe(saved);
  const gold = s.gold;
  s = gameReducer(s, { type: 'EDUCATION', action: 'enrol', track: 'guild' });
  expect(s.gold).toBe(gold);
  expect(tuitionDue(s, 'guild')).toBe(12);
  expect(s.world.characters[s.playerCharacterId].education!.sponsorships![0].status).toBe('spent');
});
test('poor children can seek limited parish support, failures explain a later retry', () => {
  let wins = 0, failures = 0;
  for (let seed = 1; seed <= 40; seed++) {
    let s = createLife({ worldSeed: seed, birthOrigin: 'peasant' }); s.age = 6; s.gold = 0;
    expect(sponsorshipEligibility(s, 'parish_charity', 'parish')).toBeNull();
    s = gameReducer(s, { type: 'EDUCATION', action: 'scholarship', funding: 'parish_charity', track: 'parish' });
    const application = s.world.characters[s.playerCharacterId].education!.applications![0];
    if (application.approved) { wins++; expect(tuitionDue(s, 'parish')).toBe(0); expect(tuitionDue(s, 'cathedral')).toBe(14); }
    else { failures++; expect(application.reason).toMatch(/later year/); expect(sponsorshipEligibility(s, 'parish_charity', 'parish')).toMatch(/later year/); }
  }
  expect(wins).toBeGreaterThan(0); expect(failures).toBeGreaterThan(0);
});
test('adult learning has adult colleagues and events while childhood friendships survive', () => {
  let s = createLife({ worldSeed: 32 }); s.age = 10;
  s = gameReducer(s, { type: 'EDUCATION', action: 'enrol', track: 'household' });
  const e = s.world.characters[s.playerCharacterId].education!, oldPeer = e.classmateIds[0];
  s.age = 30; recoverEducationActors(s);
  expect(e.classmateIds).toContain(oldPeer);
  expect(s.world.characters[e.activeClassmateIds![0]].age).toBeGreaterThanOrEqual(18);
  for (const event of EDUCATION_EVENTS.filter(event => !event.id.includes('_adult_'))) expect(isEventPlayable(s, event)).toBe(false);
  expect(EDUCATION_EVENTS.filter(event => event.id.startsWith('education_adult_'))).toHaveLength(12);
});
test('v6 scholarships, saved names, qualifications and RNG survive additive migration', () => {
  const s = createLife({ worldSeed: 171 }); const p = s.world.characters[s.playerCharacterId];
  p.education!.scholarship = true; p.education!.qualifications = ['literacy'];
  s.world.characters.mother.name = 'A name chosen in an old save';
  const next = normalizeGameState(JSON.parse(JSON.stringify({ ...s, schemaVersion: 6 })));
  expect(tuitionDue(next, 'noble')).toBe(0);
  expect(next.world.characters.mother.name).toBe('A name chosen in an old save');
  expect(next.world.characters[p.id].education!.qualifications).toContain('literacy');
  expect(next.world.rngState).toEqual(s.world.rngState);
});
test('merit requires demonstrated learning and institutional support; free household learning supplies an alternative', () => {
  let s = createLife({ worldSeed: 11,birthOrigin: 'peasant' }); s.age = 8; s.gold = 0; s.stats.wits = 20;
  expect(sponsorshipEligibility(s,'merit','parish')).toMatch(/Show learning/);
  s = gameReducer(s,{ type: 'EDUCATION',action: 'enrol',track: 'household' });
  for (let year = 0; year < 3; year++) { s.world.currentYear++; s.actionClock.used = 0; for (let lesson = 0; lesson < 3; lesson++) s = gameReducer(s,{ type: 'EDUCATION',action: 'study' }); }
  expect(s.world.characters[s.playerCharacterId].education!.progress).toBeGreaterThanOrEqual(25);
  expect(sponsorshipEligibility(s,'merit','parish')).toBeNull();
  s.world.factions.church.influence = 10;
  expect(sponsorshipEligibility(s,'merit','parish')).toMatch(/cannot support/);
  expect(s.gold).toBe(0);
});
test('patron support needs a real influential living person, trust and a purse', () => {
  const { relationshipWith } = require('@/engine/relationshipState');
  let approved = 0, declined = 0;
  for (let seed = 1; seed <= 35; seed++) {
    let s = createLife({ worldSeed: seed,birthOrigin: 'peasant' }); s.age = 12;
    const patron = s.world.characters.beatrice; patron.gold = 40;
    const relationship = relationshipWith(s,patron.id); relationship.bToA.trust = 20; relationship.bToA.affinity = 20; relationship.bToA.respect = 20;
    expect(sponsorshipEligibility(s,'patron','cathedral',patron.id)).toMatch(/trust/);
    relationship.bToA.trust = 90; relationship.bToA.affinity = 90; relationship.bToA.respect = 90;
    patron.gold = 0; expect(sponsorshipEligibility(s,'patron','cathedral',patron.id)).toMatch(/cannot fund/); patron.gold = 40;
    s = gameReducer(s,{ type: 'EDUCATION',action: 'scholarship',track: 'cathedral',funding: 'patron',sponsorId: patron.id });
    const e = s.world.characters[s.playerCharacterId].education!;
    if (e.applications![0].approved) { approved++; expect(e.sponsorships![0].sponsorId).toBe(patron.id); expect(s.world.characters[patron.id].gold).toBe(26); expect(tuitionDue(s,'noble')).toBe(20); }
    else { declined++; expect(s.world.characters[patron.id].gold).toBe(40); }
  }
  expect(approved).toBeGreaterThan(0); expect(declined).toBeGreaterThan(0);
});
test('an adult reload replaces an accidentally saved childhood lesson without RNG or lost classmates', () => {
  let s = createLife({ worldSeed: 55,birthOrigin: 'peasant' }); s.age = 8;
  s = gameReducer(s,{ type: 'EDUCATION',action: 'enrol',track: 'household' });
  const before = [...s.world.characters[s.playerCharacterId].education!.classmateIds];
  s.age = 35; s.pendingEvent = { eventId: 'education_household_2' };
  const next = normalizeGameState(JSON.parse(JSON.stringify(s)));
  expect(next.pendingEvent?.eventId).toBe('education_adult_household_0');
  expect(next.world.rngState).toEqual(s.world.rngState);
  expect(next.world.characters[next.pendingEvent!.bindings!.classmate].age).toBeGreaterThanOrEqual(18);
  expect(next.world.characters[next.playerCharacterId].education!.classmateIds).toEqual(expect.arrayContaining(before));
});
test('authored scholarship effects also use finite route coverage and cannot create a blanket waiver', () => {
  const { applyEducationEffect } = require('@/engine/educationEngine');
  let s = createLife({ worldSeed: 13,birthOrigin: 'artisan' }); s.age = 10;
  s = gameReducer(s,{ type: 'EDUCATION',action: 'enrol',track: 'guild' });
  applyEducationEffect(s,{ scholarship: true }); applyEducationEffect(s,{ scholarship: true });
  const e = s.world.characters[s.playerCharacterId].education!;
  expect(e.scholarship).toBe(false); expect(e.sponsorships).toHaveLength(1);
  expect(e.sponsorships![0].remaining).toBe(12); expect(tuitionDue(s,'noble')).toBe(20);
});
