import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '@config/site';
import { getPostHref, getPublishedPosts } from '@lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: getPostHref(post),
      categories: post.data.tags,
    })),
  });
}
