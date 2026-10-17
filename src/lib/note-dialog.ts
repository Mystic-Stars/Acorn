import { enhanceCodeCopy } from './article-reader';

export function findNoteTemplate(document: Document, id: string): HTMLTemplateElement | undefined {
  return [...document.querySelectorAll<HTMLTemplateElement>('template[data-note-template]')].find(
    (template) => template.dataset.noteTemplate === id,
  );
}

/** Keep modified clicks and no-JS navigation working through the permanent URL. */
export function bindNoteDialog(
  document: Document,
  open: (template: HTMLTemplateElement) => void,
): () => void {
  const triggers = [...document.querySelectorAll<HTMLAnchorElement>('a[data-note-open]')];
  triggers.forEach((trigger) => {
    trigger.dataset.noteDialogReady = 'true';
  });
  const onClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const target = event.target;
    if (!(target instanceof document.defaultView!.Element)) return;
    const trigger = target.closest<HTMLAnchorElement>('a[data-note-open]');
    if (!trigger || trigger.target === '_blank' || trigger.hasAttribute('download')) return;
    const template = findNoteTemplate(document, trigger.dataset.noteOpen ?? '');
    if (!template) return;
    event.preventDefault();
    trigger.focus({ preventScroll: true });
    open(template);
  };
  document.addEventListener('click', onClick);
  return () => {
    document.removeEventListener('click', onClick);
    triggers.forEach((trigger) => {
      delete trigger.dataset.noteDialogReady;
    });
  };
}

interface ReaderOptions {
  codeCopy: {
    enabled: boolean;
    buttonLabel: string;
    copiedLabel: string;
    failedLabel: string;
    copiedStatus: string;
    failedStatus: string;
  };
  imageLabel: string;
}

/** Clone trusted build-rendered Markdown, not user input or remote HTML. */
export function mountNoteContent(
  container: HTMLElement,
  template: HTMLTemplateElement,
  options: ReaderOptions,
): () => void {
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const ids = new Map<string, string>();
  fragment.querySelectorAll<HTMLElement>('[id]').forEach((element) => {
    const previous = element.id;
    const next = `note-dialog-${template.dataset.noteTemplate}-${previous}`;
    ids.set(previous, next);
    element.id = next;
  });
  fragment.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href')!.slice(1);
    let id = href;
    try {
      id = decodeURIComponent(href);
    } catch {
      /* Preserve malformed authored anchors. */
    }
    if (ids.has(id)) link.setAttribute('href', `#${encodeURIComponent(ids.get(id)!)}`);
  });
  for (const attribute of ['aria-labelledby', 'aria-describedby', 'headers', 'for']) {
    fragment.querySelectorAll<HTMLElement>(`[${attribute}]`).forEach((element) => {
      element.setAttribute(
        attribute,
        element
          .getAttribute(attribute)!
          .split(/\s+/)
          .map((id) => ids.get(id) ?? id)
          .join(' '),
      );
    });
  }
  fragment.querySelectorAll<HTMLImageElement>('.prose img').forEach((image) => {
    const src = image.getAttribute('src') ?? '';
    if (image.closest('a') || !/^(https?:\/\/|\/(?!\/))/i.test(src)) return;
    const link = container.ownerDocument.createElement('a');
    link.href = src;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = options.imageLabel;
    link.setAttribute(
      'aria-label',
      image.alt ? `${options.imageLabel}：${image.alt}` : options.imageLabel,
    );
    image.replaceWith(link);
    link.append(image);
  });
  container.replaceChildren(fragment);
  const prose = container.querySelector<HTMLElement>('.prose');
  const dispose =
    prose && options.codeCopy.enabled ? enhanceCodeCopy(prose, options.codeCopy) : () => {};
  return () => {
    dispose();
    container.replaceChildren();
  };
}
