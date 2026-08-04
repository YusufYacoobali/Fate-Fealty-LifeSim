/**
 * The things a life simulator has to let you do to other people.
 *
 * Everything here changes the TARGET, not just the player: their gold, their
 * health, their standing with the law, what their household thinks of them, or
 * whether they are alive at all. The player's own cost is routed through the
 * existing legal system, so a crime becomes suspicion, then a charge, then a
 * trial — the game already knows how to punish that.
 */

import { GameState, WorldCharacter } from '@/types/game';
import { addMemory, appendWorldHistory, pushFeed } from './gameState';
import { applyRelationshipShift, relationshipWith } from './relationshipEngine';
import { killKin } from './kinFactory';
import { chance, clamp, pick, rnd } from './random';
import { C } from '@/theme/theme';

/** Everyone who shares a roof or a family with the target. */
function circleOf(state: GameState, target: WorldCharacter): WorldCharacter[] {
  return Object.values(state.world.characters).filter(
    (character) =>
      character.alive
      && character.id !== target.id
      && character.id !== state.playerCharacterId
      && (character.householdId === target.householdId || character.birthFamilyId === target.birthFamilyId),
  );
}

/** Record that the target's circle now believes something about them. */
function rememberAbout(state: GameState, target: WorldCharacter, summary: string, sentiment: number): void {
  target.worldMemories = [...(target.worldMemories ?? []), {
    id: `memory_${state.nextId++}`,
    year: state.world.currentYear,
    type: 'reputation',
    actorIds: [state.playerCharacterId],
    inherited: false,
    summary,
    sentiment,
    salience: 3 as const,
  }].slice(-12);
}

/** Add a charge against a character, which the legal system will act on. */
function accuse(state: GameState, accused: WorldCharacter, offence: string, severity: number, evidence: number, victimId?: string): void {
  accused.legalState ??= { status: 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 };
  accused.legalState.suspicion = clamp(accused.legalState.suspicion + Math.round(severity / 2));
  accused.legalState.charges.push({
    id: `charge_${state.nextId++}`,
    offence,
    severity,
    evidence,
    victimIds: victimId ? [victimId] : [],
    witnessIds: [],
    year: state.world.currentYear,
    resolved: false,
  });
}

// ---------------------------------------------------------------------------
// Cruelty
// ---------------------------------------------------------------------------

/** Talk about someone until the village believes it. Costs them, not thee. */
export function spreadRumour(state: GameState, target: WorldCharacter): void {
  const believed = chance(0.45 + state.stats.charm / 250 + state.reputation / 500);
  if (believed) {
    // The damage lands on the people whose opinion of them matters daily.
    for (const witness of circleOf(state, target).slice(0, 6)) {
      const relation = state.world.relationships[`rel_${witness.id}_${target.id}`];
      if (relation) relation.aToB.affinity = clamp(relation.aToB.affinity - rnd(4, 10));
    }
    const family = target.birthFamilyId ? state.world.families[target.birthFamilyId] : undefined;
    if (family) family.reputation = clamp(family.reputation - rnd(3, 8), -100, 100);
    const household = state.world.households.find((item) => item.id === target.householdId);
    if (household) household.status = clamp((household.status ?? 50) - rnd(3, 7));
    rememberAbout(state, target, `Talk went round Swineford about ${target.name}.`, -3);
    applyRelationshipShift(state, target.id, {}, { affinity: -8, trust: -10 });
    pushFeed(state, 'A RUMOUR SPREADS', C.purpleDark, `Thy story about ${target.name} takes root. Doors that were open to ${target.pronouns.object} begin to close.`, 'plain');
  } else {
    applyRelationshipShift(state, target.id, { respect: -3 }, { affinity: -6, respect: -8 });
    pushFeed(state, 'A RUMOUR FAILS', C.amber, `Nobody believes thy story about ${target.name}, and several people mention who started it.`, 'bad');
  }
}

/** Whether the player knows something about them worth threatening to tell. */
export function knownSecretOf(state: GameState, target: WorldCharacter) {
  return target.secrets?.find((secret) => !secret.revealed && secret.knownByIds.includes(state.playerCharacterId));
}

