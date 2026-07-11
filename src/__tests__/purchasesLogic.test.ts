import {
  ENTITLEMENT_ID,
  entitlementActive,
  isProductionRevenueCatKey,
  mergeEntitlement,
  pickLifetimePackage,
} from '@/services/purchasesLogic';

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

describe('pickLifetimePackage', () => {
  it('uses the current offering lifetime package', () => {
    const lifetime = { identifier: '$rc_lifetime' };
    const offering = { lifetime, availablePackages: [{ identifier: '$rc_monthly' }] };
    expect(pickLifetimePackage(offering)).toBe(lifetime);
  });

  it('does not fall back to another package when lifetime is missing', () => {
    expect(pickLifetimePackage({ availablePackages: [{ identifier: '$rc_monthly' }] })).toBeNull();
    expect(pickLifetimePackage(null)).toBeNull();
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
