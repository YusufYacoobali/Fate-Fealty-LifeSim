import { assignLifeGoalIfDue, checkLifeGoal, goalView, GOAL_AGE } from '@/engine/goalEngine';
import { goalById, LIFE_GOALS } from '@/data/goals';
import { ageUp } from '@/engine/lifeDirector';
import { cloneState } from '@/engine/gameState';
import { makeState } from './helpers';

describe('life-goal assignment', () => {
  it('does not assign a goal before coming of age', () => {
    const s = makeState({ age: 17 });
    assignLifeGoalIfDue(s);
    expect(s.goalId).toBeNull();
  });

  it('assigns exactly one goal at 18, and never re-assigns', () => {
    const s = makeState({ age: 18 });
    assignLifeGoalIfDue(s);
    expect(s.goalId).not.toBeNull();
    const first = s.goalId;
    assignLifeGoalIfDue(s);
    expect(s.goalId).toBe(first);
  });

  it('only assigns goals not already satisfied', () => {
    // Already wealthy + married: those goals should never be the assignment.
    const s = makeState({ age: 18, gold: 999 });
    s.tags = [...s.tags, 'married'];
    for (let i = 0; i < 40; i++) {
      const t = { ...s, goalId: null, goalDone: false, tags: [...s.tags] };
      assignLifeGoalIfDue(t);
      expect(['fortune', 'wedded']).not.toContain(t.goalId);
    }
  });

  it('an age-up at 18 assigns a goal via the Life Director', () => {
    let s = makeState({ age: 17, stats: { health: 90, charm: 50, wits: 50, faith: 50 } });
    s = cloneState(s);
    ageUp(s);
    expect(s.age).toBe(18);
    expect(s.goalId).not.toBeNull();
  });
});

describe('life-goal completion', () => {
  it('marks the goal done and rewards it once when satisfied', () => {
    const s = makeState({ age: 20, gold: 200 });
    s.goalId = 'fortune';
    const repBefore = s.reputation;
    checkLifeGoal(s);
    expect(s.goalDone).toBe(true);
    expect(s.tags).toContain('goal_done');
    expect(s.reputation).toBe(Math.min(100, repBefore + 10));

    // Idempotent: a second check doesn't reward again.
    const repAfter = s.reputation;
    checkLifeGoal(s);
    expect(s.reputation).toBe(repAfter);
  });

  it('does not complete a goal whose target is unmet', () => {
    const s = makeState({ age: 20, gold: 10 });
    s.goalId = 'fortune';
    checkLifeGoal(s);
    expect(s.goalDone).toBe(false);
  });
});

describe('goalView', () => {
  it('returns null with no goal and a progress fraction with one', () => {
    const none = makeState({ age: 10 });
    expect(goalView(none)).toBeNull();

    const s = makeState({ age: 20, gold: 75 });
    s.goalId = 'fortune';
    const v = goalView(s)!;
    expect(v.id).toBe('fortune');
    expect(v.progress).toBeCloseTo(0.5); // 75 / 150
    expect(v.done).toBe(false);
  });
});

describe('goal data integrity', () => {
  it('GOAL_AGE is 18 and every goal id is unique with a valid lookup', () => {
    expect(GOAL_AGE).toBe(18);
    const ids = LIFE_GOALS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(goalById(id)).toBeDefined();
  });
});
