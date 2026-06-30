/**
 * The Life Director — the heartbeat of the game. Each call to `ageUp` advances
 * one year and, in order:
 *
 *   1. Increments age, ages kin.
 *   2. Emits 1-2 annual flavour beats (with effects).
 *   3. Applies the slow attrition of old age.
 *   4. Continues any in-flight story arc, OR rolls for a new main event.
 *   5. Ticks rank/path progression (may auto-promote).
 *   6. Runs the death engine.
 *
 * The returned state may carry `event != null`, meaning the UI should open a
 * popup and wait for the player's choice before the year is truly "done".
 */

import { GameState } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { pickAnnualMessage } from '@/content/annualMessages';
import { pushFeed } from './gameState';
import { agingDamage, checkDeath } from './deathEngine';
import { tickProgression } from './pathProgression';
import { grantAcquiredTraits } from './traitEngine';
import { assignLifeGoalIfDue, checkLifeGoal } from './goalEngine';
import { tickAilments, tickImprisonment, tickKinMortality } from './lifecycleEngine';
import { pickEvent } from './eventPicker';
import { popReadyArc } from './storyGraph';
import { chance, rnd } from './random';

const EVENT_CHANCE = 0.34;

export function ageUp(s: GameState): GameState {
  if (s.dead || s.event) return s; // guard: don't advance mid-popup

  s.age += 1;
  s.tab = 'life';
  s.selectedKinId = null;

  // --- 1. age the living kin ---
  for (const k of s.kin) {
    if (k.alive && k.kind !== 'friend') k.age += 1;
  }

  // --- 2. annual flavour (1-2 beats) ---
  const beats = chance(0.5) ? 2 : 1;
  for (let i = 0; i < beats; i++) {
    const msg = pickAnnualMessage(s);
    if (!msg) continue;
    applyEffects(s, msg.effects);
    pushFeed(s, `AGE ${s.age} · ${msg.tag}`, msg.tagColor, msg.text, msg.tone);
    if (s.dead) return s; // a flavour beat can, rarely, be fatal
  }

  // --- 3. attrition of age + ongoing world states ---
  const decay = agingDamage(s);
  if (decay > 0) applyEffects(s, { health: -decay });
  tickKinMortality(s);
  tickAilments(s);
  tickImprisonment(s);

  // --- 4. story arc continuation OR new main event ---
  const arcNode = popReadyArc(s);
  if (arcNode) {
    s.event = arcNode;
  } else if (chance(EVENT_CHANCE)) {
    s.event = pickEvent(s);
  }

  // --- 5. progression + newly-earned acquired traits + life goal ---
  tickProgression(s);
  grantAcquiredTraits(s);
  assignLifeGoalIfDue(s);
  checkLifeGoal(s);

  // --- 6. mortality ---
  checkDeath(s);

  return s;
}

/** A tiny bit of randomised income flavour the Life Director can call on. */
export function passiveIncome(s: GameState): number {
  // Owning a cottage or steed implies a steadier purse.
  let n = 0;
  if (s.inventory.includes('cottage')) n += rnd(1, 3);
  if (s.inventory.includes('steed')) n += rnd(0, 2);
  return n;
}
