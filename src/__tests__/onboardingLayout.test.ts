import { onboardingLayout, onboardingPages } from '@/screens/OnboardingScreen';
import { RANKS } from '@/data/ranks';

function rankStripWidth(width: number, height: number): number {
  const layout = onboardingLayout(width, height);
  return layout.rankTileSize * RANKS.length + layout.rankGap * (RANKS.length - 1);
}

describe('onboardingLayout', () => {
  it('always keeps the paywall attached as the final onboarding page', () => {
    expect(onboardingPages()).toEqual(['hook', 'lessons', 'destiny', 'paywall']);
  });

  it.each([
    [240, 568],
    [280, 653],
    [320, 568],
  ])('fits the full rank strip on a %ipx-wide compact screen', (width, height) => {
    const layout = onboardingLayout(width, height);
    const usableWidth = width - layout.contentPadding * 2;

    expect(layout.compact).toBe(true);
    expect(rankStripWidth(width, height)).toBeLessThanOrEqual(usableWidth);
  });

  it('uses regular metrics on a standard tall phone', () => {
    const layout = onboardingLayout(390, 844);

    expect(layout.compact).toBe(false);
    expect(layout.heroSize).toBe(108);
    expect(layout.rankTileSize).toBe(42);
  });

  it('uses compact vertical metrics in landscape', () => {
    expect(onboardingLayout(844, 390).compact).toBe(true);
  });

  it('caps the readable column on tablets', () => {
    const layout = onboardingLayout(1024, 1366);

    expect(layout.contentMaxWidth).toBe(560);
    expect(rankStripWidth(1024, 1366)).toBeLessThanOrEqual(layout.contentMaxWidth);
  });
});
