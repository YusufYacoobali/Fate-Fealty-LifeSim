import { CHARS_PER_SECOND, MAX_DURATION_MS, MIN_TICK_MS, revealPacing } from '@/components/ui/TypewriterText';
import { ALL_EVENTS } from '@/content';

/** What the animation will actually take, from the pacing it chose. */
function realDuration(length: number): number {
  const { step, tickMs } = revealPacing(length);
  return Math.ceil(length / step) * tickMs;
}

describe('typewriter pacing', () => {
  it('writes an ordinary passage one letter at a time', () => {
    for (const length of [12, 40, 120]) expect(revealPacing(length).step).toBe(1);
  });

  it('holds the stated speed rather than quietly running faster', () => {
    // A single-letter cadence must match CHARS_PER_SECOND, not overshoot it.
    expect(revealPacing(100).tickMs).toBeCloseTo(1000 / CHARS_PER_SECOND, 1);
  });

  it('speeds up rather than running on, so no passage outstays its welcome', () => {
    for (const length of [1, 50, 200, 600, 2000, 8000]) {
      const { step, tickMs } = revealPacing(length);
      expect(step).toBeGreaterThanOrEqual(1);
      // A timer faster than this misses frames instead of animating.
      expect(tickMs).toBeGreaterThanOrEqual(MIN_TICK_MS);
      expect(realDuration(length)).toBeLessThanOrEqual(MAX_DURATION_MS + tickMs);
    }
  });

  it('handles an empty passage without dividing by zero', () => {
    expect(revealPacing(0)).toEqual({ step: 1, tickMs: MIN_TICK_MS, durationMs: 0 });
  });

  it('keeps every real event passage inside the cap', () => {
    const staticTexts = ALL_EVENTS.map((event) => event.text).filter((text): text is string => typeof text === 'string');
    expect(staticTexts.length).toBeGreaterThan(0);
    for (const text of staticTexts) {
      expect(realDuration(text.length)).toBeLessThanOrEqual(MAX_DURATION_MS + revealPacing(text.length).tickMs);
    }
  });
});
