import {
  SHOP_PROMO_ENTRY_FREQUENCY,
  SHOP_PROMO_MESSAGES,
  shopPromoMessageIndex,
  shouldPromptShopPromo,
} from '@/services/shopPromoLogic';
import { DEFAULT_META } from '@/state/appMeta';
import { makeState } from './helpers';

function goodMomentState() {
  const state = makeState();
  state.feed = [{ id: 1, age: 20, tag: 'TRIUMPH', text: 'A fine deed.', tone: 'good', source: 'player' }];
  return state;
}

describe('shopPromoLogic.shouldPromptShopPromo', () => {
  it('waits for 30 entries since the previous shop promo', () => {
    const due = { ...DEFAULT_META, totalEntries: SHOP_PROMO_ENTRY_FREQUENCY };

    expect(shouldPromptShopPromo({ ...due, totalEntries: due.totalEntries - 1 }, goodMomentState(), false)).toBe(false);
    expect(shouldPromptShopPromo(due, goodMomentState(), false)).toBe(true);
  });

  it('uses its own recurring cadence after a promo is shown', () => {
    const meta = { ...DEFAULT_META, totalEntries: 74, shopPromoLastEntry: 45, shopPromoCount: 2 };
    expect(shouldPromptShopPromo(meta, goodMomentState(), false)).toBe(false);
    expect(shouldPromptShopPromo({ ...meta, totalEntries: 75 }, goodMomentState(), false)).toBe(true);
  });

  it('is independent of whether the one-time review prompt was shown', () => {
    const meta = { ...DEFAULT_META, totalEntries: 30, reviewPrompted: true };
    expect(shouldPromptShopPromo(meta, goodMomentState(), false)).toBe(true);
  });

  it('requires a good player moment and a clear screen', () => {
    const meta = { ...DEFAULT_META, totalEntries: 30 };
    const bad = goodMomentState();
    bad.feed[0].tone = 'bad';
    expect(shouldPromptShopPromo(meta, bad, false)).toBe(false);

    const event = goodMomentState();
    event.pendingEvent = { eventId: 'x' };
    expect(shouldPromptShopPromo(meta, event, false)).toBe(false);

    const settings = goodMomentState();
    settings.settingsOpen = true;
    expect(shouldPromptShopPromo(meta, settings, false)).toBe(false);

    const dead = goodMomentState();
    dead.dead = true;
    expect(shouldPromptShopPromo(meta, dead, false)).toBe(false);
  });

  it('never promotes the shop to an existing premium player', () => {
    const meta = { ...DEFAULT_META, totalEntries: 300 };
    expect(shouldPromptShopPromo(meta, goodMomentState(), true)).toBe(false);
  });
});

describe('shopPromoLogic message rotation', () => {
  it('rotates through every playful message and wraps', () => {
    const indexes = SHOP_PROMO_MESSAGES.map((_, count) => shopPromoMessageIndex(count));
    expect(indexes).toEqual(SHOP_PROMO_MESSAGES.map((_, index) => index));
    expect(shopPromoMessageIndex(SHOP_PROMO_MESSAGES.length)).toBe(0);
  });

  it('safely handles invalid persisted counts', () => {
    expect(shopPromoMessageIndex(-3)).toBe(0);
    expect(shopPromoMessageIndex(Number.NaN)).toBe(0);
  });
});
