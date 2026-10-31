import { ANNUAL_MESSAGES, annualActors, eligibleAnnualMessages, pickAnnualMessage } from '@/content/annualMessages';
import { createLife, cloneState, syncPlayerToWorld } from '@/engine/gameState';
import { normalizeGameState } from '@/state/persistence';
import { runWithWorldRng } from '@/engine/random';
import { spawnKin } from '@/engine/kinFactory';

it('uses the controlled character’s actual parents and spouse and excludes missing family roles', () => {
  const s = createLife({worldSeed:1701});
  s.age = 9;
  const p = s.world.characters[s.playerCharacterId];
  for (const id of p.parentIds!) s.world.characters[id].alive = false;
  expect(eligibleAnnualMessages(s).some(m => m.actors?.some(r => ['mother','father','carer'].includes(r)))).toBe(false);
  const child = spawnKin(s,{kind:'child',age:20});
  s.playerCharacterId = child.id;
  p.alive = true;
  expect(Object.values(annualActors(s))).toContain(p.id);
  expect(eligibleAnnualMessages(s).filter(m => m.actors?.includes('spouse'))).toEqual([]);
});
it('honours twelve-year IDs, once-per-life incidents, and same-year theme exclusion across reloads', () => {
  let s = createLife({worldSeed:1702}); s.age = 24;
  const p = s.world.characters[s.playerCharacterId];
  p.annualNarrativeYears = {fortune_coin:s.world.currentYear-11,baby_first_steps:s.world.currentYear-20};
  expect(eligibleAnnualMessages(s).some(m => m.id==='fortune_coin')).toBe(false);
  s.world.currentYear++;
  expect(eligibleAnnualMessages(s).some(m => m.id==='fortune_coin')).toBe(true);
  const first = runWithWorldRng(s.world,()=>pickAnnualMessage(s))!;
  p.annualNarrativeYears[first.id] = s.world.currentYear;
  const second = runWithWorldRng(s.world,()=>pickAnnualMessage(s,[first.id]))!;
  expect(second.theme).not.toBe(first.theme);
  syncPlayerToWorld(s); const original=cloneState(s);
  s=normalizeGameState(JSON.parse(JSON.stringify(s)));
  expect(runWithWorldRng(s.world,()=>pickAnnualMessage(s))).toEqual(runWithWorldRng(original.world,()=>pickAnnualMessage(original)));
  s.age=2;
  expect(eligibleAnnualMessages(s).some(m => m.id==='baby_first_steps')).toBe(false);
});
it('keeps court, occupational, famine and sickness observations relevant', () => {
  const s = createLife({worldSeed:1703}); s.age=24; s.rankIdx=0;
  s.occupation.careerId='cleric'; s.world.conditions.foodSecurity=90; s.world.conditions.diseasePressure=0;
  const ids = eligibleAnnualMessages(s).map(m=>m.id);
  expect(ids).not.toContain('famine'); expect(ids).not.toContain('plague_cough');
  expect(ids).not.toContain('work_furrow'); expect(ids).not.toContain('court_precedence_door');
  expect(ids).toContain('work_parish_seat');
  expect(new Set(ANNUAL_MESSAGES.map(m=>m.id)).size).toBe(ANNUAL_MESSAGES.length);
});
