export interface FeedEntry {
  id: string;
  data: { pubDate: Date; draft?: boolean; tags: string[] };
}

export function createFeedItems<T extends FeedEntry>(
  entries: T[],
  describe: (entry: T) => { title: string; description: string; link: string },
) {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id))
    .map((entry) => ({
      ...describe(entry),
      pubDate: entry.data.pubDate,
      categories: [...new Set(entry.data.tags)],
    }));
}
