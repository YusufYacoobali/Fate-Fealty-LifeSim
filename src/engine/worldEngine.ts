import { professionalRecord } from './careerSpecializationEngine';
import { grantSkillXp } from './rpgProgress';
import { GameState, KinMember, Relationship, RelationshipPerspective } from '@/types/game';
import { CAREERS, careerById } from '@/data/careers';
import { chance, clamp, pick, rnd } from './random';
import { addTag, pushFeed } from './gameState';
import { spawnKin } from './kinFactory';
import { maybeCreateNpcProposal } from './relationshipEngine';
import { C } from '@/theme/theme';
import { unlinkSpouse } from './characterState';

function view(value: number, attraction = 0): RelationshipPerspective {
  return { affinity: value, trust: value, respect: value, attraction };
}

function npcRelationship(state: GameState, a: KinMember, b: KinMember): Relationship {
  let relationship = Object.values(state.world.relationships).find(
    (item) => (item.aId === a.id && item.bId === b.id) || (item.aId === b.id && item.bId === a.id),
  );
  if (!relationship) {
    const base = rnd(35, 65);
    relationship = {
      id: `rel_${a.id}_${b.id}`,
      aId: a.id,
      bId: b.id,
      aToB: view(base),
      bToA: view(base),
      flags: [],
      lastInteractionAge: state.age,
      interactionsThisYear: 0,
      sharedMemories: [],
    };
    state.world.relationships[relationship.id] = relationship;
  }
  return relationship;
}

/**
 * How many of the village's working lives get narrated in a single year.
 *
 * Everyone's career is still simulated; this only limits how much of it reaches
 * the feed. Thirty-odd NPCs each promoting or taking work produced a wall of
 * "so-and-so rises from X to Y" that buried the player's own year.
 */
export const WORLD_CAREER_REPORTS_PER_YEAR = 2;

function promoteNpc(state: GameState, npc: KinMember, budget: { left: number }): boolean {
  const career = careerById(npc.occupation.careerId);
  if (!career?.promotesTo || npc.occupation.experience < 55 || !chance(0.18)) return false;
  const next = careerById(career.promotesTo)!;
  if (npc.age < next.minAge) return false;
  npc.occupation = { careerId: next.id, experience: 10, performance: 55, workedThisYear: 0 };
  npc.role = next.title;
  if (budget.left > 0) {
    budget.left -= 1;
    pushFeed(state, 'WORLD · CAREER', C.blue, `${npc.name} rises from ${career.title} to ${next.title}.`, 'good', {}, npc.id, 'npc');
  }
  return true;
}

function simulateNpcCareer(state: GameState, npc: KinMember, budget: { left: number }): void {
  let career = careerById(npc.occupation.careerId);
  if (career && npc.age < career.minAge) { npc.occupation = { careerId:null,experience:0,performance:50,workedThisYear:0 }; career = undefined; }
  if (!career && npc.age >= 8) {
    const possible = CAREERS.filter((item) => item.tier === 0 && npc.age >= item.minAge);
    if (possible.length) {
      career = pick(possible);
      npc.occupation = { careerId: career.id, experience: 0, performance: 50, workedThisYear: 0 };
      npc.role = career.title;
      if (budget.left > 0) {
        budget.left -= 1;
        pushFeed(state, 'WORLD · WORK', C.blue, `${npc.name} begins work as ${career.title}.`, 'plain', {}, npc.id, 'npc');
      }
    }
  }
  if (!career) return;
  const record = professionalRecord(npc, career.family);
  if (record.lastWorkedYear !== state.world.currentYear) {
    record.lastWorkedYear = state.world.currentYear; record.reputation = clamp(record.reputation + 1, -100, 100); record.shifts = (record.shifts ?? 0) + 1;
    if (record.shifts >= 8 && !record.milestones.includes('field_training')) record.milestones.push('field_training');
    grantSkillXp(state, career.family === 'martial' ? 'arms' : career.family === 'craft' ? 'craftsmanship' : career.family === 'agriculture' ? 'husbandry' : 'scholarship', 4, 'professional service', npc.id);
  }
  const workActions = rnd(5, 12);
  npc.gold += workActions * career.wage;
  npc.gold = Math.max(0, npc.gold - Math.max(2, 1 + npc.rankIdx * 2 + Math.floor(npc.age / 25)));
  npc.occupation.experience += workActions * 2;
  npc.occupation.performance = clamp(npc.occupation.performance + rnd(-3, 7));
  if (career.healthRisk && chance(career.healthRisk / 35)) npc.stats.health = clamp(npc.stats.health - rnd(2, 8));
  if (npc.stats.health <= 0) {
    unlinkSpouse(state, npc.id);
    npc.alive = false;
    npc.deathYear = state.world.currentYear;
    npc.healthTags.push('died_from_health');
    pushFeed(state, 'WORLD · DEATH', C.bad, `${npc.name} dies after a long decline in health. Their place in Swineford will not be filled quickly.`, 'bad', {}, npc.id, 'npc');
    return;
  }
  promoteNpc(state, npc, budget);
}

