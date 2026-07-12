/**
 * Premium plan catalog: display copy, fallback prices, and which plans each
 * sales surface shows. Live store prices come from RevenueCat at runtime; the
 * fallback keeps the paywall showing real numbers while prices load (or when
 * running without a store, e.g. Expo Go).
 *
 * Pure data — adding a plan or reordering a surface is an edit here only.
 */

import { PlanId } from '@/services/purchasesLogic';

export type { PlanId };

export interface PremiumPlan {
  id: PlanId;
  name: string;
  /** Shown when the store hasn't supplied a localized price (yet). */
  fallbackPrice: string;
  /** Billing cadence, e.g. "per year". */
  period: string;
  /** One-line sell under the plan name. */
  blurb: string;
  /** Attention ribbon, e.g. "BEST VALUE". */
  badge?: string;
  /** Renewal/ownership small print shown under the CTA for this plan. */
  ctaNote: string;
}

export const PREMIUM_PLANS: Record<PlanId, PremiumPlan> = {
  annual: {
    id: 'annual',
    name: 'YEARLY',
    fallbackPrice: '$9.99',
    period: 'per year',
    blurb: 'Under $0.84 a month.',
    badge: 'BEST VALUE · SAVE 72%',
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

/** What the Pro entitlement unlocks, shown on every sales surface. */
export const PREMIUM_BENEFITS = [
  'Baron and Monarch ranks',
  'Premium ruler events and story arcs',
  'Extra goals and deeds',
  "Permadeath off: death isn't the end",
  'All future premium chapters',
] as const;
