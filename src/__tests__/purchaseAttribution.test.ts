const mockPrepare = jest.fn().mockResolvedValue(undefined);
const mockConfigure = jest.fn();
const mockPurchase = jest.fn();
const mockRestore = jest.fn();
const mockOffer = { product: { identifier: 'lifetime', price: 9.99, currencyCode: 'GBP' } };
jest.mock('../services/metaAds', () => ({ connectMetaPurchases: () => mockPrepare() }));
jest.mock('react-native', () => ({ Platform: { OS: 'android' }, TurboModuleRegistry: { get: jest.fn(() => null) } }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: {
  revenueCat: { androidApiKey: 'goog_unit_test_public_key' },
} } } }));
jest.mock('react-native-purchases', () => ({ __esModule: true, default: {
  configure: (...args: unknown[]) => mockConfigure(...args),
  getOfferings: jest.fn(async () => ({ current: { lifetime: mockOffer } })),
  purchasePackage: (...args: unknown[]) => mockPurchase(...args),
  restorePurchases: (...args: unknown[]) => mockRestore(...args),
  getCustomerInfo: jest.fn(async () => ({ entitlements: { active: {} } })),
} }));

beforeEach(() => {
  jest.clearAllMocks(); mockPrepare.mockResolvedValue(undefined);
  mockPurchase.mockResolvedValue({ customerInfo: { entitlements: { active: { pro: {} } } } });
  mockRestore.mockResolvedValue({ entitlements: { active: { pro: {} } } });
});

test('checkout waits for current attribution before buying the selected store package', async () => {
  const { configurePurchases, purchasePremium } = require('../services/purchases');
  configurePurchases();
  let resolve!: () => void;
  mockPrepare.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
  const checkout = purchasePremium('lifetime');
  await Promise.resolve(); await Promise.resolve();
  expect(mockPurchase).not.toHaveBeenCalled();
  resolve();
  await expect(checkout).resolves.toEqual({ outcome: 'purchased', unlocked: true });
  expect(mockPurchase).toHaveBeenCalledWith(mockOffer);
});

test('a cancelled store transaction never unlocks premium', async () => {
  mockPurchase.mockRejectedValueOnce({ userCancelled: true });
  const { purchasePremium } = require('../services/purchases');
  await expect(purchasePremium('lifetime')).resolves.toEqual({ outcome: 'cancelled', unlocked: false });
});

test('an unavailable plan does not buy another product', async () => {
  const { purchasePremium } = require('../services/purchases');
  await expect(purchasePremium('annual')).resolves.toEqual({ outcome: 'unavailable', unlocked: false });
  expect(mockPurchase).not.toHaveBeenCalled();
});

test('restore reconciles consent before touching store history and never purchases', async () => {
  const { restorePremium } = require('../services/purchases');
  let resolve!: () => void;
  mockPrepare.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
  const restore = restorePremium();
  await Promise.resolve();
  expect(mockRestore).not.toHaveBeenCalled();
  resolve();
  await expect(restore).resolves.toBe(true);
  expect(mockRestore).toHaveBeenCalledTimes(1);
  expect(mockPurchase).not.toHaveBeenCalled();
});
