import { GameState, ExpectedChild, WorldCharacter } from '@/types/game';
import { spawnKin } from './kinFactory';
import { namesForGender } from '@/data/names';
import { chance, clamp, pick } from './random';
import { appendWorldHistory } from './worldJournal';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';

function removeFromGeneratedHome(state: GameState, child: WorldCharacter, originalFamilyId?: string, originalHouseholdId?: string): void {
  if (originalFamilyId && originalFamilyId !== child.birthFamilyId) {
    const family = state.world.families[originalFamilyId];
    if (family) {
      family.memberIds = family.memberIds.filter((id) => id !== child.id);
      if (!family.memberIds.length) delete state.world.families[originalFamilyId];
    }
  }
  if (originalHouseholdId && originalHouseholdId !== child.householdId) {
    const household = state.world.households.find((item) => item.id === originalHouseholdId);
    if (household) household.memberIds = household.memberIds.filter((id) => id !== child.id);
    state.world.households = state.world.households.filter((item) => item.id !== originalHouseholdId || item.memberIds.length > 0);
  }
}

function resolveExpectedChild(state: GameState, expected: ExpectedChild): void {
  const parents = expected.parentIds.map((id) => state.world.characters[id]).filter((parent): parent is WorldCharacter => Boolean(parent?.alive));
  if (!parents.length) {
    expected.status = 'cancelled';
    return;
  }
  // Only the controlled character's own arrivals join the player's kin roster.
  // Everyone else's children are ordinary villagers, or the player would be
  // charged upkeep for — and offered parental actions on — half of Swineford.
  const playerRaisesChild = expected.parentIds.includes(state.playerCharacterId);
  const childGender = pick(['woman', 'man'] as const);
  const child = playerRaisesChild
    ? spawnKin(state, { kind: 'child', age: 0, isHeir: true, gender: childGender })
    : spawnKin(state, {
        kind: 'acquaintance',
        age: 0,
        gender: childGender,
        name: pick(namesForGender(childGender, true)),
        role: `Child of ${parents.map((parent) => parent.name).join(' and ')}`,
        emoji: '🧒',
        rel: 50,
      });
  const generatedFamilyId = child.birthFamilyId;
  const generatedHouseholdId = child.householdId;
  const generatedParentIds = [...(child.parentIds ?? [])];
  child.parentIds = expected.route === 'wardship' ? [] : parents.map((parent) => parent.id);
  child.guardianIds = expected.route === 'wardship' ? parents.map((parent) => parent.id) : [];
  child.lineageStatus = expected.route === 'pregnancy' ? 'marital'
    : expected.route === 'illegitimate' ? 'illegitimate'
      : expected.route === 'adoption' ? 'adopted' : 'ward';
  if (expected.route === 'illegitimate') {
    child.role = 'Thy Illegitimate Child';
    child.trait = 'Born of scandal';
    child.bio = `Born to ${parents.map((parent) => parent.name).join(' and ')} outside marriage. The truth belongs to the child, whatever the village calls it.`;
    child.isHeir = false;
  }
  child.birthFamilyId = expected.route === 'wardship' ? generatedFamilyId : expected.familyId;
  child.householdId = expected.householdId;
  child.childDevelopment = { completedMilestones: [], education: 'none', investment: 0, favour: 0 };
  for (const generatedParentId of generatedParentIds) {
    if (!child.parentIds.includes(generatedParentId)) {
      const generatedParent = state.world.characters[generatedParentId];
      if (generatedParent) generatedParent.childIds = (generatedParent.childIds ?? []).filter((id) => id !== child.id);
    }
  }
  if (expected.route !== 'wardship') for (const parent of parents) parent.childIds = Array.from(new Set([...(parent.childIds ?? []), child.id]));
  const family = state.world.families[expected.familyId];
  if (family && expected.route !== 'wardship') family.memberIds = Array.from(new Set([...family.memberIds, child.id]));
  const household = state.world.households.find((item) => item.id === expected.householdId);
  if (household) household.memberIds = Array.from(new Set([...household.memberIds, child.id]));
  removeFromGeneratedHome(state, child, expected.route === 'wardship' ? undefined : generatedFamilyId, generatedHouseholdId);

  if (expected.route === 'pregnancy' || expected.route === 'illegitimate') {
    const mother = parents.find((parent) => parent.gender === 'woman');
    const food = household?.storedFood ?? household?.foodSecurity ?? 50;
    const risk = clamp(8 + state.world.conditions.diseasePressure / 5 + Math.max(0, 35 - food) / 3 + (mother && mother.age > 36 ? 8 : 0), 4, 45) / 100;
    if (mother && chance(risk)) {
      mother.stats.health = clamp(mother.stats.health - 12);
      if (mother.id === state.playerCharacterId) state.stats.health = mother.stats.health;
      mother.healthConditions ??= [];
      mother.healthConditions.push({ id: `health_${state.nextId++}`, conditionId: 'childbed_fever', kind: 'illness', severity: 42, diagnosed: false, startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear + 1, sourceId: expected.id });
    }
    if (chance(risk * 0.65)) {
      child.stats.health = clamp(child.stats.health - 20);
      child.healthConditions ??= [];
      child.healthConditions.push({ id: `health_${state.nextId++}`, conditionId: 'winter_fever', kind: 'illness', severity: 35, diagnosed: false, startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear + 1, sourceId: expected.id });
    }
  }
  expected.status = 'resolved';
  const routeText = expected.route === 'pregnancy' ? 'is born'
    : expected.route === 'illegitimate' ? 'is born outside marriage'
      : expected.route === 'adoption' ? 'is adopted into the household' : 'enters the household as a ward';
  pushFeed(state, 'WORLD · FAMILY', C.good, `${child.name} ${routeText}. The household changes around a new young life.`, 'good', {}, child.id, 'world');
  appendWorldHistory(state, { id: `history_child_${state.nextId++}`, year: state.world.currentYear, type: expected.route, participantIds: [child.id, ...parents.map((parent) => parent.id)], familyIds: Array.from(new Set([expected.familyId, child.birthFamilyId].filter((id): id is string => Boolean(id)))), causes: [expected.sourceChoiceId ?? 'family formation'], summary: `${child.name} ${routeText}.`, salience: 4 });
}

