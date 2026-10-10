const DAY_IN_MILLISECONDS = 86_400_000;

export function getSiteAgeInDays(
  establishedAt: string,
  today = new Date(),
  timeZone = 'UTC',
): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(establishedAt);
  if (!match) throw new Error('siteConfig.establishedAt must use the YYYY-MM-DD format.');

  const [, year, month, day] = match;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const establishedUtc = Date.UTC(numericYear, numericMonth - 1, numericDay);
  const establishedDate = new Date(establishedUtc);

  if (
    establishedDate.getUTCFullYear() !== numericYear ||
    establishedDate.getUTCMonth() !== numericMonth - 1 ||
    establishedDate.getUTCDate() !== numericDay
  ) {
    throw new Error('siteConfig.establishedAt must be a valid calendar date.');
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(today);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value);
  const todayUtc = Date.UTC(part('year'), part('month') - 1, part('day'));

  return Math.max(0, Math.floor((todayUtc - establishedUtc) / DAY_IN_MILLISECONDS) + 1);
}
