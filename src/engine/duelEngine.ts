/**
 * Fights, played out exchange by exchange.
 *
 * A duel is not a single dice roll behind a feed line. The opponent telegraphs
 * an attack, the player picks which attribute to answer it with, and the fight
 * runs on `vigour` — a fight-local composure track that has nothing to do with
 * health until the fight ends. Only the conclusion touches the real character.
 */

import { DuelKind, DuelStakes, DuelState, GameState, WorldCharacter } from '@/types/game';
import { DUEL_MOVE_BY_ID, DuelResponse, movesForKind } from '@/content/duelMoves';
import { applyEffects } from './consequenceEngine';
import { addMemory, pushFeed } from './gameState';
import { applyRelationshipShift } from './relationshipState';
import { isCloseBlood, kinshipTo } from './kinship';
import { chance, clamp, pick, rnd } from './random';
import { C } from '@/theme/theme';
import { Attack, Defence, TimingGrade } from '@/types/rpg';
import { equippedBonus, grantSkillXp, skillLevel } from './rpgProgress';
import { spendAction, timedActionAvailability } from './actionClock';

/** Composure both fighters start with. */
export const DUEL_START_VIGOUR = 100;

/** After this many exchanges the fight is called on remaining composure. */
export const DUEL_MAX_ROUNDS = 4;
export const SOLO_PRACTICE_SWINGS = 5;

export function armsPracticeAvailability(s: GameState): string | null {
  if (s.dead || s.duel || s.pendingEvent || s.rpg.mission || s.rpg.forge) return 'Finish the current encounter first';
  const available = timedActionAvailability(s);
  if (!available.available) return available.reason ?? 'Unavailable';
  if (s.age < 8) return 'Sword practice opens at age 8';
  if (skillLevel(s, 'arms') >= 10) return 'Maximum skill level';
  if (skillLevel(s, 'arms') >= 3 && !s.holding.upgrades.includes('training_yard')) return 'Build a training yard for advanced exercises';
  return null;
}

export function startArmsPractice(s: GameState): void {
  if (armsPracticeAvailability(s)) return;
  spendAction(s);
  // The player is the saved session owner; solo resolution never reads an opponent.
  s.duel = { opponentId: s.playerCharacterId, kind: 'duel', playerVigour: 100, opponentVigour: 100, round: 1, moveId: 'high_swing', log: [] };
  upgradeDuel(s);
  const c = s.duel!.combat!;
  c.practice = true; c.solo = { completed: 0, xp: 0 }; c.phase = 'attack';
}

export function finishArmsPractice(s: GameState, fightId: string): void {
  const d = s.duel, c = d?.combat;
  if (!d || !c?.solo || c.id !== fightId || d.outcome || s.dead) return;
  c.solo.xp = 6;
  finish(d, 'won', 'Practice complete. +6 Arms XP.');
  grantSkillXp(s, 'arms', 6, 'solo sword practice');
  pushFeed(s, 'SWORD PRACTICE', C.healthDark, 'You rehearse your cuts and footwork alone. The air puts up a brave defence. +6 Arms XP.', 'good');
}

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
  return Boolean(state.rpg.equipment.weapon) || ['sword', 'lance'].some((id) => state.inventory.includes(id));
}

export function duelAvailability(state: GameState, opponentId: string, kind: DuelKind, loanedBlade = false): DuelAvailability {
  if (state.dead) return { available: false, reason: 'Thy life is ended' };
  if (state.duel) return { available: false, reason: 'A fight is already underway' };
  const opponent = state.world.characters[opponentId];
  if (!opponent?.alive) return { available: false, reason: 'They are beyond fighting' };
  if (isCloseBlood(kinshipTo(state, opponentId))) return { available: false, reason: 'Thou will not raise a hand to close blood' };
  const minAge = kind === 'duel' ? 16 : 14;
  if (state.age < minAge) return { available: false, reason: `Requires age ${minAge}` };
  if (opponent.age < minAge) return { available: false, reason: 'They are too young to face thee' };
  if (kind === 'duel' && !loanedBlade && !hasBlade(state) && state.rankIdx < 1) {
    return { available: false, reason: 'A formal duel needs a blade or a station' };
  }
  return { available: true };
}

function nextMoveId(state: GameState, kind: DuelKind, previousId?: string): string {
  const options = movesForKind(kind).filter((move) => move.id !== previousId);
  return pick(options.length ? options : movesForKind(kind)).id;
}

