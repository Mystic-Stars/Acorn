import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '@config/site';
import { notesConfig } from '@config/notes';
import { getNoteHref, getNoteSummary, getNoteTitle, getPublishedNotes } from '@lib/notes';
import { createFeedItems } from '@lib/subscriptions';

export async function GET(context: APIContext) {
  const notes = await getPublishedNotes();
  return rss({
    title: `${siteConfig.name} · ${notesConfig.title}`,
    description: notesConfig.description,
    site: context.site ?? 'https://example.com',
    items: createFeedItems(notes, (note) => ({
      title: getNoteTitle(note),
      description: getNoteSummary(note),
      link: getNoteHref(note),
    })),
  });
}
