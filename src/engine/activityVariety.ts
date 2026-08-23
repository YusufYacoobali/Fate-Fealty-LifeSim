import { FactionKey, GameState, LifeRole, PathKey, StatKey, WorldConditionKey } from '@/types/game';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';

/**
 * Routine activities are useful, but doing the exact same thing all year should
 * not be the strongest way to play. High-risk and strongly chance-driven actions
 * keep their own risk/reward curve instead.
 */
const ROUTINE_ACTIVITIES = new Set([
  'tavern',
  'feast',
  'fair',
  'fields',
  'blacksmith',
  'market',
  'church',
  'pilgrimage',
  'train',
  'leech',
  'bathhouse',
  'herbalist',
  'village_service',
  'gather_fuel',
  'manage_workshop',
  'guild_bargain',
  'copy_manuscript',
  'lead_patrol',
  'drill_levy',
  'hear_petitions',
  'hold_council',
  'royal_audience',
  'teach_child',
  'care_relative',
  'rest',
  'treat_patient',
  'study_trade',
  'seek_patron',
  'repair_household',
  'manage_stores',
]);

export const MAX_ROUTINE_ACTIVITY_USES = 5;

type HoldingSnapshot = { stores: number; security: number; loyalty: number };
type OccupationSnapshot = { experience: number; performance: number; guildStanding: number };
type HouseholdSnapshot = { wealth: number; food: number; quality: number; capacity: number; status: number };
type CharacterSnapshot = {
  stats: Record<StatKey, number>;
  rel: number;
  childInvestment: number;
  childFavour: number;
  healthConditions: Record<string, number>;
  suspicion: number;
  notoriety: number;
};
type RelationshipSnapshot = {
  aToB: { affinity: number; trust: number; respect: number; attraction: number };
  bToA: { affinity: number; trust: number; respect: number; attraction: number };
};

export interface ActivityRewardSnapshot {
  gold: number;
  rankProgress: number;
  reputation: number;
  stats: Record<StatKey, number>;
  paths: Record<PathKey, number>;
  holding: HoldingSnapshot;
  income: number;
  occupation: OccupationSnapshot;
  roleProgress: Record<string, number>;
  conditions: Record<WorldConditionKey, number>;
  factions: Record<FactionKey, number>;
  families: Record<string, number>;
  households: Record<string, HouseholdSnapshot>;
  characters: Record<string, CharacterSnapshot>;
  relationships: Record<string, RelationshipSnapshot>;
}

export function captureActivityRewards(s: GameState): ActivityRewardSnapshot {
  return {
    gold: s.gold,
    rankProgress: s.rankProgress,
    reputation: s.reputation,
    stats: { ...s.stats },
    paths: { ...s.paths },
    holding: {
      stores: s.holding.stores,
      security: s.holding.security,
      loyalty: s.holding.loyalty,
    },
    income: s.income,
    occupation: {
      experience: s.occupation.experience,
      performance: s.occupation.performance,
      guildStanding: s.occupation.guildStanding ?? 0,
    },
    roleProgress: { ...s.playerRun.roleProgress },
    conditions: { ...s.world.conditions },
    factions: Object.fromEntries(
      Object.entries(s.world.factions).map(([id, faction]) => [id, faction.playerStanding]),
    ) as Record<FactionKey, number>,
    families: Object.fromEntries(
      Object.entries(s.world.families).map(([id, family]) => [id, family.reputation]),
    ),
    households: Object.fromEntries(s.world.households.map((household) => [household.id, {
      wealth: household.wealth,
      food: household.storedFood ?? 50,
      quality: household.residenceQuality ?? 50,
      capacity: household.capacity ?? 4,
      status: household.status ?? 50,
    }])),
    characters: Object.fromEntries(Object.entries(s.world.characters).map(([id, character]) => [id, {
      stats: { ...character.stats },
      rel: character.rel,
      childInvestment: character.childDevelopment?.investment ?? 0,
      childFavour: character.childDevelopment?.favour ?? 0,
      healthConditions: Object.fromEntries((character.healthConditions ?? []).map((condition) => [condition.id, condition.severity])),
      suspicion: character.legalState?.suspicion ?? 0,
      notoriety: character.legalState?.notoriety ?? 0,
    }])),
    relationships: Object.fromEntries(Object.entries(s.world.relationships).map(([id, relationship]) => [id, {
      aToB: { ...relationship.aToB },
      bToA: { ...relationship.bToA },
    }])),
  };
}

