import { applyCourtScandal, applyRoyalTransition } from './courtEngine';
import { applyProfessionalEffect } from './careerSpecializationEngine';
import { applyEducationEffect } from './educationEngine';
/**
 * The consequence engine turns a declarative `Effects` object into mutations on
 * the game state: stats, gold, rank progress, reputation, hidden paths, tags,
 * memories, kin relationships, promotions, and life-ending outcomes.
 *
 * This is the single chokepoint through which ALL event/activity outcomes flow,
 * so balancing (e.g. difficulty scaling on damage) lives in one place.
 */

import { Effects, GameState, PathKey, STAT_KEYS } from '@/types/game';
import { addMemory, addMoney, addTag, pushFeed, removeTag } from './gameState';
import { clamp } from './random';
import { promote, demote } from './pathProgression';
import { killKin as killKinMember, spawnKin } from './kinFactory';
import { applyRelationshipShift } from './relationshipState';
import { grantSkillXp } from './rpgProgress';
import { MaterialId, SkillId } from '@/types/rpg';

// Normal deeds earn rank slowly; explicit promotion-claim scenes keep full value.
const RANK_PROGRESS_GAIN_MULTIPLIER = 0.65;

/**
 * Difficulty multiplier applied to NEGATIVE stat changes only. Tuned (with the
 * death modifier) so reaching Noble is "hard but not impossible" on every mode:
 * the spread is compressed around Normal rather than trivial/impossible at the
 * extremes. See scripts/balance.ts.
 */
function harshness(s: GameState): number {
  switch (s.settings.difficulty) {
    case 'Brutal':
      return 1.3;
    case 'Merciful':
      return 0.8;
    default:
      return 1;
  }
}

function rankProgressDelta(delta: number, fullStrength: boolean): number {
  if (fullStrength || delta === 0) return delta;
  if (delta > 0) return Math.max(1, Math.ceil(delta * RANK_PROGRESS_GAIN_MULTIPLIER));
  return Math.min(-1, Math.floor(delta * RANK_PROGRESS_GAIN_MULTIPLIER));
}