function simulateNpcSocialLife(state: GameState): void {
  const adults = Object.values(state.world.characters).filter((npc) => npc.id !== state.playerCharacterId && npc.alive && npc.age >= 18 && npc.kind !== 'spouse' && npc.id !== 'goose');
  if (adults.length < 2) return;
  for (let i = 0; i < Math.min(5, adults.length); i++) {
    const a = pick(adults);
    const b = pick(adults.filter((npc) => npc.id !== a.id));
    const relation = npcRelationship(state, a, b);
    relation.interactionsThisYear += 1;
    if (chance(0.45)) {
      relation.aToB.affinity = clamp(relation.aToB.affinity + rnd(2, 8));
      relation.bToA.affinity = clamp(relation.bToA.affinity + rnd(2, 8));
      relation.aToB.trust = clamp(relation.aToB.trust + 3);
      relation.bToA.trust = clamp(relation.bToA.trust + 3);
      if (relation.aToB.affinity >= 70 && !relation.flags.includes('friend')) {
        relation.flags.push('friend');
        pushFeed(state, 'WORLD · FRIENDSHIP', C.good, `${a.name} and ${b.name} have become close friends.`, 'good', {}, a.id, 'npc');
      }
    } else {
      relation.aToB.affinity = clamp(relation.aToB.affinity - rnd(2, 9));
      relation.bToA.affinity = clamp(relation.bToA.affinity - rnd(2, 9));
      if (relation.aToB.affinity <= 25 && !relation.flags.includes('rival')) {
        relation.flags.push('rival');
        pushFeed(state, 'WORLD · FEUD', C.bad, `${a.name} and ${b.name} begin a quarrel that neither can now explain briefly.`, 'bad', {}, a.id, 'npc');
      }
    }
  }

  if (!chance(0.16)) return;
  const singles = adults.filter((npc) => !npc.spouseId && !Object.values(state.world.relationships).some((rel) => rel.flags.includes('spouse') && (rel.aId === npc.id || rel.bId === npc.id)));
  if (singles.length < 2) return;
  const a = pick(singles);
  const b = pick(singles.filter((npc) => npc.id !== a.id));
  const relation = npcRelationship(state, a, b);
  relation.flags = relation.flags.filter((flag) => flag !== 'rival' && flag !== 'feud');
  relation.flags.push('spouse', 'family');
  relation.aToB = { affinity: 75, trust: 68, respect: 62, attraction: 72 };
  relation.bToA = { affinity: 75, trust: 68, respect: 62, attraction: 72 };
  a.spouseId = b.id;
  b.spouseId = a.id;
  const sharedHouseholdId = a.householdId ?? b.householdId ?? `house_${a.id}`;
  let sharedHousehold = state.world.households.find((household) => household.id === sharedHouseholdId);
  if (!sharedHousehold) {
    sharedHousehold = { id: sharedHouseholdId, headId: a.id, memberIds: [], wealth: a.gold + b.gold, foodSecurity: 50, status: 40, residenceQuality: 45, capacity: 4, storedFood: 50 };
    state.world.households.push(sharedHousehold);
  }
  for (const household of state.world.households) household.memberIds = household.memberIds.filter((id) => id !== b.id || household.id === sharedHouseholdId);
  sharedHousehold.memberIds = Array.from(new Set([...sharedHousehold.memberIds, a.id, b.id]));
  a.householdId = sharedHouseholdId;
  b.householdId = sharedHouseholdId;
  addTag(state, 'witnessed_world_wedding');
  pushFeed(state, 'WORLD · WEDDING', C.healthDark, `${a.name} and ${b.name} marry. Half the village attends; the other half supplies opinions.`, 'good', {}, a.id, 'npc');

  const livingPopulation = Object.values(state.world.characters).filter((npc) => npc.alive).length;
  if (livingPopulation < 45 && chance(0.28)) {
    const child = spawnKin(state, { kind: 'acquaintance', age: 0, role: `Child of ${a.name} and ${b.name}`, rel: 50 });
    const generatedHouseholdId = child.householdId;
    const generatedFamilyId = child.birthFamilyId;
    child.householdId = sharedHouseholdId;
    child.birthFamilyId = a.birthFamilyId ?? generatedFamilyId;
    child.parentIds = [a.id, b.id];
    a.childIds = Array.from(new Set([...(a.childIds ?? []), child.id]));
    b.childIds = Array.from(new Set([...(b.childIds ?? []), child.id]));
    for (const household of state.world.households) household.memberIds = household.memberIds.filter((id) => id !== child.id || household.id === sharedHouseholdId);
    sharedHousehold.memberIds = Array.from(new Set([...sharedHousehold.memberIds, child.id]));
    if (child.birthFamilyId) state.world.families[child.birthFamilyId].memberIds = Array.from(new Set([...state.world.families[child.birthFamilyId].memberIds, child.id]));
    if (generatedFamilyId && generatedFamilyId !== child.birthFamilyId) {
      state.world.families[generatedFamilyId].memberIds = state.world.families[generatedFamilyId].memberIds.filter((id) => id !== child.id);
      if (!state.world.families[generatedFamilyId].memberIds.length) delete state.world.families[generatedFamilyId];
    }
    if (generatedHouseholdId && generatedHouseholdId !== sharedHouseholdId) {
      const generatedHousehold = state.world.households.find((household) => household.id === generatedHouseholdId);
      if (generatedHousehold && !generatedHousehold.memberIds.length) state.world.households = state.world.households.filter((household) => household.id !== generatedHouseholdId);
    }
    addTag(state, 'witnessed_world_birth');
    pushFeed(state, 'WORLD · BIRTH', C.good, `${a.name} and ${b.name} welcome ${child.name} into the world.`, 'good', {}, child.id, 'npc');
  }
}

