export function parseCounterValue(value: string | null): number | null {
  const text = value?.trim() ?? '';
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text)) return null;
  const number = Number(text.replaceAll(',', ''));
  return Number.isSafeInteger(number) ? number : null;
}

/** Third-party counters may populate before or after this module runs. */
export function observeCounter(
  source: HTMLElement,
  onReady: (value: number) => void,
  onUnavailable: () => void,
  timeoutMs: number,
): () => void {
  const view = source.ownerDocument.defaultView;
  if (!view) return () => {};

  let timer: number | undefined;
  let observer: MutationObserver | undefined;
  const cleanup = () => {
    observer?.disconnect();
    view.clearTimeout(timer);
  };
  const update = () => {
    const value = parseCounterValue(source.textContent);
    if (value === null) return false;
    cleanup();
    onReady(value);
    return true;
  };

  if (update()) return cleanup;
  observer = new view.MutationObserver(update);
  observer.observe(source, { childList: true, characterData: true, subtree: true });
  timer = view.setTimeout(() => {
    cleanup();
    onUnavailable();
  }, timeoutMs);
  return cleanup;
}