function maybeExpectCarePlacement(state: GameState): void {
  if (Object.values(state.world.characters).filter((character) => character.alive).length >= 52) return;
  const households = state.world.households.filter((household) => household.memberIds.length < (household.capacity ?? 6) && (household.foodSecurity ?? 50) >= 35 && Boolean(household.headId));
  if (!households.length || !chance(state.world.conditions.warThreat > 65 || state.world.conditions.diseasePressure > 60 ? 0.08 : 0.025)) return;
  const household = pick(households);
  const head = household.headId ? state.world.characters[household.headId] : undefined;
  if (!head?.alive || head.age < 18) return;
  const parentIds = [head.id, ...(head.spouseId && state.world.characters[head.spouseId]?.alive ? [head.spouseId] : [])];
  if (state.world.expectedChildren.some((expected) => expected.status === 'expected' && expected.parentIds.some((id) => parentIds.includes(id)))) return;
  const route: ExpectedChild['route'] = head.childIds?.length ? 'wardship' : 'adoption';
  state.world.expectedChildren.push({
    id: `expected_${state.nextId++}`, parentIds, route, dueYear: state.world.currentYear + 1,
    householdId: household.id, familyId: head.birthFamilyId ?? `family_${head.id}`, status: 'expected',
  });
}

function maybeExpectNpcChild(state: GameState): void {
  const living = Object.values(state.world.characters).filter((character) => character.alive).length;
  if (living >= 55) return;
  const mothers = Object.values(state.world.characters).filter((character) => character.alive && character.gender === 'woman' && character.age >= 18 && character.age <= 42 && character.spouseId && state.world.characters[character.spouseId]?.alive);
  for (const mother of mothers) {
    if (state.world.expectedChildren.some((expected) => expected.status === 'expected' && expected.parentIds.includes(mother.id))) continue;
    if (!chance(0.09)) continue;
    const familyId = mother.birthFamilyId ?? `family_${mother.id}`;
    const householdId = mother.householdId ?? `house_${mother.id}`;
    state.world.expectedChildren.push({ id: `expected_${state.nextId++}`, parentIds: [mother.id, mother.spouseId!], route: 'pregnancy', dueYear: state.world.currentYear + 1, householdId, familyId, status: 'expected' });
  }
}

// ---------------------------------------------------------------------------
// Player-directed family planning
// ---------------------------------------------------------------------------

/** Women bear children up to this age in the simulation. */
export const CHILDBEARING_MAX_AGE = 44;

/** Silver a household must find to take in a child of its own choosing. */
export const ADOPTION_COST = 15;

