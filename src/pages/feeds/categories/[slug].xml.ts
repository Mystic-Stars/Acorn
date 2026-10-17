import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '@config/site';
import { collectCategories, getPostHref, getPublishedPosts, type BlogPost } from '@lib/posts';
import { createFeedItems } from '@lib/subscriptions';

export async function getStaticPaths() {
  const posts = (await getPublishedPosts()).filter((post) => !post.data.draft);
  return [...collectCategories(posts)].map(([slug, category]) => ({
    params: { slug },
    props: { label: category.label, posts: category.posts },
  }));
}

export async function GET(context: APIContext) {
  const { label, posts } = context.props as { label: string; posts: BlogPost[] };
  return rss({
    title: `${siteConfig.name} · ${label}`,
    description: `${label} 分类的文章`,
    site: context.site ?? 'https://example.com',
    items: createFeedItems(posts, (post) => ({
      title: post.data.title,
      description: post.data.description,
      link: getPostHref(post),
    })),
  });
}
