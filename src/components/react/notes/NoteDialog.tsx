import { Button, Modal } from 'animal-island-ui';
import { useEffect, useRef, useState } from 'react';
import { LuCopy, LuX } from 'react-icons/lu';
import { bindNoteDialog, mountNoteContent } from '@lib/note-dialog';
import { copyCode } from '@lib/article-reader';
import type { articleReaderConfig } from '@config/content';
import type { notesConfig } from '@config/notes';

interface Props {
  config: typeof notesConfig.dialog;
  codeCopy: typeof articleReaderConfig.codeCopy;
}
interface Selection {
  template: HTMLTemplateElement;
  title: string;
  href: string;
}

function NoteBody({ selection, config, codeCopy }: Props & { selection: Selection }) {
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!content.current) return;
    return mountNoteContent(content.current, selection.template, {
      codeCopy,
      imageLabel: config.imageLabel,
    });
  }, [selection, config.imageLabel, codeCopy]);
  return <div className="note-dialog-document" ref={content} />;
}

export default function NoteDialog({ config, codeCopy }: Props) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copying = useRef(false);
  const currentSelection = useRef(selection);
  currentSelection.current = selection;

  useEffect(
    () =>
      bindNoteDialog(document, (template) => {
        setCopyStatus('idle');
        setSelection({
          template,
          title: template.dataset.noteTitle ?? '',
          href: template.dataset.noteHref ?? '',
        });
      }),
    [],
  );

  const close = () => {
    setSelection(null);
    setCopyStatus('idle');
  };
  const copy = async () => {
    if (!selection || copying.current) return;
    copying.current = true;
    const copied = await copyCode(new URL(selection.href, window.location.origin).href, document);
    if (currentSelection.current === selection) setCopyStatus(copied ? 'copied' : 'failed');
    copying.current = false;
  };

  return (
    <Modal
      open={selection !== null}
      className="note-dialog"
      width="min(44rem, calc(100vw - 1.5rem))"
      typewriter={false}
      footer={null}
      onClose={close}
      title={
        <div className="note-dialog-heading">
          <span>{selection?.title}</span>
          <div className="note-dialog-tools">
            <Button
              type="text"
              size="small"
              icon={<LuCopy size={18} />}
              onClick={() => void copy()}
              title={config.copyLabel}
              aria-label={config.copyLabel}
            />
            <Button
              type="text"
              size="small"
              icon={<LuX size={20} />}
              onClick={close}
              title={config.closeLabel}
              aria-label={config.closeLabel}
            />
          </div>
        </div>
      }
    >
      {selection && (
        <>
          {copyStatus !== 'idle' && (
            <p className="note-dialog-status" role="status">
              {copyStatus === 'copied' ? config.copiedLabel : config.copyFailedLabel}
            </p>
          )}
          {copyStatus === 'failed' && (
            <a className="note-dialog-fallback" href={selection.href}>
              {new URL(selection.href, window.location.origin).href}
            </a>
          )}
          <NoteBody selection={selection} config={config} codeCopy={codeCopy} />
        </>
      )}
    </Modal>
  );
}
