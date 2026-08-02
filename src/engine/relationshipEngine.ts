import {
  GameState,
  KinKind,
  KinMember,
  RelationFilter,
  Relationship,
  RelationshipFlag,
  RelationshipPerspective,
} from '@/types/game';
import { attractionAllows } from '@/data/identity';
import { addMemory, addTag, appendWorldHistory, pushFeed, removeTag } from './gameState';
import { chance, clamp, pick, rnd } from './random';
import { C } from '@/theme/theme';
import { pickNarrative } from './narrativeEngine';

const neutral = (value = 50): RelationshipPerspective => ({ affinity: value, trust: value, respect: value, attraction: 0 });

function flagsFor(kind: KinKind): RelationshipFlag[] {
  if (['mother', 'father', 'sibling', 'child'].includes(kind)) return ['family'];
  if (kind === 'spouse') return ['spouse', 'family'];
  if (kind === 'friend') return ['friend'];
  if (kind === 'foe') return ['rival'];
  if (kind === 'liege') return ['authority'];
  return [];
}

export function makePlayerRelationship(playerId: string, kin: KinMember, age: number): Relationship {
  const attraction = kin.kind === 'spouse' ? 72 : 0;
  return {
    id: `rel_${playerId}_${kin.id}`,
    aId: playerId,
    bId: kin.id,
    aToB: { ...neutral(kin.rel), attraction },
    bToA: { ...neutral(kin.rel), attraction },
    flags: flagsFor(kin.kind),
    lastInteractionAge: age,
    interactionsThisYear: 0,
    sharedMemories: [],
  };
}

export function relationshipWith(state: GameState, characterId: string): Relationship {
  let relation = Object.values(state.world.relationships).find(
    (item) => (item.aId === state.playerCharacterId && item.bId === characterId) || (item.bId === state.playerCharacterId && item.aId === characterId),
  );
  if (!relation) {
    const kin = state.world.characters[characterId];
    if (!kin) throw new Error(`Cannot create relationship with missing character ${characterId}`);
    relation = makePlayerRelationship(state.playerCharacterId, kin, state.age);
    state.world.relationships[relation.id] = relation;
  }
  return relation;
}

export function perspectives(state: GameState, relation: Relationship): { player: RelationshipPerspective; other: RelationshipPerspective } {
  return relation.aId === state.playerCharacterId
    ? { player: relation.aToB, other: relation.bToA }
    : { player: relation.bToA, other: relation.aToB };
}

export function syncLegacyBond(state: GameState, characterId: string): void {
  const kin = state.world.characters[characterId];
  if (!kin) return;
  const { player, other } = perspectives(state, relationshipWith(state, characterId));
  kin.rel = clamp(Math.round((player.affinity + other.affinity + player.trust + other.trust) / 4));
}

export function relationMatchesFilter(state: GameState, kin: KinMember, filter: RelationFilter): boolean {
  if (filter === 'all') return kin.alive;
  if (filter === 'deceased') return !kin.alive;
  if (!kin.alive) return false;
  const flags = relationshipWith(state, kin.id).flags;
  if (filter === 'family') return flags.includes('family');
  if (filter === 'romance') return flags.includes('spouse') || perspectives(state, relationshipWith(state, kin.id)).other.attraction >= 25;
  if (filter === 'friends') return flags.includes('friend');
  if (filter === 'rivals') return flags.includes('rival') || flags.includes('feud');
  if (filter === 'authority') return flags.includes('authority');
  return !flags.some((flag) => ['family', 'spouse', 'friend', 'rival', 'authority'].includes(flag));
}

function driftToward(value: number, target: number, amount: number): number {
  if (value === target) return value;
  return clamp(value + Math.sign(target - value) * Math.min(amount, Math.abs(target - value)));
}

export function tickRelationshipDecay(state: GameState): GameState {
  for (const relation of Object.values(state.world.relationships)) {
    const family = relation.flags.includes('family') || relation.flags.includes('spouse');
    const feud = relation.flags.includes('feud');
    const contact = relation.interactionsThisYear;
    const base = Math.max(0, (family ? 2 : 4) - contact * 2);
    for (const view of [relation.aToB, relation.bToA]) {
      if (view.affinity > 50) view.affinity = Math.max(50, view.affinity - base);
      else if (view.affinity < 50) view.affinity = feud ? Math.max(0, view.affinity - 2) : driftToward(view.affinity, 50, 2);
      if (view.trust > 50) view.trust = Math.max(50, view.trust - base);
      view.respect = driftToward(view.respect, 50, Math.max(1, Math.floor(base / 2)));
      view.attraction = Math.max(0, view.attraction - (relation.flags.includes('spouse') ? 1 : 5));
    }
    relation.interactionsThisYear = 0;
    const kinId = relation.aId === state.playerCharacterId ? relation.bId : relation.bId === state.playerCharacterId ? relation.aId : null;
    if (kinId) syncLegacyBond(state, kinId);
  }
  return state;
}

