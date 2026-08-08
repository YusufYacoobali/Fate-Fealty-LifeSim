import { ACTIVITY_ICONS, SHOP_ITEM_ICONS } from '@/assets/generatedAssets';
import { ACTIVITY_DEFS } from '@/data/activities';
import { SHOP_ITEMS } from '@/data/shop';
import { ALL_EVENTS, EVENTS_BY_ID } from '@/content';
import { applyChoice } from '@/engine/storyGraph';
import { createLife } from '@/engine/gameState';
import { CONTEXTUAL_ACTIVITY_IDS, handleContextualActivity } from '@/engine/contextualActivityEngine';
import { relationshipWith } from '@/engine/relationshipEngine';
import { resetRandomSource, setRandomSource } from '@/engine/random';

describe('contextual activities', () => {
  afterEach(resetRandomSource);

  it('deepens every role action plus gathering and preaching', () => {
    expect(CONTEXTUAL_ACTIVITY_IDS).toEqual(expect.arrayContaining([
      'village_service', 'gather_fuel', 'manage_workshop', 'guild_bargain',
      'hear_confession', 'copy_manuscript', 'lead_patrol', 'drill_levy',
      'hear_petitions', 'host_court', 'hold_council', 'royal_audience',
      'plan_heist', 'rally_gang', 'arrange_gathering', 'preach_sermon',
    ]));
    expect(CONTEXTUAL_ACTIVITY_IDS).toHaveLength(16);
  });

  it('uses a relationship-aware outcome, not only flat stat rewards', () => {
    const state = createLife({ worldSeed: 411 });
    state.age = 30;
    state.world.conditions.publicOrder = 0;
    const before = new Map(state.kin.filter((kin) => kin.alive).map((kin) => [kin.id, relationshipWith(state, kin.id).bToA.affinity]));
    setRandomSource({ next: () => 0.7 });

    expect(handleContextualActivity(state, 'village_service')).toBe(true);

    expect(state.kin.some((kin) => kin.alive && relationshipWith(state, kin.id).bToA.affinity > (before.get(kin.id) ?? 0))).toBe(true);
    expect(state.feed.at(-1)?.text).toMatch(/helps|neighbours|shared work/i);
  });

  it('can open an authored complication and records its resolution', () => {
    const state = createLife({ worldSeed: 412 });
    state.age = 30;
    setRandomSource({ next: () => 0.999999 });

    handleContextualActivity(state, 'arrange_gathering');

    expect(state.pendingEvent?.eventId).toBe('activity_gathering_quarrel');
    expect(state.pendingEvent?.bindings?.other).toBeTruthy();
    const event = EVENTS_BY_ID[state.pendingEvent!.eventId];
    applyChoice(state, event, event.choices[0]);
    expect(state.memories.some((memory) => memory.tag === 'activity_gathering_quarrel_resolved')).toBe(true);
  });

  it('keeps activity complications out of the ambient event lottery', () => {
    const consequences = ALL_EVENTS.filter((event) => event.id.startsWith('activity_'));
    expect(consequences).toHaveLength(10);
    expect(consequences.every((event) => event.arcNodeOnly && event.choices.length === 3)).toBe(true);
  });
});

describe('generated icon coverage', () => {
  it('has finished art for every activity without an emoji fallback', () => {
    expect(ACTIVITY_DEFS.filter((activity) => !ACTIVITY_ICONS[activity.id]).map((activity) => activity.id)).toEqual([]);
  });

  it('has finished art for every shop item without an emoji fallback', () => {
    expect(SHOP_ITEMS.filter((item) => !SHOP_ITEM_ICONS[item.id]).map((item) => item.id)).toEqual([]);
  });
});