/** True when one of these people already has an arrival on the way. */
export function hasPendingArrival(state: GameState, ids: string[]): boolean {
  return state.world.expectedChildren.some((expected) => expected.status === 'expected' && expected.parentIds.some((id) => ids.includes(id)));
}

/** Whichever of the couple could carry a child, or null when neither can. */
export function childbearingPartner(state: GameState, partnerId: string): WorldCharacter | null {
  const couple = [state.world.characters[state.playerCharacterId], state.world.characters[partnerId]];
  for (const person of couple) {
    if (person?.alive && person.gender === 'woman' && person.age >= 16 && person.age <= CHILDBEARING_MAX_AGE) return person;
  }
  return null;
}

/**
 * How this couple could come by a child right now. A pregnancy when one of them
 * can carry one; otherwise the household may take in a child that needs a home,
 * which is also the only road open to a couple of the same gender.
 */
export function familyPlanningRoute(state: GameState, partnerId: string): 'pregnancy' | 'adoption' | null {
  const partner = state.world.characters[partnerId];
  if (!partner?.alive || partner.spouseId !== state.playerCharacterId) return null;
  if (state.age < 18 || partner.age < 18) return null;
  if (hasPendingArrival(state, [state.playerCharacterId, partnerId])) return null;
  return childbearingPartner(state, partnerId) ? 'pregnancy' : 'adoption';
}

/** Odds of a year of trying bearing fruit, from the mother's age and health. */
function conceptionChance(mother: WorldCharacter): number {
  const decline = Math.max(0, mother.age - 28) * 0.022;
  return Math.min(0.62, Math.max(0.07, 0.55 - decline + (mother.stats.health - 50) / 400));
}

function expectChild(state: GameState, route: ExpectedChild['route'], parents: WorldCharacter[], carrier: WorldCharacter): void {
  state.world.expectedChildren.push({
    id: `expected_${state.nextId++}`,
    parentIds: parents.map((parent) => parent.id),
    route,
    dueYear: state.world.currentYear + 1,
    householdId: carrier.householdId ?? `house_${carrier.id}`,
    familyId: carrier.birthFamilyId ?? `family_${carrier.id}`,
    status: 'expected',
    sourceChoiceId: route === 'pregnancy' ? 'try_for_child' : 'adopt_child',
  });
}

/** A secret lover may conceive, with the child retaining both true parents. */
export function tryForAffairChild(state: GameState, partnerId: string): boolean {
  const player = state.world.characters[state.playerCharacterId];
  const partner = state.world.characters[partnerId];
  const mother = childbearingPartner(state, partnerId);
  if (!player || !partner || !mother) return false;
  if (hasPendingArrival(state, [state.playerCharacterId, partnerId])) return false;
  // A single night is less deliberate than a year spent trying, but the risk
  // is substantial enough to make the choice matter.
  if (!chance(conceptionChance(mother) * 0.55)) return false;
  expectChild(state, 'illegitimate', [player, partner], mother);
  return true;
}

/**
 * A year spent trying for a child with the player's spouse. Returns whether an
 * arrival is now expected; the birth itself resolves in `tickFamilyFormation`.
 */
export function tryForChild(state: GameState, partnerId: string): boolean {
  const player = state.world.characters[state.playerCharacterId];
  const partner = state.world.characters[partnerId];
  const mother = childbearingPartner(state, partnerId);
  if (!player || !partner || !mother) return false;
  if (!chance(conceptionChance(mother))) return false;
  expectChild(state, 'pregnancy', [player, partner], mother);
  return true;
}

/**
 * Take in a child who has no household of their own. Slower and costlier than a
 * pregnancy, but open to every couple.
 */
export function adoptChild(state: GameState, partnerId: string): void {
  const player = state.world.characters[state.playerCharacterId];
  const partner = state.world.characters[partnerId];
  if (!player || !partner) return;
  state.gold -= ADOPTION_COST;
  state.expenses += ADOPTION_COST;
  expectChild(state, 'adoption', [player, partner], player);
}

export function tickFamilyFormation(state: GameState): GameState {
  for (const expected of state.world.expectedChildren.filter((item) => item.status === 'expected' && item.dueYear <= state.world.currentYear)) resolveExpectedChild(state, expected);
  state.world.expectedChildren = state.world.expectedChildren.filter((item) => item.status === 'expected' || state.world.currentYear - item.dueYear <= 5).slice(-40);
  maybeExpectNpcChild(state);
  maybeExpectCarePlacement(state);
  return state;
}
