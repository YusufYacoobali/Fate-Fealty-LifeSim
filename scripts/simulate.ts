/**
 * Headless engine smoke test. Plays many full lives with random choices and
 * asserts invariants. Run: npx tsx scripts/simulate.ts
 */
import { createLife, cloneState } from '../src/engine/gameState';
import { ageUp } from '../src/engine/lifeDirector';
import { applyChoice } from '../src/engine/storyGraph';
import { doActivity } from '../src/engine/activityEngine';
import { isChoiceAvailable } from '../src/engine/eventPicker';
import { ACTIVITY_DEFS } from '../src/data/activities';
import { RANKS } from '../src/data/ranks';
import { GameState } from '../src/types/game';

function randomChoice<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error('INVARIANT FAILED: ' + msg);
}

function checkInvariants(s: GameState) {
  for (const k of ['health', 'charm', 'wits', 'faith'] as const) {
    assert(s.stats[k] >= 0 && s.stats[k] <= 100, `${k} out of range: ${s.stats[k]}`);
  }
  assert(s.gold >= 0, `negative gold: ${s.gold}`);
  assert(s.rankIdx >= 0 && s.rankIdx < RANKS.length, `rankIdx out of range: ${s.rankIdx}`);
  assert(s.age >= 0 && s.age < 200, `absurd age: ${s.age}`);
}

const LIVES = 500;
let deaths = 0;
let totalDeathAge = 0;
const rankReached: number[] = [0, 0, 0, 0];
let eventsSeen = 0;
let arcsSeen = 0;
let maxAge = 0;

for (let i = 0; i < LIVES; i++) {
  let s = createLife({ settings: { autoScroll: true, difficulty: randomChoice(['Merciful', 'Normal', 'Brutal']), permadeath: true, haptics: false } });
  let guard = 0;

  while (!s.dead && guard < 400) {
    guard++;
    if (s.event) {
      const ev = s.event;
      if (ev.arcNodeOnly) arcsSeen++;
      eventsSeen++;
      const choices = ev.choices.filter((c) => isChoiceAvailable(s, c));
      const choice = randomChoice(choices);
      s = cloneState(s);
      applyChoice(s, ev, choice);
    } else {
      // Occasionally do a free activity, then age up.
      if (Math.random() < 0.6) {
        s = cloneState(s);
        doActivity(s, randomChoice(ACTIVITY_DEFS).id);
      }
      s = cloneState(s);
      ageUp(s);
    }
    checkInvariants(s);
    if (s.age > maxAge) maxAge = s.age;
  }

  // track highest rank reached
  rankReached[s.rankIdx]++;
  if (s.dead) {
    deaths++;
    totalDeathAge += s.age;
  }
}

console.log('--- SIMULATION COMPLETE ---');
console.log(`Lives simulated:      ${LIVES}`);
console.log(`Deaths (permadeath):  ${deaths} (${((deaths / LIVES) * 100).toFixed(1)}%)`);
console.log(`Avg age at death:     ${(totalDeathAge / Math.max(1, deaths)).toFixed(1)}`);
console.log(`Oldest life reached:  ${maxAge}`);
console.log(`Events resolved:      ${eventsSeen} (arc nodes: ${arcsSeen})`);
console.log('Highest rank reached by:');
RANKS.forEach((r, i) => console.log(`  ${r.key.padEnd(8)} ${rankReached[i]} lives (${((rankReached[i] / LIVES) * 100).toFixed(1)}%)`));
console.log('\nAll invariants held. Engine is stable. ✅');
