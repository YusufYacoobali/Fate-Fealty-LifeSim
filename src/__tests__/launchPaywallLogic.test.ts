import { isLaunchPaywallDue, nextAppOpenCount } from '@/services/launchPaywallLogic';

describe('launch paywall cadence', () => {
  it('shows on the fifth full launch and every fifth launch after it', () => {
    expect(isLaunchPaywallDue(1)).toBe(false);
    expect(isLaunchPaywallDue(4)).toBe(false);
    expect(isLaunchPaywallDue(5)).toBe(true);
    expect(isLaunchPaywallDue(6)).toBe(false);
    expect(isLaunchPaywallDue(10)).toBe(true);
    expect(isLaunchPaywallDue(15)).toBe(true);
  });

  it('increments persisted launch counts defensively', () => {
    expect(nextAppOpenCount(0)).toBe(1);
    expect(nextAppOpenCount(4)).toBe(5);
    expect(nextAppOpenCount(9.9)).toBe(10);
    expect(nextAppOpenCount(-10)).toBe(1);
    expect(nextAppOpenCount(Number.NaN)).toBe(1);
  });
});
