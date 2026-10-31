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
import { adoptChild, ADOPTION_COST, familyPlanningRoute, tryForAffairChild, tryForChild } from './familyFormationEngine';
import { isCloseBlood, isFamilyTie, kinshipTo } from './kinship';
import { duelAvailability, startDuel } from './duelEngine';
import { unlinkSpouse } from './characterState';
import {
  assault,
  blackmail,
  carouse,
  frameThem,
  knownSecretOf,
  murder,
  prank,
  spreadRumour,
  stealFrom,
} from './misdeedEngine';

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

/**
 * Read-only lookup. Returns undefined when the player has no record with this
 * character yet — normal for anyone born or arriving after the life began.
 * Selectors and components must use this; only engine code that is already
 * mutating a cloned state may use `relationshipWith`.
 */
export function findRelationship(state: GameState, characterId: string): Relationship | undefined {
  return Object.values(state.world.relationships).find(
    (item) => (item.aId === state.playerCharacterId && item.bId === characterId) || (item.bId === state.playerCharacterId && item.aId === characterId),
  );
}

/** Lookup that lazily creates the missing record. Mutates `state`. */
export function relationshipWith(state: GameState, characterId: string): Relationship {
  const existing = findRelationship(state, characterId);
  if (existing) return existing;
  const kin = state.world.characters[characterId];
  if (!kin) throw new Error(`Cannot create relationship with missing character ${characterId}`);
  const relation = makePlayerRelationship(state.playerCharacterId, kin, state.age);
  state.world.relationships[relation.id] = relation;
  return relation;
}

/**
 * The relationship as the UI should read it, without writing anything: a real
 * record when one exists, otherwise the same defaults `relationshipWith` would
 * have created.
 */
