/**
 * Path & rank progression.
 *
 * Two things live here:
 *  1. The visible CLASS LADDER, advanced
 *     via hidden `rankProgress` plus gating requirements per rank.
 *  2. The hidden LIFE PATHS (martial/court/church/labour/outlaw) whose dominant
 *     value tells the event picker what kind of life this is becoming.
 */

import { GameState, PathKey } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { addMemory, pushFeed } from './gameState';
import { C } from '@/theme/theme';

/** The dominant hidden path (or 'labour' as the default peasant baseline). */
export function dominantPath(s: GameState): PathKey {
  let best: PathKey = 'labour';
  let bestVal = -1;
  (Object.keys(s.paths) as PathKey[]).forEach((k) => {
    if (s.paths[k] > bestVal) {
      bestVal = s.paths[k];
      best = k;
    }
  });
  return best;
}

/** Check whether the player currently QUALIFIES for the next rank. */
export function canPromote(s: GameState): boolean {
  const next = RANKS[s.rankIdx + 1];
  if (!next) return false;
  if (next.premium && !s.lifetimeUnlocked) return false;
  const req = next.promote;
  if (s.age < req.minAge) return false;
  if (req.minGold != null && s.gold < req.minGold) return false;
  if (s.rankProgress < req.progress) return false;
  if (req.stats) {
    for (const [k, v] of Object.entries(req.stats)) {
      if ((s.stats as any)[k] < (v as number)) return false;
    }
  }
  return true;
}

const PROMOTION_REASON: Record<string, string> = {
  'a life under arms': 'service under arms',
  'a life at court': 'years spent learning which fork and which lie to use at court',
  'a life in the Church': 'visible devotion to the Church',
  'honest trade and toil': 'honest work that even the lazy have noticed',
  'a name known for the right reasons': 'a name spoken well beyond thy own table',
  'a growing good name': 'a steadily improving name',
  'a name beginning to travel': 'a name beginning to travel',
  'conspicuous wealth': 'wealth too conspicuous to dismiss',
  'a comfortable purse': 'a comfortably heavy purse',
  'a purse that covers appearances': 'enough coin to look respectable at a distance',
  'courtly bearing': 'courtly bearing',
  'letters and learning': 'letters and learning',
  'a reputation for piety': 'a reputation for piety',
  'a flourishing holding': 'a flourishing holding',
  'a well-kept holding': 'a well-kept holding',
  'powerful friends': 'powerful friends',
  'friends in useful places': 'friends in useful places',
  'respected work': 'respected work',
};

/** A short, player-facing account of what actually earned an ordinary promotion. */
export function promotionRationale(s: GameState): string {
  const reasons = standingContributions(s)
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .map((item) => PROMOTION_REASON[item.label] ?? item.label)
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, 3);

  if (!reasons.length) return 'Years of stubborn effort have finally become inconvenient to ignore.';
  if (reasons.length === 1) return `Thy ${reasons[0]} has finally become inconvenient to ignore.`;
  if (reasons.length === 2) return `Thy ${reasons[0]} and ${reasons[1]} have finally become inconvenient to ignore.`;
  return `Thy ${reasons[0]}, ${reasons[1]}, and ${reasons[2]} have finally become inconvenient to ignore.`;
}

/** Promote one rank if possible (or forced). Resets rankProgress. */
export function promote(s: GameState, force = false): boolean {
  const next = RANKS[s.rankIdx + 1];
  if (!next) return false;
  if (!force && !canPromote(s)) return false;
  const reason = force
    ? 'Fortune, favour, or somebody important has moved the ladder beneath thy feet.'
    : promotionRationale(s);
  s.rankIdx += 1;
  s.rankProgress = 0;
  addMemory(s, `promoted_${next.key.toLowerCase()}`, 3, reason);
  pushFeed(
    s,
    `PROMOTED → ${next.short}`,
    C.good,
    `${reason} Swineford can argue no longer: you are now a ${next.key}. One cousin has taken the news personally.`,
    'good',
  );
  return true;
}

export function demote(s: GameState): boolean {
  if (s.rankIdx <= 0) return false;
  const lost = RANKS[s.rankIdx];
  s.rankIdx -= 1;
  s.rankProgress = 40;
  addMemory(s, `demoted_from_${lost.key.toLowerCase()}`, 3);
  pushFeed(
    s,
    `DEMOTED → ${RANKS[s.rankIdx].short}`,
    C.bad,
    `Disgrace! You lose the rank of ${lost.key} and slink back to being a ${RANKS[s.rankIdx].key}.`,
    'bad',
  );
  return true;
}

export interface StandingContribution {
  label: string;
  delta: number;
}

/** Yearly standing owed to the life the player is visibly leading. */
const PATH_STANDING: Record<PathKey, number> = {
  martial: 3,
  court: 3,
  church: 3,
  labour: 2,
  outlaw: -4,
};

const PATH_LABEL: Record<PathKey, string> = {
  martial: 'a life under arms',
  court: 'a life at court',
  church: 'a life in the Church',
  labour: 'honest trade and toil',
  outlaw: 'a life outside the law',
};

/**
 * Every yearly pressure on the player's social standing, with a reason attached.
 *
 * Standing used to come almost entirely from swinging a sword: the tick added
 * +1 for a martial or court life and nothing else, so training was the only real
 * ladder. It is now a running account — wealth, reputation, faith, learning,
 * a thriving estate, faction favour and steady work all raise it, and disgrace,
 * debt, notoriety and a collapsing estate all pull it back down.
 */
