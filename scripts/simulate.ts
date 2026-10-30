import { runWithWorldRng, pick, rnd } from '../src/engine/random';
import { resolveRpgEncounter } from '../src/__tests__/rpgSoakHelpers';
/**
 * Headless engine smoke test. Plays many full lives with random choices and
 * asserts invariants. Run: npx tsx scripts/simulate.ts
 */
import { createLife } from '../src/engine/gameState';
import { eventById, isChoiceEnabled } from '../src/engine/eventPicker';
import { ACTIVITY_DEFS } from '../src/data/activities';
import { RANKS } from '../src/data/ranks';
import { GameState } from '../src/types/game';
import { gameReducer } from '../src/state/gameReducer';
import { ENTRY_CAREERS } from '../src/data/careers';

function randomChoice<T>(a: T[], state: GameState): T { return runWithWorldRng(state.world, () => pick(a)); }

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
  for (const k of ['stores', 'security', 'loyalty'] as const) {
    assert(s.holding[k] >= 0 && s.holding[k] <= 100, `holding ${k} out of range: ${s.holding[k]}`);
  }
  assert(new Set(s.holding.upgrades).size === s.holding.upgrades.length, 'duplicate Holding upgrade');
  assert(s.holding.lastActionAge == null || s.holding.lastActionAge <= s.age, 'Holding action recorded in the future');
  assert(s.holding.criticalYears >= 0, 'negative Holding crisis streak');
  assert(s.actionClock.used >= 0 && s.actionClock.used <= 24, `action clock out of range: ${s.actionClock.used}`);
  assert(s.actionClock.cap === 24, `unexpected action cap: ${s.actionClock.cap}`);
  assert(s.kin.filter((person) => person.alive).length <= 60, 'living world exceeded its soft cap');
  for (const relationship of Object.values(s.world.relationships)) {
    for (const perspective of [relationship.aToB, relationship.bToA]) {
      for (const value of Object.values(perspective)) assert(value >= 0 && value <= 100, `relationship dimension out of range: ${value}`);
    }
  }
}

const LIVES = 500;
let deaths = 0;
let totalDeathAge = 0;
const rankReached: number[] = Array.from({ length: RANKS.length }, () => 0);
let eventsSeen = 0;
let arcsSeen = 0;
let maxAge = 0;

for (let i = 0; i < LIVES; i++) {
  let s = createLife({ worldSeed: 400000 + i, settings: { autoScroll: true, difficulty: (['Merciful', 'Normal', 'Brutal'] as const)[i % 3], liveForever: false, haptics: false, soundEffects: false } });
  s.lifetimeUnlocked = Math.random() < 0.5;
  let guard = 0;

  while (!s.dead && guard < 400) {
    guard++;
    resolveRpgEncounter(s);
    if (s.pendingEvent) {
      const ev = eventById(s.pendingEvent.eventId)!;
      if (ev.arcNodeOnly) arcsSeen++;
      eventsSeen++;
      const choices = ev.choices.filter((c) => isChoiceEnabled(s, c));
      const choice = randomChoice(choices, s);
      s = gameReducer(s, { type: 'CHOOSE', choice });
    } else {
      // Spend a variable part of the yearly allowance, including work, then
      // deliberately age up early or at the cap.
      const actions = runWithWorldRng(s.world, () => rnd(0, 6));
      for (let action = 0; action < actions && !s.dead && !s.pendingEvent; action++) {
        if (!s.occupation.careerId && s.age >= 8 && runWithWorldRng(s.world, () => rnd(0, 99)) < 25) {
          s = gameReducer(s, { type: 'CAREER_ACTION', action: 'apply', careerId: randomChoice(ENTRY_CAREERS, s).id });
        } else if (s.occupation.careerId && runWithWorldRng(s.world, () => rnd(0, 99)) < 35) {
          s = gameReducer(s, { type: 'CAREER_ACTION', action: 'work' });
        } else {
          s = gameReducer(s, { type: 'DO_ACTIVITY', id: randomChoice(ACTIVITY_DEFS, s).id });
        }
      }
      s = gameReducer(s, { type: 'AGE_UP' });
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
console.log(`Deaths (Live Forever off): ${deaths} (${((deaths / LIVES) * 100).toFixed(1)}%)`);
console.log(`Avg age at death:     ${(totalDeathAge / Math.max(1, deaths)).toFixed(1)}`);
console.log(`Oldest life reached:  ${maxAge}`);
console.log(`Events resolved:      ${eventsSeen} (arc nodes: ${arcsSeen})`);
console.log('Highest rank reached by:');
RANKS.forEach((r, i) => console.log(`  ${r.key.padEnd(8)} ${rankReached[i]} lives (${((rankReached[i] / LIVES) * 100).toFixed(1)}%)`));
console.log('\nAll invariants held. Engine is stable. ✅');
