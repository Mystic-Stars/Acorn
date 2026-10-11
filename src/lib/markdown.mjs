import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkCjkFriendlyStrikethrough from 'remark-cjk-friendly-gfm-strikethrough';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

/** Shared syntax for article rendering and search. */
export const markdownSyntaxPlugins = [remarkCjkFriendly, remarkCjkFriendlyStrikethrough];

export function createMarkdownParser() {
  const parser = unified().use(remarkParse).use(remarkGfm);
  for (const plugin of markdownSyntaxPlugins) parser.use(plugin);
  return parser;
}

const languageLabels = {
  bash: 'Bash',
  css: 'CSS',
  html: 'HTML',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  markdown: 'Markdown',
  md: 'Markdown',
  mermaid: 'Mermaid',
  plaintext: '',
  text: '',
  txt: '',
  none: '',
  python: 'Python',
  py: 'Python',
  shell: 'Shell',
  sh: 'Shell',
  sql: 'SQL',
  ts: 'TypeScript',
  tsx: 'TSX',
  typescript: 'TypeScript',
  yaml: 'YAML',
  yml: 'YAML',
};

export function formatCodeLanguage(language, fallback) {
  const key = String(language ?? '')
    .toLowerCase()
    .trim();
  if (!key) return fallback;
  return (
    (languageLabels[key] ??
      key.replace(/(^|[-_])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`)) ||
    fallback
  );
}
