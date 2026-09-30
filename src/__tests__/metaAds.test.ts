const mockActivation = { configure: jest.fn().mockResolvedValue(undefined), activateApp: jest.fn().mockResolvedValue(undefined), getAnonymousID: jest.fn().mockResolvedValue('fb-anonymous') };
const mockPermission = jest.fn();
const mockRequest = jest.fn();
const mockRC = {
  setFBAnonymousID: jest.fn().mockResolvedValue(undefined),
  collectDeviceIdentifiers: jest.fn().mockResolvedValue(undefined),
  setAttributes: jest.fn().mockResolvedValue(undefined),
  syncAttributesAndOfferingsIfNeeded: jest.fn().mockResolvedValue({}),
};
let mockConsent: string | null;
let mockPlatform: string;
let mockEnabled: boolean;
const mockAlert = jest.fn();
jest.mock('react-native', () => ({
  // Expo's lazy fetch initialization also consults this optional native registry.
  TurboModuleRegistry: { get: jest.fn(() => null) },
  Platform: { get OS() { return mockPlatform; } },
  AppState: { currentState: 'active' }, Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
}));
jest.mock('expo-constants', () => ({ __esModule: true, default: {
  executionEnvironment: 'standalone', expoConfig: { extra: { metaAds: { get enabled() { return mockEnabled; } } } },
} }));
jest.mock('expo-tracking-transparency', () => ({
  getTrackingPermissionsAsync: () => mockPermission(), requestTrackingPermissionsAsync: () => mockRequest(),
}));
jest.mock('../../modules/meta-activation/src/MetaActivationModule', () => ({ __esModule: true, default: mockActivation }));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true, default: {
    getItem: jest.fn(async () => mockConsent),
    setItem: jest.fn(async (_key: string, value: string) => { mockConsent = value; }),
  },
}));

function service(): typeof import('../services/metaAds') { return require('../services/metaAds'); }
function client(): typeof import('react-native-purchases').default { return mockRC as unknown as typeof import('react-native-purchases').default; }

beforeEach(() => {
  jest.resetModules(); jest.clearAllMocks();
  mockPlatform = 'ios'; mockEnabled = true; mockConsent = null;
  mockPermission.mockResolvedValue({ status: 'granted' });
  mockRequest.mockResolvedValue({ status: 'granted' });
  mockActivation.getAnonymousID.mockResolvedValue('fb-anonymous');
});

test.each(['ios', 'android'])('no initialization or collection before consent on %s', async (os) => {
  mockPlatform = os;
  await service().connectMetaPurchases(client());
  expect(mockActivation.configure).not.toHaveBeenCalledWith(true);
  expect(mockRC.collectDeviceIdentifiers).not.toHaveBeenCalled();
  expect(mockActivation.activateApp).not.toHaveBeenCalled();
});

test('unconfigured development builds do not prompt or collect', async () => {
  mockEnabled = false;
  await service().startMetaAds(); await service().connectMetaPurchases(client());
  expect(mockAlert).not.toHaveBeenCalled(); expect(mockRC.setAttributes).not.toHaveBeenCalled();
});

test('web never initializes mobile SDKs', async () => {
  mockPlatform = 'web'; mockConsent = 'granted';
  await service().startMetaAds(); await service().connectMetaPurchases(client());
  expect(mockActivation.configure).not.toHaveBeenCalledWith(true);
});

test('consented activation attaches identifiers before returning, with auto-purchases disabled', async () => {
  mockConsent = 'granted';
  await service().connectMetaPurchases(client());
  expect(mockActivation.activateApp).toHaveBeenCalledTimes(1);
  expect(mockRC.setFBAnonymousID).toHaveBeenCalledWith('fb-anonymous');
  expect(mockRC.collectDeviceIdentifiers).toHaveBeenCalledTimes(1);
  expect(mockActivation.configure).toHaveBeenCalledWith(true);

  await service().refreshMetaConsent();
  expect(mockActivation.activateApp).toHaveBeenCalledTimes(1);
  service().metaAppBackgrounded(); await service().refreshMetaConsent();
  expect(mockActivation.activateApp).toHaveBeenCalledTimes(2);
});

test.each(['denied', 'undetermined'])('iOS ATT %s does not initialize or collect identifiers', async (status) => {
  mockConsent = 'granted'; mockPermission.mockResolvedValue({ status });
  await service().connectMetaPurchases(client());
  expect(mockActivation.configure).not.toHaveBeenCalledWith(true);
  expect(mockRC.collectDeviceIdentifiers).not.toHaveBeenCalled();
  expect(mockRequest).not.toHaveBeenCalled();
});

