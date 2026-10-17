import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '@config/site';
import { getPostHref, getPublishedPosts } from '@lib/posts';
import { createFeedItems } from '@lib/subscriptions';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? 'https://example.com',
    items: createFeedItems(posts, (post) => ({
      title: post.data.title,
      description: post.data.description,
      link: getPostHref(post),
    })),
  });
}
