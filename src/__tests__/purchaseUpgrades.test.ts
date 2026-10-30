import { Platform } from 'react-native';
import { addPremiumListener, getPremiumAccess, purchasePremium, restorePremiumAccess } from '../services/purchases';

const mockInfo = jest.fn();
const mockBuy = jest.fn();
const mockRestore = jest.fn();
const mockListener = jest.fn();
const mockProducts = {
  monthly: { product: { identifier: 'premium:monthly' } },
  annual: { product: { identifier: 'premium:yearly' } },
  lifetime: { product: { identifier: 'lifetime' } },
};
jest.mock('../services/metaAds', () => ({ connectMetaPurchases: jest.fn().mockResolvedValue(undefined) }));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' }, TurboModuleRegistry: { get: jest.fn(() => null) } }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: {
  revenueCat: { iosApiKey: 'appl_unit_test_public_key', androidApiKey: 'goog_unit_test_public_key' },
} } } }));
jest.mock('react-native-purchases', () => ({ __esModule: true, default: {
  configure: jest.fn(),
  getOfferings: jest.fn(async () => ({ current: mockProducts })),
  getCustomerInfo: (...args: unknown[]) => mockInfo(...args),
  purchasePackage: (...args: unknown[]) => mockBuy(...args),
  restorePurchases: (...args: unknown[]) => mockRestore(...args),
  addCustomerInfoUpdateListener: (...args: unknown[]) => mockListener(...args),
  removeCustomerInfoUpdateListener: jest.fn(),
  STORE_REPLACEMENT_MODE: { WITHOUT_PRORATION: 'WITHOUT_PRORATION' },
} }));

function customer(plan: 'monthly' | 'yearly' | 'lifetime') {
  return {
    entitlements: { active: { pro: {
      productIdentifier: plan === 'lifetime' ? 'lifetime' : Platform.OS === 'android' ? 'premium' : `premium:${plan}`,
      productPlanIdentifier: plan === 'lifetime' || Platform.OS === 'ios' ? null : plan,
      expirationDate: plan === 'lifetime' ? null : '2027-10-04T00:00:00Z',
      store: Platform.OS === 'android' ? 'PLAY_STORE' : 'APP_STORE',
    } } },
    activeSubscriptions: plan === 'lifetime' ? [] : ['premium'],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  (Platform as { OS: string }).OS = 'ios';
  mockInfo.mockResolvedValue(customer('monthly'));
  mockBuy.mockResolvedValue({ customerInfo: customer('yearly') });
});

test('an iOS monthly owner can switch to yearly using the normal StoreKit purchase', async () => {
  await expect(purchasePremium('annual')).resolves.toMatchObject({ outcome: 'purchased', ownership: { kind: 'subscription' } });
  expect(mockBuy).toHaveBeenCalledWith(mockProducts.annual);
});

test('an iOS yearly owner can buy Lifetime', async () => {
  mockInfo.mockResolvedValue(customer('yearly'));
  mockBuy.mockResolvedValue({ customerInfo: customer('lifetime') });
  await expect(purchasePremium('lifetime')).resolves.toMatchObject({ outcome: 'purchased', ownership: { kind: 'lifetime' } });
  expect(mockBuy).toHaveBeenCalledWith(mockProducts.lifetime);
});

test('Google yearly checkout replaces the owned monthly base plan instead of adding a subscription', async () => {
  (Platform as { OS: string }).OS = 'android';
  mockInfo.mockResolvedValue(customer('monthly'));
  mockBuy.mockResolvedValue({ customerInfo: customer('yearly') });
  await expect(purchasePremium('annual')).resolves.toMatchObject({ outcome: 'purchased' });
  expect(mockBuy).toHaveBeenCalledWith(mockProducts.annual, null, {
    oldProductIdentifier: 'premium:monthly', replacementMode: 'WITHOUT_PRORATION',
  });
});

test('Lifetime is a separate non-consumable and never receives subscription replacement arguments', async () => {
  (Platform as { OS: string }).OS = 'android';
  mockInfo.mockResolvedValue(customer('yearly'));
  mockBuy.mockResolvedValue({ customerInfo: customer('lifetime') });
  await purchasePremium('lifetime');
  expect(mockBuy).toHaveBeenCalledWith(mockProducts.lifetime);
});

test.each(['monthly', 'annual', 'lifetime'] as const)('Lifetime owners cannot purchase %s again', async (plan) => {
  mockInfo.mockResolvedValue(customer('lifetime'));
  await expect(purchasePremium(plan)).resolves.toEqual({ outcome: 'unavailable', unlocked: false });
  expect(mockBuy).not.toHaveBeenCalled();
});

test('yearly owners cannot buy a second monthly subscription', async () => {
  mockInfo.mockResolvedValue(customer('yearly'));
  await expect(purchasePremium('monthly')).resolves.toEqual({ outcome: 'unavailable', unlocked: false });
  expect(mockBuy).not.toHaveBeenCalled();
});

test('store-confirmed ownership is returned on load, restore and listener updates', async () => {
  mockInfo.mockResolvedValue(customer('monthly'));
  await expect(getPremiumAccess()).resolves.toMatchObject({ unlocked: true, ownership: { productIdentifier: 'premium:monthly' } });
  mockRestore.mockResolvedValue(customer('lifetime'));
  await expect(restorePremiumAccess()).resolves.toMatchObject({ unlocked: true, ownership: { kind: 'lifetime' } });
  const onChange = jest.fn();
  addPremiumListener(onChange);
  mockListener.mock.calls[0][0](customer('yearly'));
  expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ productIdentifier: 'premium:yearly' }));
});

test('a failed ownership endpoint does not block a fresh iOS purchase', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  mockInfo.mockRejectedValueOnce(new Error('offline customer endpoint'));
  mockBuy.mockResolvedValue({ customerInfo: customer('lifetime') });
  await expect(purchasePremium('lifetime')).resolves.toMatchObject({ outcome: 'purchased' });
  expect(mockBuy).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});

test('Google never starts an independent subscription when ownership cannot be verified', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  (Platform as { OS: string }).OS = 'android';
  mockInfo.mockRejectedValueOnce(new Error('offline'));
  await expect(purchasePremium('annual', { unlocked: false, ownership: null })).resolves.toEqual({ outcome: 'unavailable', unlocked: false });
  expect(mockBuy).not.toHaveBeenCalled();
  warn.mockRestore();
});