export type SystemicKinAction =
  | 'time'
  | 'praise'
  | 'gift'
  | 'favour'
  | 'insult'
  | 'plot'
  | 'apologize'
  | 'help'
  | 'confide'
  | 'forgive'
  | 'educate_child'
  | 'arrange_marriage'
  | 'care_for_relative'
  | 'expose_secret'
  | 'flirt'
  | 'court'
  | 'propose'
  | 'accept_proposal'
  | 'reject_proposal'
  | 'reconcile'
  | 'divorce';

export function isRomanceEligible(state: GameState, kin: KinMember): boolean {
  if (!kin.alive || state.age < 18 || kin.age < 18) return false;
  if (['mother', 'father', 'sibling', 'child'].includes(kin.kind)) return false;
  const player = state.world.characters[state.playerCharacterId];
  if (kin.spouseId && kin.spouseId !== state.playerCharacterId) return false;
  if (player?.spouseId && player.spouseId !== kin.id) return false;
  if (state.tags.includes('married') && kin.kind !== 'spouse') return false;
  return attractionAllows(state.attraction, kin.gender) && attractionAllows(kin.attraction, state.gender);
}

export function contextualActions(state: GameState, kin: KinMember): SystemicKinAction[] {
  if (!kin.alive) return [];
  const relation = relationshipWith(state, kin.id);
  const result: SystemicKinAction[] = ['time', 'praise', 'help', 'gift', 'favour'];
  if (perspectives(state, relation).other.trust >= 35) result.push('confide');
  if (perspectives(state, relation).other.affinity < 45) result.push('apologize', 'forgive');
  if (relation.flags.includes('rival') || relation.flags.includes('feud')) result.push('reconcile', 'plot');
  else result.push('insult');
  if (kin.kind === 'child' && kin.age < 18) result.push('educate_child');
  if (kin.kind === 'child' && kin.age >= 14 && !kin.spouseId) result.push('arrange_marriage');
  if (relation.flags.includes('family') && (kin.stats.health < 70 || Boolean(kin.healthConditions?.length))) result.push('care_for_relative');
  if (kin.secrets?.some((secret) => !secret.revealed && secret.knownByIds.includes(state.playerCharacterId))) result.push('expose_secret');
  if (isRomanceEligible(state, kin)) result.push('flirt', 'court', 'propose');
  if (kin.kind === 'spouse') result.push('divorce');
  if (state.world.proposalFromId === kin.id) result.unshift('accept_proposal', 'reject_proposal');
  return result;
}

export function applyRelationshipShift(
  state: GameState,
  kinId: string,
  playerDelta: Partial<RelationshipPerspective>,
  otherDelta: Partial<RelationshipPerspective>,
): Relationship {
  const relation = relationshipWith(state, kinId);
  const views = perspectives(state, relation);
  for (const [key, value] of Object.entries(playerDelta)) views.player[key as keyof RelationshipPerspective] = clamp(views.player[key as keyof RelationshipPerspective] + (value ?? 0));
  for (const [key, value] of Object.entries(otherDelta)) views.other[key as keyof RelationshipPerspective] = clamp(views.other[key as keyof RelationshipPerspective] + (value ?? 0));
  relation.lastInteractionAge = state.age;
  relation.interactionsThisYear += 1;
  syncLegacyBond(state, kinId);
  return relation;
}

const TIME_LINES = [
  'You trade stories until the fire burns low.',
  'You share food, gossip, and a silence comfortable enough to keep.',
  'The two of you pass an easy afternoon and part in better spirits.',
  'You spend time together without a single goat-related emergency.',
] as const;

