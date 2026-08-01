import {
  annualSubscriptionValue,
  ENTITLEMENT_ID,
  entitlementActive,
  isProductionRevenueCatKey,
  mergeEntitlement,
  PLAN_IDS,
  pickPackage,
} from '@/services/purchasesLogic';

describe('annualSubscriptionValue', () => {
  it('calculates the monthly equivalent and saving against twelve monthly payments', () => {
    expect(annualSubscriptionValue(9.99, 2.99)).toEqual({ perMonth: 0.8325, savingsPercent: 72 });
  });

  it('never reports negative savings and rejects unusable prices', () => {
    expect(annualSubscriptionValue(36, 2.99)).toEqual({ perMonth: 3, savingsPercent: 0 });
    expect(annualSubscriptionValue(0, 2.99)).toBeNull();
  });
});

describe('entitlementActive (gate on entitlement, never product)', () => {
  it('uses the RevenueCat pro entitlement', () => {
    expect(ENTITLEMENT_ID).toBe('pro');
  });

  it('is active when the pro entitlement is present, whatever granted it', () => {
    expect(entitlementActive({ entitlements: { active: { pro: { productIdentifier: 'pro_lifetime' } } } })).toBe(true);
  });

  it('is inactive when absent, and safe on malformed/missing info', () => {
    expect(entitlementActive({ entitlements: { active: {} } })).toBe(false);
    expect(entitlementActive({ entitlements: { active: { other: {} } } })).toBe(false);
    expect(entitlementActive(null)).toBe(false);
    expect(entitlementActive(undefined)).toBe(false);
  });
});

describe('mergeEntitlement', () => {
  it('keeps unavailable separate from a confirmed inactive entitlement', () => {
    expect(mergeEntitlement(true, null)).toBeNull();
    expect(mergeEntitlement(false, null)).toBeNull();
  });

  it('a fresh reading wins in both directions', () => {
    expect(mergeEntitlement(false, true)).toBe(true);
    expect(mergeEntitlement(true, false)).toBe(false);
  });
});

describe('pickPackage', () => {
  const monthly = { identifier: '$rc_monthly' };
  const annual = { identifier: '$rc_annual' };
  const lifetime = { identifier: '$rc_lifetime' };
  const offering = { monthly, annual, lifetime };

  it('picks each plan from its standard offering accessor', () => {
    expect(pickPackage(offering, 'monthly')).toBe(monthly);
    expect(pickPackage(offering, 'annual')).toBe(annual);
    expect(pickPackage(offering, 'lifetime')).toBe(lifetime);
  });

  it('never falls back to a different package when a plan is missing', () => {
    for (const plan of PLAN_IDS) {
      expect(pickPackage({}, plan)).toBeNull();
      expect(pickPackage(null, plan)).toBeNull();
    }
    expect(pickPackage({ monthly }, 'lifetime')).toBeNull();
  });
});

describe('isProductionRevenueCatKey', () => {
  it('accepts production platform public SDK key prefixes', () => {
    expect(isProductionRevenueCatKey('goog_abc123', 'android')).toBe(true);
    expect(isProductionRevenueCatKey('appl_abc123', 'ios')).toBe(true);
  });

  it('rejects blank, wrong-platform, and Test Store keys', () => {
    expect(isProductionRevenueCatKey('', 'android')).toBe(false);
    expect(isProductionRevenueCatKey('appl_abc123', 'android')).toBe(false);
    expect(isProductionRevenueCatKey('test_abc123', 'android')).toBe(false);
    expect(isProductionRevenueCatKey('rc_test_abc123', 'ios')).toBe(false);
  });
});