test('enabling measurement requests ATT before activating', async () => {
  mockPermission.mockResolvedValue({ status: 'undetermined' });
  await service().setMetaConsent(true);
  expect(mockRequest).toHaveBeenCalledTimes(1);
  expect(mockActivation.activateApp).toHaveBeenCalledTimes(1);
});

test('withdrawal clears server attribution and disables collection', async () => {
  mockConsent = 'granted'; await service().connectMetaPurchases(client());
  await service().setMetaConsent(false);
  expect(mockActivation.configure).toHaveBeenLastCalledWith(false);
  expect(mockRC.setAttributes).toHaveBeenLastCalledWith(expect.objectContaining({ $fbAnonId: '', $idfa: '', $gpsAdId: '' }));
  expect(mockRC.syncAttributesAndOfferingsIfNeeded).toHaveBeenCalled();
  expect(mockConsent).toBe('denied');
});

test('iOS permission revoked while backgrounded clears existing attribution', async () => {
  mockConsent = 'granted'; await service().connectMetaPurchases(client());
  mockPermission.mockResolvedValue({ status: 'denied' });
  await service().refreshMetaConsent();
  expect(mockActivation.configure).toHaveBeenLastCalledWith(false);
  expect(mockRC.setAttributes).toHaveBeenLastCalledWith(expect.objectContaining({ $attConsentStatus: 'denied' }));
});

test('SDK errors cannot reject the purchase preparation promise', async () => {
  mockConsent = 'granted'; mockActivation.getAnonymousID.mockRejectedValueOnce(new Error('native unavailable'));
  await expect(service().connectMetaPurchases(client())).resolves.toBeUndefined();
  expect(mockRC.collectDeviceIdentifiers).toHaveBeenCalledTimes(1);
});

test('activation failure still attaches purchase identifiers and retries activation', async () => {
  mockConsent = 'granted'; mockActivation.activateApp.mockRejectedValueOnce(new Error('activation unavailable'));
  await service().connectMetaPurchases(client());
  expect(mockRC.setFBAnonymousID).toHaveBeenCalledWith('fb-anonymous');
  expect(mockRC.collectDeviceIdentifiers).toHaveBeenCalledTimes(1);
  await service().refreshMetaConsent();
  expect(mockActivation.activateApp).toHaveBeenCalledTimes(2);
});

test('Android first-launch choice is only presented once per process', async () => {
  mockPlatform = 'android';
  await service().startMetaAds(); await service().startMetaAds();
  expect(mockAlert).toHaveBeenCalledTimes(1);
  expect(mockRequest).not.toHaveBeenCalled();
});

test.each(['granted', 'denied'])('iOS first launch shows only ATT and respects %s', async (status) => {
  mockPermission.mockResolvedValue({ status: 'undetermined' });
  mockRequest.mockImplementationOnce(async () => {
    expect(mockActivation.configure).not.toHaveBeenCalledWith(true);
    mockPermission.mockResolvedValue({ status });
    return { status };
  });
  await service().connectMetaPurchases(client());
  await Promise.all([service().startMetaAds(), service().startMetaAds()]);
  await service().startMetaAds();
  expect(mockAlert).not.toHaveBeenCalled();
  expect(mockRequest).toHaveBeenCalledTimes(1);
  expect(mockActivation.configure).toHaveBeenLastCalledWith(status === 'granted');
  if (status === 'denied') expect(mockRC.collectDeviceIdentifiers).not.toHaveBeenCalled();
});

test.each(['granted', 'denied'])('existing ATT %s does not show either startup prompt', async (status) => {
  mockPermission.mockResolvedValue({ status });
  await service().startMetaAds();
  expect(mockAlert).not.toHaveBeenCalled();
  expect(mockRequest).not.toHaveBeenCalled();
  expect(mockActivation.configure).toHaveBeenLastCalledWith(status === 'granted');
});

test('iOS startup preserves a previous in-app opt-out', async () => {
  mockConsent = 'denied';
  await service().startMetaAds();
  expect(mockAlert).not.toHaveBeenCalled();
  expect(mockRequest).not.toHaveBeenCalled();
  expect(mockActivation.configure).toHaveBeenLastCalledWith(false);
  expect(mockConsent).toBe('denied');
});

test('iOS retries an undetermined ATT permission after returning to the app', async () => {
  mockConsent = 'granted';
  mockPermission.mockResolvedValue({ status: 'undetermined' });
  mockRequest.mockResolvedValueOnce({ status: 'undetermined' });
  await service().startMetaAds();
  expect(mockActivation.configure).toHaveBeenLastCalledWith(false);
  await service().startMetaAds();
  expect(mockRequest).toHaveBeenCalledTimes(2);
  expect(mockActivation.configure).toHaveBeenLastCalledWith(true);
  expect(mockAlert).not.toHaveBeenCalled();
});


