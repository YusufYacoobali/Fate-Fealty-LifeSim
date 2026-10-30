import React from 'react';
import { TouchableOpacity } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { OnboardingPaywallPanel, RoyalShopOfferPanel } from '@/components/premium/onboarding-paywall-panel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelText } from '@/components/ui/PixelText';
import { PlanOffers, PremiumOwnership } from '@/services/purchases';

const mockRetryOffers = jest.fn();
let mockOffers: PlanOffers | null = null;
let mockStoreUnavailable = false;
let mockOffersLoading = false;

jest.mock('@/components/premium/FullScreenPage', () => ({
  FullScreenPage: ({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) => <>{children}{footer}</>,
}));
jest.mock('@/state/hooks/usePremiumOffers', () => ({
  usePremiumOffers: () => ({ offers: mockOffers, storeUnavailable: mockStoreUnavailable, offersLoading: mockOffersLoading, retryOffers: mockRetryOffers }),
}));

let root: ReactTestRenderer;
const onPurchase = jest.fn().mockResolvedValue('purchased');
const onRestore = jest.fn().mockResolvedValue(true);
const onDone = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockOffers = null;
  mockStoreUnavailable = false;
  mockOffersLoading = false;
});

it('allows checkout when ownership failed but store products are available', async () => {
  const live = { available: true, priceString: '$9.99', price: 9.99, currencyCode: 'USD' };
  mockOffers = { annual: live, monthly: live, lifetime: live };
  act(() => {
    root = create(<OnboardingPaywallPanel compact={false} unlocked={false} accessState="unavailable" onPurchase={onPurchase} onRestore={onRestore} />);
  });
  const buyButton = root.root.findByType(PixelButton);
  expect(buyButton.props.disabled).toBe(false);
  await act(async () => { await buyButton.props.onPress(); });
  expect(onPurchase).toHaveBeenCalledWith('annual');
});

it('offers a retry after products fail to load', () => {
  mockStoreUnavailable = true;
  act(() => {
    root = create(<OnboardingPaywallPanel compact={false} unlocked={false} accessState="inactive" onPurchase={onPurchase} onRestore={onRestore} />);
  });
  expect(root.root.findByType(PixelButton).props.disabled).toBe(true);
  const retry = root.root.findAllByType(TouchableOpacity).find((node) =>
    node.findAllByType(PixelText).some((text) => text.props.children === 'Retry store'),
  )!;
  act(() => retry.props.onPress());
  expect(mockRetryOffers).toHaveBeenCalledTimes(1);
});

it('disables checkout until store loading finishes', () => {
  mockOffersLoading = true;
  act(() => {
    root = create(<OnboardingPaywallPanel compact={false} unlocked={false} accessState="inactive" onPurchase={onPurchase} onRestore={onRestore} />);
  });
  expect(root.root.findByType(PixelButton).props.disabled).toBe(true);
  expect(textNodes('LOADING STORE...')).toHaveLength(1);
});

function mountSubscriberShop(plan: 'monthly' | 'annual' | 'lifetime', hasActiveSubscription = plan !== 'lifetime') {
  const live = { available: true, priceString: '$9.99', price: 9.99, currencyCode: 'USD' };
  mockOffers = {
    monthly: { ...live, productIdentifier: 'monthly_product' },
    annual: { ...live, productIdentifier: 'yearly_product' },
    lifetime: { ...live, productIdentifier: 'lifetime_product' },
  };
  const ownership: PremiumOwnership = {
    kind: plan === 'lifetime' ? 'lifetime' : 'subscription',
    productIdentifier: mockOffers[plan].productIdentifier!,
    productPlanIdentifier: null,
    store: 'APP_STORE',
    hasActiveSubscription,
  };
  act(() => {
    root = create(<RoyalShopOfferPanel compact={false} unlocked ownership={ownership} accessState="active" onPurchase={onPurchase} onRestore={onRestore} />);
  });
}

it('monthly owners see yearly and lifetime with a working yearly checkout', async () => {
  mountSubscriberShop('monthly');
  expect(textNodes('MONTHLY PASS ACTIVE')).toHaveLength(1);
  expect(textNodes('YEARLY')).toHaveLength(1);
  expect(textNodes('LIFETIME')).toHaveLength(1);
  expect(textNodes('MONTHLY')).toHaveLength(0);
  expect(root.root.findAllByType(TouchableOpacity).filter((node) => node.props.accessibilityRole === 'radio')).toHaveLength(2);
  await act(async () => { await root.root.findByType(PixelButton).props.onPress(); });
  expect(onPurchase).toHaveBeenCalledWith('annual');
  expect(textNodes('Your plan change was submitted. Your store confirms when the yearly plan starts.')).toHaveLength(1);
});

