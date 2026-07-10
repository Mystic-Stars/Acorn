import type { BlogPost } from './posts';

const DAY_IN_MILLISECONDS = 86_400_000;

export interface BlogStats {
  postCount: number;
  wordCount: number;
  siteDays: number;
}

/**
 * Count readable CJK characters and Latin-style words in Markdown body text.
 * Markdown punctuation, URLs, code blocks and inline code are excluded.
 */
export function countContentWords(source: string): number {
  const readableText = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*[-+*]\s+/gm, ' ')
    .replace(/^\s*\d+[.)]\s+/gm, ' ')
    .replace(/[#>*_~|=-]+/g, ' ');

  const words = readableText.match(
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu,
  );

  return words?.length ?? 0;
}

export function getSiteAgeInDays(establishedAt: string, today = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(establishedAt);

  if (!match) {
    throw new Error('siteConfig.establishedAt must use the YYYY-MM-DD format.');
  }

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

  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.max(0, Math.floor((todayUtc - establishedUtc) / DAY_IN_MILLISECONDS) + 1);
}

export function getBlogStats(
  posts: BlogPost[],
  establishedAt: string,
  today = new Date(),
): BlogStats {
  return {
    postCount: posts.length,
    wordCount: posts.reduce((total, post) => total + countContentWords(post.body ?? ''), 0),
    siteDays: getSiteAgeInDays(establishedAt, today),
  };
}