export function performSystemicRelationshipAction(state: GameState, kin: KinMember, action: SystemicKinAction): GameState {
  const relation = relationshipWith(state, kin.id);
  const views = perspectives(state, relation);
  switch (action) {
    case 'time':
      applyRelationshipShift(state, kin.id, { affinity: 5, trust: 3 }, { affinity: rnd(4, 8), trust: 3 });
      pushFeed(state, `WITH ${kin.name.toUpperCase()}`, C.good, pickNarrative(state, 'relationship_time', TIME_LINES), 'good');
      break;
    case 'praise':
      applyRelationshipShift(state, kin.id, { respect: 2 }, { affinity: rnd(4, 9), respect: 3 });
      pushFeed(state, 'PRAISE', C.good, `You praise ${kin.name}'s ${kin.trait.toLowerCase()} nature. ${kin.pronouns.subject} tries not to look pleased.`, 'good');
      break;
    case 'help':
      applyRelationshipShift(state, kin.id, { trust: 5 }, { affinity: 5, trust: 8, respect: 4 });
      pushFeed(state, 'HELPED', C.good, `You help ${kin.name} with a troublesome task. It remains troublesome, but now it is shared.`, 'good');
      break;
    case 'confide': {
      const player = state.world.characters[state.playerCharacterId];
      const secret = player?.secrets?.find((item) => !item.revealed);
      if (secret && !secret.knownByIds.includes(kin.id)) secret.knownByIds.push(kin.id);
      applyRelationshipShift(state, kin.id, { trust: 5 }, { trust: 9, affinity: 4 });
      relation.sharedMemories.push(`confided_${state.world.currentYear}`);
      relation.sharedMemories = relation.sharedMemories.slice(-24);
      addMemory(state, 'confided_in_someone', 3, kin.name);
      pushFeed(state, 'CONFIDED', C.teal, `You trust ${kin.name} with something difficult to say aloud. ${kin.pronouns.subject} keeps it close.`, 'good');
      break;
    }
    case 'forgive':
      relation.flags = relation.flags.filter((flag) => flag !== 'feud');
      applyRelationshipShift(state, kin.id, { affinity: 6, trust: 4 }, { affinity: 5, trust: 6, respect: 4 });
      addMemory(state, 'offered_forgiveness', 3, kin.name);
      pushFeed(state, 'FORGIVEN', C.good, `You forgive ${kin.name} without pretending the hurt never happened.`, 'good');
      break;
    case 'educate_child':
      const development = kin.childDevelopment ?? { education: 'household' as const, investment: 0, favour: 0, completedMilestones: [] };
      kin.childDevelopment = development;
      development.education = state.stats.wits >= 60 ? 'craft' : 'household';
      development.investment += 2;
      development.favour += 1;
      kin.stats.wits = clamp(kin.stats.wits + rnd(2, 5));
      kin.ambition = kin.ambition ?? (state.stats.faith > state.stats.wits ? 'join_clergy' : 'master_craft');
      applyRelationshipShift(state, kin.id, { respect: 2 }, { trust: 7, respect: 5 });
      pushFeed(state, 'TAUGHT A CHILD', C.faith, `You teach ${kin.name} letters, figures, and which family stories improve with silence.`, 'good');
      break;
    case 'arrange_marriage': {
      const candidates = Object.values(state.world.characters).filter((candidate) => candidate.alive && candidate.id !== kin.id && candidate.id !== state.playerCharacterId && candidate.age >= 16 && !candidate.spouseId && candidate.gender !== kin.gender && !candidate.parentIds?.some((id) => kin.parentIds?.includes(id)));
      const spouse = candidates.sort((a, b) => Math.abs(a.age - kin.age) - Math.abs(b.age - kin.age) || a.id.localeCompare(b.id))[0];
      if (!spouse) {
        pushFeed(state, 'MATCHMAKING', C.bad, `No suitable household will presently agree to a match with ${kin.name}.`, 'plain');
        break;
      }
      kin.spouseId = spouse.id;
      spouse.spouseId = kin.id;
      const arranged: Relationship = { id: `rel_${kin.id}_${spouse.id}`, aId: kin.id, bId: spouse.id, aToB: neutral(48), bToA: neutral(48), flags: ['spouse', 'family'], lastInteractionAge: state.age, interactionsThisYear: 0, sharedMemories: [`arranged_marriage_${state.world.currentYear}`] };
      state.world.relationships[arranged.id] = arranged;
      kin.householdId = spouse.householdId;
      const household = state.world.households.find((item) => item.id === spouse.householdId);
      if (household && !household.memberIds.includes(kin.id)) household.memberIds.push(kin.id);
      applyRelationshipShift(state, kin.id, {}, { trust: views.other.trust >= 55 ? 3 : -6 });
      pushFeed(state, 'A MATCH ARRANGED', C.charm, `${kin.name} is betrothed to ${spouse.name}. Two households begin discussing promises, bedding, and grain.`, 'good');
      break;
    }
    case 'care_for_relative': {
      const active = kin.healthConditions ?? [];
      for (const condition of active) condition.severity = Math.max(1, condition.severity - 1);
      kin.stats.health = clamp(kin.stats.health + rnd(4, 8));
      applyRelationshipShift(state, kin.id, { affinity: 2 }, { affinity: 7, trust: 9 });
      pushFeed(state, 'FAMILY CARE', C.good, `You bring food, clean bedding, and patient company to ${kin.name}.`, 'good');
      break;
    }
    case 'expose_secret': {
      const secret = kin.secrets?.find((item) => !item.revealed && item.knownByIds.includes(state.playerCharacterId));
      if (!secret) break;
      secret.revealed = true;
      applyRelationshipShift(state, kin.id, { respect: -3 }, { affinity: -12, trust: -18 });
      appendWorldHistory(state, { id: `history_secret_${state.nextId++}`, year: state.world.currentYear, type: 'secret_revealed', participantIds: [state.playerCharacterId, kin.id], familyIds: [kin.birthFamilyId].filter((id): id is string => Boolean(id)), causes: [secret.type], summary: `${kin.name}'s ${secret.type.replaceAll('_', ' ')} became public.`, salience: Math.max(2, secret.severity) });
      pushFeed(state, 'SECRET EXPOSED', C.bad, `You reveal what ${kin.name} had hidden. Truth arrives without mercy for either of you.`, 'bad');
      break;
    }
    case 'gift':
      state.gold -= 5;
      state.expenses += 5;
      applyRelationshipShift(state, kin.id, { affinity: 2 }, { affinity: rnd(9, 15), trust: 3 });
      pushFeed(state, 'GIFT', C.good, `You give ${kin.name} a thoughtful gift. It is accepted before anyone asks what it cost.`, 'good');
      break;
    case 'favour': {
      if (views.other.trust >= 55 && kin.gold >= 3) {
        const gold = Math.min(kin.gold, rnd(3, 8));
        kin.gold -= gold;
        state.gold += gold;
        state.income += gold;
        applyRelationshipShift(state, kin.id, { trust: -1 }, { trust: -4 });
        pushFeed(state, 'FAVOUR', C.good, `${kin.name} lends you ${gold} gold and remembers doing so.`, 'good');
      } else {
        applyRelationshipShift(state, kin.id, {}, { affinity: -4, trust: -3 });
        pushFeed(state, 'FAVOUR', C.bad, `${kin.name} refuses. ${kin.pronouns.subject} appears to have rehearsed the refusal.`, 'bad');
      }
      break;
    }
    case 'apologize':
      applyRelationshipShift(state, kin.id, { respect: 3 }, { affinity: rnd(3, 8), trust: 5 });
      pushFeed(state, 'APOLOGY', C.good, `You apologize to ${kin.name}. The words are awkward, which makes them sound sincere.`, 'good');
      break;
    case 'insult':
      applyRelationshipShift(state, kin.id, { affinity: -2 }, { affinity: -12, trust: -7, respect: -6 });
      pushFeed(state, 'INSULT', C.bad, `You find exactly the wrong thing to say to ${kin.name}, then say it with confidence.`, 'bad');
      break;
    case 'plot':
      if (!relation.flags.includes('feud')) relation.flags.push('feud');
      applyRelationshipShift(state, kin.id, { trust: -4 }, { affinity: -8, trust: -10 });
      pushFeed(state, 'SCHEME', C.purpleDark, `You scheme against ${kin.name}. Somewhere, a candle gutters dramatically.`, 'plain');
      break;
    case 'reconcile':
      relation.flags = relation.flags.filter((flag) => flag !== 'feud' && flag !== 'rival');
      applyRelationshipShift(state, kin.id, { affinity: 5, trust: 5 }, { affinity: 8, trust: 7 });
      addTag(state, 'made_peace');
      pushFeed(state, 'RECONCILED', C.good, `You offer ${kin.name} peace. Pride objects, but both of you ignore it.`, 'good');
      break;
    case 'flirt': {
      const worked = chance(0.35 + state.stats.charm / 250 + views.other.affinity / 500);
      applyRelationshipShift(state, kin.id, { attraction: 5 }, worked ? { attraction: 10, affinity: 4 } : { attraction: -2, respect: -2 });
      pushFeed(state, 'FLIRT', worked ? C.good : C.bad, worked ? `${kin.name} returns your smile. The room suddenly has too many witnesses.` : `${kin.name} mistakes your flirtation for a concern about the weather.`, worked ? 'good' : 'bad');
      break;
    }
    case 'court':
      applyRelationshipShift(state, kin.id, { attraction: 7, trust: 3 }, { attraction: rnd(6, 12), affinity: 5, trust: 4 });
      pushFeed(state, 'COURTSHIP', C.healthDark, `You court ${kin.name} with time, attention, and a flower only slightly crushed.`, 'good');
      break;
    case 'propose': {
      const accepts = views.other.attraction >= 45 && views.other.trust >= 45 && chance(0.35 + views.other.affinity / 200);
      if (accepts) marry(state, kin, relation);
      else {
        applyRelationshipShift(state, kin.id, { attraction: -6 }, { attraction: -8, affinity: -4 });
        pushFeed(state, 'PROPOSAL', C.bad, `${kin.name} refuses your proposal. The nearby geese maintain a respectful silence.`, 'bad');
      }
      break;
    }
    case 'accept_proposal':
      marry(state, kin, relation);
      state.world.proposalFromId = null;
      break;
    case 'reject_proposal':
      state.world.proposalFromId = null;
      applyRelationshipShift(state, kin.id, {}, { attraction: -15, affinity: -7 });
      pushFeed(state, 'PROPOSAL', C.bad, `You refuse ${kin.name}'s proposal as kindly as the moment allows.`, 'plain');
      break;
    case 'divorce':
      relation.flags = relation.flags.filter((flag) => flag !== 'spouse');
      relation.flags.push('former_spouse');
      kin.kind = 'acquaintance';
      if (state.world.characters[state.playerCharacterId]) delete state.world.characters[state.playerCharacterId].spouseId;
      if (state.world.characters[kin.id]) {
        delete state.world.characters[kin.id].spouseId;
        state.world.characters[kin.id].kind = 'acquaintance';
      }
      removeTag(state, 'married');
      addTag(state, 'divorced');
      applyRelationshipShift(state, kin.id, { affinity: -12, trust: -12 }, { affinity: -18, trust: -20 });
      pushFeed(state, 'DIVORCE', C.bad, `You and ${kin.name} end the marriage. The village acquires opinions immediately.`, 'bad');
      break;
  }
  return state;
}

