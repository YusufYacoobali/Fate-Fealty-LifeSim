import { GameState } from '@/types/game';

/**
 * Life-goal registry. At coming-of-age (18) the player is handed one of these
 * ambitions to chase alongside the long climb to nobility. Each goal is pure
 * data: a progress fraction and a done predicate over the game state.
 */
export interface LifeGoalDef {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  /** 0..1 progress toward the goal. */
  progress: (s: GameState) => number;
  done: (s: GameState) => boolean;
}

const frac = (have: number, need: number) => Math.max(0, Math.min(1, have / need));
const livingChildren = (s: GameState) => s.kin.filter((k) => k.kind === 'child' && k.alive).length;

const GOLD_TARGET = 150;
const CHILDREN_TARGET = 3;
const STAT_TARGET = 85;
const FAITH_TARGET = 90;
const ELDER_TARGET = 65;

export const LIFE_GOALS: LifeGoalDef[] = [
  { id: 'fortune', title: 'Amass a Fortune', desc: `Hold ${GOLD_TARGET} gold at once.`, emoji: '💰', progress: (s) => frac(s.gold, GOLD_TARGET), done: (s) => s.gold >= GOLD_TARGET },
  { id: 'family', title: 'Raise a Family', desc: `Raise ${CHILDREN_TARGET} living children.`, emoji: '👨‍👩‍👧', progress: (s) => frac(livingChildren(s), CHILDREN_TARGET), done: (s) => livingChildren(s) >= CHILDREN_TARGET },
  { id: 'scholar', title: 'Become a Scholar', desc: `Raise Wits to ${STAT_TARGET}.`, emoji: '✦', progress: (s) => frac(s.stats.wits, STAT_TARGET), done: (s) => s.stats.wits >= STAT_TARGET },
  { id: 'beloved', title: "Win the People's Love", desc: `Raise Charm to ${STAT_TARGET}.`, emoji: '★', progress: (s) => frac(s.stats.charm, STAT_TARGET), done: (s) => s.stats.charm >= STAT_TARGET },
  { id: 'devout', title: 'Lead a Holy Life', desc: `Raise Faith to ${FAITH_TARGET}.`, emoji: '✝', progress: (s) => frac(s.stats.faith, FAITH_TARGET), done: (s) => s.stats.faith >= FAITH_TARGET },
  { id: 'knighthood', title: 'Earn Your Spurs', desc: 'Rise to the rank of Knight.', emoji: '🛡️', progress: (s) => frac(s.rankIdx, 2), done: (s) => s.rankIdx >= 2 },
  { id: 'elder', title: 'Live to a Grand Old Age', desc: `Reach the age of ${ELDER_TARGET}.`, emoji: '🧓', progress: (s) => frac(s.age - 18, ELDER_TARGET - 18), done: (s) => s.age >= ELDER_TARGET },
  { id: 'wedded', title: 'Find True Love', desc: 'Take a spouse and wed.', emoji: '💍', progress: (s) => (s.tags.includes('married') ? 1 : 0), done: (s) => s.tags.includes('married') },
];

const BY_ID: Record<string, LifeGoalDef> = LIFE_GOALS.reduce(
  (acc, g) => {
    acc[g.id] = g;
    return acc;
  },
  {} as Record<string, LifeGoalDef>,
);

export function goalById(id: string): LifeGoalDef | undefined {
  return BY_ID[id];
}

/** Goals worth assigning: those not already satisfied at coming-of-age. */
export function assignableGoals(s: GameState): LifeGoalDef[] {
  return LIFE_GOALS.filter((g) => !g.done(s));
}
