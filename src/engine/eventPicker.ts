/**
 * Event picker. Evaluates conditions and selects the next main event for the
 * year from the content banks, respecting age range, path, rank, tags, stats,
 * reputation, once-per-life flags, and weighting.
 */

import { Choice, Condition, ContentDomain, EventActorRole, GameEvent, GameState, KinKind, PathKey, STAT_KEYS } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { ALL_EVENTS, DOMAIN_EVENT_COUNTS, EVENTS_BY_ID } from '@/content';
import { countLivingKin, hasLivingKin } from './gameState';
import { dominantPath } from './pathProgression';
import { pick, pickWeighted } from './random';
import { deriveLifeRole } from '@/content/persistentStories';
import { MAX_OPEN_THREADS, noteChainBeatResolved, openThreads } from './director/threads';

export function meetsCondition(s: GameState, c?: Condition): boolean {
  if (!c) return true;
  if (c.minAge != null && s.age < c.minAge) return false;
  if (c.maxAge != null && s.age > c.maxAge) return false;
  if (c.minGold != null && s.gold < c.minGold) return false;
  if (c.maxGold != null && s.gold > c.maxGold) return false;
  if (c.rankAtLeast != null && s.rankIdx < c.rankAtLeast) return false;
  if (c.rankAtMost != null && s.rankIdx > c.rankAtMost) return false;
  if (c.minReputation != null && s.reputation < c.minReputation) return false;
  if (c.maxReputation != null && s.reputation > c.maxReputation) return false;

  if (c.statAtLeast) {
    for (const k of STAT_KEYS) {
      const v = c.statAtLeast[k];
      if (v != null && s.stats[k] < v) return false;
    }
  }
  if (c.statAtMost) {
    for (const k of STAT_KEYS) {
      const v = c.statAtMost[k];
      if (v != null && s.stats[k] > v) return false;
    }
  }
  if (c.hasTags) {
    for (const t of c.hasTags) if (!s.tags.includes(t)) return false;
  }
  if (c.missingTags) {
    for (const t of c.missingTags) if (s.tags.includes(t)) return false;
  }
  if (c.hasTraits) {
    for (const t of c.hasTraits) if (!s.traits.includes(t)) return false;
  }
  if (c.pathAtLeast) {
    for (const key of Object.keys(c.pathAtLeast) as PathKey[]) {
      const v = c.pathAtLeast[key];
      if (v != null && s.paths[key] < v) return false;
    }
  }
  if (c.holdingAtLeast) {
    for (const key of ['stores', 'security', 'loyalty'] as const) {
      const v = c.holdingAtLeast[key];
      if (v != null && s.holding[key] < v) return false;
    }
  }
  if (c.holdingAtMost) {
    for (const key of ['stores', 'security', 'loyalty'] as const) {
      const v = c.holdingAtMost[key];
      if (v != null && s.holding[key] > v) return false;
    }
  }
  if (c.hasKinOfKind) {
    for (const kind of c.hasKinOfKind) {
      if (!hasLivingKin(s, kind)) return false;
    }
  }
  if (c.kinCountAtMost) {
    for (const kind of Object.keys(c.kinCountAtMost) as KinKind[]) {
      const cap = c.kinCountAtMost[kind];
      if (cap != null && countLivingKin(s, kind) > cap) return false;
    }
  }
  if (c.roles && !c.roles.includes(deriveLifeRole(s))) return false;
  if (c.worldAtLeast) for (const [key, value] of Object.entries(c.worldAtLeast)) if (value != null && s.world.conditions[key as keyof typeof s.world.conditions] < value) return false;
  if (c.worldAtMost) for (const [key, value] of Object.entries(c.worldAtMost)) if (value != null && s.world.conditions[key as keyof typeof s.world.conditions] > value) return false;
  const player = s.world.characters[s.playerCharacterId];
  const healthIds = new Set((player?.healthConditions ?? []).map((item) => item.conditionId));
  if (c.hasHealthCondition?.some((id) => !healthIds.has(id))) return false;
  if (c.missingHealthCondition?.some((id) => healthIds.has(id))) return false;
  if (c.legalStatuses && !c.legalStatuses.includes(player?.legalState?.status ?? 'free')) return false;
  if (c.suspicionAtLeast != null && (player?.legalState?.suspicion ?? 0) < c.suspicionAtLeast) return false;
  if (c.factionStandingAtLeast) for (const [key, value] of Object.entries(c.factionStandingAtLeast)) if (value != null && s.world.factions[key as keyof typeof s.world.factions].playerStanding < value) return false;
  if (c.householdAtLeast) {
    const household = s.world.households.find((item) => item.id === player?.householdId);
    if (!household) return false;
    if (c.householdAtLeast.wealth != null && household.wealth < c.householdAtLeast.wealth) return false;
    if (c.householdAtLeast.food != null && (household.storedFood ?? 0) < c.householdAtLeast.food) return false;
    if (c.householdAtLeast.quality != null && (household.residenceQuality ?? 0) < c.householdAtLeast.quality) return false;
    if (c.householdAtLeast.status != null && (household.status ?? 0) < c.householdAtLeast.status) return false;
  }
  if (c.hasKnownSecret != null) {
    const hasKnown = Object.values(s.world.characters).some((character) => (character.secrets ?? []).some((secret) => secret.revealed || secret.knownByIds.includes(s.playerCharacterId)));
    if (hasKnown !== c.hasKnownSecret) return false;
  }
  if (c.hasWorldMemoryType?.some((type) => !s.world.history.some((entry) => entry.type === type || entry.causes.includes(type)))) return false;
  if (c.hasItems?.some((id) => !s.inventory.includes(id))) return false;
  if (c.missingItems?.some((id) => s.inventory.includes(id))) return false;
  if (c.custom && !c.custom(s)) return false;
  return true;
}

