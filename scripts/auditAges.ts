/**
 * Age audit: for each young age, list events the picker considers eligible.
 * Flags adult-themed content reachable by toddlers. Run: npx tsx scripts/auditAges.ts
 */
import { createLife } from '../src/engine/gameState';
import { isEventEligible } from '../src/engine/eventPicker';
import { ALL_EVENTS } from '../src/content';

for (const age of [0, 2, 4, 6, 10]) {
  const s = createLife();
  s.age = age;
  s.gold = 50; // generous so gold gates don't mask age gaps
  s.reputation = 10;
  s.lifetimeUnlocked = true;
  const eligible = ALL_EVENTS.filter((e) => isEventEligible(s, e)).map((e) => e.id);
  console.log(`\nAGE ${age} (${eligible.length} eligible):`);
  console.log('  ' + (eligible.join(', ') || '(none)'));
}
