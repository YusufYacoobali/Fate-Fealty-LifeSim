/** PURE: respectful, curiosity-led reminders and their deterministic rotation. */

export type ReminderCategory = 'story' | 'people' | 'world' | 'reward' | 'humour';

export interface ReminderMessage {
  title: string;
  body: string;
  category: ReminderCategory;
}

/**
 * A broad pool avoids repeating the same promise every day. Copy points to
 * unfinished relationships, world pressure and player agency without false
 * urgency or punishment language.
 */
export const REMINDER_MESSAGES: ReminderMessage[] = [
  { title: 'A tale remains unfinished', body: 'Someone in Swineford is still living with thy last decision.', category: 'story' },
  { title: 'The village remembers', body: 'Old loyalties and older grudges are waiting for their next chapter.', category: 'people' },
  { title: 'News from Swineford', body: 'The balance of food, faith and order will not stay still forever.', category: 'world' },
  { title: 'A welcome gift awaits', body: 'The steward has set aside today\'s free provisions.', category: 'reward' },
  { title: 'Sir Quackbeard reports', body: 'The goose has investigated a suspicious turnip. Results are inconclusive.', category: 'humour' },
  { title: 'One choice can echo', body: 'Return to see which promise, secret or rivalry resurfaces next.', category: 'story' },
  { title: 'Someone speaks thy name', body: 'Friend, rival or creditor? Swineford has room for all three.', category: 'people' },
  { title: 'The chapel bell rings', body: 'Faith is shifting, and the parish is watching what thou dost next.', category: 'world' },
  { title: 'The steward saved thy share', body: 'Claim today\'s free reward whenever thou art ready.', category: 'reward' },
  { title: 'A quiet year? Perhaps not', body: 'Age up when ready and discover what has been gathering beneath the calm.', category: 'story' },
  { title: 'A familiar face returns', body: 'Persistent people make persistent trouble. Thy response is still thine.', category: 'people' },
  { title: 'Market whispers travel fast', body: 'Prosperity brings opportunity, envy and very creative accounting.', category: 'world' },
  { title: 'Thy daily provisions', body: 'A small free gift is waiting at the manor gate.', category: 'reward' },
  { title: 'The tax collector came by', body: 'The goose handled it. There may now be paperwork.', category: 'humour' },
  { title: 'An old decision stirs', body: 'Consequences can wait years before knocking at thy door.', category: 'story' },
  { title: 'Family news has arrived', body: 'A child, sibling or spouse may be entering a decisive chapter.', category: 'people' },
  { title: 'Clouds over the harvest', body: 'Food security shapes every household. See how Swineford fares.', category: 'world' },
  { title: 'Today\'s gift is ready', body: 'Return for free provisions and continue at thine own pace.', category: 'reward' },
  { title: 'A secret seeks daylight', body: 'What is known, hidden or suspected may change a family for years.', category: 'story' },
  { title: 'A rival is making moves', body: 'They have ambitions of their own, even while thou art away.', category: 'people' },
  { title: 'The roads feel less safe', body: 'Order, law and outlawry are pulling Swineford in different directions.', category: 'world' },
  { title: 'The turnips held council', body: 'Their ruling was unanimous: more medieval life is required.', category: 'humour' },
  { title: 'Thy chronicle has room', body: 'The next year may become a footnote, a feud or a family legend.', category: 'story' },
  { title: 'An ally could use thee', body: 'Relationships deepen when remembered choices meet new pressure.', category: 'people' },
  { title: 'War drums or thunder?', body: 'Swineford is listening. Return when thou art ready to act.', category: 'world' },
  { title: 'Provisions from the manor', body: 'Today\'s free reward waits without cost or obligation.', category: 'reward' },
  { title: 'The guilds are whispering', body: 'Careers rise on skill, patrons and the choices no one forgets.', category: 'people' },
  { title: 'History is still moving', body: 'One more year can change a household, a faction or an heir\'s future.', category: 'world' },
];

/** Deterministic pick by index; wraps around the pool. */
export function reminderByIndex(i: number): ReminderMessage {
  return REMINDER_MESSAGES[((i % REMINDER_MESSAGES.length) + REMINDER_MESSAGES.length) % REMINDER_MESSAGES.length];
}

/** Calendar-day ordinal in the user's local timezone. */
export function localDayOrdinal(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/**
 * The pool is editorially ordered to alternate hooks, so adjacent days do not
 * repeat a category. The offset keeps dates stable across runs.
 */
export function reminderForDate(date: Date): ReminderMessage {
  return reminderByIndex(localDayOrdinal(date) + 17);
}

export const DAILY_REMINDER_HOUR = 19;
export const DAILY_REMINDER_MINUTE = 0;

export interface ReminderScheduleEntry {
  date: Date;
  message: ReminderMessage;
}

/** Build the next local-evening schedule without touching randomness. */
export function buildReminderSchedule(now = new Date(), count = 14): ReminderScheduleEntry[] {
  const first = new Date(now);
  first.setHours(DAILY_REMINDER_HOUR, DAILY_REMINDER_MINUTE, 0, 0);
  if (first.getTime() <= now.getTime()) first.setDate(first.getDate() + 1);
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const date = new Date(first);
    date.setDate(first.getDate() + index);
    return { date, message: reminderForDate(date) };
  });
}
