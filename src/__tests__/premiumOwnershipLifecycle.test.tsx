import React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { usePremium } from '../state/hooks/usePremium';
import { AppMetaApi } from '../state/hooks/useAppMeta';
import { DEFAULT_META } from '../state/appMeta';
import { addPremiumListener, getPremiumAccess, purchasePremium, restorePremiumAccess, PremiumAccess, PremiumOwnership } from '../services/purchases';

jest.mock('../services/purchases', () => ({
  configurePurchases: jest.fn(),
  getPremiumAccess: jest.fn(),
  addPremiumListener: jest.fn(),
  purchasePremium: jest.fn(),
  restorePremiumAccess: jest.fn(),
  mergeEntitlement: (cached: boolean, fresh: boolean | null) => fresh ?? cached,
}));

const monthly: PremiumOwnership = { kind: 'subscription', productIdentifier: 'month', productPlanIdentifier: null, store: 'APP_STORE', hasActiveSubscription: true };
const lifetime: PremiumOwnership = { ...monthly, kind: 'lifetime', productIdentifier: 'life', hasActiveSubscription: true };
const mockRead = getPremiumAccess as jest.MockedFunction<typeof getPremiumAccess>;
let current: ReturnType<typeof usePremium>;
let meta: AppMetaApi;
let root: ReactTestRenderer;
let foreground: (state: AppStateStatus) => void;
let listener: (unlocked: boolean, ownership: PremiumOwnership | null) => void;

function Harness() {
  current = usePremium(meta, true);
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  meta = {
    metaRef: { current: { ...DEFAULT_META } }, ready: true,
    update: jest.fn((patch) => { meta.metaRef.current = { ...meta.metaRef.current, ...patch }; }),
  };
  mockRead.mockResolvedValue({ unlocked: true, ownership: monthly });
  (addPremiumListener as jest.Mock).mockImplementation((handler) => {
    listener = handler;
    return jest.fn();
  });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    foreground = handler;
    return { remove: jest.fn() };
  });
});
afterEach(() => {
  act(() => root?.unmount());
  jest.restoreAllMocks();
});

test('purchase updates ownership even when the subscriber was already unlocked', async () => {
  await act(async () => { root = create(<Harness />); });
  expect(current.premiumOwnership).toEqual(monthly);
  (purchasePremium as jest.Mock).mockResolvedValue({ outcome: 'purchased', unlocked: true, ownership: lifetime });
  await act(async () => { await current.purchasePlan('lifetime'); });
  expect(purchasePremium).toHaveBeenCalledWith('lifetime', { unlocked: true, ownership: monthly });
  expect(current.premiumUnlocked).toBe(true);
  expect(current.premiumOwnership).toEqual(lifetime);
});

test('restore and SDK updates reconcile the owned plan', async () => {
  await act(async () => { root = create(<Harness />); });
  act(() => listener(true, lifetime));
  expect(current.premiumOwnership).toEqual(lifetime);
  (restorePremiumAccess as jest.Mock).mockResolvedValue({ unlocked: true, ownership: monthly });
  await act(async () => { await current.restorePremium(); });
  expect(current.premiumOwnership).toEqual(monthly);
});

test('foreground failure retains confirmed ownership, while confirmed expiry clears it', async () => {
  await act(async () => { root = create(<Harness />); });
  mockRead.mockResolvedValueOnce(null);
  await act(async () => { foreground('active'); });
  expect(current.premiumUnlocked).toBe(true);
  expect(current.premiumOwnership).toEqual(monthly);
  expect(current.premiumAccessState).toBe('unavailable');
  mockRead.mockResolvedValueOnce({ unlocked: false, ownership: null });
  await act(async () => { foreground('active'); });
  expect(current.premiumOwnership).toBeNull();
  expect(current.premiumUnlocked).toBe(false);
});

test('a stale startup response cannot overwrite a newer confirmed purchase', async () => {
  let resolve!: (access: PremiumAccess) => void;
  mockRead.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
  await act(async () => { root = create(<Harness />); });
  (purchasePremium as jest.Mock).mockResolvedValue({ outcome: 'purchased', unlocked: true, ownership: lifetime });
  await act(async () => { await current.purchasePlan('lifetime'); });
  await act(async () => { resolve({ unlocked: true, ownership: monthly }); });
  expect(current.premiumOwnership).toEqual(lifetime);
});
