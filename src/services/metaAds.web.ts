// Ad measurement is native-only. Do not import ATT or the native Meta bridge
// into the browser bundle: those modules can throw before the platform guard.
type RevenueCat = typeof import('react-native-purchases').default;
export function isMetaAdsConfigured(): boolean { return false; }
export async function connectMetaPurchases(_client: RevenueCat): Promise<void> {}
export async function refreshMetaConsent(): Promise<void> {}
export async function setMetaConsent(_granted: boolean): Promise<void> {}
export async function showMetaConsentChoices(): Promise<void> {}
export async function startMetaAds(): Promise<void> {}
export function metaAppBackgrounded(): void {}