function rewardMultiplier(use: number): number {
  if (use <= 2) return 1;
  if (use === 3) return 0.75;
  if (use === 4) return 0.5;
  return 0.25;
}

function trimIncrease(before: number, after: number, multiplier: number): number {
  if (after <= before) return after;
  return before + Math.round((after - before) * multiplier);
}

function trimDecrease(before: number, after: number, multiplier: number): number {
  if (after >= before) return after;
  return before - Math.round((before - after) * multiplier);
}

function useKey(s: GameState, id: string): string {
  return `activity-year:${s.age}:${id}`;
}

export function isRoutineActivity(id: string): boolean {
  return ROUTINE_ACTIVITIES.has(id);
}

export function routineActivityUseCount(s: GameState, id: string): number {
  return ROUTINE_ACTIVITIES.has(id) ? (s.world.repetitionLedger[useKey(s, id)] ?? 0) : 0;
}

export function routineActivityAvailable(s: GameState, id: string): boolean {
  return !ROUTINE_ACTIVITIES.has(id) || routineActivityUseCount(s, id) < MAX_ROUTINE_ACTIVITY_USES;
}

/** Keep only this year's activity counters so the persistent ledger stays tiny. */
function pruneOldActivityUses(s: GameState): void {
  const currentPrefix = `activity-year:${s.age}:`;
  for (const key of Object.keys(s.world.repetitionLedger)) {
    if (key.startsWith('activity-year:') && !key.startsWith(currentPrefix)) delete s.world.repetitionLedger[key];
  }
}

const LOWER_IS_BETTER = new Set<WorldConditionKey>(['warThreat', 'diseasePressure', 'religiousTension']);