export function startDuel(state: GameState, opponentId: string, kind: DuelKind, practice = false, stakes?: DuelStakes): GameState {
  if (!practice && !duelAvailability(state, opponentId, kind, !!stakes).available) return state;
  if (state.duel || state.dead || !state.world.characters[opponentId]?.alive) return state;
  const opponent = state.world.characters[opponentId]!;
  // A better fighter starts with more left in the tank than a village drunk.
  const opponentEdge = Math.round(opponentSkill(opponent) * 20) - 10;
  state.duel = {
    ...(stakes ? { stakes } : {}),
    opponentId,
    kind,
    playerVigour: DUEL_START_VIGOUR,
    opponentVigour: clamp(DUEL_START_VIGOUR + opponentEdge, 60, 120),
    round: 1,
    moveId: nextMoveId(state, kind),
    log: [],
  };
  upgradeDuel(state);
  state.duel.combat!.practice = practice;
  pushFeed(
    state,
    stakes ? 'CHALLENGE ACCEPTED' : practice ? 'SPARRING' : state.rpg.mission ? 'A CHAMPION STEPS FORWARD' : kind === 'duel' ? 'A DUEL IS CALLED' : 'A BRAWL BEGINS',
    kind === 'duel' ? C.healthDark : C.amber,
    stakes ? `${opponent.name} meets you in the yard. Blunted swords are provided. ${stakes.summary}` : practice ? `${opponent.name} lends you the yard for a friendly practice bout.` : state.rpg.mission ? `${opponent.name} takes the opposing side in the dispute. Settle the challenge before returning to your assignment.` : kind === 'duel'
      ? `Thou calls out ${opponent.name} before witnesses. There is no walking this back now.`
      : `You and ${opponent.name} take the fight into the yard. The spectators retreat to a cowardly but sensible distance.`,
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
  const move = DUEL_MOVE_BY_ID[duel.moveId];
  return fill((duel.combat ? move?.combatTelegraph : move?.telegraph) ?? '', opponent);
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
  return Boolean(state.duel && !state.duel.outcome && (state.duel.combat ? ['defence', 'attack'].includes(state.duel.combat.phase) : state.duel.round > DUEL_YIELD_AFTER_ROUND));
}

function finish(duel: DuelState, outcome: DuelState['outcome'], verdict: string): void {
  duel.outcome = outcome;
  duel.verdict = verdict;
  if (duel.combat) duel.combat.phase = 'resolved';
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
    finish(duel, 'yielded', duel.combat?.solo ? 'You leave the drill unfinished.' : `Thou lowers thy guard and steps back. ${opponent.name} accepts it, loudly.`);
    return state;
  }
  if (duel.combat?.solo) return state;

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
  if (duel.combat?.practice) {
    if (duel.combat.solo) { state.tab = 'life'; state.world.feedFilter = 'all'; }
    state.duel = null; return state;
  }
  const opponent = state.world.characters[duel.opponentId];
  const name = opponent?.name ?? 'thy opponent';
  const missionFight = state.rpg.mission?.phase === 'combat';
  const formal = duel.kind === 'duel' || missionFight;
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
        : `You beat ${name} in the yard. The spectators are impressed; the law will be less so.`,
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

  if (duel.stakes) {
    applyEffects(state, duel.outcome === 'won' ? duel.stakes.win : duel.stakes.lose);
    pushFeed(state, 'CHALLENGE SETTLED', C.amber, duel.outcome === 'won' ? `You claim the promised reward. ${duel.stakes.summary}` : `The challenge is lost. ${duel.stakes.summary}`, duel.outcome === 'won' ? 'good' : 'bad');
  }
  addMemory(state, duel.kind === 'duel' ? 'fought_a_duel' : 'fought_a_brawl', 2, name);
  if (!missionFight) grantSkillXp(state, 'arms', duel.outcome === 'won' ? 6 : 3, 'combat');
  state.duel = null;
  return state;
}