export function blackmail(state: GameState, target: WorldCharacter): void {
  const secret = knownSecretOf(state, target);
  if (!secret) return;
  const paid = Math.min(target.gold, rnd(8, 22) + Math.round(secret.severity / 4));
  if (paid > 0) {
    target.gold -= paid;
    state.gold += paid;
    state.income += paid;
  }
  const relation = relationshipWith(state, target.id);
  if (!relation.flags.includes('feud')) relation.flags.push('feud');
  applyRelationshipShift(state, target.id, { trust: -4 }, { affinity: -30, trust: -35, respect: -10 });
  rememberAbout(state, target, `${target.name} is paying someone to stay quiet.`, -4);
  pushFeed(state, 'BLACKMAIL', C.purpleDark, `${target.name} pays thee ${paid} gold to keep quiet. ${target.pronouns.subject} will not forget who holds the knife.`, 'plain');
}

export function stealFrom(state: GameState, target: WorldCharacter): void {
  const caught = chance(0.3 - state.stats.wits / 400 + (target.stats.wits - 50) / 300);
  const taken = Math.min(target.gold, rnd(5, 18));
  if (!caught && taken > 0) {
    target.gold -= taken;
    state.gold += taken;
    state.income += taken;
    rememberAbout(state, target, `${target.name} lost coin and never learned to whom.`, -2);
    pushFeed(state, 'THEFT', C.purpleDark, `Thou lifts ${taken} gold from ${target.name}. ${target.pronouns.subject} notices only that the purse is lighter.`, 'good');
    return;
  }
  applyRelationshipShift(state, target.id, {}, { affinity: -22, trust: -30 });
  const relation = relationshipWith(state, target.id);
  if (!relation.flags.includes('feud')) relation.flags.push('feud');
  pushFeed(state, 'CAUGHT STEALING', C.bad, `${target.name} catches thy hand in ${target.pronouns.possessive} purse. There were witnesses.`, 'bad');
}

/** Move the law's attention from thee onto them. */
export function frameThem(state: GameState, target: WorldCharacter): void {
  const player = state.world.characters[state.playerCharacterId];
  const legal = player?.legalState;
  const convincing = chance(0.35 + state.stats.wits / 220 + state.reputation / 500 - (target.stats.charm - 50) / 300);
  if (convincing) {
    const shifted = Math.min(30, legal?.suspicion ?? 0);
    if (legal) legal.suspicion = clamp(legal.suspicion - shifted);
    accuse(state, target, 'theft laid at their door', 30, 55, state.playerCharacterId);
    rememberAbout(state, target, `${target.name} stands accused of a crime.`, -4);
    applyRelationshipShift(state, target.id, {}, { affinity: -25, trust: -30 });
    pushFeed(state, 'FRAMED', C.purpleDark, `The evidence points at ${target.name} now. The reeve is satisfied, which is all the reeve requires.`, 'plain');
  } else {
    pushFeed(state, 'A CLUMSY FRAME', C.bad, `Thy attempt to shift the blame onto ${target.name} is transparent. It has been noted where it will hurt.`, 'bad');
  }
}

// ---------------------------------------------------------------------------
// Violence
// ---------------------------------------------------------------------------

export function assault(state: GameState, target: WorldCharacter): void {
  const overwhelmed = chance(0.5 + (state.stats.health - target.stats.health) / 200);
  if (overwhelmed) {
    target.stats.health = clamp(target.stats.health - rnd(14, 28));
    target.healthConditions = [...(target.healthConditions ?? []), {
      id: `health_${state.nextId++}`,
      conditionId: 'broken_bone',
      kind: 'injury',
      severity: rnd(25, 45),
      diagnosed: true,
      startedYear: state.world.currentYear,
      nextReviewYear: state.world.currentYear + 1,
    }];
    rememberAbout(state, target, `${target.name} was beaten in the open.`, -5);
    pushFeed(state, 'ASSAULT', C.bad, `Thou beats ${target.name} without ceremony or warning. It is quick, and everybody sees it.`, 'plain');
  } else {
    state.stats.health = clamp(state.stats.health - rnd(10, 20));
    pushFeed(state, 'ASSAULT FAILS', C.bad, `${target.name} was readier than thou expected, and thou comes off worse.`, 'bad');
  }
  const relation = relationshipWith(state, target.id);
  if (!relation.flags.includes('feud')) relation.flags.push('feud');
  applyRelationshipShift(state, target.id, {}, { affinity: -35, trust: -30, respect: -10 });
  const player = state.world.characters[state.playerCharacterId];
  if (player) accuse(state, player, `assault upon ${target.name}`, 40, 60, target.id);
}

/**
 * The darkest thing the game allows. It can succeed — and the law, the family,
 * and the memory of the village all respond as if it did.
 */