export function standingContributions(s: GameState): StandingContribution[] {
  const out: StandingContribution[] = [];
  const add = (label: string, delta: number) => {
    if (delta !== 0) out.push({ label, delta });
  };

  // Standing is never free: it must be re-earned every year.
  add('the passing of a year', -2);

  const path = dominantPath(s);
  add(PATH_LABEL[path], PATH_STANDING[path]);

  // Reputation runs -100..100 from a standing start of zero, so a new life is
  // unknown rather than disgraced. It is what most event choices actually move,
  // which is how a choice-led life climbs without ever lifting a sword.
  if (s.reputation >= 60) add('a name known for the right reasons', 3);
  else if (s.reputation >= 30) add('a growing good name', 2);
  else if (s.reputation >= 12) add('a name beginning to travel', 1);
  else if (s.reputation <= -40) add('a name spoken as a warning', -3);
  else if (s.reputation < 0) add('a tarnished name', -1);

  if (s.gold >= 200) add('conspicuous wealth', 3);
  else if (s.gold >= 80) add('a comfortable purse', 2);
  else if (s.gold >= 30) add('a purse that covers appearances', 1);

  const debt = s.debts.reduce((sum, item) => sum + item.principal, 0);
  if (debt >= 60) add('debts everyone has heard about', -3);
  else if (debt > 0) add('outstanding debts', -1);

  if (s.stats.charm >= 70) add('courtly bearing', 1);
  if (s.stats.wits >= 70) add('letters and learning', 1);
  if (s.stats.faith >= 70) add('a reputation for piety', 1);

  // A thriving estate is visible proof of competence; a failing one, of the
  // opposite. This is the Holding's route into the class ladder.
  const holdingFloor = Math.min(s.holding.stores, s.holding.security, s.holding.loyalty);
  if (holdingFloor >= 75) add('a flourishing holding', 3);
  else if (holdingFloor >= 50) add('a well-kept holding', 1);
  else if (holdingFloor < 20) add('a holding falling apart', -3);

  const standings = Object.values(s.world.factions).map((faction) => faction.playerStanding);
  const bestFaction = Math.max(0, ...standings);
  const worstFaction = Math.min(0, ...standings);
  if (bestFaction >= 20) add('powerful friends', 2);
  else if (bestFaction >= 8) add('friends in useful places', 1);
  if (worstFaction <= -20) add('a powerful enemy', -2);

  if (s.occupation.careerId && s.occupation.performance >= 65) add('respected work', 1);

  const legal = s.world.characters[s.playerCharacterId]?.legalState;
  if (s.tags.includes('imprisoned')) add('imprisonment', -6);
  if ((legal?.notoriety ?? 0) >= 30) add('a name known to the law', -3);
  else if ((legal?.suspicion ?? 0) >= 50) add('the suspicion of officials', -1);

  return out;
}

/** Net yearly movement in rankProgress before any promotion is checked. */
export function yearlyStandingDelta(s: GameState): number {
  return standingContributions(s).reduce((sum, item) => sum + item.delta, 0);
}

function humanReasons(items: StandingContribution[], positive: boolean): string[] {
  return items
    .filter((item) => positive ? item.delta > 0 : item.delta < 0)
    .filter((item) => item.label !== 'the passing of a year')
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 2)
    .map((item) => item.label);
}

function holdingStandingLine(items: StandingContribution[]): string {
  const holding = items.find((item) => item.label.includes('holding'));
  if (!holding) return '';
  if (holding.label === 'a flourishing holding') return ' Thy flourishing holding is doing more than feeding people; it is lifting thy station.';
  if (holding.label === 'a well-kept holding') return ' The holding is tidy enough that important people have begun pretending they noticed first.';
  return ' Thy holding is falling apart, and unfortunately so is thy argument for higher station.';
}

function explainStanding(s: GameState, items: StandingContribution[], delta: number): void {
  const hasHoldingSignal = items.some((item) => item.label.includes('holding'));
  if (Math.abs(delta) < 2 && !hasHoldingSignal) return;

  const reasons = humanReasons(items, delta >= 0);
  const reasonText = reasons.length === 0
    ? ''
    : reasons.length === 1
      ? ` The chief reason is ${reasons[0]}.`
      : ` The loudest arguments are ${reasons[0]} and ${reasons[1]}.`;
  const holdingText = holdingStandingLine(items);

  if (delta > 0) {
    pushFeed(
      s,
      `STANDING ↑ ${delta}`,
      C.good,
      `Thy name rises a little in the reckoning.${reasonText}${holdingText}`,
      'good',
    );
  } else if (delta < 0) {
    pushFeed(
      s,
      `STANDING ↓ ${Math.abs(delta)}`,
      C.bad,
      `The realm's opinion of thee has developed concerns.${reasonText}${holdingText}`,
      'bad',
    );
  } else if (holdingText) {
    pushFeed(
      s,
      'STANDING ↔',
      C.amber,
      `Thy standing holds where it is; the good arguments and the bad have cancelled one another.${holdingText}`,
      'plain',
    );
  }
}

/**
 * Called every age-up after events resolve: settle the year's standing account,
 * then auto-promote if the player has earned it. Progress can fall as well as
 * rise, and a rank already held is never lost here — only the climb toward the
 * next one is.
 */
export function tickProgression(s: GameState): GameState {
  const contributions = standingContributions(s);
  const delta = contributions.reduce((sum, item) => sum + item.delta, 0);
  s.rankProgress = Math.max(0, s.rankProgress + delta);
  explainStanding(s, contributions, delta);
  if (canPromote(s)) promote(s);
  return s;
}
