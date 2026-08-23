import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { buildReminderSchedule } from './notificationMessages';

const ANDROID_CHANNEL = 'reminders';
const REMINDER_ID_PREFIX = 'mls:daily-reminder:';
const LEGACY_REMINDER_ID = 'mls:daily-reminder';
const SCHEDULE_DAYS = 14;

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
    name: 'Swineford reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export interface ScheduleResult {
  granted: boolean;
  scheduled: boolean;
}

/**
 * Refresh a rolling two-week set of one-off reminders. One-off dates let the
 * copy rotate; cancelling only our known identifiers keeps the operation
 * idempotent and leaves every other app notification untouched.
 */
export async function ensureDailyReminder(now = new Date()): Promise<ScheduleResult> {
  let permissionGranted = false;
  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return { granted: false, scheduled: false };
    permissionGranted = true;

    await ensureAndroidChannel();
    await Notifications.cancelScheduledNotificationAsync(LEGACY_REMINDER_ID);
    await Promise.all(
      Array.from({ length: SCHEDULE_DAYS }, (_, index) =>
        Notifications.cancelScheduledNotificationAsync(`${REMINDER_ID_PREFIX}${index}`),
      ),
    );

    const schedule = buildReminderSchedule(now, SCHEDULE_DAYS);
    await Promise.all(
      schedule.map(({ date, message }, index) =>
        Notifications.scheduleNotificationAsync({
          identifier: `${REMINDER_ID_PREFIX}${index}`,
          content: {
            title: message.title,
            body: message.body,
            data: { kind: 'daily-reminder', category: message.category },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
            channelId: Platform.OS === 'android' ? ANDROID_CHANNEL : undefined,
          },
        }),
      ),
    );
    return { granted: true, scheduled: schedule.length > 0 };
  } catch {
    return { granted: permissionGranted, scheduled: false };
  }
}
