/**
 * Balance report. Runs a *skilled* agent (heals when low, builds toward the next
 * rank's requirements, makes reasonable event choices) across many lives and
 * reports the rank-reach distribution + lifespan, per difficulty.
 *
 * Run: npx tsx scripts/balance.ts
 */
import { createLife, cloneState } from '../src/engine/gameState';
import { ageUp } from '../src/engine/lifeDirector';
import { applyChoice } from '../src/engine/storyGraph';
import { doActivity } from '../src/engine/activityEngine';
import { isChoiceAvailable } from '../src/engine/eventPicker';
import { canPromote } from '../src/engine/pathProgression';
import { RANKS } from '../src/data/ranks';
import { GameState, Choice, Difficulty } from '../src/types/game';

/** Pick the activity a deliberate climber would choose this year. */
function chooseActivity(s: GameState): string {
  if (s.tags.includes('imprisoned')) return 'church'; // no-op-ish; just age out
  // Heal when health is getting dangerous.
  if (s.stats.health < 40) {
    if (s.gold >= 4) return 'herbalist';
    if (s.gold >= 2) return 'bathhouse';
  }
  const next = RANKS[s.rankIdx + 1];
  if (next?.promote.stats) {
    // Shore up whichever gated stat is short.
    const need = next.promote.stats;
    if (need.charm != null && s.stats.charm < need.charm && s.gold >= 2) return 'bathhouse';
    if (need.wits != null && s.stats.wits < need.wits) return 'train';
  }
  // Need gold for the noble gate?
  if (next?.promote.minGold != null && s.gold < next.promote.minGold + 5) return 'fields';
  return 'train';
}

/** Pick a sensible event option: prefer a safe deterministic one, else the first. */
function chooseOption(s: GameState, choices: Choice[]): Choice {
  const safe = choices.find((c) => c.outcome && !c.costGold);
  return safe ?? choices[0];
}

function runLife(difficulty: Difficulty): GameState {
  let s = createLife({ settings: { autoScroll: true, difficulty, permadeath: true, haptics: false } });
  let guard = 0;
  while (!s.dead && guard < 400) {
    guard++;
    if (s.event) {
      const ev = s.event;
      const choices = ev.choices.filter((c) => isChoiceAvailable(s, c));
      s = cloneState(s);
      applyChoice(s, ev, chooseOption(s, choices));
      continue;
    }
    s = cloneState(s);
    doActivity(s, chooseActivity(s));
    s = cloneState(s);
    ageUp(s);
  }
  return s;
}

function report(difficulty: Difficulty, lives: number) {
  const rankReached = [0, 0, 0, 0];
  const buckets = { '<20': 0, '20-39': 0, '40-59': 0, '60+': 0 };
  let totalAge = 0;
  let goalAssigned = 0;
  let goalDone = 0;
  for (let i = 0; i < lives; i++) {
    const s = runLife(difficulty);
    rankReached[s.rankIdx]++;
    if (s.goalId) goalAssigned++;
    if (s.goalDone) goalDone++;
    totalAge += s.age;
    if (s.age < 20) buckets['<20']++;
    else if (s.age < 40) buckets['20-39']++;
    else if (s.age < 60) buckets['40-59']++;
    else buckets['60+']++;
  }
  const pct = (n: number) => `${((n / lives) * 100).toFixed(1)}%`;
  console.log(`\n=== ${difficulty} (skilled play, ${lives} lives) ===`);
  console.log(`Avg lifespan: ${(totalAge / lives).toFixed(1)}`);
  console.log(`Lifespan buckets: <20 ${pct(buckets['<20'])} | 20-39 ${pct(buckets['20-39'])} | 40-59 ${pct(buckets['40-59'])} | 60+ ${pct(buckets['60+'])}`);
  RANKS.forEach((r, i) => console.log(`  reached ${r.key.padEnd(8)} ${pct(rankReached[i] + rankReached.slice(i + 1).reduce((a, b) => a + b, 0))} (final ${pct(rankReached[i])})`));
  console.log(`Life goal: assigned ${pct(goalAssigned)} | fulfilled ${pct(goalDone)} (${goalAssigned ? ((goalDone / goalAssigned) * 100).toFixed(1) : '0'}% of those assigned)`);
}

const LIVES = 2000;
(['Merciful', 'Normal', 'Brutal'] as Difficulty[]).forEach((d) => report(d, LIVES));
