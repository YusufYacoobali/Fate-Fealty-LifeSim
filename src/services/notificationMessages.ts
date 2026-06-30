/** PURE: the pool of reminder messages + selection. No native imports. */

export const REMINDER_MESSAGES: { title: string; body: string }[] = [
  { title: 'Swineford calls', body: 'Another year of thy life awaits. The turnips will not toil themselves. 🌾' },
  { title: 'Thy goose misses thee', body: 'Sir Quackbeard has bitten two tax collectors in thine absence. Return! 🪿' },
  { title: 'A new year beckons', body: 'Fortune, plague, or a tourney? Age up and find out. ⚔️' },
  { title: 'The chapel bell rings', body: 'Thy soul (and thy stats) could use some tending. 🕯️' },
  { title: 'Word from the village', body: 'Much has happened. Come live another year of thy medieval life. 🏰' },
];

/** Deterministic pick by index (handy for tests); wraps around the pool. */
export function reminderByIndex(i: number) {
  return REMINDER_MESSAGES[((i % REMINDER_MESSAGES.length) + REMINDER_MESSAGES.length) % REMINDER_MESSAGES.length];
}

export function pickReminder() {
  return REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
}

/** Daily reminder time in the user's local timezone. */
export const DAILY_REMINDER_HOUR = 19;
export const DAILY_REMINDER_MINUTE = 0;