function trimConnectedRewards(s: GameState, before: ActivityRewardSnapshot, multiplier: number): void {
  const originalGold = s.gold;
  s.gold = trimIncrease(before.gold, s.gold, multiplier);
  const goldTrimmed = Math.max(0, originalGold - s.gold);
  if (goldTrimmed > 0) s.income = Math.max(before.income, s.income - goldTrimmed);

  s.rankProgress = trimIncrease(before.rankProgress, s.rankProgress, multiplier);
  s.reputation = trimIncrease(before.reputation, s.reputation, multiplier);

  (Object.keys(before.stats) as StatKey[]).forEach((key) => {
    s.stats[key] = trimIncrease(before.stats[key], s.stats[key], multiplier);
  });
  (Object.keys(before.paths) as PathKey[]).forEach((key) => {
    s.paths[key] = trimIncrease(before.paths[key], s.paths[key], multiplier);
  });
  s.holding.stores = trimIncrease(before.holding.stores, s.holding.stores, multiplier);
  s.holding.security = trimIncrease(before.holding.security, s.holding.security, multiplier);
  s.holding.loyalty = trimIncrease(before.holding.loyalty, s.holding.loyalty, multiplier);

  s.occupation.experience = trimIncrease(before.occupation.experience, s.occupation.experience, multiplier);
  s.occupation.performance = trimIncrease(before.occupation.performance, s.occupation.performance, multiplier);
  if (s.occupation.guildStanding != null) {
    s.occupation.guildStanding = trimIncrease(before.occupation.guildStanding, s.occupation.guildStanding, multiplier);
  }

  for (const [roleKey, value] of Object.entries(s.playerRun.roleProgress)) {
    const role = roleKey as LifeRole;
    s.playerRun.roleProgress[role] = trimIncrease(before.roleProgress[role] ?? 0, value, multiplier);
  }

  (Object.keys(before.conditions) as WorldConditionKey[]).forEach((key) => {
    s.world.conditions[key] = LOWER_IS_BETTER.has(key)
      ? trimDecrease(before.conditions[key], s.world.conditions[key], multiplier)
      : trimIncrease(before.conditions[key], s.world.conditions[key], multiplier);
  });

  (Object.keys(before.factions) as FactionKey[]).forEach((id) => {
    s.world.factions[id].playerStanding = trimIncrease(before.factions[id], s.world.factions[id].playerStanding, multiplier);
  });

  for (const [id, reputation] of Object.entries(before.families)) {
    const family = s.world.families[id];
    if (family) family.reputation = trimIncrease(reputation, family.reputation, multiplier);
  }

  for (const [id, snapshot] of Object.entries(before.households)) {
    const household = s.world.households.find((item) => item.id === id);
    if (!household) continue;
    household.wealth = trimIncrease(snapshot.wealth, household.wealth, multiplier);
    household.storedFood = trimIncrease(snapshot.food, household.storedFood ?? snapshot.food, multiplier);
    household.residenceQuality = trimIncrease(snapshot.quality, household.residenceQuality ?? snapshot.quality, multiplier);
    household.capacity = trimIncrease(snapshot.capacity, household.capacity ?? snapshot.capacity, multiplier);
    household.status = trimIncrease(snapshot.status, household.status ?? snapshot.status, multiplier);
  }

  for (const [id, snapshot] of Object.entries(before.characters)) {
    const character = s.world.characters[id];
    if (!character) continue;
    (Object.keys(snapshot.stats) as StatKey[]).forEach((key) => {
      character.stats[key] = trimIncrease(snapshot.stats[key], character.stats[key], multiplier);
    });
    character.rel = trimIncrease(snapshot.rel, character.rel, multiplier);
    if (character.childDevelopment) {
      character.childDevelopment.investment = trimIncrease(snapshot.childInvestment, character.childDevelopment.investment, multiplier);
      character.childDevelopment.favour = trimIncrease(snapshot.childFavour, character.childDevelopment.favour, multiplier);
    }
    for (const condition of character.healthConditions ?? []) {
      const severity = snapshot.healthConditions[condition.id];
      if (severity != null) condition.severity = trimDecrease(severity, condition.severity, multiplier);
    }
    if (character.legalState) {
      character.legalState.suspicion = trimDecrease(snapshot.suspicion, character.legalState.suspicion, multiplier);
      character.legalState.notoriety = trimDecrease(snapshot.notoriety, character.legalState.notoriety, multiplier);
    }
  }

  for (const [id, snapshot] of Object.entries(before.relationships)) {
    const relationship = s.world.relationships[id];
    if (!relationship) continue;
    for (const key of ['affinity', 'trust', 'respect', 'attraction'] as const) {
      relationship.aToB[key] = trimIncrease(snapshot.aToB[key], relationship.aToB[key], multiplier);
      relationship.bToA[key] = trimIncrease(snapshot.bToA[key], relationship.bToA[key], multiplier);
    }
  }
}

/**
 * Apply diminishing returns only to beneficial movement. Costs, wounds, lost
 * standing and other bad consequences are never softened by repetition.
 */
export function applyActivityDiminishingReturns(
  s: GameState,
  id: string,
  before: ActivityRewardSnapshot,
): GameState {
  if (!ROUTINE_ACTIVITIES.has(id) || s.dead) return s;

  pruneOldActivityUses(s);
  const key = useKey(s, id);
  const use = (s.world.repetitionLedger[key] ?? 0) + 1;
  s.world.repetitionLedger[key] = use;
  const multiplier = rewardMultiplier(use);
  if (multiplier >= 1) return s;

  trimConnectedRewards(s, before, multiplier);

  if (use === 3) {
    pushFeed(
      s,
      'FAMILIAR GROUND',
      C.amber,
      'The work still serves thee, but repetition has begun charging rent. A different use of the year may teach more.',
      'plain',
    );
  } else if (use === MAX_ROUTINE_ACTIVITY_USES) {
    pushFeed(
      s,
      'ENOUGH FOR ONE YEAR',
      C.amber,
      'Even the village has noticed. Thou hast wrung nearly all the profit from this pursuit; another road may prove kinder.',
      'plain',
    );
  }

  return s;
}
