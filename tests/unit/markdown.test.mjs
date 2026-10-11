import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMarkdownParser, formatCodeLanguage } from '../../src/lib/markdown.mjs';
import remarkInferCodeLanguage, {
  inferLanguage,
} from '../../src/plugins/remark-infer-code-language.mjs';

test('language inference recognizes common snippets and distinguishes JS imports from Python', () => {
  for (const [source, language] of [
    ['{"a": [1, 2]}', 'json'],
    ['import value from "package";', 'javascript'],
    ['import os\nprint(os.name)', 'python'],
    ['from pathlib import Path', 'python'],
    ['SELECT * FROM posts;', 'sql'],
    ['npm install astro', 'shell'],
    ['<div>hello</div>', 'html'],
    ['.article { color: brown; }', 'css'],
    ['name: acorn', 'yaml'],
    ['flowchart TD\n A --> B', 'mermaid'],
    ['普通文本', undefined],
    ['', undefined],
  ])
    assert.equal(inferLanguage(source), language, source);
});

test('explicit text/code languages and authored whitespace always take precedence', async () => {
  const parser = createMarkdownParser().use(remarkInferCodeLanguage);
  const source = '```text\n    print("literal")\n```\n\n```custom-language\n  example\n```\n';
  const tree = await parser.run(parser.parse(source));
  assert.equal(tree.children[0].lang, 'text');
  assert.equal(tree.children[0].value, '    print("literal")');
  assert.equal(tree.children[1].lang, 'custom-language');
});

test('code labels respect plain text and unknown languages', () => {
  assert.equal(formatCodeLanguage('js', '纯文本'), 'JavaScript');
  assert.equal(formatCodeLanguage('plaintext', '纯文本'), '纯文本');
  assert.equal(formatCodeLanguage(undefined, '纯文本'), '纯文本');
  assert.equal(formatCodeLanguage('custom-language', '纯文本'), 'Custom-Language');
});
