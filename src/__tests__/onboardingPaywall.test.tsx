import React from 'react';
import { TouchableOpacity } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { OnboardingPaywallPanel } from '@/components/premium/onboarding-paywall-panel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelText } from '@/components/ui/PixelText';

jest.mock('@/components/premium/FullScreenPage', () => ({
  FullScreenPage: ({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) => <>{children}{footer}</>,
}));
jest.mock('@/state/hooks/usePremiumOffers', () => ({
  usePremiumOffers: () => ({ offers: null, storeUnavailable: false }),
}));

let root: ReactTestRenderer;
const onPurchase = jest.fn().mockResolvedValue('purchased');
const onRestore = jest.fn().mockResolvedValue(true);
const onDone = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
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
