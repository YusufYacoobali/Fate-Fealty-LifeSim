import { gameReducer } from '@/state/gameReducer';
import { makeState } from './helpers';
import { relationshipWith, perspectives, tickRelationshipDecay } from '@/engine/relationshipEngine';
import { selectKin } from '@/state/viewModel';
import { normalizeGameState } from '@/state/persistence';
import { simulateLivingWorld } from '@/engine/worldEngine';
import { ACHIEVEMENTS } from '@/data/achievements';
import { LIFE_GOALS } from '@/data/goals';

describe('24-action yearly clock', () => {
  it('charges valid actions, rejects invalid attempts for free, caps at 24, and resets on age up', () => {
    let state = makeState({ age: 18, settings: { autoScroll: true, difficulty: 'Normal', liveForever: true, haptics: false, music: false, soundEffects: false } });
    state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'church' });
    expect(state.actionClock.used).toBe(1);

    const infant = gameReducer(makeState({ age: 2 }), { type: 'DO_ACTIVITY', id: 'train' });
    expect(infant.actionClock.used).toBe(0);

    state.actionClock.used = 23;
    state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'church' });
    expect(state.actionClock.used).toBe(24);
    const faith = state.stats.faith;
    state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'church' });
    expect(state.actionClock.used).toBe(24);
    expect(state.stats.faith).toBe(faith);

    state.pendingEvent = null;
    state = gameReducer(state, { type: 'AGE_UP' });
    expect(state.actionClock.used).toBe(0);
    expect(state.actionClock.fullYears).toBe(1);
  });

  it('never accepts player commands after death', () => {
    const dead = makeState({ dead: true, deathCause: 'test', actionClock: { used: 4, cap: 24, lifetimeUsed: 4, fullYears: 0 } });
    const beforeFeed = dead.feed.length;
    const after = gameReducer(dead, { type: 'DO_ACTIVITY', id: 'church' });
    expect(after.actionClock.used).toBe(4);
    expect(after.feed).toHaveLength(beforeFeed);
  });
});

describe('careers and economy', () => {
  it('supports applying and working as separate timed actions', () => {
    let state = makeState({ age: 18, gold: 0 });
    state = gameReducer(state, { type: 'CAREER_ACTION', action: 'apply', careerId: 'farmhand' });
    expect(state.occupation.careerId).toBe('farmhand');
    expect(state.actionClock.used).toBe(1);
    state = gameReducer(state, { type: 'CAREER_ACTION', action: 'work' });
    expect(state.gold).toBeGreaterThan(0);
    expect(state.occupation.experience).toBeGreaterThan(0);
    expect(state.actionClock.used).toBe(2);
  });

  it('does not leave occupations available after all yearly actions are spent', () => {
    const fullClock = { used: 24, cap: 24, lifetimeUsed: 24, fullYears: 1 };
    const state = makeState({ age: 18, actionClock: fullClock });
    const after = gameReducer(state, { type: 'CAREER_ACTION', action: 'apply', careerId: 'farmhand' });
    expect(after.occupation.careerId).toBeNull();
    expect(after.actionClock.used).toBe(24);
  });

  it('tracks borrowing and repayment without allowing free invalid retries', () => {
    let state = makeState({ age: 18, gold: 20 });
    state = gameReducer(state, { type: 'CAREER_ACTION', action: 'borrow' });
    expect(state.debts[0].principal).toBe(20);
    expect(state.tags).toContain('has_borrowed');
    const used = state.actionClock.used;
    state = gameReducer(state, { type: 'CAREER_ACTION', action: 'borrow' });
    expect(state.actionClock.used).toBe(used);
  });
});

describe('mutual relationships and living characters', () => {
  it('decays neglected positive bonds while retaining both perspectives', () => {
    const state = makeState({ age: 20 });
    const relation = relationshipWith(state, 'mother');
    const before = perspectives(state, relation).other.affinity;
    tickRelationshipDecay(state);
    expect(perspectives(state, relation).other.affinity).toBeLessThan(before);
    expect(relation.aToB).not.toBe(relation.bToA);
  });

  it('allows accepting an NPC proposal and marrying by choice', () => {
    let state = makeState({ age: 22, attraction: 'women' });
    const candidate = state.kin.find((kin) => kin.id === 'agnes')!;
    candidate.age = 22;
    state.world.proposalFromId = candidate.id;
    state = gameReducer(state, { type: 'KIN_INTERACT', id: candidate.id, action: 'accept_proposal' });
    expect(state.tags).toContain('married');
    expect(state.tags).toContain('chose_marriage');
    expect(state.kin.find((kin) => kin.id === candidate.id)?.kind).toBe('spouse');
  });

  it('keeps deceased people in their dedicated filter', () => {
    const state = makeState();
    state.kin.find((kin) => kin.id === 'mother')!.alive = false;
    state.world.relationFilter = 'deceased';
    expect(selectKin(state).map((kin) => kin.id)).toContain('mother');
    state.world.relationFilter = 'family';
    expect(selectKin(state).map((kin) => kin.id)).not.toContain('mother');
  });

  it('advances autonomous careers without exceeding the living-cast cap', () => {
    const state = makeState({ age: 25 });
    simulateLivingWorld(state);
    expect(Object.values(state.world.characters).filter((kin) => kin.alive).length).toBeLessThanOrEqual(60);
    expect(state.kin.some((kin) => kin.occupation.careerId != null)).toBe(true);
  });
});

describe('save migration', () => {
  it('preserves Premium action usage while access is being rechecked', () => {
    const saved = makeState({
      lifetimeUnlocked: true,
      actionClock: { used: 41, cap: 50, lifetimeUsed: 141, fullYears: 2 },
    });
    const loaded = normalizeGameState(saved);
    expect(loaded.actionClock.used).toBe(41);
    expect(loaded.actionClock.cap).toBe(24);

    const restored = gameReducer(loaded, { type: 'SET_LIFETIME_UNLOCKED', unlocked: true });
    expect(restored.actionClock).toMatchObject({ used: 41, cap: 50 });
  });

  it('upgrades a legacy save without discarding its life', () => {
    const legacy = makeState({ first: 'Legacy', age: 33 }) as any;
    delete legacy.world;
    delete legacy.actionClock;
    delete legacy.occupation;
    delete legacy.debts;
    delete legacy.gender;
    delete legacy.pronouns;
    delete legacy.attraction;
    legacy.kin = legacy.kin.slice(0, 4).map(({ gender, pronouns, attraction, stats, traits, gold, rankIdx, occupation, debts, healthTags, memories, ...old }: any) => old);
    const migrated = normalizeGameState(legacy);
    expect(migrated.first).toBe('Legacy');
    expect(migrated.age).toBe(33);
    expect(migrated.actionClock.cap).toBe(24);
    expect(Object.values(migrated.world.relationships)).toHaveLength(4);
    expect(['he', 'she']).toContain(migrated.kin[0].pronouns.id);
    expect(['man', 'woman']).toContain(migrated.kin[0].gender);
  });
});

describe('expanded achievements and text assets', () => {
  it('ships at least 45 deeds with unique ids and no single-letter placeholders', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(45);
    expect(new Set(ACHIEVEMENTS.map((achievement) => achievement.id)).size).toBe(ACHIEVEMENTS.length);
    expect(ACHIEVEMENTS.some((achievement) => /^[A-Z+!]$/.test(achievement.emoji))).toBe(false);
    expect(LIFE_GOALS.some((goal) => /^[A-Z+!]$/.test(goal.emoji))).toBe(false);
  });
});
