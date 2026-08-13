import { useEffect } from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { AppMetaApi } from './useAppMeta';

/**
 * Configures notification display and refreshes the rolling daily reminder
 * rotation once meta is ready. Single responsibility: reminder scheduling.
 */
export function useScheduledReminders(meta: AppMetaApi) {
  useEffect(() => {
    if (!meta.ready) return;
    // Loading expo-notifications itself emits unsupported-feature warnings in
    // Expo Go. Local notifications remain enabled in development and store
    // builds, where the native module has the app-specific configuration.
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
    let active = true;
    (async () => {
      const { configureNotificationHandler, ensureDailyReminder } = await import('@/services/notifications');
      configureNotificationHandler();
      if (meta.metaRef.current.notificationsDenied) return;
      const result = await ensureDailyReminder();
      if (!active) return;
      meta.update({
        notificationsScheduled: result.scheduled || meta.metaRef.current.notificationsScheduled,
        notificationsDenied: !result.granted && !result.scheduled,
      });
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.ready]);
}
