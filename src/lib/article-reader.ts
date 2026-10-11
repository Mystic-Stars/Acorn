interface CopyLabels {
  buttonLabel: string;
  copiedLabel: string;
  failedLabel: string;
  copiedStatus: string;
  failedStatus: string;
}

export async function copyCode(value: string, document: Document): Promise<boolean> {
  try {
    const clipboard = document.defaultView?.navigator.clipboard;
    if (clipboard?.writeText) {
      await clipboard.writeText(value);
      return true;
    }
  } catch {
    // A denied Clipboard API can still allow the browser's legacy copy command.
  }
  const previousFocus = document.activeElement as HTMLElement | null;
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  let copied = false;
  try {
    const legacyDocument = document as unknown as { execCommand(command: string): boolean };
    copied = legacyDocument.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    textarea.remove();
    previousFocus?.focus({ preventScroll: true });
  }
  return copied;
}

/** A single delegated listener; static toolbars do not reflow on hydration. */
export function enhanceCodeCopy(prose: HTMLElement, labels: CopyLabels) {
  const document = prose.ownerDocument;
  const view = document.defaultView;
  if (!view) return () => {};
  const timers = new Set<number>();
  const buttons = prose.querySelectorAll<HTMLButtonElement>('[data-code-copy]');
  buttons.forEach((button) => {
    button.hidden = false;
  });

  const onClick = async (event: Event) => {
    const target = event.target as Element | null;
    const button = target?.closest<HTMLButtonElement>('[data-code-copy]');
    if (!button || !prose.contains(button) || button.disabled) return;
    const block = button.closest('.article-code-block');
    const code = block?.querySelector('pre > code');
    const status = block?.querySelector('[data-code-copy-status]');
    if (!code) return;
    button.disabled = true;
    if (status) status.textContent = '';
    const copied = await copyCode(code.textContent ?? '', document);
    button.textContent = copied ? labels.copiedLabel : labels.failedLabel;
    if (status) status.textContent = copied ? labels.copiedStatus : labels.failedStatus;
    const timer = view.setTimeout(() => {
      button.textContent = labels.buttonLabel;
      button.disabled = false;
      timers.delete(timer);
    }, 1800);
    timers.add(timer);
  };
  prose.addEventListener('click', onClick);
  return () => {
    prose.removeEventListener('click', onClick);
    timers.forEach((timer) => view.clearTimeout(timer));
    buttons.forEach((button) => {
      button.hidden = true;
    });
  };
}
