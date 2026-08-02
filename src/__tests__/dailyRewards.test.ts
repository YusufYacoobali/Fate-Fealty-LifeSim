import { DEFAULT_DAILY_REWARD, evaluateDailyReward, progressAfterClaim } from '@/services/dailyRewards';
import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';

describe('daily rewards', () => {
  it('allows one claim per local calendar day', () => {
    const first = evaluateDailyReward(DEFAULT_DAILY_REWARD, new Date(2026, 7, 2, 10));
    expect(first.eligible).toBe(true);
    const progress = progressAfterClaim(DEFAULT_DAILY_REWARD, first);
    const duplicate = evaluateDailyReward(progress, new Date(2026, 7, 2, 23, 59));
    expect(duplicate.eligible).toBe(false);
    expect(progress.totalClaims).toBe(1);
    expect(evaluateDailyReward(progress, new Date(2026, 7, 1, 23, 59)).eligible).toBe(false);
  });

  it('continues consecutive days and protects one missed day', () => {
    const progress = { ...DEFAULT_DAILY_REWARD, lastClaimDate: '2026-08-01', streak: 3 };
    const consecutive = evaluateDailyReward(progress, new Date(2026, 7, 2, 12));
    expect(consecutive.nextStreak).toBe(4);
    expect(consecutive.usedGrace).toBe(false);

    const grace = evaluateDailyReward(progress, new Date(2026, 7, 3, 12));
    expect(grace.nextStreak).toBe(4);
    expect(grace.usedGrace).toBe(true);
    expect(progressAfterClaim(progress, grace).graceAvailable).toBe(false);
  });

  it('resets gently after a longer absence and restores grace on day seven', () => {
    const reset = evaluateDailyReward({ ...DEFAULT_DAILY_REWARD, lastClaimDate: '2026-07-20', streak: 6 }, new Date(2026, 7, 2));
    expect(reset.nextStreak).toBe(1);
    const seventh = evaluateDailyReward({ ...DEFAULT_DAILY_REWARD, lastClaimDate: '2026-08-01', streak: 6, graceAvailable: false }, new Date(2026, 7, 2));
    expect(seventh.cycleDay).toBe(7);
    expect(progressAfterClaim({ ...DEFAULT_DAILY_REWARD, totalClaims: 6, graceAvailable: false }, seventh).graceAvailable).toBe(true);
  });

  it('applies a claim without spending an action or consuming world RNG', () => {
    const state = createLife({ worldSeed: 4021 });
    const beforeDraws = state.world.rngState.draws;
    const beforeActions = state.actionClock.used;
    const next = gameReducer(state, { type: 'CLAIM_DAILY_REWARD', gold: 8, streak: 3, bonus: 'health', bonusAmount: 3 });
    expect(next.gold).toBe(state.gold + 8);
    expect(next.stats.health).toBe(Math.min(100, state.stats.health + 3));
    expect(next.actionClock.used).toBe(beforeActions);
    expect(next.world.rngState.draws).toBe(beforeDraws);
    expect(state.gold).not.toBe(next.gold);
  });
});
