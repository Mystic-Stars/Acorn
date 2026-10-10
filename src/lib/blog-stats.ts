import type { BlogPost } from './posts';
import { getSiteAgeInDays } from './dates';
export { getSiteAgeInDays } from './dates';

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

export function getBlogStats(
  posts: BlogPost[],
  establishedAt: string,
  today = new Date(),
  timeZone = 'UTC',
): BlogStats {
  return {
    postCount: posts.length,
    wordCount: posts.reduce((total, post) => total + countContentWords(post.body ?? ''), 0),
    siteDays: getSiteAgeInDays(establishedAt, today, timeZone),
  };
}
