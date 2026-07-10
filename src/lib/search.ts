import type { BlogPost } from './posts';

/** A compact, serializable document used by the client-side site search. */
export interface SearchDocument {
  href: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
}

export function createSearchDocument(post: BlogPost, href: string): SearchDocument {
  return {
    href,
    title: post.data.title,
    description: post.data.description,
    category: post.data.category ?? '',
    tags: post.data.tags,
    content: stripMarkdown(post.body ?? ''),
  };
}

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?(?:\[[^\]]*\]\([^)]*\))/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[>#*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
