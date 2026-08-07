/**
 * Premium plan catalog. Live store prices come from RevenueCat at runtime.
 * Fallback prices keep the paywall useful while prices load or in Expo Go.
 */

import { PlanId } from '@/services/purchasesLogic';

export type { PlanId };

export interface PremiumPlan {
  id: PlanId;
  name: string;
  fallbackPrice: string;
  period: string;
  blurb: string;
  badge?: string;
  ctaNote: string;
}

export const PREMIUM_PLANS: Record<PlanId, PremiumPlan> = {
  annual: {
    id: 'annual',
    name: 'YEARLY',
    fallbackPrice: '$9.99',
    period: 'per year',
    blurb: 'Best value for a full year.',
    badge: 'BEST VALUE | SAVE 72%',
    ctaNote: 'Renews yearly. Cancel anytime.',
  },
  monthly: {
    id: 'monthly',
    name: 'MONTHLY',
    fallbackPrice: '$2.99',
    period: 'per month',
    blurb: 'The crown, month by month.',
    ctaNote: 'Renews monthly. Cancel anytime.',
  },
  lifetime: {
    id: 'lifetime',
    name: 'LIFETIME',
    fallbackPrice: '$19.99',
    period: 'one payment',
    blurb: 'Pay once. Reign in every life, forever.',
    badge: 'PAY ONCE',
    ctaNote: 'One payment. Yours forever.',
  },
};

/** End-of-onboarding paywall: subscriptions only, yearly preselected. */
export const PAYWALL_PLAN_IDS: PlanId[] = ['annual', 'monthly'];

/**
 * The premium shop: yearly first as the recommendation, lifetime in the middle
 * where the eye rests, monthly last and smallest. Monthly is the option we are
 * least trying to sell, so it does not get equal billing with the other two.
 */
export const SHOP_PLAN_IDS: PlanId[] = ['annual', 'lifetime', 'monthly'];

export const PREMIUM_BENEFIT_DETAILS = [
  {
    title: 'EXPAND THY HOLDING',
    body: 'Unlock baronial and royal estate orders, buildings, and rewards.',
  },
  {
    title: 'REACH THE CROWN',
    body: 'Continue beyond Noble to Baron and Monarch with new challenges.',
  },
  {
    title: 'LIVE MORE STORIES',
    body: 'Unlock premium ruler events, story arcs, goals, and deeds.',
  },
  {
    title: 'CHOOSE WILDER FATES',
    body: 'Unlock four Premium birth traits, including Goose-Cursed and Royal Bastard.',
  },
  {
    title: 'LIVE FOREVER',
    body: 'Enable Live Forever to survive lethal moments, ignore old-age death, and keep aging.',
  },
  {
    title: 'TAKE 50 ACTIONS A YEAR',
    body: 'Raise the yearly action limit from 24 to 50 for longer, more flexible lives.',
  },
] as const;

/** Short enough to keep the onboarding paywall on one screen. */
export const PREMIUM_BENEFIT_LINES = [
  'Baron and Monarch ranks',
  'Royal Holding orders and buildings',
  'Premium events and story arcs',
  '4 Premium birth traits',
  'Live Forever mode',
  '50 actions every year',
] as const;

/** Compact copy retained for content checks and any small sales surface. */
export const PREMIUM_BENEFITS = PREMIUM_BENEFIT_DETAILS.map((benefit) => `${benefit.title}: ${benefit.body}`);
