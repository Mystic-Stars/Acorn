export interface ReadingPost {
  id: string;
  data: {
    pubDate: Date;
    draft?: boolean;
    tags: string[];
    category?: string | undefined;
    relatedPosts?: string[] | undefined;
  };
}

export function sortPublishedPosts<T extends ReadingPost>(posts: T[]): T[] {
  return posts
    .filter((post) => !post.data.draft)
    .sort(
      (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id),
    );
}

export function getPostNeighbors<T extends ReadingPost>(post: T, posts: T[]) {
  const sorted = sortPublishedPosts(posts);
  const index = sorted.findIndex((entry) => entry.id === post.id);
  return {
    previous: index >= 0 ? sorted[index + 1] : undefined,
    next: index > 0 ? sorted[index - 1] : undefined,
  };
}

export function getRelatedPosts<T extends ReadingPost>(post: T, posts: T[], limit = 3): T[] {
  if (limit <= 0 || post.data.draft) return [];
  const candidates = sortPublishedPosts(posts).filter((entry) => entry.id !== post.id);
  const byId = new Map(candidates.map((entry) => [entry.id, entry]));
  const manual = [...new Set(post.data.relatedPosts ?? [])]
    .map((id) => byId.get(id))
    .filter((entry): entry is T => Boolean(entry));
  const selected = new Set(manual.map((entry) => entry.id));
  const tags = new Set(post.data.tags.map((tag) => tag.trim().toLocaleLowerCase()));
  const scored = candidates
    .filter((entry) => !selected.has(entry.id))
    .map((entry) => ({
      entry,
      score:
        [...new Set(entry.data.tags.map((tag) => tag.trim().toLocaleLowerCase()))].filter((tag) =>
          tags.has(tag),
        ).length *
          3 +
        (post.data.category && post.data.category === entry.data.category ? 1 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return [...manual, ...scored.map(({ entry }) => entry)].slice(0, limit);
}

/** Check the complete graph, including drafts, before any public route is generated. */
export function validateReadingGraph(posts: ReadingPost[]): void {
  const knownPosts = new Set(posts.map((post) => post.id));
  for (const post of posts) {
    for (const id of post.data.relatedPosts ?? []) {
      if (!knownPosts.has(id))
        throw new Error(`${post.id}: relatedPosts references missing post ${id}`);
      if (id === post.id) throw new Error(`${post.id}: relatedPosts cannot reference itself`);
    }
  }
}
