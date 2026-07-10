import type { APIRoute } from 'astro';
import { getPostHref, getPublishedPosts } from '@lib/posts';
import { createSearchDocument } from '@lib/search';

export const GET: APIRoute = async () => {
  const documents = (await getPublishedPosts()).map((post) =>
    createSearchDocument(post, getPostHref(post)),
  );

  return new Response(JSON.stringify(documents), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
