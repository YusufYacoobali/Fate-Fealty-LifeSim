import { DAILY_REWARDS, DEFAULT_DAILY_REWARD, evaluateDailyReward, progressAfterClaim } from '@/services/dailyRewards';
import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';

describe('daily rewards', () => {
  it('uses a complete fourteen-day ledger and wraps after its royal bounty', () => {
    expect(DAILY_REWARDS).toHaveLength(14);
    expect(DAILY_REWARDS.map((reward) => reward.day)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    expect(DAILY_REWARDS.map((reward) => reward.gold)).toEqual([5, 10, 20, 35, 50, 75, 125, 150, 200, 275, 350, 425, 500, 1000]);
    expect(DAILY_REWARDS[6]).toMatchObject({ gold: 125, bonus: 'reputation', bonusAmount: 10, itemId: 'stewards_signet' });
    expect(DAILY_REWARDS[13]).toMatchObject({ gold: 1000, bonus: 'reputation', bonusAmount: 25, itemId: 'kings_charter' });
    const wrapped = evaluateDailyReward({ ...DEFAULT_DAILY_REWARD, lastClaimDate: '2026-08-01', streak: 14 }, new Date(2026, 7, 2));
    expect(wrapped.cycleDay).toBe(1);
  });

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

  it('resets gently after a longer absence and restores grace at the end of the fortnight', () => {
    const reset = evaluateDailyReward({ ...DEFAULT_DAILY_REWARD, lastClaimDate: '2026-07-20', streak: 6 }, new Date(2026, 7, 2));
    expect(reset.nextStreak).toBe(1);
    const finalDay = evaluateDailyReward({ ...DEFAULT_DAILY_REWARD, lastClaimDate: '2026-08-01', streak: 13, graceAvailable: false }, new Date(2026, 7, 2));
    expect(finalDay.cycleDay).toBe(14);
    expect(progressAfterClaim({ ...DEFAULT_DAILY_REWARD, totalClaims: 13, graceAvailable: false }, finalDay).graceAvailable).toBe(true);
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

  it('grants each milestone keepsake once and applies its permanent effects once', () => {
    const state = createLife({ worldSeed: 4022 });
    const first = gameReducer(state, { type: 'CLAIM_DAILY_REWARD', gold: 125, streak: 7, itemId: 'stewards_signet' });
    expect(first.inventory).toContain('stewards_signet');
    expect(first.stats.charm).toBe(Math.min(100, state.stats.charm + 8));
    expect(first.stats.wits).toBe(Math.min(100, state.stats.wits + 5));

    const repeated = gameReducer(first, { type: 'CLAIM_DAILY_REWARD', gold: 125, streak: 21, itemId: 'stewards_signet' });
    expect(repeated.inventory.filter((id) => id === 'stewards_signet')).toHaveLength(1);
    expect(repeated.stats.charm).toBe(first.stats.charm);
    expect(repeated.stats.wits).toBe(first.stats.wits);
  });
});
