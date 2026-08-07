/**
 * The Life Director — the heartbeat of the game. Each call to `ageUp` advances
 * one year and, in order:
 *
 *   1. Increments age, ages kin.
 *   2. Emits 1-2 annual flavour beats (with effects).
 *   3. Applies the slow attrition of old age.
 *   4. Asks the director what shape this year takes and fills it (see ./director).
 *   5. Ticks rank/path progression (may auto-promote).
 *   6. Runs the death engine.
 *
 * The returned state may carry `pendingEvent != null`, meaning the UI should open a
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
import { chance } from './random';
import { tickHoldingYear } from './holdingEngine';
import { tickCareerAndEconomy } from './careerEngine';
import { simulateLivingWorld } from './worldEngine';
import { tickAffairs, tickRelationshipDecay } from './relationshipEngine';
import { resolveScheduledConsequences, tickPersistentSociety, tickWorldConditions } from './worldSimulation';
import { tickFamilyFormation } from './familyFormationEngine';
import { tickStructuredHealth } from './healthEngine';
import { beginLegalTrial, tickLegalSystem } from './legalEngine';
import { bindDirectedEvent, directYear } from './director';
import { tickFactions } from './factionEngine';

export function ageUp(s: GameState): GameState {
  if (s.dead || s.pendingEvent) return s; // guard: don't advance mid-popup

  s.age += 1;
  s.world.currentYear += 1;
  s.tab = 'life';
  s.selectedKinId = null;

  // --- 1. age the living kin ---
  for (const k of s.kin) if (k.alive) k.age += 1;

  // --- 2. annual flavour (1-2 beats) ---
  const beats = chance(0.5) ? 2 : 1;
  for (let i = 0; i < beats; i++) {
    const msg = pickAnnualMessage(s);
    if (!msg) continue;
    applyEffects(s, msg.effects);
    pushFeed(s, `AGE ${s.age} · ${msg.tag}`, msg.tagColor, msg.text, msg.tone);
    checkDeath(s);
    if (s.dead) return s; // a flavour beat can, rarely, be fatal
  }

  // --- 3. attrition of age + ongoing world states ---
  const decay = agingDamage(s);
  if (decay > 0) applyEffects(s, { health: -decay });
  checkDeath(s);
  if (s.dead) return s;
  tickKinMortality(s);
  tickFamilyFormation(s);
  tickStructuredHealth(s);
  checkDeath(s);
  if (s.dead) return s;
  tickAilments(s);
  checkDeath(s);
  if (s.dead) return s;
  tickImprisonment(s);
  checkDeath(s);
  if (s.dead) return s;

  // Careers, household costs, mutual relationships, and autonomous people all
  // close their outgoing year before the next story begins.
  tickCareerAndEconomy(s);
  checkDeath(s);
  if (s.dead) return s;
  tickRelationshipDecay(s);
  tickAffairs(s);
  simulateLivingWorld(s);
  tickPersistentSociety(s);
  tickWorldConditions(s);
  tickFactions(s);
  tickLegalSystem(s);
  resolveScheduledConsequences(s);

  // Resolve the outgoing year's estate management. A health collapse is
  // finalised before another story is offered while Live Forever is enabled
  // recovers at 1 Health and continues normally.
  tickHoldingYear(s);
  if (s.stats.health <= 0) {
    checkDeath(s);
    if (s.dead) return s;
  }

  // --- 4. the year's beat, chosen by the director ---
  const directed = directYear(s);
  if (directed.event) {
    // Only commit the trial's charge once the popup is genuinely being opened.
    if (!s.pendingEvent) {
      if (directed.isLegal) beginLegalTrial(s);
      s.pendingEvent = { eventId: directed.event.id, bindings: bindDirectedEvent(s, directed) };
    }
    s.world.pacing.quietYearsSinceStory = 0;
  } else {
    s.world.pacing.quietYearsSinceStory += 1;
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