/** Years before the same thread may be drawn again. */
const REPETITION_GAP_YEARS = 5;

/**
 * Content the director serves on a schedule and the lottery must never offer.
 *
 * A chain continuation is a promise already made to the player. Leaving it in
 * the draw meant a one-off year could serve a mid-chain beat, so the two
 * systems fought over the same calendar and the ambient pool was crowded out.
 */
function isDirected(e: GameEvent): boolean {
  return e.arcNodeOnly || (e.chain ? e.chain.index > 0 : false);
}

/**
 * Whether this event could legally be shown right now, ignoring who is asking.
 * The director uses this to check a scheduled beat; the lottery layers its own
 * exclusions on top (see isEventEligible).
 */
export function isEventPlayable(s: GameState, e: GameEvent): boolean {
  if (e.premium && !s.lifetimeUnlocked) return false;
  if (e.once && s.firedOnce.includes(e.id)) return false;
  if (e.ageMin != null && s.age < e.ageMin) return false;
  if (e.ageMax != null && s.age > e.ageMax) return false;
  if (e.ranks && !e.ranks.includes(RANKS[s.rankIdx].key)) return false;
  if (e.paths && !e.paths.includes(dominantPath(s))) return false;
  if (!meetsCondition(s, e.requires)) return false;
  const last = s.world.contentLedger[e.id]?.lastYear;
  if (last != null && s.world.currentYear - last < (e.cooldownYears ?? 15)) return false;
  // A scheduled continuation answers to the director's own spacing, not to the
  // gate that stops one thread hogging consecutive years.
  if (!isDirected(e)) {
    const groupLast = e.repetitionGroup ? s.world.repetitionLedger[e.repetitionGroup] : undefined;
    if (groupLast != null && s.world.currentYear - groupLast < REPETITION_GAP_YEARS) return false;
  }
  if (s.world.recentNarrativeIds.slice(-12).includes(e.id)) return false;
  if (e.actorRoles && Object.values(e.actorRoles).some((role) => actorCandidates(s, role).length === 0)) return false;
  // Must have at least one selectable choice.
  return e.choices.some((ch) => isChoiceAvailable(s, ch));
}

export function isEventEligible(s: GameState, e: GameEvent): boolean {
  if (isDirected(e)) return false;
  // Opening a chain is a promise to finish it, so the lottery may not open one
  // while the board is full. Without this the cap only governed persistent
  // stories, chains piled up eleven deep, and each was served too rarely to
  // ever reach its ending.
  if (e.chain && e.chain.index === 0 && openThreads(s).length >= MAX_OPEN_THREADS) return false;
  return isEventPlayable(s, e);
}

