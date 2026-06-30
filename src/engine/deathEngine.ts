/**
 * Death engine. Runs once per age-up (after the year's events) and decides
 * whether — and how — the life ends.
 *
 * Checks, in order:
 *   1. Already dead (event-driven death set the flag) -> just finalise.
 *   2. Health <= 0.
 *   3. Old-age risk that ramps with age.
 *   4. Path-flavoured hazards (outlaws hang, knights fall in war, etc.).
 */

import { GameState } from '@/types/game';
import { EPITAPHS } from '@/data/names';
import { dominantPath } from './pathProgression';
import { agingMultiplierFromTraits } from './traitEngine';
import { killPlayer, legacyScore } from './consequenceEngine';
import { addMemory, hasTag, pushFeed } from './gameState';
import { chance, pick, rnd } from './random';
import { C } from '@/theme/theme';

const HEALTH_DEATHS = [
  'Succumbed to a mild cough that turned out not to be mild.',
  'The plague, finally. It had been going around.',
  'A goose-related incident. Details remain disputed.',
  'Fell into the turnip cellar and simply gave up.',
  'Wasted away, muttering about apples.',
];

const OUTLAW_DEATHS = [
  'Hanged at the crossroads for banditry. The crowd ate pies.',
  'Caught by the King’s men one road too many.',
  'Knifed in a tavern over a debt of four gold.',
];

const MARTIAL_DEATHS = [
  'Fell gloriously in battle. Mostly gloriously.',
  'Unhorsed at a tourney for the final, fatal time.',
  'Died of a wound that the leech-doctor insisted was fine.',
];

function difficultyDeathMod(s: GameState): number {
  switch (s.settings.difficulty) {
    case 'Brutal':
      return 1.35;
    case 'Merciful':
      return 0.78;
    default:
      return 1;
  }
}

export function checkDeath(s: GameState): GameState {
  if (!s.settings.permadeath) {
    // No permadeath: floor health at 1 so the player can keep going.
    if (s.stats.health <= 0) s.stats.health = 1;
    return s;
  }

  const mod = difficultyDeathMod(s);

  // 1. Event-driven death (flag already set by consequence engine).
  if (s.dead) return finalise(s);

  // 2. Health collapse.
  if (s.stats.health <= 0) {
    let cause = pick(HEALTH_DEATHS);
    if (dominantPath(s) === 'outlaw') cause = pick(OUTLAW_DEATHS);
    killPlayer(s, cause);
    return finalise(s);
  }

  // 3. Old age — risk ramps after 45, sharply after 60.
  if (s.age > 45) {
    const oldRisk = ((s.age - 45) / 110) * mod;
    if (chance(oldRisk)) {
      killPlayer(s, s.age > 70 ? 'Died peacefully of being very, very old.' : 'Died of a winter chill and a tired heart.');
      return finalise(s);
    }
  }

  // 4. Path-flavoured hazard.
  const path = dominantPath(s);
  if (path === 'outlaw' && s.reputation < -20 && chance(0.05 * mod)) {
    killPlayer(s, pick(OUTLAW_DEATHS));
    return finalise(s);
  }
  if (path === 'martial' && s.rankIdx >= 2 && hasTag(s, 'at_war') && chance(0.06 * mod)) {
    killPlayer(s, pick(MARTIAL_DEATHS));
    return finalise(s);
  }

  return s;
}

function finalise(s: GameState): GameState {
  if (!s.epitaph) s.epitaph = pick(EPITAPHS);
  addMemory(s, 'died', 5, s.deathCause);
  pushFeed(s, `AGE ${s.age} · THE END`, C.bad, `You died at ${s.age}. ${s.deathCause}`, 'bad');
  return s;
}

export interface DeathSummary {
  name: string;
  age: number;
  rank: string;
  gold: number;
  heirs: number;
  cause: string;
  epitaph: string;
  legacy: number;
}

export function buildDeathSummary(s: GameState, rankKey: string): DeathSummary {
  const heirs = s.kin.filter((k) => k.kind === 'child' && k.alive).length;
  return {
    name: `${s.first} ${s.epithet}`,
    age: s.age,
    rank: rankKey,
    gold: s.gold,
    heirs,
    cause: s.deathCause,
    epitaph: s.epitaph,
    legacy: legacyScore(s),
  };
}

/** Random extra flavour for the slow decline of old age, scaled by traits. */
export function agingDamage(s: GameState): number {
  if (s.age <= 45) return 0;
  const base = rnd(1, Math.floor((s.age - 40) / 4) + 2);
  return Math.round(base * agingMultiplierFromTraits(s));
}
