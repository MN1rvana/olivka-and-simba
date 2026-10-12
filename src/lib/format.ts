const listFormat = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

/** ['a', 'b', 'c'] → 'a, b, and c'. Intl handles the commas and the "and". */
export function joinAsSentenceList(items: readonly string[]): string {
  return listFormat.format(items);
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // The birthday is a calendar date, not a moment in time. Formatting it in UTC
  // stops a visitor west of Greenwich from seeing the day before.
  timeZone: 'UTC',
});

/** '2022-03-14' → '14 March 2022' */
export function formatBirthday(birthday: string): string {
  return dateFormat.format(new Date(`${birthday}T00:00:00Z`));
}