export function isChoiceAvailable(s: GameState, ch: Choice): boolean {
  if (ch.requires && !meetsCondition(s, ch.requires)) return false;
  return true;
}

/** Whether a choice is selectable AND affordable (for UI gating). */
export function isChoiceEnabled(s: GameState, ch: Choice): boolean {
  if (!isChoiceAvailable(s, ch)) return false;
  if (ch.costGold != null && s.gold < ch.costGold) return false;
  return true;
}

/**
 * Weight an eligible event: base weight, boosted when it matches the dominant
 * path, slightly boosted when its tags resonate with the player's memories.
 *
 * Each domain's share of the year is normalised against its pool size first, so
 * a domain with sixty authored events does not drown one with thirteen. Without
 * this, adding content to a domain would silently make every other domain
 * rarer.
 */
function eventWeight(s: GameState, e: GameEvent): number {
  let w = (e.weight ?? 1) / (e.domain ? DOMAIN_EVENT_COUNTS[e.domain] || 1 : 1);
  const path = dominantPath(s);


  if (e.paths && e.paths.includes(path)) w *= 2.2;
  // Rarity thins out cold starts, not payoffs the player has already unlocked.
  if (e.rarity === 'uncommon') w *= 0.7;
  if (e.rarity === 'rare') w *= 0.35;
  if (e.domain && s.world.recentDomains.slice(-2).every((domain) => domain === e.domain)) w *= 0.08;
  if (e.domain === 'health') w *= 0.6 + s.world.conditions.diseasePressure / 70;
  if (e.domain === 'crime') w *= 0.6 + (100 - s.world.conditions.publicOrder) / 70;
  if (e.domain === 'politics') w *= 0.7 + (s.world.conditions.warThreat + s.world.conditions.religiousTension) / 160;
  if (e.domain === 'household') w *= 0.7 + (100 - s.world.conditions.foodSecurity) / 100;
  return w;
}

export function pickEvent(s: GameState): GameEvent | null {
  const eligible = ALL_EVENTS.filter((e) => isEventEligible(s, e));
  if (eligible.length === 0) return null;
  return pickWeighted(eligible, (e) => eventWeight(s, e));
}

export function eventById(id: string): GameEvent | undefined {
  return EVENTS_BY_ID[id];
}

function actorCandidates(s: GameState, role: EventActorRole) {
  return Object.values(s.world.characters).filter((character) => {
    if (role.excludePlayer !== false && character.id === s.playerCharacterId) return false;
    if (role.alive != null && character.alive !== role.alive) return false;
    if (role.minAge != null && character.age < role.minAge) return false;
    if (role.maxAge != null && character.age > role.maxAge) return false;
    if (role.kinds && !role.kinds.includes(character.kind)) return false;
    if (role.importance && !role.importance.includes(character.importance ?? 'background')) return false;
    return true;
  });
}

export function bindEventActors(s: GameState, event: GameEvent): Record<string, string> | undefined {
  if (!event.actorRoles) return undefined;
  const used = new Set<string>();
  const bindings: Record<string, string> = {};
  for (const [roleId, role] of Object.entries(event.actorRoles)) {
    const candidates = actorCandidates(s, role).filter((character) => !used.has(character.id));
    if (!candidates.length) return undefined;
    const actor = pick(candidates);
    bindings[roleId] = actor.id;
    used.add(actor.id);
  }
  return bindings;
}

export function recordEventResolution(s: GameState, event: GameEvent, choiceId: string): void {
  if (event.arcNodeOnly) return;
  noteChainBeatResolved(s, event);
  const previous = s.world.contentLedger[event.id];
  s.world.contentLedger[event.id] = { lastYear: s.world.currentYear, timesResolved: (previous?.timesResolved ?? 0) + 1, lastChoiceId: choiceId };
  if (event.repetitionGroup) s.world.repetitionLedger[event.repetitionGroup] = s.world.currentYear;
  if (event.domain) s.world.recentDomains = [...s.world.recentDomains, event.domain].slice(-6) as ContentDomain[];
  s.world.recentNarrativeIds = [...s.world.recentNarrativeIds, event.id].slice(-30);
}
