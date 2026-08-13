/**
 * Fights, played out exchange by exchange.
 *
 * A duel is not a single dice roll behind a feed line. The opponent telegraphs
 * an attack, the player picks which attribute to answer it with, and the fight
 * runs on `vigour` — a fight-local composure track that has nothing to do with
 * health until the fight ends. Only the conclusion touches the real character.
 */

import { DuelKind, DuelState, GameState, WorldCharacter } from '@/types/game';
import { DUEL_MOVE_BY_ID, DuelResponse, movesForKind } from '@/content/duelMoves';
import { applyEffects } from './consequenceEngine';
import { addMemory, pushFeed } from './gameState';
import { applyRelationshipShift } from './relationshipState';
import { isCloseBlood, kinshipTo } from './kinship';
import { chance, clamp, pick, rnd } from './random';
import { C } from '@/theme/theme';

/** Composure both fighters start with. */
export const DUEL_START_VIGOUR = 100;

/** After this many exchanges the fight is called on remaining composure. */
export const DUEL_MAX_ROUNDS = 8;

/** Yielding becomes available once the fight has actually been joined. */
export const DUEL_YIELD_AFTER_ROUND = 2;

export interface DuelAvailability {
  available: boolean;
  reason?: string;
}

/** How dangerous this opponent is, 0..1. */
function opponentSkill(opponent: WorldCharacter): number {
  const physical = (opponent.stats.health + opponent.stats.charm) / 2;
  const seasoning = Math.min(20, Math.max(0, opponent.age - 14)) / 20;
  return clamp(Math.round(physical * 0.7 + seasoning * 30), 0, 100) / 100;
}

/** Whether the player is carrying anything worth calling a weapon. */
function hasBlade(state: GameState): boolean {
  return ['sword', 'lance', 'mail_shirt'].some((id) => state.inventory.includes(id));
}

export function duelAvailability(state: GameState, opponentId: string, kind: DuelKind): DuelAvailability {
  if (state.duel) return { available: false, reason: 'A fight is already underway' };
  const opponent = state.world.characters[opponentId];
  if (!opponent?.alive) return { available: false, reason: 'They are beyond fighting' };
  if (isCloseBlood(kinshipTo(state, opponentId))) return { available: false, reason: 'Thou will not raise a hand to close blood' };
  const minAge = kind === 'duel' ? 16 : 14;
  if (state.age < minAge) return { available: false, reason: `Requires age ${minAge}` };
  if (opponent.age < minAge) return { available: false, reason: 'They are too young to face thee' };
  if (kind === 'duel' && !hasBlade(state) && state.rankIdx < 1) {
    return { available: false, reason: 'A formal duel needs a blade or a station' };
  }
  return { available: true };
}

function nextMoveId(state: GameState, kind: DuelKind, previousId?: string): string {
  const options = movesForKind(kind).filter((move) => move.id !== previousId);
  return pick(options.length ? options : movesForKind(kind)).id;
}

export function startDuel(state: GameState, opponentId: string, kind: DuelKind): GameState {
  if (!duelAvailability(state, opponentId, kind).available) return state;
  const opponent = state.world.characters[opponentId]!;
  // A better fighter starts with more left in the tank than a village drunk.
  const opponentEdge = Math.round(opponentSkill(opponent) * 20) - 10;
  state.duel = {
    opponentId,
    kind,
    playerVigour: DUEL_START_VIGOUR,
    opponentVigour: clamp(DUEL_START_VIGOUR + opponentEdge, 60, 120),
    round: 1,
    moveId: nextMoveId(state, kind),
    log: [],
  };
  pushFeed(
    state,
    kind === 'duel' ? 'A DUEL IS CALLED' : 'A BRAWL BEGINS',
    kind === 'duel' ? C.healthDark : C.amber,
    kind === 'duel'
      ? `Thou calls out ${opponent.name} before witnesses. There is no walking this back now.`
      : `Thou swings first at ${opponent.name}. The tavern rearranges itself around the two of you.`,
    'plain',
  );
  return state;
}

/** Odds a chosen answer lands, from its base, the player's attribute and the opponent. */
export function responseChance(state: GameState, response: DuelResponse, opponent: WorldCharacter): number {
  const attribute = state.stats[response.stat];
  return Math.min(0.94, Math.max(0.06, response.base + (attribute - 50) / 220 - (opponentSkill(opponent) - 0.5) / 3));
}

function fill(text: string, opponent: WorldCharacter): string {
  return text
    .replaceAll('{name}', opponent.name)
    .replaceAll('{HIM}', opponent.pronouns.object.toUpperCase())
    .replaceAll('{him}', opponent.pronouns.object)
    .replaceAll('{his}', opponent.pronouns.possessive)
    .replaceAll('{he}', opponent.pronouns.subject)
    .replaceAll('{He}', opponent.pronouns.subject.charAt(0).toUpperCase() + opponent.pronouns.subject.slice(1));
}

/** The telegraph line for the current exchange, ready to display. */
export function duelTelegraph(state: GameState): string {
  const duel = state.duel;
  const opponent = duel ? state.world.characters[duel.opponentId] : undefined;
  if (!duel || !opponent) return '';
  return fill(DUEL_MOVE_BY_ID[duel.moveId]?.telegraph ?? '', opponent);
}

/** The answers open to the player this exchange, with their text filled in. */
export function duelResponses(state: GameState): Array<DuelResponse & { text: { label: string; hint: string } }> {
  const duel = state.duel;
  const opponent = duel ? state.world.characters[duel.opponentId] : undefined;
  if (!duel || !opponent) return [];
  const move = DUEL_MOVE_BY_ID[duel.moveId];
  return (move?.responses ?? []).map((response) => ({
    ...response,
    text: { label: fill(response.label, opponent), hint: fill(response.hint, opponent) },
  }));
}

