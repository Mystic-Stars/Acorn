import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import AnimalMarkdownTable from './AnimalMarkdownTable';

function readTable(table: HTMLTableElement) {
  const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th'), (cell) =>
    cell.innerHTML.trim(),
  );
  const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr'), (row) =>
    Array.from(row.querySelectorAll<HTMLTableCellElement>('td'), (cell) => cell.innerHTML.trim()),
  ).filter((row) => row.length === headers.length);

  return headers.length > 0 && rows.length > 0 ? { headers, rows } : null;
}

/** Enhances authored Markdown tables after their semantic HTML fallback has rendered. */
export default function MarkdownTableEnhancer() {
  useEffect(() => {
    const roots = Array.from(document.querySelectorAll<HTMLTableElement>('.prose table')).flatMap(
      (table) => {
        if (table.dataset.animalTableEnhanced === 'true') return [];

        const data = readTable(table);
        if (!data) return [];

        table.dataset.animalTableEnhanced = 'true';
        const mount = document.createElement('div');
        mount.className = 'article-animal-table-mount';
        table.replaceWith(mount);

        const root = createRoot(mount);
        root.render(<AnimalMarkdownTable {...data} />);
        return [root];
      },
    );

    return () => roots.forEach((root) => root.unmount());
  }, []);

  return null;
}
