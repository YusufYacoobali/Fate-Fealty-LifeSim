/** Focused-play sim: train toward knighthood, earn gold, manage health. */
import { createLife, cloneState } from '../src/engine/gameState';
import { ageUp } from '../src/engine/lifeDirector';
import { applyChoice } from '../src/engine/storyGraph';
import { doActivity } from '../src/engine/activityEngine';
import { isChoiceAvailable } from '../src/engine/eventPicker';
import { RANKS } from '../src/data/ranks';

let reachedNoble = 0;
let reachedKnight = 0;
const LIVES = 300;
let bestRank = 0;

for (let i = 0; i < LIVES; i++) {
  let s = createLife({ settings: { autoScroll: true, difficulty: 'Normal', permadeath: true, haptics: false } });
  let guard = 0;
  while (!s.dead && guard < 400) {
    guard++;
    if (s.event) {
      const ev = s.event;
      const choices = ev.choices.filter((c) => isChoiceAvailable(s, c));
      // Prefer the first choice (usually the "engage" path).
      s = cloneState(s);
      applyChoice(s, ev, choices[0]);
      continue;
    }
    s = cloneState(s);
    if (s.stats.health < 35 && s.gold >= 4) doActivity(s, 'herbalist');
    else if (s.gold < 60 && s.rankIdx >= 2) doActivity(s, 'fields');
    else doActivity(s, 'train');
    s = cloneState(s);
    ageUp(s);
  }
  if (s.rankIdx >= 2) reachedKnight++;
  if (s.rankIdx >= 3) reachedNoble++;
  if (s.rankIdx > bestRank) bestRank = s.rankIdx;
}

console.log(`Focused play over ${LIVES} lives:`);
console.log(`  Reached Knight+: ${reachedKnight} (${((reachedKnight / LIVES) * 100).toFixed(1)}%)`);
console.log(`  Reached Noble:   ${reachedNoble} (${((reachedNoble / LIVES) * 100).toFixed(1)}%)`);
console.log(`  Best rank ever:  ${RANKS[bestRank].key}`);
