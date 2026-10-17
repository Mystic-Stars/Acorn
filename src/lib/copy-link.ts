export function bindCopyLinks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach((button) => {
    if (button.dataset.copyBound) return;
    button.dataset.copyBound = 'true';
    button.hidden = false;
    const container = button.closest('[data-copy-container]');
    const status = container?.querySelector<HTMLElement>('[data-copy-status]');
    const fallback = container?.querySelector<HTMLElement>('[data-copy-fallback]');
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      button.disabled = true;
      if (fallback) fallback.hidden = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copyLink ?? '');
        if (status) status.textContent = button.dataset.copySuccess ?? '';
      } catch {
        if (status) status.textContent = button.dataset.copyError ?? '';
        if (fallback) fallback.hidden = false;
      } finally {
        button.disabled = false;
      }
    });
  });
}