/** Upgrade old saves without rerolling their current attack or charging an action. */
export function upgradeDuel(s: GameState): void {
  const duel = s.duel;
  if (!duel) return;
  if (duel.combat) delete (duel.combat as unknown as Record<string, unknown>).assist;
  const opponent = s.world.characters[duel.opponentId];
  if (!opponent?.alive || s.dead) { s.duel = null; return; }
  if (!DUEL_MOVE_BY_ID[duel.moveId]) duel.moveId = 'high_swing';
  duel.combat ??= {
    version: 1, id: `fight_${s.nextId++}`, phase: duel.outcome ? 'resolved' : 'defence', sequence: 0,
    playerStamina: 100, opponentStamina: 100, exposed: false, feinted: false,
    archetype: duel.kind === 'brawl' ? 'brawler' : opponent.age > 35 ? 'veteran' : opponent.stats.wits > 60 ? 'duellist' : 'guard',
    damage: equippedBonus(s, 'damage'), protection: equippedBonus(s, 'protection'), dodgeCost: equippedBonus(s, 'dodgeCost'),
    arms: skillLevel(s, 'arms'), weaponId: s.rpg.equipment.weapon, armourId: s.rpg.equipment.armour,
    practice: false, opponentStartVigour: duel.opponentVigour,
  };
}
export function timingWindows(s: GameState): { good: number; perfect: number } {
  const c = s.duel?.combat;
  const progress = ((c?.arms ?? 1) - 1) / 9;
  return { good: 180 + progress * 60 + (c?.phase === 'defence_timing' && c.defence === 'block' ? 80 : 0), perfect: 60 + progress * 20 };
}
export function timingGrade(s: GameState, offsetMs: number): TimingGrade {
  const windows = timingWindows(s);
  const difference = Math.abs(offsetMs);
  return difference <= windows.perfect ? 'perfect' : difference <= windows.good ? 'good' : 'miss';
}
export function combatCost(s: GameState, move: Defence | Attack): number {
  if (s.duel?.combat?.solo) return 0;
  return ({ block: 10, dodge: 20 + (s.duel?.combat?.dodgeCost ?? 0), parry: 15, brace: 0, quick: 10, heavy: 25, feint: 15, recover: 0 })[move];
}
export function combatChoiceReason(s: GameState, move: Defence | Attack): string | null {
  const d = s.duel, c = d?.combat;
  if (!d || !c || d.outcome) return 'Fight is decided';
  if (c.solo && !['quick', 'heavy', 'feint'].includes(move)) return 'Choose a practice swing';
  if (move === 'parry' && d.moveId === 'grapple') return 'Cannot parry this guard-breaking strike';
  if (combatCost(s, move) > c.playerStamina) return `Needs ${combatCost(s, move)} stamina`;
  return null;
}
export function selectCombatMove(s: GameState, sequence: number, move: Defence | Attack): void {
  const d = s.duel, c = d?.combat;
  if (!d || !c || c.sequence !== sequence || combatChoiceReason(s, move)) return;
  if (c.phase === 'defence' && ['block', 'dodge', 'parry', 'brace'].includes(move)) {
    c.defence = move as Defence; c.phase = 'defence_timing';
  } else if (c.phase === 'attack' && ['quick', 'heavy', 'feint', 'recover'].includes(move)) {
    c.attack = move as Attack;
    if (move === 'recover') {
      c.lastStaminaGain = Math.min(30, 100 - c.playerStamina);
      c.playerStamina += c.lastStaminaGain;
      c.lastAction = 'recover'; c.lastMove = 'recover'; c.lastDamage = 0; c.lastGrade = undefined; c.impactId = c.sequence + 1;
      d.log = [...d.log, `You give up the attack and recover ${c.lastStaminaGain} stamina.`].slice(-6);
      nextExchange(s); return;
    }
    c.phase = 'attack_timing';
  } else return;
  c.playerStamina -= combatCost(s, move); c.sequence += 1;
}
export function resolveCombatTiming(s: GameState, sequence: number, offsetMs: number): void {
  const d = s.duel, c = d?.combat;
  if (!d || !c || d.outcome || c.sequence !== sequence || !Number.isFinite(offsetMs)) return;
  if (c.phase !== 'defence_timing' && c.phase !== 'attack_timing') return;
  const grade = timingGrade(s, offsetMs); c.lastGrade = grade; c.sequence += 1; c.impactId = c.sequence;
  if (c.solo) {
    c.lastMove = c.attack; c.lastAction = grade === 'miss' ? 'miss' : 'strike'; c.lastDamage = undefined;
    c.solo.completed += 1;
    const swing = c.attack === 'heavy' ? 'heavy swing' : c.attack === 'feint' ? 'feint and cut' : 'quick slash';
    d.log = [...d.log, `${grade.toUpperCase()} · ${grade === 'miss' ? `Your ${swing} is mistimed. Reset your stance.` : `You complete a ${swing}.`} Swing ${c.solo.completed}/${SOLO_PRACTICE_SWINGS}.`].slice(-6);
    c.attack = undefined; c.phase = 'attack';
    if (c.solo.completed === SOLO_PRACTICE_SWINGS) finishArmsPractice(s, c.id);
    return;
  }
  if (c.phase === 'defence_timing') {
    const enemy = s.world.characters[d.opponentId];
    const heavy = d.moveId === 'high_swing' || d.moveId === 'wild_flurry';
    const incoming = 15 + Math.round(opponentSkill(enemy) * 9) + (heavy ? 5 : 0) - (c.opponentStamina < 20 ? 6 : 0);
    c.opponentStamina = Math.max(0, c.opponentStamina - (heavy ? 25 : 15));
    const success = grade !== 'miss';
    let mitigation = c.defence === 'brace' ? 0.2 : 0;
    if (success && c.defence === 'block') mitigation = heavy ? 0.55 : grade === 'perfect' ? 0.95 : 0.8;
    if (success && c.defence === 'dodge') mitigation = 1;
    if (success && c.defence === 'parry') mitigation = grade === 'perfect' ? 1 : 0.65;
    c.exposed = grade === 'perfect' && (c.defence === 'parry' || c.defence === 'dodge');
    const damage = Math.max(0, Math.round(incoming * (1 - mitigation)) - c.protection);
    c.lastMove = c.defence; c.lastDamage = damage;
    c.lastAction = !success ? 'hurt' : c.defence === 'dodge' ? 'dodge' : 'block';
    d.playerVigour = Math.max(0, d.playerVigour - damage);
    const defenceText = !success ? 'You mistime your defence. The blow gets through.'
      : c.defence === 'dodge' ? 'You dodge clear of the blade.'
      : c.defence === 'parry' ? 'You turn the blade aside.'
      : c.defence === 'brace' ? 'You brace behind your guard and take the impact.'
      : 'You catch the swing on your guard.';
    d.log = [...d.log, `${grade.toUpperCase()} · ${defenceText} ${damage ? `You lose ${damage} vigour.` : 'No vigour lost.'}${c.exposed ? ' Their guard is open. Counter now!' : ''}`].slice(-6);
    if (d.playerVigour === 0) { finish(d, 'lost', 'Your guard gives way. The fight is over.'); return; }
    c.phase = 'attack';
  } else {
    const base = c.attack === 'heavy' ? 34 : c.attack === 'feint' ? 18 : 24;
    const factor = grade === 'miss' ? 0 : grade === 'perfect' ? 1.35 : 1;
    const guard = c.archetype === 'guard' && !c.exposed && !c.feinted ? 5 : 0;
    const damage = Math.max(0, Math.round((base + c.damage + c.arms * 0.65 + (s.stats.health - 50) / 25 + (c.exposed ? c.defence === 'parry' ? 12 : 6 : 0) + (c.feinted ? 5 : 0)) * factor) - (factor ? guard : 0));
    c.lastAction = grade === 'miss' ? 'miss' : 'strike';
    c.lastMove = c.attack; c.lastDamage = damage;
    d.opponentVigour = Math.max(0, d.opponentVigour - damage);
    c.feinted = c.attack === 'feint' && grade !== 'miss';
    const attackText = grade === 'miss' ? 'Your swing cuts empty air.'
      : c.attack === 'heavy' ? 'Your heavy swing crashes home.'
      : c.attack === 'feint' ? 'You sell the feint, then land the cut.'
      : 'Your quick slash lands.';
    d.log = [...d.log, `${grade.toUpperCase()} · ${attackText} ${damage ? `Your opponent loses ${damage} vigour.` : 'No vigour lost.'}${c.feinted ? ' Their next defence is weakened.' : ''}`].slice(-6);
    if (d.opponentVigour === 0) { finish(d, 'won', 'Your opponent goes down. Victory is yours.'); return; }
    nextExchange(s);
  }
}
function nextExchange(s: GameState): void {
  const d = s.duel!, c = d.combat!;
  const previousDefence = c.defence;
  d.round += 1; c.sequence += 1;
  if (d.round > DUEL_MAX_ROUNDS) {
    // Compare the share of starting vigour retained. An opponent who began below
    // 100 must not award a victory simply because the player never attacked.
    const won = d.playerVigour / DUEL_START_VIGOUR > d.opponentVigour / (c.opponentStartVigour ?? DUEL_START_VIGOUR);
    finish(d, won ? 'won' : 'lost', won ? 'Four exchanges fought. You kept more of your starting vigour and win.' : 'Four exchanges fought. You needed a greater share of your starting vigour left to win.');
    return;
  }
  c.playerStamina = Math.min(100, c.playerStamina + 10); c.opponentStamina = Math.min(100, c.opponentStamina + 10);
  c.phase = 'defence'; c.exposed = false; c.defence = undefined; c.attack = undefined;
  if (c.opponentStamina < 25) {
    c.opponentStamina = Math.min(100, c.opponentStamina + 30);
    c.phase = 'attack'; c.exposed = true;
    d.log = [...d.log, 'Your opponent gives up the attack to recover 30 stamina. Counter while their guard is open, or recover too.'].slice(-6);
    return;
  }
  // Veterans adapt to the last defence; every committed threat is still saved.
  const moves = c.archetype === 'brawler' ? ['wild_flurry', 'grapple', 'high_swing'] : c.archetype === 'guard' ? ['shield_press', 'low_cut', 'high_swing'] : c.archetype === 'duellist' ? ['feint', 'low_cut', 'crowd_play'] : previousDefence === 'parry' ? ['grapple', 'grapple', 'shield_press'] : previousDefence === 'block' ? ['high_swing', 'wild_flurry', 'feint'] : ['high_swing', 'feint', 'grapple', 'shield_press'];
  d.moveId = pick(moves.filter((id) => id !== d.moveId));
}
