import { markdownSyntaxPlugins } from '../lib/markdown.mjs';
import remarkInferCodeLanguage from './remark-infer-code-language.mjs';
import rehypeArticleContent from './rehype-article-content.mjs';
import rehypeLocalImages from './rehype-local-images.mjs';
import rehypeRaw from 'rehype-raw';
import remarkArticleStructure from './remark-article-structure.mjs';

/**
 * One production pipeline, also used directly by rendering regression tests.
 * @param {typeof import('../config/content.ts').articleReaderConfig} reader
 * @param {typeof import('../config/content.ts').articleMarkdownConfig} markdown
 * @returns {import('@astrojs/markdown-remark').AstroMarkdownOptions & {shikiConfig: import('@astrojs/markdown-remark').ShikiConfig}}
 */
export function createArticleMarkdownOptions(reader, markdown) {
  return {
    gfm: true,
    smartypants: false,
    remarkPlugins: [...markdownSyntaxPlugins, remarkArticleStructure, remarkInferCodeLanguage],
    remarkRehype: {
      footnoteLabel: markdown.footnotes.label,
      footnoteBackLabel: markdown.footnotes.backLabel,
      footnoteLabelProperties: { className: ['article-footnotes-title'] },
    },
    rehypePlugins: [
      rehypeRaw,
      rehypeLocalImages,
      [
        rehypeArticleContent,
        {
          codeCopy: reader.codeCopy,
          tableLabel: markdown.tableLabel,
        },
      ],
    ],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
      wrap: markdown.code.wrap,
      transformers: [
        {
          pre(node) {
            node.properties['data-language'] = this.options.lang;
          },
        },
      ],
    },
  };
}
