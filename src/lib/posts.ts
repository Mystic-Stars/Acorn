import { getCollection, type CollectionEntry } from 'astro:content';
import { archiveConfig } from '@config/archives';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  const includeDrafts = import.meta.env.DEV && archiveConfig.includeDraftsInDevelopment;

  return posts
    .filter((post) => includeDrafts || !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getPostHref(post: BlogPost): string {
  return `${archiveConfig.route}/${post.id}/`;
}

export interface ArchiveFilterParams {
  category?: string | undefined;
  tags?: string[] | undefined;
  year?: number | string | undefined;
}

export function getArchiveHref({ category, tags, year }: ArchiveFilterParams = {}): string {
  const params = new URLSearchParams();

  if (category && category !== 'all') {
    params.set('category', slugifyTag(category));
  }

  const uniqueTags = [...new Set(tags?.map(slugifyTag).filter(Boolean) ?? [])];
  if (uniqueTags.length > 0) {
    params.set('tags', uniqueTags.join(','));
  }

  if (year && year !== 'all') {
    params.set('year', String(year));
  }

  const query = params.toString();
  return `${archiveConfig.route}/${query ? `?${query}` : ''}`;
}

export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-');
}

export function collectTags(posts: BlogPost[]): Map<string, { label: string; posts: BlogPost[] }> {
  const tags = new Map<string, { label: string; posts: BlogPost[] }>();

  for (const post of posts) {
    for (const label of post.data.tags) {
      const slug = slugifyTag(label);
      const item = tags.get(slug) ?? { label, posts: [] };
      item.posts.push(post);
      tags.set(slug, item);
    }
  }

  return new Map([...tags.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label)));
}

export function collectCategories(
  posts: BlogPost[],
): Map<string, { label: string; posts: BlogPost[] }> {
  const categories = new Map<string, { label: string; posts: BlogPost[] }>();

  for (const post of posts) {
    const label = post.data.category?.trim();
    if (!label) continue;

    const slug = slugifyTag(label);
    const item = categories.get(slug) ?? { label, posts: [] };
    item.posts.push(post);
    categories.set(slug, item);
  }

  return new Map([...categories.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label)));
}
