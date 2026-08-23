import * as Haptics from 'expo-haptics';

/**
 * Thin, fire-and-forget haptics wrapper. Every call is gated by the player's
 * `haptics` setting and wrapped so an unsupported platform (or the web) can
 * never throw. Semantic names keep call sites readable.
 */
export type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

function run(fn: () => Promise<unknown>): void {
  // Expo native calls normally reject asynchronously, but a missing/released
  // native module can throw synchronously before a Promise is returned.
  try {
    void fn().catch(() => {});
  } catch {
    // Haptics are optional feedback; never let them crash gameplay.
  }
}

export function haptic(kind: HapticKind, enabled: boolean): void {
  if (!enabled) return;
  switch (kind) {
    case 'light':
      return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    case 'medium':
      return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    case 'heavy':
      return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
    case 'success':
      return run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    case 'warning':
      return run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
    case 'error':
      return run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  }
}