export function murder(state: GameState, target: WorldCharacter): void {
  const succeeded = chance(0.35 + (state.stats.health - target.stats.health) / 250 + state.stats.wits / 400);
  const player = state.world.characters[state.playerCharacterId];
  if (succeeded) {
    const survivors = circleOf(state, target);
    killKin(state, target.id);
    // Everyone who loved them now knows someone did this, even if not who.
    for (const mourner of survivors.slice(0, 6)) {
      mourner.worldMemories = [...(mourner.worldMemories ?? []), {
        id: `memory_${state.nextId++}`,
        year: state.world.currentYear,
        type: 'bereavement',
        actorIds: [target.id],
        inherited: false,
        summary: `${target.name} was killed.`,
        sentiment: -5,
        salience: 5 as const,
      }].slice(-12);
    }
    appendWorldHistory(state, {
      id: `history_killing_${state.nextId++}`,
      year: state.world.currentYear,
      type: 'killing',
      participantIds: [state.playerCharacterId, target.id],
      familyIds: [target.birthFamilyId].filter((id): id is string => Boolean(id)),
      causes: ['murder'],
      summary: `${target.name} was found dead.`,
      salience: 5,
    });
    addMemory(state, 'took_a_life', 5, target.name);
    if (player) accuse(state, player, `the killing of ${target.name}`, 80, rnd(35, 70), target.id);
    pushFeed(state, 'A KILLING', C.bad, `${target.name} is dead by thy hand. Whatever thou tells thyself tonight, Swineford will be asking questions by morning.`, 'bad');
  } else {
    target.stats.health = clamp(target.stats.health - rnd(20, 35));
    const relation = relationshipWith(state, target.id);
    if (!relation.flags.includes('feud')) relation.flags.push('feud');
    applyRelationshipShift(state, target.id, {}, { affinity: -60, trust: -60, respect: -20 });
    rememberAbout(state, target, `${target.name} survived an attempt on their life.`, -5);
    if (player) accuse(state, player, `attempted murder of ${target.name}`, 70, rnd(55, 85), target.id);
    pushFeed(state, 'IT GOES WRONG', C.bad, `${target.name} lives, and knows thy face, and will say it aloud to anyone who asks.`, 'bad');
  }
}

// ---------------------------------------------------------------------------
// Mischief
// ---------------------------------------------------------------------------

const PRANKS = [
  'Thou puts a goose in {name}\'s bed. The goose enjoys it more than {he} does.',
  'Thou swaps {name}\'s salt for sand at the feast. The face is worth the trouble.',
  'Thou tells {name} the priest is asking after {him}. {He} spends the whole day hiding in a barn.',
  'Thou nails {name}\'s boots to the floor. It is not sophisticated. It works.',
] as const;

export function prank(state: GameState, target: WorldCharacter): void {
  const line = pick(PRANKS)
    .replaceAll('{name}', target.name)
    .replaceAll('{him}', target.pronouns.object)
    .replaceAll('{he}', target.pronouns.subject)
    .replaceAll('{He}', target.pronouns.subject.charAt(0).toUpperCase() + target.pronouns.subject.slice(1));
  const tookItWell = chance(0.55 + state.stats.charm / 300);
  applyRelationshipShift(
    state,
    target.id,
    { affinity: 2 },
    tookItWell ? { affinity: 6, respect: -2 } : { affinity: -9, respect: -5 },
  );
  pushFeed(state, 'MISCHIEF', tookItWell ? C.charmDark : C.amber, `${line} ${tookItWell ? `${target.name} laughs about it afterwards.` : `${target.name} does not laugh.`}`, tookItWell ? 'good' : 'plain');
}

export function carouse(state: GameState, target: WorldCharacter): void {
  const messy = chance(0.3);
  state.stats.health = clamp(state.stats.health - rnd(3, 8));
  target.stats.health = clamp(target.stats.health - rnd(2, 6));
  applyRelationshipShift(state, target.id, { affinity: 8, trust: 5 }, { affinity: 10, trust: 7, respect: messy ? -6 : 2 });
  if (messy) {
    state.reputation = clamp(state.reputation - rnd(2, 5), -100, 100);
    rememberAbout(state, target, `${target.name} was seen very drunk indeed.`, -1);
  }
  pushFeed(
    state,
    'A LONG NIGHT',
    messy ? C.amber : C.charmDark,
    messy
      ? `Thou and ${target.name} drink far past sense. What happened to the fence is still disputed.`
      : `Thou and ${target.name} drink until the candles gutter. Thou parts as firmer friends and worse company.`,
    messy ? 'plain' : 'good',
  );
}
