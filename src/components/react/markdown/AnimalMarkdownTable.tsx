import { Table } from '@components/animal';
import type { TableColumn } from 'animal-island-ui';

interface Props {
  headers: string[];
  rows: string[][];
}

function HtmlCell({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Render Markdown table cells through Animal Island's server-rendered Table component. */
export default function AnimalMarkdownTable({ headers, rows }: Props) {
  const columns: TableColumn[] = headers.map((header, index) => ({
    title: <HtmlCell html={header} />,
    dataIndex: `column-${index}`,
    render: (value) => <HtmlCell html={String(value ?? '')} />,
  }));
  const dataSource = rows.map((row, rowIndex) => ({
    key: String(rowIndex),
    ...Object.fromEntries(
      headers.map((_, columnIndex) => [`column-${columnIndex}`, row[columnIndex] ?? '']),
    ),
  }));

  return (
    <Table
      className="article-animal-table"
      columns={columns}
      dataSource={dataSource}
      rowKey="key"
      scroll={{ x: '48rem' }}
    />
  );
}
