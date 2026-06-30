import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DAILY_REMINDER_HOUR, DAILY_REMINDER_MINUTE, pickReminder } from './notificationMessages';

const ANDROID_CHANNEL = 'reminders';
const DAILY_REMINDER_ID = 'mls:daily-reminder';

/** Foreground display behaviour. Call once, early (before scheduling). */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export interface ScheduleResult {
  granted: boolean;
  scheduled: boolean;
}

/**
 * Request permission and schedule one app-owned daily reminder. Idempotent: it
 * replaces only our known reminder id so relaunching never stacks duplicates or
 * disturbs notifications owned by other features.
 *
 * Returns whether permission was granted and whether a reminder is now set.
 * Wrapped defensively because local-notification support varies (e.g. limited
 * in Expo Go on Android) — it must never crash the app.
 */
export async function ensureDailyReminder(): Promise<ScheduleResult> {
  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return { granted: false, scheduled: false };

    await ensureAndroidChannel();
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);

    const msg = pickReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: { title: msg.title, body: msg.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: DAILY_REMINDER_HOUR,
        minute: DAILY_REMINDER_MINUTE,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL : undefined,
      },
    });
    return { granted: true, scheduled: true };
  } catch {
    return { granted: false, scheduled: false };
  }
}
