import { resolveRpgEncounter } from './rpgSoakHelpers';
import { ageUp } from '@/engine/lifeDirector';
import { createLife } from '@/engine/gameState';
import { MAX_LIFESPAN, DECLINE_AGE, agingDamage } from '@/engine/deathEngine';
import { isEventEligible } from '@/engine/eventPicker';
import { EVENTS_BY_ID } from '@/content';
import { WORK_BEFORE_GLUT } from '@/engine/careerEngine';
import { makeState } from './helpers';

/** Plays a life out with no player input, which is the harshest reading of it. */
function liveOut(mutate: (s: ReturnType<typeof createLife>) => void = () => {}) {
  let s = createLife();
  mutate(s);
  let story = 0;
  let ambient = 0;
  let worstCareerYear = 0;
  while (!s.dead && s.age < 200) {
    const before = s.feed.length;
    s.pendingEvent = null;
    resolveRpgEncounter(s);
    s = ageUp(s);
    if (s.pendingEvent) {
      const event = EVENTS_BY_ID[s.pendingEvent.eventId];
      if (event?.arcNodeOnly) story += 1; else ambient += 1;
    }
    const added = s.feed.slice(before).filter((entry) => entry.tag === 'WORLD · CAREER' || entry.tag === 'WORLD · WORK');
    worstCareerYear = Math.max(worstCareerYear, added.length);
  }
  return { age: s.age, story, ambient, worstCareerYear };
}

describe('lifespan', () => {
  it('nobody outlives the span, Live Forever included', () => {
    const forever = liveOut((s) => { s.settings.liveForever = true; });
    expect(forever.age).toBe(MAX_LIFESPAN);
    const ordinary = Array.from({ length: 10 }, () => liveOut().age);
    expect(Math.max(...ordinary)).toBeLessThanOrEqual(MAX_LIFESPAN);
  });

  it('the yearly hazards roll once a year, not once per sub-step', () => {
    // `ageUp` calls checkDeath eight or nine times; if the old-age roll is not
    // gated, almost nobody reaches sixty and the span ceiling is decorative.
    const ages = Array.from({ length: 20 }, () => liveOut().age);
    expect(ages.filter((age) => age >= 60).length).toBeGreaterThan(4);
  });

  it('health gives ground from the decline age', () => {
    const before = makeState({ age: DECLINE_AGE - 1 });
    const after = makeState({ age: DECLINE_AGE + 20 });
    const sample = (s: typeof before) => Math.round(
      Array.from({ length: 200 }, () => agingDamage(s)).reduce((a, b) => a + b, 0) / 200,
    );
    expect(sample(after)).toBeGreaterThan(sample(before));
  });
});

describe('year-to-year pacing', () => {
  it('one-off events get a real share of the years', () => {
    let story = 0;
    let ambient = 0;
    for (let i = 0; i < 6; i += 1) {
      const run = liveOut();
      story += run.story;
      ambient += run.ambient;
    }
    // Story beats used to take every year they were due, and one always was.
    expect(ambient / (ambient + story)).toBeGreaterThan(0.3);
  });

  it('caps how much of the village’s working life reaches the feed', () => {
    for (let i = 0; i < 4; i += 1) expect(liveOut().worstCareerYear).toBeLessThanOrEqual(2);
  });
});

describe('possessions open content', () => {
  it('an item-gated event needs the item', () => {
    const s = makeState({ age: 30 });
    s.inventory = [];
    expect(isEventEligible(s, EVENTS_BY_ID.own_relic_pilgrims)).toBe(false);
    s.inventory = ['relic'];
    expect(isEventEligible(s, EVENTS_BY_ID.own_relic_pilgrims)).toBe(true);
  });

  it('every possession event names a real shop item', () => {
    const { SHOP_ITEMS } = require('@/data/shop');
    const ids = new Set(SHOP_ITEMS.map((item: { id: string }) => item.id));
    const gated = Object.values(EVENTS_BY_ID).filter((event) => event.requires?.hasItems?.length);
    expect(gated.length).toBeGreaterThan(0);
    for (const event of gated) {
      for (const id of event.requires!.hasItems!) expect(ids.has(id)).toBe(true);
    }
  });
});

describe('wages', () => {
  it('a trade is worked out before the year is', () => {
    expect(WORK_BEFORE_GLUT).toBeGreaterThan(0);
    expect(WORK_BEFORE_GLUT).toBeLessThan(24);
  });
});
