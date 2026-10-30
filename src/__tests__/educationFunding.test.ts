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
