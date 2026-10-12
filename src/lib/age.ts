/**
 * Whole years between an ISO birthday (YYYY-MM-DD) and `today`.
 * Pure: `today` is passed in, so tests don't depend on the real date.
 */
export function getAgeInYears(birthday: string, today: Date): number {
  const [year, month, day] = birthday.split('-').map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Expected YYYY-MM-DD, got "${birthday}"`);
  }

  let age = today.getFullYear() - year;
  const hadBirthdayThisYear =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!hadBirthdayThisYear) {
    age -= 1;
  }

  return age;
}
