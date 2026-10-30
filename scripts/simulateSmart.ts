import { gameReducer } from '../src/state/gameReducer';
import { resolveRpgEncounter } from '../src/__tests__/rpgSoakHelpers';
/** Focused-play sim: train toward knighthood, earn gold, manage health. */
import { createLife } from '../src/engine/gameState';
import { eventById, isChoiceEnabled } from '../src/engine/eventPicker';
import { RANKS } from '../src/data/ranks';

let reachedNoble = 0;
let reachedKnight = 0;
let reachedBaron = 0;
let reachedMonarch = 0;
const LIVES = 300;
let bestRank = 0;

for (let i = 0; i < LIVES; i++) {
  let s = createLife({ worldSeed: 500000 + i, lifetimeUnlocked: true, settings: { autoScroll: true, difficulty: 'Normal', liveForever: false, haptics: false, soundEffects: false } });
  let guard = 0;
  while (!s.dead && guard < 400) {
    guard++;
    resolveRpgEncounter(s);
    if (s.pendingEvent) {
      const ev = eventById(s.pendingEvent.eventId)!;
      const choices = ev.choices.filter((c) => isChoiceEnabled(s, c));
      // Prefer the first choice (usually the "engage" path).
      s = gameReducer(s, { type: 'CHOOSE', choice: choices[0] });
      continue;
    }
    if (s.stats.health < 35 && s.gold >= 4) s = gameReducer(s, { type: 'DO_ACTIVITY', id: 'herbalist' });
    else if (s.gold < 240 && s.rankIdx >= 2) s = gameReducer(s, { type: 'DO_ACTIVITY', id: 'fields' });
    else s = gameReducer(s, { type: 'DO_ACTIVITY', id: 'train' });
    s = gameReducer(s, { type: 'AGE_UP' });
  }
  if (s.rankIdx >= 2) reachedKnight++;
  if (s.rankIdx >= 3) reachedNoble++;
  if (s.rankIdx >= 4) reachedBaron++;
  if (s.rankIdx >= 5) reachedMonarch++;
  if (s.rankIdx > bestRank) bestRank = s.rankIdx;
}

console.log(`Focused play over ${LIVES} lives:`);
console.log(`  Reached Knight+: ${reachedKnight} (${((reachedKnight / LIVES) * 100).toFixed(1)}%)`);
console.log(`  Reached Noble:   ${reachedNoble} (${((reachedNoble / LIVES) * 100).toFixed(1)}%)`);
console.log(`  Reached Baron:   ${reachedBaron} (${((reachedBaron / LIVES) * 100).toFixed(1)}%)`);
console.log(`  Reached Monarch: ${reachedMonarch} (${((reachedMonarch / LIVES) * 100).toFixed(1)}%)`);
console.log(`  Best rank ever:  ${RANKS[bestRank].key}`);