function marry(state: GameState, kin: KinMember, relation: Relationship): void {
  const player = state.world.characters[state.playerCharacterId];
  const spouse = state.world.characters[kin.id];
  if ((player?.spouseId && player.spouseId !== kin.id) || (spouse?.spouseId && spouse.spouseId !== state.playerCharacterId)) return;
  kin.kind = 'spouse';
  kin.role = 'Thy Spouse';
  if (!relation.flags.includes('spouse')) relation.flags.push('spouse');
  if (!relation.flags.includes('family')) relation.flags.push('family');
  addTag(state, 'married');
  addTag(state, 'chose_marriage');
  addMemory(state, 'married', 3, kin.name);
  if (player) player.spouseId = kin.id;
  if (spouse) {
    spouse.spouseId = state.playerCharacterId;
    spouse.kind = 'spouse';
    spouse.role = 'Thy Spouse';
    spouse.householdId = player?.householdId ?? 'house_player';
  }
  const household = state.world.households.find((item) => item.id === (player?.householdId ?? 'house_player')) ?? state.world.households[0];
  household.memberIds = Array.from(new Set([...household.memberIds, kin.id]));
  pushFeed(state, 'WEDDING', C.good, `You marry ${kin.name} by your own choosing. Bells ring, bread vanishes, and two families pretend not to count the gifts.`, 'good');
}

export function maybeCreateNpcProposal(state: GameState): void {
  if (state.world.proposalFromId || state.tags.includes('married') || state.age < 18) return;
  const candidates = state.kin.filter((kin) => isRomanceEligible(state, kin)).filter((kin) => {
    const other = perspectives(state, relationshipWith(state, kin.id)).other;
    return other.affinity >= 65 && other.trust >= 55 && other.attraction >= 55;
  });
  if (!candidates.length || !chance(0.18)) return;
  const candidate = pick(candidates);
  state.world.proposalFromId = candidate.id;
  pushFeed(state, 'A PROPOSAL', C.healthDark, `${candidate.name} asks to marry you. ${candidate.pronouns.subject} awaits your answer in the Relationships tab.`, 'good', {}, candidate.id, 'npc');
}
