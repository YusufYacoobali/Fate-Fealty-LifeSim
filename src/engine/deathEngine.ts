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
import { addMemory, countLivingKin, hasTag, pushFeed } from './gameState';
import { chance, pick, rnd } from './random';
import { C } from '@/theme/theme';
import { appendWorldHistory } from './worldJournal';

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
  if (s.settings.liveForever) {
    // Live Forever floors health at 1 so the player can keep aging.
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

  // 3. Nobody outlives the span. Without a ceiling the old-age roll can be
  // dodged indefinitely, and a life that never ends has no stakes in it.
  if (s.age >= MAX_LIFESPAN) {
    killPlayer(s, 'Died at the full span of years. Nobody in Swineford could remember an older soul.');
    return finalise(s);
  }

  // 4. Old age — risk ramps after 45, and climbs steeply through the eighties
  // so that reaching the ceiling is a rare feat rather than the usual ending.
  if (s.age > 45) {
    const years = s.age - 45;
    const oldRisk = ((years / 110) + Math.pow(years / 45, 3) * 0.22) * mod;
    if (chance(oldRisk)) {
      killPlayer(s, s.age > 70 ? 'Died peacefully of being very, very old.' : 'Died of a winter chill and a tired heart.');
      return finalise(s);
    }
  }

  // 5. Path-flavoured hazard.
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
  if (!s.world.history.some((entry) => entry.type === 'death' && entry.participantIds.includes(s.playerCharacterId))) {
    appendWorldHistory(s, { id: `history_death_${s.nextId++}`, year: s.world.currentYear, type: 'death', participantIds: [s.playerCharacterId], familyIds: [s.world.characters[s.playerCharacterId]?.birthFamilyId ?? ''].filter(Boolean), causes: [s.deathCause], summary: `${s.first} died at ${s.age}. ${s.deathCause}`, salience: 5 });
  }
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
  chronicle: string[];
}

export function buildLifeChronicle(s: GameState): string[] {
  const relevant = s.world.history
    .filter((entry) => entry.participantIds.includes(s.playerCharacterId) || entry.year >= s.playerRun.startedYear)
    .sort((a, b) => b.salience - a.salience || a.year - b.year)
    .slice(0, 5)
    .sort((a, b) => a.year - b.year)
    .map((entry) => `${entry.year}: ${entry.summary}`);
  const closest = Object.values(s.world.relationships)
    .filter((relationship) => relationship.aId === s.playerCharacterId || relationship.bId === s.playerCharacterId)
    .sort((a, b) => (b.aToB.affinity + b.bToA.affinity) - (a.aToB.affinity + a.bToA.affinity))[0];
  if (closest) {
    const otherId = closest.aId === s.playerCharacterId ? closest.bId : closest.aId;
    const other = s.world.characters[otherId];
    if (other) relevant.push(`${other.name} remained one of the strongest threads in this life.`);
  }
  if (!relevant.length) relevant.push(`${s.first} lived through ${s.age} changing years in Swineford.`);
  return relevant.slice(0, 6);
}

export function buildDeathSummary(s: GameState, rankKey: string): DeathSummary {
  const heirs = countLivingKin(s, 'child');
  return {
    name: `${s.first} ${s.epithet}`,
    age: s.age,
    rank: rankKey,
    gold: s.gold,
    heirs,
    cause: s.deathCause,
    epitaph: s.epitaph,
    legacy: legacyScore(s),
    chronicle: buildLifeChronicle(s),
  };
}

/** Nobody sees the far side of this, Live Forever aside. */
export const MAX_LIFESPAN = 110;

/** The age at which the body stops holding its own and starts giving ground. */
export const DECLINE_AGE = 55;

/**
 * The slow decline of old age, scaled by traits.
 *
 * Past `DECLINE_AGE` this is a floor as well as a roll: a character who is
 * eating well and resting can no longer hold a flat hundred health into their
 * eighties, which is what made a long life a matter of patience rather than of
 * luck. The floor climbs with each decade so the last years are genuinely hard.
 */
export function agingDamage(s: GameState): number {
  if (s.age <= 45) return 0;
  const base = rnd(1, Math.floor((s.age - 40) / 4) + 2);
  const decline = s.age >= DECLINE_AGE ? 1 + Math.floor((s.age - DECLINE_AGE) / 8) : 0;
  return Math.round((base + decline) * agingMultiplierFromTraits(s));
}
