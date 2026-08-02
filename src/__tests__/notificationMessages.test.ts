import { DAILY_REMINDER_HOUR, DAILY_REMINDER_MINUTE, REMINDER_MESSAGES, buildReminderSchedule, reminderByIndex, reminderForDate } from '@/services/notificationMessages';

describe('notificationMessages', () => {
  it('daily reminder time is a valid local clock time', () => {
    expect(DAILY_REMINDER_HOUR).toBeGreaterThanOrEqual(0);
    expect(DAILY_REMINDER_HOUR).toBeLessThanOrEqual(23);
    expect(DAILY_REMINDER_MINUTE).toBeGreaterThanOrEqual(0);
    expect(DAILY_REMINDER_MINUTE).toBeLessThanOrEqual(59);
  });

  it('has a broad, categorised message pool with title + body', () => {
    expect(REMINDER_MESSAGES.length).toBeGreaterThanOrEqual(28);
    for (const m of REMINDER_MESSAGES) {
      expect(m.title).toBeTruthy();
      expect(m.body).toBeTruthy();
      expect(m.category).toBeTruthy();
    }
    expect(new Set(REMINDER_MESSAGES.map((message) => message.category)).size).toBe(5);
  });

  it('reminderByIndex wraps around the pool', () => {
    expect(reminderByIndex(0)).toBe(REMINDER_MESSAGES[0]);
    expect(reminderByIndex(REMINDER_MESSAGES.length)).toBe(REMINDER_MESSAGES[0]);
    expect(reminderByIndex(-1)).toBe(REMINDER_MESSAGES[REMINDER_MESSAGES.length - 1]);
  });

  it('builds fourteen distinct local-evening reminders without randomness', () => {
    const now = new Date(2026, 7, 2, 20, 30);
    const schedule = buildReminderSchedule(now, 14);
    expect(schedule).toHaveLength(14);
    expect(schedule[0].date.getDate()).toBe(3);
    expect(schedule.every((entry) => entry.date.getHours() === 19 && entry.date.getMinutes() === 0)).toBe(true);
    expect(new Set(schedule.map((entry) => entry.message.body)).size).toBe(14);
    expect(schedule.every((entry, index) => index === 0 || entry.message.category !== schedule[index - 1].message.category)).toBe(true);
    expect(reminderForDate(schedule[0].date)).toBe(schedule[0].message);
  });
});
