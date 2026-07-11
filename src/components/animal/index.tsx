import {
  Card as AnimalCard,
  CodeBlock as AnimalCodeBlock,
  Divider as AnimalDivider,
  Footer as AnimalFooter,
  Icon as AnimalIcon,
  Progress as AnimalProgress,
  Tag as AnimalTag,
  Table as AnimalTable,
  Time as AnimalTime,
  Title as AnimalTitle,
} from 'animal-island-ui';
import type {
  CardProps,
  CodeBlockProps,
  DividerProps,
  FooterProps,
  IconProps,
  ProgressProps,
  TagProps,
  TableProps,
  TimeProps,
  TitleProps,
} from 'animal-island-ui';

/**
 * Local SSR boundary for animal-island-ui.
 *
 * Keep these wrappers prop-transparent and update them only from AI_USAGE.md.
 * No client directive is needed for these presentational components.
 */
export function Card(props: CardProps) {
  return <AnimalCard {...props} />;
}

export function CodeBlock(props: CodeBlockProps) {
  return <AnimalCodeBlock {...props} />;
}

export function Divider(props: DividerProps) {
  return <AnimalDivider {...props} />;
}

export function Footer(props: FooterProps) {
  return <AnimalFooter {...props} />;
}

export function Tag(props: TagProps) {
  return <AnimalTag {...props} />;
}

export function Table(props: TableProps) {
  return <AnimalTable {...props} />;
}

export function Time(props: TimeProps) {
  return <AnimalTime {...props} />;
}

export function Title(props: TitleProps) {
  return <AnimalTitle {...props} />;
}

export function Icon(props: IconProps) {
  return <AnimalIcon {...props} />;
}

export function Progress(props: ProgressProps) {
  return <AnimalProgress {...props} />;
}
