import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table } from 'animal-island-ui';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { formatCodeLanguage } from '../lib/markdown.mjs';

const element = (tagName, properties = {}, children = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const text = (value) => ({ type: 'text', value });
const elements = (node, tagName) =>
  (node.children ?? []).filter(
    (child) => child.type === 'element' && (!tagName || child.tagName === tagName),
  );
const cellHtml = (cell) => toHtml(cell.children, { allowDangerousHtml: true });
const htmlCell = (html) => createElement('span', { dangerouslySetInnerHTML: { __html: html } });

function renderTable(table) {
  const head = elements(table, 'thead')[0];
  const body = elements(table, 'tbody')[0];
  const headers = head && elements(elements(head, 'tr')[0] ?? {}, 'th');
  // Rich hand-written HTML tables keep their original attributes, captions and spans.
  if (
    !headers?.length ||
    !body ||
    Object.keys(table.properties).length ||
    elements(table).some((child) => !['thead', 'tbody'].includes(child.tagName))
  )
    return table;
  const rows = elements(body, 'tr').map((row) => elements(row, 'td'));
  if (
    rows.some((row) => row.length !== headers.length) ||
    [...headers, ...rows.flat()].some((cell) =>
      Object.keys(cell.properties).some((property) => property !== 'align'),
    ) ||
    [head, body, ...elements(head, 'tr'), ...elements(body, 'tr')].some(
      (node) => Object.keys(node.properties).length,
    )
  )
    return table;

  const columns = headers.map((header, index) => ({
    title: htmlCell(cellHtml(header)),
    dataIndex: `column-${index}`,
    align: ['left', 'center', 'right'].includes(header.properties.align)
      ? header.properties.align
      : 'left',
    render: (value) => htmlCell(value),
  }));
  const dataSource = rows.map((row, index) => ({
    key: String(index),
    ...Object.fromEntries(row.map((cell, column) => [`column-${column}`, cellHtml(cell)])),
  }));
  const fragment = fromHtml(
    renderToStaticMarkup(
      createElement(Table, {
        className: 'article-animal-table',
        columns,
        dataSource,
        rowKey: 'key',
        scroll: { x: 'auto' },
      }),
    ),
    { fragment: true },
  );
  const wrapper = fragment.children.find((child) => child.tagName === 'div');
  if (!wrapper) return table;
  const renderedTable = elements(wrapper, 'table')[0];
  elements(elements(elements(renderedTable, 'thead')[0], 'tr')[0], 'th').forEach((header) => {
    header.properties.scope = 'col';
  });
  return wrapper;
}

/** Emit complete reading markup at build time; browser JS only handles user actions. */
export default function rehypeArticleContent({ codeCopy, tableLabel }) {
  return (tree) => {
    let tableIndex = 0;
    function walk(parent) {
      if (!Array.isArray(parent.children)) return;
      parent.children = parent.children.map((node) => {
        if (node.type !== 'element') return node;
        walk(node);
        if (node.tagName === 'table') {
          return element(
            'div',
            {
              className: ['article-animal-table-mount'],
              role: 'region',
              tabIndex: 0,
              ariaLabel: `${tableLabel} ${++tableIndex}`,
              'data-markdown-table': '',
            },
            [renderTable(node)],
          );
        }
        if (node.tagName !== 'pre' || !elements(node, 'code').length) return node;
        // Shiki supplies data-language; excluded/plain code keeps its language class.
        const code = elements(node, 'code')[0];
        const language =
          node.properties['data-language'] ??
          node.properties.dataLanguage ??
          (Array.isArray(code.properties.className) ? code.properties.className : [])
            .find((name) => name.startsWith('language-'))
            ?.slice(9);
        node.properties.tabIndex ??= 0;
        node.properties.ariaLabel ??= formatCodeLanguage(language, codeCopy.languageFallback);
        const toolbar = element('div', { className: ['article-code-toolbar'] }, [
          element(
            'span',
            { className: ['article-code-traffic-lights'], ariaHidden: 'true' },
            ['red', 'yellow', 'green'].map((color) =>
              element('span', {
                className: ['article-code-traffic-light', `is-${color}`],
              }),
            ),
          ),
          element('span', { className: ['article-code-language'] }, [
            text(formatCodeLanguage(language, codeCopy.languageFallback)),
          ]),
          ...(codeCopy.enabled
            ? [
                element(
                  'button',
                  {
                    className: ['article-code-copy'],
                    type: 'button',
                    hidden: true,
                    'data-code-copy': '',
                  },
                  [text(codeCopy.buttonLabel)],
                ),
                element('span', {
                  className: ['sr-only'],
                  ariaLive: 'polite',
                  'data-code-copy-status': '',
                }),
              ]
            : []),
        ]);
        return element('div', { className: ['article-code-block'] }, [toolbar, node]);
      });
    }
    walk(tree);
  };
}
