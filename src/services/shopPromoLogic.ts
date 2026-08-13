import type { AppMeta } from '@/state/appMeta';
import type { GameState } from '@/types/game';
import { hasRecentGoodOutcome } from './reviewLogic';

/** A good age-up may open the promo once this many age-ups have passed. */
export const SHOP_PROMO_AGE_UP_FREQUENCY = 20;

/** Stop waiting for good luck after this many additional age-ups. */
export const SHOP_PROMO_PATIENCE_AGE_UPS = 10;

export interface ShopPromoMessage {
  heading: string;
  title: string;
  body: string;
  cta: string;
}

export const SHOP_PROMO_MESSAGES: readonly ShopPromoMessage[] = [
  {
    heading: 'A LARGER FATE AWAITS',
    title: 'Ready to try the extra tales?',
    body: 'Open the royal shop to discover royal Holding upgrades, ruler events, new deeds, and the road from Baron to Monarch.',
    cta: 'PEEK BEHIND THE GATE',
  },
  {
    heading: 'THE GOOSE HAS A PLAN',
    title: 'Sir Quackbeard demands more adventure.',
    body: 'Premium adds grander stations, stranger stories, and an estate with almost enough room for his ambitions.',
    cta: 'HEAR THE GOOSE OUT',
  },
  {
    heading: 'A PEDLAR BEARS CONTENT',
    title: 'No magic pebbles. Probably.',
    body: 'The royal shop holds extra goals, premium story arcs, ruler choices, and 50 actions every year.',
    cta: 'INSPECT THE WARES',
  },
  {
    heading: 'THY LEGEND LOOKS HUNGRY',
    title: 'Feed it a bigger destiny.',
    body: 'Expand your lands into a barony, climb beyond Noble, and meet the glorious problems reserved for rulers.',
    cta: 'SEEK GREATER TROUBLE',
  },
  {
    heading: 'THE CROWN IS BORED',
    title: 'It has been waiting several lifetimes.',
    body: 'Take a look at the extra content and see whether thy next life deserves a throne of its own.',
    cta: 'VISIT THE ROYAL SHOP',
  },
  {
    heading: 'MORE MISCHIEF THIS WAY',
    title: 'Thy good fortune could grow stranger.',
    body: 'Premium opens more deeds, more stories, baronial Holding orders, and two lofty ranks to survive.',
    cta: 'SHOW ME THE MISCHIEF',
  },
] as const;

export function shopPromoMessageIndex(shownCount: number): number {
  const safeCount = Number.isFinite(shownCount) ? Math.max(0, Math.floor(shownCount)) : 0;
  return safeCount % SHOP_PROMO_MESSAGES.length;
}

/** Whether this age-up earns/forces a promo; independent of temporary overlays. */
export function shopPromoCadenceDue(meta: AppMeta, state: GameState, premiumUnlocked: boolean): boolean {
  if (premiumUnlocked) return false;
  const ageUpsSincePromo = meta.totalAgeUps - meta.shopPromoLastAgeUp;
  if (ageUpsSincePromo < SHOP_PROMO_AGE_UP_FREQUENCY) return false;
  return hasRecentGoodOutcome(state)
    || ageUpsSincePromo >= SHOP_PROMO_AGE_UP_FREQUENCY + SHOP_PROMO_PATIENCE_AGE_UPS;
}

export function shouldPromptShopPromo(meta: AppMeta, state: GameState, premiumUnlocked: boolean): boolean {
  if (state.dead || state.pendingEvent || state.settingsOpen) return false;
  return shopPromoCadenceDue(meta, state, premiumUnlocked);
}
