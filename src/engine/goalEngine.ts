/**
 * Life-goal engine. Hands the player an ambition at coming-of-age (18) and
 * watches for its completion, rewarding it once. Kept as the single chokepoint
 * for goal logic; UI just reads the assigned goal's progress.
 */

import { GameState } from '@/types/game';
import { assignableGoals, goalById } from '@/data/goals';
import { applyEffects } from './consequenceEngine';
import { addTag, hasTag, pushFeed } from './gameState';
import { pick } from './random';
import { C } from '@/theme/theme';

export const GOAL_AGE = 18;

/** Assign a life goal once the player comes of age (idempotent). */
export function assignLifeGoalIfDue(s: GameState): GameState {
  if (s.dead) return s;
  if (s.goalId || s.goalDone) return s;
  if (s.age < GOAL_AGE) return s;

  const options = assignableGoals(s);
  if (options.length === 0) return s;
  const goal = pick(options);
  s.goalId = goal.id;
  pushFeed(
    s,
    'COMING OF AGE',
    C.purpleDark,
    `You are a grown soul now. You set yourself a life's ambition: ${goal.emoji} ${goal.title} — ${goal.desc}`,
    'good',
  );
  return s;
}

/** If the active goal is now satisfied, mark it done and reward it once. */
export function checkLifeGoal(s: GameState): GameState {
  if (!s.goalId || s.goalDone || s.dead) return s;
  const goal = goalById(s.goalId);
  if (!goal || !goal.done(s)) return s;

  s.goalDone = true; // set before reward so the reward can't re-trigger this
  if (!hasTag(s, 'goal_done')) addTag(s, 'goal_done');
  applyEffects(s, { gold: 15, reputation: 10, faith: 2, memory: { tag: 'goal_fulfilled', weight: 4 } });
  pushFeed(
    s,
    'AMBITION FULFILLED',
    C.good,
    `${goal.emoji} You have achieved your life's ambition — ${goal.title}! The village marvels, and you stand a little taller.`,
    'good',
  );
  return s;
}

export interface GoalView {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  progress: number; // 0..1
  done: boolean;
}

/** Display shape for the active goal, or null if none assigned yet. */
export function goalView(s: GameState): GoalView | null {
  if (!s.goalId) return null;
  const goal = goalById(s.goalId);
  if (!goal) return null;
  return {
    id: goal.id,
    title: goal.title,
    desc: goal.desc,
    emoji: goal.emoji,
    progress: s.goalDone ? 1 : Math.max(0, Math.min(1, goal.progress(s))),
    done: s.goalDone,
  };
}
