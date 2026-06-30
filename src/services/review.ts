import { Linking, Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';

export { REVIEW_ENTRY_THRESHOLD, shouldPromptReview, entriesDelta } from './reviewLogic';

/** The package id from app.json — used to build a Play Store fallback URL. */
const ANDROID_PACKAGE = 'com.medievallife.app';

function fallbackStoreUrl(): string | null {
  if (Platform.OS === 'android') {
    return `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  }
  // iOS needs a numeric App Store id, assigned at submission time. Until then
  // there is no meaningful page to open, so we bail gracefully.
  return null;
}

/** Open the store listing as a fallback when the in-app prompt is unavailable. */
export async function openStorePage(): Promise<void> {
  let url: string | null = null;
  try {
    url = await StoreReview.storeUrl();
  } catch {
    url = null;
  }
  if (!url) url = fallbackStoreUrl();
  if (url) {
    Linking.openURL(url).catch(() => {
      /* nothing more we can do */
    });
  }
}

/**
 * Present the OS-native in-app review prompt (SKStoreReviewController on iOS,
 * the In-App Review API on Android). If it isn't available, fall back to opening
 * the store page directly.
 *
 * Note: iOS gives no callback indicating whether the system actually rendered
 * the sheet (it is throttled by Apple), so "did it show?" cannot be detected
 * programmatically — we do the best the platform allows.
 */
export async function presentNativeReview(): Promise<void> {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      return;
    }
  } catch {
    // fall through to the store page
  }
  await openStorePage();
}
