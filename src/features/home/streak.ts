/**
 * Activity streak in whole local calendar days.
 *
 * The streak is calculated from mastery timestamps instead of a stored
 * counter: there is no scheduled job in an offline-first app, so a counter
 * would go stale the moment the child skips a day. A run that ended
 * yesterday still counts today — the child has the rest of the day to keep
 * it alive — otherwise the flame resets at midnight.
 */
export const dayKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const currentStreak = (
  timestamps: readonly number[],
  now: number = Date.now(),
): number => {
  const days = new Set(timestamps.map(dayKey));
  const cursor = new Date(now);

  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor.getTime()))) return 0;
  }

  let streak = 0;
  while (streak < 3650 && days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
