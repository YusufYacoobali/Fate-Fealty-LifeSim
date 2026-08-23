import { EVENTS_BY_ID } from '@/content';
import { createLife } from '@/engine/gameState';
import { ageUp } from '@/engine/lifeDirector';
import { applyChoice } from '@/engine/storyGraph';
import { QUALITY_CHAIN_SPECS } from '@/content/qualityAmbientEvents';
import { MAX_OPEN_THREADS, openThreads } from '@/engine/director/threads';
import { RHYTHM } from '@/engine/director/rhythm';
import { isEventEligible, isEventPlayable } from '@/engine/eventPicker';

jest.setTimeout(600000);

interface Run {
  deepest: Record<string, number>;
  quietRunMax: number;
  maxOpenThreads: number;
  threadYears: number;
  oneOffYears: number;
  years: number;
}

function playLife(): Run {
  let s = createLife();
  const run: Run = { deepest: {}, quietRunMax: 0, maxOpenThreads: 0, threadYears: 0, oneOffYears: 0, years: 0 };
  let quietRun = 0;
  while (!s.dead && s.age < 130) {
    s = ageUp(s);
    run.years += 1;
    run.maxOpenThreads = Math.max(run.maxOpenThreads, openThreads(s).length);
    if (s.pendingEvent) {
      const event = EVENTS_BY_ID[s.pendingEvent.eventId];
      if (event.chain) {
        run.deepest[event.chain.id] = Math.max(run.deepest[event.chain.id] ?? 0, event.chain.index + 1);
      }
      if ((event.chain?.index ?? 0) > 0 || event.arcNodeOnly) run.threadYears += 1; else run.oneOffYears += 1;
      applyChoice(s, event, event.choices[0]);
      s.pendingEvent = null;
      quietRun = 0;
    } else {
      quietRun += 1;
      run.quietRunMax = Math.max(run.quietRunMax, quietRun);
    }
  }
  return run;
}

describe('the director keeps its promises', () => {
  const runs = Array.from({ length: 40 }, playLife);

  it('finishes most of the threads it opens', () => {
    let started = 0;
    let finished = 0;
    for (const spec of QUALITY_CHAIN_SPECS) {
      for (const run of runs) {
        const depth = run.deepest[spec.id] ?? 0;
        if (depth > 0) started += 1;
        if (depth >= spec.beats.length) finished += 1;
      }
    }
    // Before the director, chains were drawn from the ambient lottery rather
    // than scheduled: they reached an average depth of 2.4 and finished about
    // 15% of the time. A half-told story is worse than no story.
    expect(started).toBeGreaterThan(100);
    expect(finished / started).toBeGreaterThan(0.5);
  });

  it('finishes even the longest chains, which never once completed before', () => {
    const longest = QUALITY_CHAIN_SPECS.filter((spec) => spec.beats.length >= 7);
    expect(longest.length).toBeGreaterThan(0);
    for (const spec of longest) {
      expect(runs.some((run) => (run.deepest[spec.id] ?? 0) >= spec.beats.length)).toBe(true);
    }
  });

  it('never leaves the player with two dead years running', () => {
    for (const run of runs) expect(run.quietRunMax).toBeLessThanOrEqual(RHYTHM.MAX_QUIET_RUN + 1);
  });

  it('holds the open-thread cap so nothing is starved', () => {
    for (const run of runs) expect(run.maxOpenThreads).toBeLessThanOrEqual(MAX_OPEN_THREADS);
  });

  it('keeps one-off events a real share of the years', () => {
    const thread = runs.reduce((n, r) => n + r.threadYears, 0);
    const oneOff = runs.reduce((n, r) => n + r.oneOffYears, 0);
    expect(oneOff / (thread + oneOff)).toBeGreaterThan(0.3);
  });
});

describe('directed content stays out of the lottery', () => {
  it('a chain continuation is never offered by the random picker', () => {
    const state = createLife();
    const continuations = Object.values(EVENTS_BY_ID).filter((event) => (event.chain?.index ?? 0) > 0);
    expect(continuations.length).toBeGreaterThan(50);
    for (const event of continuations) expect(isEventEligible(state, event)).toBe(false);
  });

  it('but the director may still play one when its turn comes', () => {
    // `isEventPlayable` is the check the director uses; it ignores the lottery
    // exclusions and only asks whether the event is legal right now.
    const opener = EVENTS_BY_ID.quality_granary_rats_1;
    const state = createLife();
    state.age = 30;
    expect(isEventPlayable(state, opener)).toBe(true);
  });
});
