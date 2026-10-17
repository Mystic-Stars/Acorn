import type { Nodes } from 'mdast';
import { createMarkdownParser } from './markdown.mjs';

const parser = createMarkdownParser();

/** Read Markdown image nodes, including reference images, without scanning code or HTML. */
export function getNotePreview(source: string): { src: string; alt: string } | undefined {
  const tree = parser.parse(source);
  const definitions = new Map<string, string>();
  const visit = (node: Nodes, callback: (node: Nodes) => void) => {
    callback(node);
    if ('children' in node) node.children.forEach((child) => visit(child, callback));
  };
  visit(tree, (node) => {
    if (node.type === 'definition') definitions.set(node.identifier, node.url);
  });
  let preview: { src: string; alt: string } | undefined;
  visit(tree, (node) => {
    if (preview || (node.type !== 'image' && node.type !== 'imageReference')) return;
    const src = node.type === 'image' ? node.url : definitions.get(node.identifier);
    if (src && (/^https?:\/\//i.test(src) || (src.startsWith('/') && !src.startsWith('//'))))
      preview = { src, alt: node.alt ?? '' };
  });
  return preview;
}
