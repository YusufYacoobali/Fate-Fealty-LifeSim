import { DAILY_REMINDER_HOUR, DAILY_REMINDER_MINUTE, REMINDER_MESSAGES, reminderByIndex } from '@/services/notificationMessages';

describe('notificationMessages', () => {
  it('daily reminder time is a valid local clock time', () => {
    expect(DAILY_REMINDER_HOUR).toBeGreaterThanOrEqual(0);
    expect(DAILY_REMINDER_HOUR).toBeLessThanOrEqual(23);
    expect(DAILY_REMINDER_MINUTE).toBeGreaterThanOrEqual(0);
    expect(DAILY_REMINDER_MINUTE).toBeLessThanOrEqual(59);
  });

  it('has a non-empty message pool with title + body', () => {
    expect(REMINDER_MESSAGES.length).toBeGreaterThan(0);
    for (const m of REMINDER_MESSAGES) {
      expect(m.title).toBeTruthy();
      expect(m.body).toBeTruthy();
    }
  });

  it('reminderByIndex wraps around the pool', () => {
    expect(reminderByIndex(0)).toBe(REMINDER_MESSAGES[0]);
    expect(reminderByIndex(REMINDER_MESSAGES.length)).toBe(REMINDER_MESSAGES[0]);
    expect(reminderByIndex(-1)).toBe(REMINDER_MESSAGES[REMINDER_MESSAGES.length - 1]);
  });
});
