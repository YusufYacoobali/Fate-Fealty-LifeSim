const mockOfferings = jest.fn();
const mockCustomerInfo = jest.fn();
const mockPurchase = jest.fn();
const mockPackage = { product: { identifier: 'lifetime', priceString: '$19.99', price: 19.99, currencyCode: 'USD' } };

jest.mock('../services/metaAds', () => ({ connectMetaPurchases: jest.fn().mockResolvedValue(undefined) }));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' }, TurboModuleRegistry: { get: jest.fn(() => null) } }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: {
  revenueCat: { iosApiKey: 'appl_unit_test_public_key' },
} } } }));
jest.mock('react-native-purchases', () => ({ __esModule: true, default: {
  configure: jest.fn(),
  getOfferings: (...args: unknown[]) => mockOfferings(...args),
  getCustomerInfo: (...args: unknown[]) => mockCustomerInfo(...args),
  purchasePackage: (...args: unknown[]) => mockPurchase(...args),
} }));

import { getPremiumOffers, getPremiumStatus, purchasePremium } from '../services/purchases';

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  mockOfferings.mockResolvedValue({ current: { lifetime: mockPackage } });
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('a failed first iOS offerings request recovers live prices', async () => {
  mockOfferings.mockRejectedValueOnce({ code: 10, message: 'Network unavailable' });
  const result = getPremiumOffers();
  await jest.runAllTimersAsync();
  await expect(result).resolves.toMatchObject({
    lifetime: { available: true, priceString: '$19.99', price: 19.99, currencyCode: 'USD' },
    annual: { available: false },
  });
  expect(mockOfferings).toHaveBeenCalledTimes(2);
});

test('an empty store response is retried and can recover', async () => {
  mockOfferings.mockResolvedValueOnce({ current: null });
  const result = getPremiumOffers();
  await jest.runAllTimersAsync();
  await expect(result).resolves.toMatchObject({ lifetime: { available: true } });
  expect(mockOfferings).toHaveBeenCalledTimes(2);
});

test('persistent empty offerings stop after three reads without advertising availability', async () => {
  mockOfferings.mockResolvedValue({ current: {} });
  const result = getPremiumOffers();
  await jest.runAllTimersAsync();
  await expect(result).resolves.toBeNull();
  expect(mockOfferings).toHaveBeenCalledTimes(3);
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('offerings'), expect.objectContaining({
    platform: 'ios', message: expect.stringContaining('product mappings'),
  }));
});

test('an ownership lookup recovers without revoking access on a network failure', async () => {
  mockCustomerInfo.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ entitlements: { active: { pro: {} } } });
  const result = getPremiumStatus();
  await jest.runAllTimersAsync();
  await expect(result).resolves.toBe(true);
  expect(mockCustomerInfo).toHaveBeenCalledTimes(2);
});

test('checkout failures never retry a transaction or unlock premium', async () => {
  mockPurchase.mockRejectedValueOnce({ code: 10, message: 'Network failed' });
  await expect(purchasePremium('lifetime')).resolves.toEqual({ outcome: 'error', unlocked: false });
  expect(mockPurchase).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});
