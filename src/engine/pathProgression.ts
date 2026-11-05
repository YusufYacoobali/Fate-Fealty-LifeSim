import {recogniseRuler} from './royalSuccessionEngine';
import {rankPromotionRequirements} from './progressionRequirements';
import { careerById } from '@/data/careers';
import { legacyStatus } from './lifeDepthState';
/** Ordinary levels use the existing standing meter, independent of occupation.
 * The Crown still belongs to the recorded ruler and lawful succession. */

import { GameState, PathKey } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { HOLDING_UNLOCK_AGE } from '@/data/holding';
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

/** Progress is a single 0–100 meter. Completed standing waits for its gates. */
export function adjustRankProgress(s:GameState,delta:number):void {
 s.rankProgress=s.rankProgress>=100?100:Math.max(0,Math.min(100,s.rankProgress+delta));
}
export function canPromote(s: GameState): boolean {
 const rows=rankPromotionRequirements(s);
 return !s.dead&&!s.pendingEvent&&!s.duel&&!s.rpg.mission&&!s.rpg.forge&&rows.length>0&&rows.every(r=>r.met);
}
/** Explain the actual life and requirements that earned this one-level rise. */
export function promotionRationale(s:GameState):string {
 const reasons=standingContributions(s).filter(r=>r.delta>0).sort((a,b)=>b.delta-a.delta).slice(0,3).map(r=>r.label);
 return `Your completed standing${reasons.length?`, built through ${reasons.join(', ')},`:''} meets the requirements for ${RANKS[s.rankIdx+1]?.key??'your next level'}.`;
}
/** The legacy force argument cannot bypass age, access, standing or Crown law. */
export function promote(s:GameState,_force=false):boolean {
 if(!canPromote(s))return false;
 const nextIndex=s.rankIdx+1,next=RANKS[nextIndex],p=s.world.characters[s.playerCharacterId],reason=promotionRationale(s);
 if(nextIndex===5&&!recogniseRuler(s,p.id,'lawful succession supported by completed standing'))return false;
 const status=p.socialStatus??=legacyStatus(s.rankIdx);
 if(nextIndex===3){if(status.estate!=='royal')status.estate='noble';status.titles=[...new Set([...status.titles,'Noble'])];}
 if(nextIndex===4){if(status.estate!=='royal')status.estate='baronial';status.titles=[...new Set([...status.titles,'Baron'])];}
 status.grants=[...new Set([...status.grants,`standing_rank_${nextIndex}_${s.world.currentYear}`])];
 s.rankIdx=p.rankIdx=nextIndex;s.rankProgress=0;
 addMemory(s,`promoted_${next.key.toLowerCase()}`,3,reason);
 pushFeed(s,`PROMOTED → ${next.short}`,C.good,`${reason} You rise to ${next.key}. One cousin has taken the news personally.`,'good');
 return true;
}

export function demote(s: GameState): boolean {
  if (s.rankIdx <= 0) return false;
  const lost = RANKS[s.rankIdx];
  s.rankIdx -= 1;
  const player = s.world.characters[s.playerCharacterId];
  if (player) {const previous=player.socialStatus;player.socialStatus=legacyStatus(s.rankIdx);if(previous){player.socialStatus.martialHonour=previous.martialHonour;if(previous.estate==='royal')player.socialStatus.estate='royal';}player.rankIdx=s.rankIdx;}
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

  // Regents hold the land until the sixth winter. Before then the estate must
  // not quietly earn social standing for a child who cannot yet manage it.
  if (s.age >= HOLDING_UNLOCK_AGE) {
    const holdingFloor = Math.min(s.holding.stores, s.holding.security, s.holding.loyalty);
    if (holdingFloor >= 75) add('a flourishing holding', 3);
    else if (holdingFloor >= 50) add('a well-kept holding', 1);
    else if (holdingFloor < 20) add('a holding falling apart', -3);
  }

  const standings = Object.values(s.world.factions).map((faction) => faction.playerStanding);
  const bestFaction = Math.max(0, ...standings);
  const worstFaction = Math.min(0, ...standings);
  if (bestFaction >= 20) add('powerful friends', 2);
  else if (bestFaction >= 8) add('friends in useful places', 1);
  if (worstFaction <= -20) add('a powerful enemy', -2);

  if (s.occupation.careerId) {
    add('steady work',1);
    if(s.occupation.performance>=65)add('respected work',1);
    const family=careerById(s.occupation.careerId)?.family;
    if(family&&(s.world.characters[s.playerCharacterId].professionalHistory?.[family]?.reputation??0)>=30)add('professional renown',1);
  }
  if(s.world.characters[s.playerCharacterId].education?.qualifications.length)add('education and training',1);

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

function holdingStandingLine(s: GameState, items: StandingContribution[]): string {
  const holding = items.find((item) => item.label.includes('holding'));
  if (!holding) return '';
  if (holding.label === 'a flourishing holding') return ' Thy flourishing holding is doing more than feeding people; it is lifting thy station.';
  if (holding.label === 'a well-kept holding') return ' The holding is tidy enough that important people have begun pretending they noticed first.';

  const weakest = (['stores', 'security', 'loyalty'] as const)
    .reduce((lowest, key) => s.holding[key] < s.holding[lowest] ? key : lowest, 'stores');
  if (weakest === 'stores') return ' Thy emptying stores make the estate look poorly governed; higher station is becoming harder to argue for.';
  if (weakest === 'security') return ' Thy neglected security makes the estate look weak; higher station is becoming harder to argue for.';
  return ' Thy people are openly losing faith in thee; higher station is becoming harder to argue for.';
}

function explainStanding(s: GameState, items: StandingContribution[], delta: number): void {
  const strongHoldingSignal = items.some((item) => item.label.includes('holding') && Math.abs(item.delta) >= 3);
  if (Math.abs(delta) < 2 && !strongHoldingSignal) return;

  const reasons = humanReasons(items, delta >= 0);
  const reasonText = reasons.length === 0
    ? ''
    : reasons.length === 1
      ? ` The chief reason is ${reasons[0]}.`
      : ` The loudest arguments are ${reasons[0]} and ${reasons[1]}.`;
  const holdingText = holdingStandingLine(s, items);

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
  } else if (holdingText && strongHoldingSignal) {
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
 * then recognise the next eligible level. Progress can fall as well as
 * rise, and a rank already held is never lost here — only the climb toward the
 * next one is.
 */
export function tickProgression(s: GameState): GameState {
  const contributions = standingContributions(s);
  const delta = contributions.reduce((sum, item) => sum + item.delta, 0);
  adjustRankProgress(s,delta);
  explainStanding(s, contributions, delta);
  if (canPromote(s)) promote(s);
  return s;
}
