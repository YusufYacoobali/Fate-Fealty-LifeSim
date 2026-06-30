import { useEffect } from 'react';
import { configureNotificationHandler, ensureDailyReminder } from '@/services/notifications';
import { AppMetaApi } from './useAppMeta';

/**
 * Configures notification display and schedules the recurring daily
 * reminder once meta is ready. Single responsibility: reminder scheduling.
 */
export function useScheduledReminders(meta: AppMetaApi) {
  useEffect(() => {
    if (!meta.ready) return;
    let active = true;
    configureNotificationHandler();
    (async () => {
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
