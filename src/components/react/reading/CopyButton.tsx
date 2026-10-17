import { Button } from 'animal-island-ui';
import { LuCopy } from 'react-icons/lu';

interface Props {
  url: string;
  label: string;
  success: string;
  error: string;
  text?: string | undefined;
  iconOnly?: boolean;
}

/** Astro markup cannot be passed as a React component's icon prop. */
export default function CopyButton({
  url,
  label,
  success,
  error,
  text,
  iconOnly = false,
}: Props) {
  return (
    <Button
      type="default"
      size="small"
      icon={<LuCopy size={16} />}
      data-copy-link={url}
      data-copy-success={success}
      data-copy-error={error}
      hidden
      title={label}
      aria-label={label}
    >
      {iconOnly ? null : (text ?? label)}
    </Button>
  );
}
