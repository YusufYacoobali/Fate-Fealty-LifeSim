import { MARKETS, SHOP_ITEMS, itemStockedInYear, shopItemById } from '@/data/shop';
import { buyItem, itemInStock, marketPrice, shopAvailability } from '@/engine/shopEngine';
import { makeState } from './helpers';

describe('shop catalogue', () => {
  it('keeps every item id unique and assigned to a real market', () => {
    const ids = SHOP_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    const markets = new Set(MARKETS.map((market) => market.id));
    for (const item of SHOP_ITEMS) expect(markets.has(item.market)).toBe(true);
  });

  it('stocks every market with at least one staple, so no stall is ever empty', () => {
    for (const market of MARKETS) {
      const staples = SHOP_ITEMS.filter((item) => item.market === market.id && item.staple);
      expect(staples.length).toBeGreaterThan(0);
    }
  });

  it('preserves the original wares so old saves keep what they bought', () => {
    for (const id of ['bread', 'herbs', 'ale', 'candle', 'tunic', 'quill', 'sword', 'steed', 'relic', 'cottage']) {
      expect(shopItemById(id)).toBeDefined();
    }
  });
});

describe('yearly stock rotation', () => {
  it('always lays out staples', () => {
    const bread = shopItemById('bread')!;
    for (let year = 1320; year < 1340; year += 1) expect(itemStockedInYear(bread, year)).toBe(true);
  });

  it('is stable within a year but varies across years', () => {
    const rotating = SHOP_ITEMS.filter((item) => !item.staple);
    const inYear = (year: number) => rotating.filter((item) => itemStockedInYear(item, year)).map((item) => item.id);

    expect(inYear(1325)).toEqual(inYear(1325));
    // Over two decades the stall list must actually change.
    const lists = new Set(Array.from({ length: 20 }, (_, offset) => inYear(1320 + offset).join(',')));
    expect(lists.size).toBeGreaterThan(1);
  });

  it('leaves something worth buying in every single year', () => {
    for (let year = 1320; year < 1400; year += 1) {
      expect(SHOP_ITEMS.filter((item) => itemStockedInYear(item, year)).length).toBeGreaterThan(12);
    }
  });
});

describe('prices follow the village', () => {
  const bread = shopItemById('bread')!;
  const quill = shopItemById('quill')!;

  it('charges more in a destitute year than a prosperous one', () => {
    const poor = makeState();
    poor.world.conditions.prosperity = 0;
    const rich = makeState();
    rich.world.conditions.prosperity = 100;

    expect(marketPrice(poor, quill)).toBeGreaterThan(marketPrice(rich, quill));
  });

  it('passes a failed harvest on to the food stalls', () => {
    const hungry = makeState();
    hungry.world.conditions.foodSecurity = 0;
    const fed = makeState();
    fed.world.conditions.foodSecurity = 100;

    expect(marketPrice(hungry, bread)).toBeGreaterThan(marketPrice(fed, bread));
    // The scrivener does not care what the harvest did.
    expect(marketPrice(hungry, quill)).toBe(marketPrice(fed, quill));
  });

  it('never asks for less than a single coin', () => {
    const rich = makeState();
    rich.world.conditions.prosperity = 100;
    rich.world.conditions.foodSecurity = 100;
    for (const item of SHOP_ITEMS) expect(marketPrice(rich, item)).toBeGreaterThanOrEqual(1);
  });

  it('charges the price the player was shown', () => {
    const s = makeState({ age: 20, gold: 200 });
    s.world.conditions.prosperity = 10;
    const price = marketPrice(s, quill);
    expect(price).toBeGreaterThan(quill.price);

    const before = s.gold;
    buyItem(s, quill);
    expect(s.gold).toBe(before - price);
  });
});

describe('shop availability', () => {
  it('refuses wares the traders do not have this year', () => {
    const s = makeState({ age: 30, gold: 500 });
    const absent = SHOP_ITEMS.find((item) => !itemInStock(s, item));
    if (!absent) return; // a year where everything happens to be stocked

    expect(shopAvailability(s, absent)).toMatchObject({ available: false, reason: 'Not stocked this year' });
    const before = s.gold;
    buyItem(s, absent);
    expect(s.gold).toBe(before);
    expect(s.inventory).not.toContain(absent.id);
  });

  it('holds the grandest properties back until the player has the station', () => {
    const manor = shopItemById('manor_lease')!;
    const rich = makeState({ age: 30, gold: 900, rankIdx: 0 });
    rich.world.currentYear = 1320;
    // Force it onto the shelf so the rank gate is what is under test.
    const stocked = { ...manor, staple: true as const };

    expect(shopAvailability(rich, stocked).available).toBe(false);
    expect(shopAvailability({ ...rich, rankIdx: 3 }, stocked).available).toBe(true);

    const before = rich.gold;
    buyItem(rich, stocked);
    expect(rich.gold).toBe(before);
  });
});
