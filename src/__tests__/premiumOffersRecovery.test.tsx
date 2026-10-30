import React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { usePremiumOffers } from '../state/hooks/usePremiumOffers';
import { getPremiumOffers, PlanOffers } from '../services/purchases';

jest.mock('../services/purchases', () => ({ getPremiumOffers: jest.fn() }));

const mockLoad = getPremiumOffers as jest.MockedFunction<typeof getPremiumOffers>;
const offers: PlanOffers = {
  monthly: { available: false, priceString: null, price: null, currencyCode: null },
  annual: { available: false, priceString: null, price: null, currencyCode: null },
  lifetime: { available: true, priceString: '$19.99', price: 19.99, currencyCode: 'USD' },
};
let current: ReturnType<typeof usePremiumOffers>;
let root: ReactTestRenderer;
let foreground: (state: AppStateStatus) => void;
const remove = jest.fn();

function Harness() {
  current = usePremiumOffers(true);
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    foreground = handler;
    return { remove };
  });
});
afterEach(() => {
  act(() => root?.unmount());
  jest.restoreAllMocks();
});

test('manual retry recovers a failed store load without reopening the paywall', async () => {
  mockLoad.mockResolvedValueOnce(null).mockResolvedValueOnce(offers);
  await act(async () => { root = create(<Harness />); });
  expect(current.storeUnavailable).toBe(true);
  await act(async () => { current.retryOffers(); });
  expect(current.storeUnavailable).toBe(false);
  expect(current.offers).toBe(offers);
  expect(current.offersLoading).toBe(false);
});

test('returning to the app refreshes products and removes the listener on unmount', async () => {
  mockLoad.mockResolvedValueOnce(null).mockResolvedValueOnce(offers);
  await act(async () => { root = create(<Harness />); });
  await act(async () => { foreground('background'); });
  expect(mockLoad).toHaveBeenCalledTimes(1);
  await act(async () => { foreground('active'); });
  expect(mockLoad).toHaveBeenCalledTimes(2);
  expect(current.offers).toBe(offers);
  act(() => root.unmount());
  expect(remove).toHaveBeenCalled();
});

test('an older in-flight failure cannot replace a successful retry', async () => {
  let failFirst!: (result: null) => void;
  mockLoad.mockImplementationOnce(() => new Promise((resolve) => { failFirst = resolve; })).mockResolvedValueOnce(offers);
  await act(async () => { root = create(<Harness />); });
  expect(current.offersLoading).toBe(true);
  await act(async () => { current.retryOffers(); });
  await act(async () => { failFirst(null); });
  expect(current.offers).toBe(offers);
  expect(current.storeUnavailable).toBe(false);
});
