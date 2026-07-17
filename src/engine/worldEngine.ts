import { GameState, KinMember, Relationship, RelationshipPerspective } from '@/types/game';
import { CAREERS, careerById } from '@/data/careers';
import { chance, clamp, pick, rnd } from './random';
import { addTag, pushFeed } from './gameState';
import { spawnKin } from './kinFactory';
import { maybeCreateNpcProposal } from './relationshipEngine';
import { C } from '@/theme/theme';

function view(value: number, attraction = 0): RelationshipPerspective {
  return { affinity: value, trust: value, respect: value, attraction };
}

function npcRelationship(state: GameState, a: KinMember, b: KinMember): Relationship {
  let relationship = state.world.relationships.find(
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
    state.world.relationships.push(relationship);
  }
  return relationship;
}

function promoteNpc(state: GameState, npc: KinMember): boolean {
  const career = careerById(npc.occupation.careerId);
  if (!career?.promotesTo || npc.occupation.experience < 55 || !chance(0.18)) return false;
  const next = careerById(career.promotesTo)!;
  npc.occupation = { careerId: next.id, experience: 10, performance: 55, workedThisYear: 0 };
  npc.role = next.title;
  pushFeed(state, 'WORLD · CAREER', C.blue, `${npc.name} rises from ${career.title} to ${next.title}.`, 'good', {}, npc.id, 'npc');
  return true;
}

function simulateNpcCareer(state: GameState, npc: KinMember): void {
  let career = careerById(npc.occupation.careerId);
  if (!career && npc.age >= 8) {
    const possible = CAREERS.filter((item) => item.tier === 0 && npc.age >= item.minAge);
    if (possible.length) {
      career = pick(possible);
      npc.occupation = { careerId: career.id, experience: 0, performance: 50, workedThisYear: 0 };
      npc.role = career.title;
      pushFeed(state, 'WORLD · WORK', C.blue, `${npc.name} begins work as ${career.title}.`, 'plain', {}, npc.id, 'npc');
    }
  }
  if (!career) return;
  const workActions = rnd(5, 12);
  npc.gold += workActions * career.wage;
  npc.gold = Math.max(0, npc.gold - Math.max(2, 1 + npc.rankIdx * 2 + Math.floor(npc.age / 25)));
  npc.occupation.experience += workActions * 2;
  npc.occupation.performance = clamp(npc.occupation.performance + rnd(-3, 7));
  if (career.healthRisk && chance(career.healthRisk / 35)) npc.stats.health = clamp(npc.stats.health - rnd(2, 8));
  if (npc.stats.health <= 0) {
    npc.alive = false;
    npc.healthTags.push('died_from_health');
    pushFeed(state, 'WORLD · DEATH', C.bad, `${npc.name} dies after a long decline in health. Their place in Swineford will not be filled quickly.`, 'bad', {}, npc.id, 'npc');
    return;
  }
  promoteNpc(state, npc);
}

function simulateNpcSocialLife(state: GameState): void {
  const adults = state.kin.filter((npc) => npc.alive && npc.age >= 18 && npc.kind !== 'spouse' && npc.id !== 'goose');
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
  const singles = adults.filter((npc) => !state.world.relationships.some((rel) => rel.flags.includes('spouse') && (rel.aId === npc.id || rel.bId === npc.id)));
  if (singles.length < 2) return;
  const a = pick(singles);
  const b = pick(singles.filter((npc) => npc.id !== a.id));
  const relation = npcRelationship(state, a, b);
  relation.flags = relation.flags.filter((flag) => flag !== 'rival' && flag !== 'feud');
  relation.flags.push('spouse', 'family');
  relation.aToB = { affinity: 75, trust: 68, respect: 62, attraction: 72 };
  relation.bToA = { affinity: 75, trust: 68, respect: 62, attraction: 72 };
  addTag(state, 'witnessed_world_wedding');
  pushFeed(state, 'WORLD · WEDDING', C.healthDark, `${a.name} and ${b.name} marry. Half the village attends; the other half supplies opinions.`, 'good', {}, a.id, 'npc');

  if (state.kin.filter((npc) => npc.alive).length < 30 && chance(0.28)) {
    const child = spawnKin(state, { kind: 'acquaintance', age: 0, role: `Child of ${a.name} and ${b.name}`, rel: 50 });
    child.householdId = `house_${a.id}`;
    addTag(state, 'witnessed_world_birth');
    pushFeed(state, 'WORLD · BIRTH', C.good, `${a.name} and ${b.name} welcome ${child.name} into the world.`, 'good', {}, child.id, 'npc');
  }
}

export function simulateLivingWorld(state: GameState): GameState {
  for (const npc of state.kin) {
    if (!npc.alive || npc.id === 'goose') continue;
    simulateNpcCareer(state, npc);
  }
  simulateNpcSocialLife(state);
  maybeCreateNpcProposal(state);
  return state;
}