export function applyEffects(s: GameState, eff?: Effects): GameState {
  if (!eff) return s;
  if (eff.royalTransition) applyRoyalTransition(s, eff.royalTransition);
  if (eff.royalTreasury != null && s.world.court?.rulerId === s.playerCharacterId) s.world.court.treasury = Math.max(0, Math.min(5000, s.world.court.treasury + eff.royalTreasury));
  if (eff.courtScandal) applyCourtScandal(s, eff.courtScandal);
  if (eff.professional) applyProfessionalEffect(s, eff.professional);
  if (eff.education) applyEducationEffect(s, eff.education);
  for (const [id, amount] of Object.entries(eff.materials ?? {})) s.rpg.materials[id as MaterialId] = Math.max(0, (s.rpg.materials[id as MaterialId] ?? 0) + amount);
  for (const [id, amount] of Object.entries(eff.goods ?? {})) s.rpg.goods[id] = Math.max(0, (s.rpg.goods[id] ?? 0) + amount);

  const harsh = harshness(s);
  const resolveCharacterId = (id?: string) => id ? (s.pendingEvent?.bindings?.[id] ?? id) : s.playerCharacterId;
  const explicitTargetId = resolveCharacterId(eff.targetCharacterId);
  for (const [id, amount] of Object.entries(eff.skillXp ?? {})) grantSkillXp(s, id as SkillId, amount, 'experience', explicitTargetId);
  if (eff.debt && eff.debt.principal > 0) s.debts.push({ id: `debt_${s.nextId++}`, principal: eff.debt.principal, lenderId: eff.debt.lenderId, interestRate: eff.debt.interestRate ?? 0.1 });
  const target = explicitTargetId !== s.playerCharacterId
    ? s.world.characters[explicitTargetId]
    : null;

  if (target) {
    for (const k of STAT_KEYS) {
      const d = eff[k];
      if (d != null) target.stats[k] = clamp(target.stats[k] + (d < 0 ? d * harsh : d));
    }
    if (eff.gold != null) target.gold = Math.max(0, target.gold + eff.gold);
  }

  // --- stats ---
  for (const k of target ? [] : STAT_KEYS) {
    const d = eff[k];
    if (d != null) {
      const scaled = d < 0 ? d * harsh : d;
      s.stats[k] = clamp(s.stats[k] + scaled);
    }
  }

  // --- gold ---
  if (eff.gold != null && !target) addMoney(s, eff.gold);

  // --- rank progress (hidden) ---
  if (eff.rankProgress != null) {
    const delta = rankProgressDelta(eff.rankProgress, !!eff.promote);
    s.rankProgress = Math.max(0, s.rankProgress + delta);
  }

  // --- reputation (hidden, -100..100) ---
  if (eff.reputation != null) {
    s.reputation = clamp(s.reputation + eff.reputation, -100, 100);
  }

  // --- hidden path progress ---
  if (eff.path) {
    for (const key of Object.keys(eff.path) as PathKey[]) {
      const d = eff.path[key];
      if (d != null) s.paths[key] = Math.max(0, s.paths[key] + d);
    }
  }

  // --- Holding resources (visible only inside the HOLD tab) ---
  if (eff.holding) {
    for (const key of ['stores', 'security', 'loyalty'] as const) {
      const delta = eff.holding[key];
      if (delta != null) s.holding[key] = clamp(s.holding[key] + delta);
    }
  }

  // --- tags ---
  if (eff.addTags) for (const t of eff.addTags) addTag(s, t);
  if (eff.removeTags) for (const t of eff.removeTags) removeTag(s, t);

  // --- memory ---
  if (eff.memory) addMemory(s, eff.memory.tag, eff.memory.weight ?? 1, eff.memory.note);

  // --- kin relationship ---
  if (eff.kinRel) {
    const resolvedKinId = s.pendingEvent?.bindings?.[eff.kinRel.id] ?? eff.kinRel.id;
    const k = s.kin.find((m) => m.id === resolvedKinId);
    if (k) {
      const legacy = k.rel;
      applyRelationshipShift(s, k.id, { affinity: eff.kinRel.delta }, { affinity: eff.kinRel.delta });
      k.rel = clamp(legacy + eff.kinRel.delta);
    }
  }
  if (eff.boundKinRel) {
    const kinId = s.pendingEvent?.bindings?.[eff.boundKinRel.role];
    const kin = kinId ? s.kin.find((member) => member.id === kinId) : undefined;
    if (kin) {
      applyRelationshipShift(s, kin.id, { affinity: eff.boundKinRel.delta }, { affinity: eff.boundKinRel.delta });
      kin.rel = clamp(kin.rel + eff.boundKinRel.delta);
    }
  }

  // --- kin roster changes (new spouse/child, or a death) ---
  if (eff.addKin) {
    const specs = Array.isArray(eff.addKin) ? eff.addKin : [eff.addKin];
    for (const spec of specs) spawnKin(s, spec);
  }
  if (eff.killKin) killKinMember(s, eff.killKin);

  // --- promotion / demotion (forced) ---
  if (eff.promote) promote(s);
  if (eff.demote) demote(s);

  // --- prison / exile (lighter than death, recorded as state) ---
  if (eff.prison) {
    addTag(s, 'imprisoned');
    addMemory(s, 'imprisoned', 3);
    const player = s.world.characters[s.playerCharacterId];
    if (player?.legalState) {
      player.legalState.status = 'imprisoned';
      player.legalState.sentenceYearsRemaining = Math.max(1, player.legalState.sentenceYearsRemaining);
    }
  }
  if (eff.exile) {
    addTag(s, 'exiled');
    addMemory(s, 'exiled', 3);
  }

  if (eff.worldConditions) {
    for (const key of Object.keys(eff.worldConditions) as Array<keyof typeof s.world.conditions>) {
      const delta = eff.worldConditions[key];
      if (delta != null) s.world.conditions[key] = clamp(s.world.conditions[key] + delta);
    }
  }
  if (eff.familyReputation) {
    const playerFamilyId = s.world.characters[s.playerCharacterId]?.birthFamilyId;
    const family = s.world.families[eff.familyReputation.familyId ?? playerFamilyId ?? ''];
    if (family) family.reputation = clamp(family.reputation + eff.familyReputation.delta, -100, 100);
  }
  if (eff.storyVariables && s.pendingEvent?.storyInstanceId) {
    const story = s.world.activeStories.find((item) => item.id === s.pendingEvent!.storyInstanceId);
    if (story) Object.assign(story.variables, eff.storyVariables);
  }
  if (eff.revealSecretOf) {
    const character = s.world.characters[resolveCharacterId(eff.revealSecretOf)];
    if (character) {
      character.secretRevealed = true;
      for (const secret of character.secrets ?? []) secret.revealed = true;
    }
  }
  if (eff.schedule) {
    const scheduled = Array.isArray(eff.schedule) ? eff.schedule : [eff.schedule];
    for (const item of scheduled) s.world.scheduledConsequences.push({ ...item, targetIds: [...item.targetIds], id: `consequence_${s.nextId++}` });
  }

  if (eff.healthCondition) {
    const character = s.world.characters[resolveCharacterId(eff.healthCondition.targetId)];
    if (character) {
      character.healthConditions ??= [];
      const existing = character.healthConditions.find((condition) => condition.conditionId === eff.healthCondition!.conditionId);
      if (existing) existing.severity = clamp(existing.severity + eff.healthCondition.severity);
      else character.healthConditions.push({
        id: `health_${s.nextId++}`,
        conditionId: eff.healthCondition.conditionId,
        kind: eff.healthCondition.conditionId.includes('injury') || ['broken_bone', 'deep_cut', 'burns', 'head_injury'].includes(eff.healthCondition.conditionId) ? 'injury' : 'illness',
        severity: clamp(eff.healthCondition.severity), diagnosed: Boolean(eff.healthCondition.diagnosed),
        startedYear: s.world.currentYear, nextReviewYear: s.world.currentYear + 1, sourceId: s.pendingEvent?.eventId,
      });
    }
  }
  if (eff.removeHealthCondition) {
    const character = s.world.characters[resolveCharacterId(eff.removeHealthCondition.targetId)];
    if (character) character.healthConditions = (character.healthConditions ?? []).filter((condition) => condition.conditionId !== eff.removeHealthCondition!.conditionId);
  }
  if (eff.legal) {
    const character = s.world.characters[resolveCharacterId(eff.legal.targetId)];
    if (character) {
      character.legalState ??= { status: 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 };
      const legal = character.legalState;
      if (eff.legal.suspicion != null) legal.suspicion = clamp(legal.suspicion + eff.legal.suspicion);
      if (eff.legal.notoriety != null) legal.notoriety = clamp(legal.notoriety + eff.legal.notoriety);
      if (eff.legal.status) legal.status = eff.legal.status;
      if (eff.legal.sentenceYears != null) legal.sentenceYearsRemaining = Math.max(0, eff.legal.sentenceYears);
      if (eff.legal.charge) legal.charges.push({ ...eff.legal.charge, id: `charge_${s.nextId++}`, year: s.world.currentYear, resolved: false, victimIds: [...eff.legal.charge.victimIds], witnessIds: [...eff.legal.charge.witnessIds] });
    }
  }
  if (eff.faction) {
    const faction = s.world.factions[eff.faction.factionId];
    if (faction) {
      if (eff.faction.influence != null) faction.influence = clamp(faction.influence + eff.faction.influence);
      if (eff.faction.playerStanding != null) faction.playerStanding = clamp(faction.playerStanding + eff.faction.playerStanding, -100, 100);
      if (eff.faction.pressure) faction.activePressure = eff.faction.pressure;
    }
  }
  if (eff.householdState) {
    const playerHouseholdId = s.world.characters[s.playerCharacterId]?.householdId;
    const household = s.world.households.find((item) => item.id === (eff.householdState!.householdId ?? playerHouseholdId));
    if (household) {
      if (eff.householdState.wealth != null) household.wealth = Math.max(0, household.wealth + eff.householdState.wealth);
      if (eff.householdState.food != null) household.storedFood = clamp((household.storedFood ?? 50) + eff.householdState.food);
      if (eff.householdState.quality != null) household.residenceQuality = clamp((household.residenceQuality ?? 50) + eff.householdState.quality);
      if (eff.householdState.capacity != null) household.capacity = Math.max(1, (household.capacity ?? 4) + eff.householdState.capacity);
      if (eff.householdState.status != null) household.status = clamp((household.status ?? 50) + eff.householdState.status);
    }
  }
  if (eff.createSecret) {
    const character = s.world.characters[resolveCharacterId(eff.createSecret.targetId)];
    if (character) {
      character.secrets ??= [];
      character.secrets.push({ id: `secret_${s.nextId++}`, type: eff.createSecret.type, knownByIds: [...(eff.createSecret.knownByIds ?? [])], revealed: false, severity: clamp(eff.createSecret.severity), createdYear: s.world.currentYear });
      character.secret = eff.createSecret.type;
      character.secretRevealed = false;
    }
  }
  if (eff.expectChild) {
    const player = s.world.characters[s.playerCharacterId];
    const spouseId = player?.spouseId;
    const parentIds = eff.expectChild.parentIds?.map((id) => resolveCharacterId(id)) ?? [s.playerCharacterId, ...(spouseId ? [spouseId] : [])];
    const householdId = player?.householdId ?? 'house_player';
    const familyId = player?.birthFamilyId ?? 'family_0';
    if (parentIds.length && !s.world.expectedChildren.some((child) => child.status === 'expected' && child.parentIds.some((id) => parentIds.includes(id)))) {
      s.world.expectedChildren.push({ id: `expected_${s.nextId++}`, parentIds, route: eff.expectChild.route, dueYear: s.world.currentYear + (eff.expectChild.dueInYears ?? 1), householdId, familyId, status: 'expected', sourceChoiceId: s.pendingEvent?.eventId });
    }
  }

  // --- death (handled last so any stat/gold context is already applied) ---
  if (eff.death && !s.settings.liveForever) {
    killPlayer(s, eff.death);
  }

  return s;
}

export function killPlayer(s: GameState, cause: string): GameState {
  if (s.dead) return s;
  s.dead = true;
  s.deathCause = cause;
  return s;
}

/** Convenience used by the death screen / legacy summary. */
export function legacyScore(s: GameState): number {
  const statSum = s.stats.health + s.stats.charm + s.stats.wits + s.stats.faith;
  const professionalLegacy = Math.max(0, ...Object.values(s.world.characters[s.playerCharacterId].professionalHistory ?? {}).map(r => Math.max(0, r.reputation) * 4 + Math.min(8, r.milestones.length) * 35 + r.matters.filter(m => m.resolved).length * 40));
  return Math.round(professionalLegacy + s.rankIdx * 120 + s.gold * 2 + statSum + s.reputation + s.memories.length * 4);
}

export { pushFeed };