export function simulateLivingWorld(state: GameState): GameState {
  const careerReports = { left: WORLD_CAREER_REPORTS_PER_YEAR };
  for (const npc of Object.values(state.world.characters)) {
    if (npc.id === state.playerCharacterId) continue;
    if (!npc.alive || npc.id === 'goose') continue;
    simulateNpcCareer(state, npc, careerReports);
  }
  simulateNpcSocialLife(state);
  // Keep Swineford populous without despawning anyone. When deaths pull the
  // living registry below its target band, a small number of newcomers arrive;
  // normal marriage/birth simulation remains the long-term organic source.
  let livingPopulation = Object.values(state.world.characters).filter((character) => character.alive).length;
  const arrivals = livingPopulation < 36 ? Math.min(3, 36 - livingPopulation) : 0;
  for (let index = 0; index < arrivals; index++) {
    if (!chance(0.9)) continue;
    const newcomer = spawnKin(state, { kind: 'acquaintance', age: rnd(16, 38), role: 'A Newcomer to Swineford', rel: rnd(38, 55) });
    newcomer.importance = 'background';
    livingPopulation += 1;
    pushFeed(state, 'WORLD · ARRIVAL', C.blue, `${newcomer.name} settles in Swineford seeking work and a safer roof.`, 'plain', {}, newcomer.id, 'npc');
  }
  maybeCreateNpcProposal(state);
  return state;
}
