/**
 * Per-year "living world" upkeep that the Life Director runs each age-up:
 *   - kin mortality (spouses and parents grow old and die),
 *   - ongoing illness (the `ill` state drains health until cured/recovered),
 *   - imprisonment (the `imprisoned` state passes years until release).
 *
 * Kept separate from the Director so each ongoing-state rule lives in one place.
 */

import { GameState, KinKind } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { killKin } from './kinFactory';
import { addMemory, addTag, hasTag, pushFeed, removeTag } from './gameState';
import { chance, rnd } from './random';
import { C } from '@/theme/theme';

const MORTAL_KINDS: KinKind[] = ['spouse', 'mother', 'father', 'sibling', 'liege'];

/** Elderly kin have a rising yearly chance of passing away. */
export function tickKinMortality(s: GameState): GameState {
  for (const k of s.kin) {
    if (!k.alive || !MORTAL_KINDS.includes(k.kind)) continue;
    if (k.age < 50) continue;
    const risk = (k.age - 50) / 150;
    if (!chance(risk)) continue;

    killKin(s, k.id);
    if (k.kind === 'spouse') {
      removeTag(s, 'married');
      addTag(s, 'widowed');
      addMemory(s, 'widowed', 3);
      pushFeed(s, 'BEREAVEMENT', C.bad, `${k.name}, your spouse, has passed away at ${k.age}. You are left a widow.`, 'bad');
    } else {
      addMemory(s, `${k.kind}_died`, 2);
      pushFeed(s, 'BEREAVEMENT', C.bad, `${k.name}, your ${k.kind}, has died at the age of ${k.age}.`, 'bad');
    }
  }
  return s;
}

/** The `ill` state drains health each year, with a chance to recover. */
export function tickAilments(s: GameState): GameState {
  if (!hasTag(s, 'ill')) return s;
  applyEffects(s, { health: -rnd(3, 7) });
  if (chance(0.28)) {
    removeTag(s, 'ill');
    pushFeed(s, 'RECOVERED', C.good, 'The lingering sickness finally breaks. You feel like a person again.', 'good');
  } else {
    pushFeed(s, 'SICKNESS', C.bad, 'The sickness lingers in your bones. You waste another year away.', 'bad');
  }
  return s;
}

/** While `imprisoned`, years pass in a cell until a chance of release. */
export function tickImprisonment(s: GameState): GameState {
  if (!hasTag(s, 'imprisoned')) return s;
  if (chance(0.4)) {
    removeTag(s, 'imprisoned');
    addTag(s, 'ex_convict');
    addMemory(s, 'released', 2);
    pushFeed(s, 'RELEASED', C.good, 'The gaoler turns the key at last. You stagger blinking into freedom, thinner and warier.', 'good');
  } else {
    applyEffects(s, { health: -rnd(2, 5), charm: -1 });
    pushFeed(s, 'IMPRISONED', C.bad, 'Another grim year in the dungeon. The rats are poor company and worse cooks.', 'bad');
  }
  return s;
}

/** Whether ongoing states currently forbid free activities. */
export function isIncapacitated(s: GameState): boolean {
  return hasTag(s, 'imprisoned');
}
