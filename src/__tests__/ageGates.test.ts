import { doActivity } from '@/engine/activityEngine';
import { buyItem } from '@/engine/shopEngine';
import { meetsCondition } from '@/engine/eventPicker';
import { ACTIVITY_DEFS } from '@/data/activities';
import { SHOP_ITEMS, shopItemById } from '@/data/shop';
import { ANNUAL_MESSAGES, pickAnnualMessage } from '@/content/annualMessages';
import { makeState } from './helpers';

describe('activity age gates', () => {
  it('refuses under-age activities with no mechanical effect', () => {
    const s = makeState({ age: 3, gold: 20 });
    const goldBefore = s.gold;
    const pathsBefore = { ...s.paths };
    doActivity(s, 'banditry');
    expect(s.gold).toBe(goldBefore);
    expect(s.paths).toEqual(pathsBefore);
    expect(s.feed[s.feed.length - 1].tag).toBe('TOO YOUNG');
  });

  it('allows an activity exactly at its minimum age', () => {
    const s = makeState({ age: 14, gold: 20, stats: { health: 80, charm: 50, wits: 50, faith: 50 } });
    doActivity(s, 'tavern');
    expect(s.feed[s.feed.length - 1].tag).not.toBe('TOO YOUNG');
  });

  it('a toddler (0-3) can only tend the body — everything else is locked', () => {
    const openToToddlers = ACTIVITY_DEFS.filter((a) => (a.minAge ?? 0) <= 3).map((a) => a.id);
    expect(openToToddlers.sort()).toEqual(['bathhouse', 'herbalist', 'leech']);
  });

  it('training unlocks in time to build toward Squire at 14', () => {
    const train = ACTIVITY_DEFS.find((a) => a.id === 'train')!;
    expect(train.minAge).toBeLessThan(14);
  });
});

describe('shop age gates', () => {
  it('the merchant refuses ale to a child and takes no coin', () => {
    const s = makeState({ age: 6, gold: 20 });
    const before = s.gold;
    buyItem(s, shopItemById('ale')!);
    expect(s.gold).toBe(before);
    expect(s.feed[s.feed.length - 1].text).toContain('Come back at');
  });

  it('bread and healing herbs are sold at any age', () => {
    for (const id of ['bread', 'herbs']) {
      expect(shopItemById(id)!.minAge).toBeUndefined();
    }
    const s = makeState({ age: 1, gold: 20, stats: { health: 40, charm: 50, wits: 50, faith: 50 } });
    buyItem(s, shopItemById('bread')!);
    expect(s.stats.health).toBeGreaterThan(40);
  });

  it('a 14-year-old may buy the iron sword', () => {
    const s = makeState({ age: 14, gold: 50 });
    buyItem(s, shopItemById('sword')!);
    expect(s.inventory).toContain('sword');
  });

  it('every priced adult good carries an age gate', () => {
    for (const id of ['ale', 'sword', 'steed', 'cottage']) {
      expect(SHOP_ITEMS.find((i) => i.id === id)!.minAge).toBeGreaterThan(0);
    }
  });
});

describe('annual message age gates', () => {
  it('does not pick an annual beat excluded earlier in the same year', () => {
    const s = makeState({ age: 2 });
    const eligible = ANNUAL_MESSAGES.filter((message) => meetsCondition(s, message.requires));
    const allowed = eligible[0];
    const picked = pickAnnualMessage(s, eligible.slice(1).map((message) => message.id));
    expect(picked?.id).toBe(allowed.id);
  });

  it('adult beats cannot fire for a toddler', () => {
    const s = makeState({ age: 2, gold: 20 });
    for (const id of ['fortune_coin', 'gossip_bard', 'wisdom_hermit', 'fortune_merchant', 'alehouse_proverb']) {
      const msg = ANNUAL_MESSAGES.find((m) => m.id === id)!;
      expect(meetsCondition(s, msg.requires)).toBe(false);
    }
  });

  it('infancy beats exist and only fire for the very young', () => {
    const babe = makeState({ age: 1 });
    const grown = makeState({ age: 10 });
    const infancy = ANNUAL_MESSAGES.filter((m) => m.tag === 'INFANCY');
    expect(infancy.length).toBeGreaterThanOrEqual(3);
    for (const m of infancy) {
      expect(meetsCondition(babe, m.requires)).toBe(true);
      expect(meetsCondition(grown, m.requires)).toBe(false);
    }
  });

  it('a toddler year always has at least one eligible flavour beat', () => {
    for (const age of [0, 1, 2, 3]) {
      const s = makeState({ age });
      const eligible = ANNUAL_MESSAGES.filter((m) => meetsCondition(s, m.requires));
      expect(eligible.length).toBeGreaterThan(0);
    }
  });
});
