import { MONEY_SUCCESS_THRESHOLD, shouldPlayMoneySuccess } from '@/services/audioLogic';

describe('game audio', () => {
  it('plays the success cue only for gains over five gold', () => {
    expect(MONEY_SUCCESS_THRESHOLD).toBe(5);
    expect(shouldPlayMoneySuccess(10, 15, true)).toBe(false);
    expect(shouldPlayMoneySuccess(10, 16, true)).toBe(true);
    expect(shouldPlayMoneySuccess(10, 40, false)).toBe(false);
    expect(shouldPlayMoneySuccess(20, 10, true)).toBe(false);
  });
});