it('yearly owners see and purchase only lifetime, even with the initial yearly selection', async () => {
  mountSubscriberShop('annual');
  expect(textNodes('YEARLY PASS ACTIVE')).toHaveLength(1);
  expect(textNodes('YEARLY')).toHaveLength(0);
  expect(textNodes('MONTHLY')).toHaveLength(0);
  expect(textNodes('LIFETIME')).toHaveLength(1);
  expect(textNodes('BUY LIFETIME')).toHaveLength(1);
  expect(textNodes('Manage subscription')).toHaveLength(1);
  expect(textNodes('Buying Lifetime does not cancel an existing subscription. Cancel its renewal in your store subscription settings.')).toHaveLength(1);
  await act(async () => { await root.root.findByType(PixelButton).props.onPress(); });
  expect(onPurchase).toHaveBeenCalledWith('lifetime');
});

it('monthly owners can select and buy lifetime', async () => {
  mountSubscriberShop('monthly');
  const lifetime = root.root.findAllByType(TouchableOpacity).find((node) =>
    node.props.accessibilityRole === 'radio' && node.findAllByType(PixelText).some((text) => text.props.children === 'LIFETIME'),
  )!;
  act(() => lifetime.props.onPress());
  await act(async () => { await root.root.findByType(PixelButton).props.onPress(); });
  expect(onPurchase).toHaveBeenCalledWith('lifetime');
});

it('lifetime owners see no further purchases and retain subscription management if renewal is still active', () => {
  mountSubscriberShop('lifetime', true);
  expect(textNodes('LIFETIME OWNED')).toHaveLength(1);
  expect(root.root.findAllByType(PixelButton)).toHaveLength(0);
  expect(root.root.findAllByType(TouchableOpacity).filter((node) => node.props.accessibilityRole === 'radio')).toHaveLength(0);
  expect(textNodes('Manage subscription')).toHaveLength(1);
});
afterEach(() => {
  if (root) act(() => root.unmount());
  jest.useRealTimers();
});

function mountOnboarding(premiumUnlocked = false) {
  act(() => {
    root = create(<OnboardingScreen premiumUnlocked={premiumUnlocked} accessState="inactive" onPurchase={onPurchase} onRestore={onRestore} onDone={onDone} />);
  });
}

function enterPaywall() {
  for (let page = 0; page < 3; page += 1) {
    act(() => root.root.findByType(PixelButton).props.onPress());
  }
}

function textNodes(copy: string) {
  return root.root.findAllByType(PixelText).filter((node) => node.props.children === copy);
}

it('starts the five-second free-continue delay when the paywall opens, not during earlier pages', () => {
  mountOnboarding();
  act(() => jest.advanceTimersByTime(10000));
  enterPaywall();
  expect(textNodes('Continue free >')).toHaveLength(0);
  act(() => jest.advanceTimersByTime(4999));
  expect(textNodes('Continue free >')).toHaveLength(0);
  act(() => jest.advanceTimersByTime(1));
  expect(textNodes('Continue free >')).toHaveLength(1);
  const continueButton = root.root.findAllByType(TouchableOpacity).find((node) =>
    node.findAllByType(PixelText).some((text) => text.props.children === 'Continue free >'),
  )!;
  act(() => continueButton.props.onPress());
  expect(onDone).toHaveBeenCalledTimes(1);
});

it('lets existing premium owners continue immediately', () => {
  mountOnboarding(true);
  enterPaywall();
  expect(textNodes('Continue >')).toHaveLength(1);
  expect(textNodes('Continue free >')).toHaveLength(0);
});

it('offers lifetime in the middle and completes that purchase without waiting for the free exit', async () => {
  mountOnboarding();
  enterPaywall();
  const plans = root.root.findAllByType(TouchableOpacity).filter((node) => node.props.accessibilityRole === 'radio');
  expect(plans).toHaveLength(3);
  expect(plans[1].findAllByType(PixelText).some((node) => node.props.children === 'LIFETIME')).toBe(true);
  act(() => plans[1].props.onPress());
  expect(textNodes('One payment. No subscription.')).toHaveLength(1);
  const panel = root.root.findByType(OnboardingPaywallPanel);
  const buyButton = panel.findByType(PixelButton);
  const content = panel.findAll((node) => node.type === PixelButton || node.type === PixelText);
  expect(content.indexOf(buyButton)).toBeLessThan(content.indexOf(textNodes('Reach Baron and Monarch ranks')[0]));
  expect(content.indexOf(textNodes('Gain royal Holding orders and buildings')[0])).toBeLessThan(content.indexOf(textNodes('One payment. No subscription.')[0]));
  await act(async () => { await buyButton.props.onPress(); });
  expect(onPurchase).toHaveBeenCalledWith('lifetime');
  expect(onDone).toHaveBeenCalledTimes(1);
  expect(textNodes('Continue free >')).toHaveLength(0);
});
