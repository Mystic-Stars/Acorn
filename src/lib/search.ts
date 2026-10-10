import type { BlogPost } from './posts';
import type { Nodes } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const parser = unified().use(remarkParse).use(remarkGfm);

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
    content: markdownToSearchText(post.body ?? ''),
  };
}

export function markdownToSearchText(value: string): string {
  const text = (node: Nodes): string => {
    if (node.type === 'text' || node.type === 'inlineCode') return node.value;
    if (node.type === 'break') return ' ';
    if (
      node.type === 'code' ||
      node.type === 'html' ||
      node.type === 'image' ||
      node.type === 'imageReference' ||
      node.type === 'definition'
    ) {
      return '';
    }
    if (!('children' in node)) return '';
    const inline = [
      'paragraph',
      'heading',
      'link',
      'linkReference',
      'strong',
      'emphasis',
      'delete',
      'tableCell',
    ];
    return node.children.map(text).join(inline.includes(node.type) ? '' : ' ');
  };

  return text(parser.parse(value)).replace(/\s+/g, ' ').trim();
}