export function readRelationship(state: GameState, kin: KinMember): Relationship {
  return findRelationship(state, kin.id) ?? makePlayerRelationship(state.playerCharacterId, kin, state.age);
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
  // Read-only: this runs inside a selector on every render, so it must never
  // create the missing record it is reading.
  const relation = readRelationship(state, kin);
  const flags = relation.flags;
  // Family comes from the genealogy so the filter and the family tree agree.
  if (filter === 'family') return isFamilyTie(kinshipTo(state, kin.id)) || flags.includes('family');
  if (filter === 'romance') return flags.includes('spouse') || flags.includes('affair') || perspectives(state, relation).other.attraction >= 25;
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
  | 'try_for_child'
  | 'adopt_child'
  | 'seduce'
  | 'secret_meeting'
  | 'spend_night'
  | 'promise_future'
  | 'elope'
  | 'end_affair'
  | 'spread_rumour'
  | 'blackmail'
  | 'steal_from'
  | 'frame_them'
  | 'prank'
  | 'carouse'
  | 'name_heir'
  | 'disinherit'
  | 'duel'
  | 'brawl'
  | 'assault'
  | 'murder'
  | 'divorce';

/** Whether the player is actually wed to this person, by the link, not a label. */
export function isPlayerSpouse(state: GameState, kin: KinMember): boolean {
  const player = state.world.characters[state.playerCharacterId];
  return Boolean(player?.spouseId && player.spouseId === kin.id && kin.spouseId === player.id);
}

export function courtshipUnavailableReason(state: GameState, kin: KinMember): string | null {
  if (!kin.alive) return 'This person has died.';
  if (state.age < 18 || kin.age < 18) return 'You must both be at least 18 to begin a romance.';
  // Blood is read from the genealogy, not from `kind`: an NPC born to the
  // player's own parents carries the label 'acquaintance', and courting them
  // used to be perfectly allowed.
  if (isCloseBlood(kinshipTo(state, kin.id))) return 'This person is a close relative.';
  if (!attractionAllows(state.attraction, kin.gender)) return 'Your character’s attraction preferences do not include this person.';
  if (!attractionAllows(kin.attraction, state.gender)) return `${kin.name} is not romantically interested in your character’s gender. Friendship does not change that preference.`;
  const player = state.world.characters[state.playerCharacterId];
  if (kin.spouseId && kin.spouseId !== state.playerCharacterId) return `${kin.name} is married to someone else. Ordinary courtship is unavailable.`;
  if ((player?.spouseId && player.spouseId !== kin.id) || (state.tags.includes('married') && !isPlayerSpouse(state, kin))) return 'You are already married. Ordinary courtship with someone else is unavailable.';
  return null;
}

export function isRomanceEligible(state: GameState, kin: KinMember): boolean {
  return courtshipUnavailableReason(state, kin) === null;
}

/** Proposing is only meaningful to someone thou art not already wed to. */
export function canProposeTo(state: GameState, kin: KinMember): boolean {
  if (!isRomanceEligible(state, kin)) return false;
  if (isPlayerSpouse(state, kin)) return false;
  const player = state.world.characters[state.playerCharacterId];
  return !player?.spouseId && !state.tags.includes('married');
}

export function contextualActions(state: GameState, kin: KinMember): SystemicKinAction[] {
  if (!kin.alive) return [];
  // Read-only: the kin detail screen calls this during render.
  const relation = readRelationship(state, kin);
  const views = perspectives(state, relation);
  const tie = kinshipTo(state, kin.id);
  const isOwnChild = tie === 'daughter' || tie === 'son';
  const spouse = isPlayerSpouse(state, kin);
  const result: SystemicKinAction[] = ['time', 'praise', 'help', 'gift', 'favour'];
  if (views.other.trust >= 35) result.push('confide');
  if (views.other.affinity < 45) result.push('apologize', 'forgive');
  if (relation.flags.includes('rival') || relation.flags.includes('feud')) result.push('reconcile', 'plot');
  else result.push('insult');
  if (duelAvailability(state, kin.id, 'duel').available) result.push('duel');
  if (duelAvailability(state, kin.id, 'brawl').available) result.push('brawl');
  if (isOwnChild && kin.age < 18) result.push('educate_child');
  if (isOwnChild && kin.age >= 14 && !kin.spouseId) result.push('arrange_marriage');
  if (isFamilyTie(tie) && (kin.stats.health < 70 || Boolean(kin.healthConditions?.length))) result.push('care_for_relative');
  if (kin.secrets?.some((secret) => !secret.revealed && secret.knownByIds.includes(state.playerCharacterId))) result.push('expose_secret');
  const affair = isAffairWith(state, kin.id);
  if (isRomanceEligible(state, kin)) {
    result.push('flirt', 'court');
    if (canProposeTo(state, kin)) result.push('propose');
  }
  if (affair) {
    if (!result.includes('flirt')) result.push('flirt');
    if (!result.includes('court')) result.push('court');
    result.push('secret_meeting', 'spend_night', 'promise_future');
    if (views.other.affinity >= 65 && views.other.trust >= 55 && views.other.attraction >= 60) result.push('elope');
    result.push('end_affair');
  }
  else if (canSeduce(state, kin)) result.push('seduce');
  if (kin.age >= 12) result.push('prank');
  if (kin.age >= 16 && state.age >= 16) result.push('carouse');
  if (!isFamilyTie(tie)) result.push('spread_rumour', 'steal_from');
  if (knownSecretOf(state, kin)) result.push('blackmail');
  if ((state.world.characters[state.playerCharacterId]?.legalState?.suspicion ?? 0) >= 20) result.push('frame_them');
  if (state.age >= 14 && !isCloseBlood(tie)) result.push('assault');
  // Murder is a player-authored extreme, not a relationship-category rule.
  // From age eleven, any living world character shown on this screen can be
  // targeted, including relatives; law and family systems carry the result.
  if (state.age >= 11) result.push('murder');
  if (isOwnChild) result.push(kin.isHeir ? 'disinherit' : 'name_heir');
  if (spouse) {
    const route = familyPlanningRoute(state, kin.id);
    // Trying remains an intimacy choice even when age or biology means it will
    // not result in conception. Adoption is an additional road, not a
    // replacement for the spouse interaction.
    if (route) result.push('try_for_child');
    if (route === 'adoption') result.push('adopt_child');
    result.push('divorce');
  }
  if (state.world.proposalFromId === kin.id && !state.tags.includes('married')) {
    result.unshift('accept_proposal', 'reject_proposal');
  }
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
    case 'try_for_child': {
      const expecting = tryForChild(state, kin.id);
      applyRelationshipShift(state, kin.id, { affinity: 3, attraction: 4 }, { affinity: 4, attraction: 5, trust: 2 });
      if (expecting) {
        addMemory(state, 'expecting_a_child', 3, kin.name);
        pushFeed(state, 'A CHILD EXPECTED', C.good, `You and ${kin.name} are to have a child. The household begins counting blankets, names, and worries.`, 'good');
      } else {
        pushFeed(state, 'TRYING FOR A CHILD', C.charm, `You and ${kin.name} hope for a child this year. None comes of it, but the hoping is not wasted.`, 'plain');
      }
      break;
    }
    case 'adopt_child': {
      adoptChild(state, kin.id);
      applyRelationshipShift(state, kin.id, { affinity: 4, trust: 3 }, { affinity: 6, trust: 6, respect: 4 });
      addMemory(state, 'sought_a_child_to_raise', 3, kin.name);
      pushFeed(state, 'A CHILD SOUGHT', C.charm, `You and ${kin.name} put ${ADOPTION_COST} gold to the parish and ask after a child who needs a household. Word will come.`, 'good');
      break;
    }
    case 'duel':
    case 'brawl':
      // The fight itself plays out in its own modal; this only opens it.
      startDuel(state, kin.id, action);
      break;
    case 'seduce': {
      const won = chance(0.3 + state.stats.charm / 200 + views.other.attraction / 300);
      if (won) {
        if (!relation.flags.includes('affair')) relation.flags.push('affair');
        relation.sharedMemories.push(`affair_began_${state.world.currentYear}`);
        relation.sharedMemories = relation.sharedMemories.slice(-24);
        applyRelationshipShift(state, kin.id, { attraction: 14, affinity: 6 }, { attraction: 16, affinity: 8 });
        addMemory(state, 'began_an_affair', 4, kin.name);
        const stakes = affairStakes(state, kin.id);
        pushFeed(state, 'AN AFFAIR BEGINS', C.purpleDark, `Thou and ${kin.name} become secret lovers. ${stakes.length ? `${stakes.join(' and ')} must not learn of it.` : 'For now, nobody else has a claim on either of you.'}`, 'plain');
      } else {
        applyRelationshipShift(state, kin.id, { attraction: -5 }, { affinity: -12, respect: -10 });
        pushFeed(state, 'REFUSED', C.bad, `${kin.name} refuses thee, and looks at thee differently afterwards.`, 'bad');
      }
      break;
    }
    case 'secret_meeting': {
      applyRelationshipShift(state, kin.id, { affinity: 5, trust: 4, attraction: 4 }, { affinity: 7, trust: 5, attraction: 6 });
      relation.sharedMemories.push(`secret_meeting_${state.world.currentYear}`);
      relation.sharedMemories = relation.sharedMemories.slice(-24);
      pushFeed(state, 'BEHIND CLOSED DOORS', C.purpleDark, `Thou and ${kin.name} steal an hour where neither household thinks to look. Every creaking board sounds like discovery.`, 'good');
      exposeAffair(state, kin.id, 0.08);
      break;
    }
    case 'spend_night': {
      applyRelationshipShift(state, kin.id, { affinity: 4, attraction: 8 }, { affinity: 6, trust: 3, attraction: 10 });
      const expecting = tryForAffairChild(state, kin.id);
      if (expecting) {
        addMemory(state, 'illegitimate_child_expected', 5, kin.name);
        pushFeed(state, 'A DANGEROUS NIGHT', C.purpleDark, `Thou spends the night with ${kin.name}. Before long, there are signs that the secret may become a child.`, 'plain');
      } else {
        pushFeed(state, 'A DANGEROUS NIGHT', C.purpleDark, `Thou spends the night with ${kin.name}. Dawn arrives too quickly, carrying risk but no promises.`, 'plain');
      }
      exposeAffair(state, kin.id, expecting ? 0.2 : 0.12);
      break;
    }
    case 'promise_future': {
      const believed = views.other.trust >= 48 || chance(0.35 + state.stats.charm / 300);
      if (believed) {
        applyRelationshipShift(state, kin.id, { trust: 4 }, { affinity: 8, trust: 9, attraction: 5 });
        relation.sharedMemories.push(`promised_future_${state.world.currentYear}`);
        relation.sharedMemories = relation.sharedMemories.slice(-24);
        pushFeed(state, 'WHEN WE ARE FREE', C.healthDark, `Thou promises ${kin.name} that this will become a life lived openly. ${kin.pronouns.subject} chooses to believe thee—for now.`, 'good');
      } else {
        applyRelationshipShift(state, kin.id, { trust: -2 }, { affinity: -8, trust: -12 });
        pushFeed(state, 'AN EMPTY PROMISE', C.bad, `${kin.name} asks when “someday” is. Thou has no answer that survives saying aloud.`, 'bad');
      }
      break;
    }
    case 'elope': {
      const player = state.world.characters[state.playerCharacterId];
      const abandoned = affairStakes(state, kin.id);
      if (player?.spouseId) unlinkSpouse(state, player.id);
      if (kin.spouseId) unlinkSpouse(state, kin.id);
      relation.flags = relation.flags.filter((flag) => flag !== 'affair' && flag !== 'feud');
      marry(state, kin, relation);
      state.reputation = clamp(state.reputation - rnd(8, 16), -100, 100);
      addTag(state, 'eloped_with_lover');
      appendWorldHistory(state, {
        id: `history_elopement_${state.nextId++}`,
        year: state.world.currentYear,
        type: 'elopement',
        participantIds: [state.playerCharacterId, kin.id],
        familyIds: [kin.birthFamilyId].filter((id): id is string => Boolean(id)),
        causes: ['affair', ...abandoned],
        summary: `${state.first} and ${kin.name} abandoned caution and married after an affair.`,
        salience: 5,
      });
      pushFeed(state, 'ELOPEMENT', C.bad, `Thou and ${kin.name} choose each other in the open. ${abandoned.length ? `${abandoned.join(' and ')} are left with the wreckage.` : 'Swineford supplies the scandal.'}`, 'plain');
      break;
    }
    case 'end_affair':
      relation.flags = relation.flags.filter((flag) => flag !== 'affair');
      applyRelationshipShift(state, kin.id, { attraction: -10 }, { attraction: -8, affinity: -10 });
      addMemory(state, 'ended_an_affair', 3, kin.name);
      pushFeed(state, 'ENDED QUIETLY', C.amber, `Thou ends it with ${kin.name} before anyone else has to. It is the kindest of the bad options.`, 'plain');
      break;
    case 'spread_rumour':
      spreadRumour(state, kin);
      break;
    case 'blackmail':
      blackmail(state, kin);
      break;
    case 'steal_from':
      stealFrom(state, kin);
      break;
    case 'frame_them':
      frameThem(state, kin);
      break;
    case 'prank':
      prank(state, kin);
      break;
    case 'carouse':
      carouse(state, kin);
      break;
    case 'assault':
      assault(state, kin);
      break;
    case 'murder':
      murder(state, kin);
      break;
    case 'name_heir': {
      for (const child of state.kin) if (child.isHeir) child.isHeir = false;
      kin.isHeir = true;
      applyRelationshipShift(state, kin.id, { respect: 3 }, { affinity: 12, trust: 10, respect: 8 });
      pushFeed(state, 'AN HEIR NAMED', C.charmDark, `Thou names ${kin.name} thy heir before witnesses. The rest of the household adjusts its expectations.`, 'good');
      break;
    }
    case 'disinherit':
      kin.isHeir = false;
      applyRelationshipShift(state, kin.id, { affinity: -6 }, { affinity: -30, trust: -25, respect: -12 });
      addMemory(state, 'disinherited_a_child', 4, kin.name);
      pushFeed(state, 'DISINHERITED', C.bad, `Thou strikes ${kin.name} from the inheritance. ${kin.pronouns.subject} will carry that for the rest of ${kin.pronouns.possessive} life.`, 'bad');
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
  // Moving an existing person must remove the old membership immediately;
  // a wedding can be the last decision before a life ends, before the annual repair.
  for (const previous of state.world.households) {
    if (previous.id !== household.id) previous.memberIds = previous.memberIds.filter(id => id !== kin.id);
  }
  if (spouse) spouse.householdId = household.id;
  household.memberIds = Array.from(new Set([...household.memberIds, kin.id]));
  for (const expected of state.world.expectedChildren) {
    if (expected.status === 'expected' && expected.parentIds.includes(kin.id)) expected.householdId = household.id;
  }
  pushFeed(state, 'WEDDING', C.good, `You marry ${kin.name} by your own choosing. Bells ring, bread vanishes, and two families pretend not to count the gifts.`, 'good');
}

// ---------------------------------------------------------------------------
// Affairs
// ---------------------------------------------------------------------------

/** Whoever the player is currently carrying on with, if anyone. */
export function affairPartnerId(state: GameState): string | null {
  for (const relation of Object.values(state.world.relationships)) {
    if (!relation.flags.includes('affair')) continue;
    if (relation.aId === state.playerCharacterId) return relation.bId;
    if (relation.bId === state.playerCharacterId) return relation.aId;
  }
  return null;
}

/**
 * Seduction is only interesting when somebody stands to be hurt by it: it needs
 * a marriage on one side or the other, and it produces a secret rather than a
 * result.
 */
export function canSeduce(state: GameState, kin: KinMember): boolean {
  if (!kin.alive || state.age < 18 || kin.age < 18) return false;
  if (isCloseBlood(kinshipTo(state, kin.id))) return false;
  if (isPlayerSpouse(state, kin)) return false;
  const player = state.world.characters[state.playerCharacterId];
  const someoneIsMarried = Boolean(player?.spouseId) || Boolean(kin.spouseId);
  if (!someoneIsMarried) return false;
  const existing = affairPartnerId(state);
  if (existing && existing !== kin.id) return false;
  if (existing === kin.id) return false;
  return attractionAllows(state.attraction, kin.gender) && attractionAllows(kin.attraction, state.gender);
}

export function isAffairWith(state: GameState, kinId: string): boolean {
  return affairPartnerId(state) === kinId;
}

function wrongedSpouses(state: GameState, partnerId: string): KinMember[] {
  const player = state.world.characters[state.playerCharacterId];
  const partner = state.world.characters[partnerId];
  const ids = new Set([player?.spouseId, partner?.spouseId].filter((id): id is string => Boolean(id)));
  ids.delete(state.playerCharacterId);
  ids.delete(partnerId);
  return [...ids]
    .map((id) => state.world.characters[id])
    .filter((character): character is KinMember => Boolean(character?.alive));
}

function affairStakes(state: GameState, partnerId: string): string[] {
  return wrongedSpouses(state, partnerId).map((spouse) => spouse.name);
}

/** Reveal an affair once, while allowing the lovers to decide what follows. */
function exposeAffair(state: GameState, partnerId: string, risk: number): boolean {
  const partner = state.world.characters[partnerId];
  if (!partner?.alive) return false;
  const relation = relationshipWith(state, partnerId);
  if (relation.sharedMemories.includes('affair_exposed')) return false;
  const wronged = wrongedSpouses(state, partnerId);
  if (!wronged.length || !chance(Math.min(0.85, Math.max(0, risk)))) return false;

  relation.sharedMemories.push('affair_exposed');
  relation.sharedMemories = relation.sharedMemories.slice(-24);
  addTag(state, 'affair_exposed');
  state.reputation = clamp(state.reputation - rnd(8, 18), -100, 100);
  for (const spouse of wronged) {
    const spouseRelation = applyRelationshipShift(state, spouse.id, { trust: -10 }, { affinity: -40, trust: -50, respect: -20 });
    if (!spouseRelation.flags.includes('feud')) spouseRelation.flags.push('feud');
  }
  applyRelationshipShift(state, partnerId, {}, { trust: -5 });
  addMemory(state, 'affair_discovered', 4, partner.name);
  appendWorldHistory(state, {
    id: `history_affair_${state.nextId++}`,
    year: state.world.currentYear,
    type: 'scandal',
    participantIds: [state.playerCharacterId, partnerId, ...wronged.map((spouse) => spouse.id)],
    familyIds: wronged.map((spouse) => spouse.birthFamilyId).filter((id): id is string => Boolean(id)),
    causes: ['affair'],
    summary: `${wronged.map((spouse) => spouse.name).join(' and ')} learned of the affair.`,
    salience: 5,
  });
  pushFeed(
    state,
    'THE AFFAIR IS OUT',
    C.bad,
    `${wronged.map((spouse) => spouse.name).join(' and ')} know about thee and ${partner.name}. The secret is gone; what happens next is still thy choice.`,
    'bad',
    {},
    wronged[0].id,
    'npc',
  );
  return true;
}

/**
 * Each year an affair runs, it may be discovered. The longer it lasts and the
 * sharper the wronged spouse, the likelier it becomes — so the choice is not
 * "start an affair", it is "how long dare I keep it".
 */
export function tickAffairs(state: GameState): GameState {
  const partnerId = affairPartnerId(state);
  if (!partnerId) return state;
  const partner = state.world.characters[partnerId];
  if (!partner?.alive) return state;

  const relation = relationshipWith(state, partnerId);
  const began = relation.sharedMemories.find((memory) => memory.startsWith('affair_began_'));
  const beganYear = began ? Number(began.slice('affair_began_'.length)) : state.world.currentYear - 1;
  const yearsRunning = Math.max(1, state.world.currentYear - beganYear + 1);
  const sharpestSpouse = Math.max(50, ...wrongedSpouses(state, partnerId).map((spouse) => spouse.stats.wits));
  exposeAffair(state, partnerId, 0.08 + yearsRunning * 0.035 + (sharpestSpouse - 50) / 400);
  return state;
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
