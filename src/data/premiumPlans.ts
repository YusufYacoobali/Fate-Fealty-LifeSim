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
    blurb: 'Under $0.84 a month.',
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

/** The premium shop: everything, yearly first, lifetime as the anchor. */
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
    title: 'KEEP A FAVOURITE LIFE',
    body: 'Turn off permadeath when you want the adventure to continue.',
  },
  {
    title: 'GET FUTURE CHAPTERS',
    body: 'Every future premium chapter is included while you have access.',
  },
] as const;

/** Compact copy retained for content checks and any small sales surface. */
export const PREMIUM_BENEFITS = PREMIUM_BENEFIT_DETAILS.map((benefit) => `${benefit.title}: ${benefit.body}`);
