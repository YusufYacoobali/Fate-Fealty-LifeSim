import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import MetaActivation from '../../modules/meta-activation/src/MetaActivationModule';

const CONSENT_KEY = '@fate-fealty/meta-ad-measurement-v1';
type RevenueCat = typeof import('react-native-purchases').default;
let purchases: RevenueCat | null = null;
let queue: Promise<unknown> = Promise.resolve();
let prompted = false;
let activated = false;

export function isMetaAdsConfigured(): boolean {
  return (Platform.OS === 'ios' || Platform.OS === 'android')
    && Constants.executionEnvironment !== 'storeClient'
    && Constants.expoConfig?.extra?.metaAds?.enabled === true;
}

function serialize(work: () => Promise<void>): Promise<void> {
  const next = queue.then(work).catch(() => {
    // Measurement must never break gameplay or a store transaction.
    if (__DEV__) console.warn('[meta-ads] Measurement unavailable; check native build and configuration.');
  });
  queue = next;
  return next;
}

async function clearAttribution(): Promise<void> {
  if (!purchases) return;
  // Empty values delete reserved subscriber attributes. This also prevents
  // later server-side purchases from using identifiers retained after opt-out.
  await purchases.setAttributes({
    $fbAnonId: '', $idfa: '', $gpsAdId: '', $idfv: '', $ip: '',
    ...(Platform.OS === 'ios' ? { $attConsentStatus: 'denied' } : {}),
  });
}

async function reconcile(allowPermissionPrompt = false): Promise<void> {
  if (!isMetaAdsConfigured()) return;
  const consent = await AsyncStorage.getItem(CONSENT_KEY) === 'granted';
  let allowed = consent;
  if (Platform.OS === 'ios' && consent) {
    let permission = await getTrackingPermissionsAsync();
    if (permission.status === 'undetermined' && allowPermissionPrompt && AppState.currentState === 'active') {
      permission = await requestTrackingPermissionsAsync();
    }
    allowed = permission.status === 'granted';
  }

  if (!allowed) {
    activated = false;
    try { await MetaActivation?.configure(false); }
    finally { await clearAttribution(); }
    return;
  }
  if (!MetaActivation) return;

  await MetaActivation.configure(true);
  try {
    if (!activated) {
      await MetaActivation.activateApp();
      activated = true;
    }
  } finally {
    // An activation or anonymous-ID failure must not discard the independent
    // advertising-ID route for an otherwise consented purchase.
    if (purchases) {
      try {
        const anonymousId = await MetaActivation.getAnonymousID();
        if (anonymousId) await purchases.setFBAnonymousID(anonymousId);
      } finally {
        await purchases.collectDeviceIdentifiers();
      }
    }
  }
}

/** Called only after RevenueCat.configure, and again before a purchase. */
export function connectMetaPurchases(client: RevenueCat): Promise<void> {
  purchases = client;
  return serialize(() => reconcile());
}

export function refreshMetaConsent(): Promise<void> {
  return serialize(() => reconcile());
}

export async function setMetaConsent(granted: boolean): Promise<void> {
  await serialize(async () => {
    await AsyncStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    await reconcile(granted);
  });
  // Network sync stays outside the native-operation queue so an offline
  // withdrawal cannot hold up future purchases or consent changes.
  if (!granted && purchases) {
    try { await purchases.syncAttributesAndOfferingsIfNeeded(); } catch { /* retried by RevenueCat */ }
  }
}

/** The same choice is available at first launch and from Settings. */
export async function showMetaConsentChoices(): Promise<void> {
  if (!isMetaAdsConfigured()) return;
  Alert.alert('Help measure our ads?',
    'Allow Fate & Fealty to share device identifiers, app opens and purchase information with Meta to measure our Facebook and Instagram ads? This is optional and does not affect the game. You can change your choice in Settings.',
    [
      { text: 'Do not allow', style: 'cancel', onPress: () => { void setMetaConsent(false); } },
      { text: 'Allow', onPress: () => { void setMetaConsent(true); } },
    ], { cancelable: false });
}

export async function startMetaAds(): Promise<void> {
  if (!isMetaAdsConfigured() || AppState.currentState !== 'active') return;
  try {
    const consent = await AsyncStorage.getItem(CONSENT_KEY);
    if (consent === null && !prompted) {
      prompted = true;
      await showMetaConsentChoices();
    } else {
      await refreshMetaConsent();
    }
  } catch {
    // A storage failure leaves tracking off.
  }
}

export function metaAppBackgrounded(): void {
  activated = false;
}