export function canYield(state: GameState): boolean {
  return Boolean(state.duel && !state.duel.outcome && state.duel.round > DUEL_YIELD_AFTER_ROUND);
}

function finish(duel: DuelState, outcome: DuelState['outcome'], verdict: string): void {
  duel.outcome = outcome;
  duel.verdict = verdict;
}

/** Resolve one exchange. `responseId` of 'yield' concedes the fight. */
export function respondToDuel(state: GameState, responseId: string): GameState {
  const duel = state.duel;
  if (!duel || duel.outcome) return state;
  const opponent = state.world.characters[duel.opponentId];
  if (!opponent) {
    state.duel = null;
    return state;
  }

  if (responseId === 'yield') {
    if (!canYield(state)) return state;
    finish(duel, 'yielded', `Thou lowers thy guard and steps back. ${opponent.name} accepts it, loudly.`);
    return state;
  }

  const move = DUEL_MOVE_BY_ID[duel.moveId];
  const response = move?.responses.find((item) => item.id === responseId);
  if (!response) return state;

  const landed = chance(responseChance(state, response, opponent));
  if (landed) {
    duel.opponentVigour = Math.max(0, duel.opponentVigour - (response.hit + rnd(0, 6)));
    duel.playerVigour = Math.min(DUEL_START_VIGOUR, duel.playerVigour + (response.recover ?? 0));
  } else {
    duel.playerVigour = Math.max(0, duel.playerVigour - (response.cost + rnd(0, 6)));
  }
  duel.log = [...duel.log, fill(landed ? response.success : response.failure, opponent)].slice(-6);

  if (duel.opponentVigour <= 0) {
    finish(duel, 'won', `${opponent.name} cannot answer. It is over, and everyone saw it.`);
    return state;
  }
  if (duel.playerVigour <= 0) {
    finish(duel, 'lost', `Thy legs decide the matter before thy pride does. ${opponent.name} stands over thee.`);
    return state;
  }

  duel.round += 1;
  if (duel.round > DUEL_MAX_ROUNDS) {
    const ahead = duel.playerVigour >= duel.opponentVigour;
    finish(
      duel,
      ahead ? 'won' : 'lost',
      ahead
        ? `Both of you are spent, but ${opponent.name} is spent first. The witnesses call it for thee.`
        : `Both of you are spent, and thou the more so. The witnesses call it against thee.`,
    );
    return state;
  }

  duel.moveId = nextMoveId(state, duel.kind, duel.moveId);
  return state;
}

/**
 * Apply what the fight cost and earned, then clear it. A won duel is worth
 * standing; a brawl is worth nothing but trouble and the respect of the wrong
 * people.
 */
export function concludeDuel(state: GameState): GameState {
  const duel = state.duel;
  if (!duel?.outcome) return state;
  const opponent = state.world.characters[duel.opponentId];
  const name = opponent?.name ?? 'thy opponent';
  const formal = duel.kind === 'duel';
  // Composure spent maps onto real injury; a comfortable win barely marks thee.
  const punishment = Math.round((DUEL_START_VIGOUR - duel.playerVigour) / (formal ? 3 : 4));

  if (duel.outcome === 'won') {
    applyEffects(state, {
      health: -punishment,
      charm: formal ? 5 : 2,
      reputation: formal ? 8 : -2,
      rankProgress: formal ? 7 : 0,
      path: formal ? { martial: 3 } : { outlaw: 2 },
      ...(formal ? {} : { legal: { suspicion: 12, notoriety: 4 } }),
      memory: { tag: formal ? 'won_a_duel' : 'won_a_brawl', weight: 3, note: name },
    });
    if (opponent) {
      opponent.stats.health = clamp(opponent.stats.health - rnd(8, 20));
      applyRelationshipShift(state, opponent.id, { respect: 4 }, { respect: 10, affinity: -12, trust: -6 });
    }
    pushFeed(state, formal ? 'DUEL WON' : 'BRAWL WON', C.good,
      formal
        ? `Thou beat ${name} in open combat. The village will be repeating this for years, with improvements.`
        : `Thou put ${name} through a table. The alehouse is impressed; the law will be less so.`,
      'good');
  } else if (duel.outcome === 'lost') {
    applyEffects(state, {
      health: -(punishment + (formal ? 10 : 6)),
      charm: formal ? -3 : -1,
      reputation: formal ? -7 : -3,
      rankProgress: formal ? -6 : 0,
      ...(formal ? {} : { legal: { suspicion: 10, notoriety: 3 } }),
      memory: { tag: formal ? 'lost_a_duel' : 'lost_a_brawl', weight: 3, note: name },
    });
    if (opponent) applyRelationshipShift(state, opponent.id, { respect: -6 }, { respect: -8, affinity: -8 });
    pushFeed(state, formal ? 'DUEL LOST' : 'BRAWL LOST', C.bad,
      `${name} had the better of thee. Thou will heal; the story will not.`, 'bad');
  } else {
    applyEffects(state, {
      health: -Math.round(punishment / 2),
      reputation: formal ? -5 : -1,
      charm: -2,
      memory: { tag: 'yielded_a_fight', weight: 2, note: name },
    });
    if (opponent) applyRelationshipShift(state, opponent.id, {}, { respect: -5, affinity: 3 });
    pushFeed(state, 'YIELDED', C.amber,
      `Thou yielded to ${name}. It is the sensible choice, which is exactly what the village will call it.`, 'plain');
  }

  addMemory(state, duel.kind === 'duel' ? 'fought_a_duel' : 'fought_a_brawl', 2, name);
  state.duel = null;
  return state;
}
