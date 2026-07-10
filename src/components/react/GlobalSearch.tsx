import { Input, Modal } from 'animal-island-ui';
import { useEffect, useMemo, useState } from 'react';
import type { SearchDocument } from '@lib/search';

interface SearchConfig {
  label: string;
  placeholder: string;
  emptyHint: string;
  loadingHint: string;
  loadError: string;
  noResults: string;
  resultLimit: number;
}

interface Props {
  indexUrl: string;
  config: SearchConfig;
}

const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase().trim();

function getSearchScore(document: SearchDocument, query: string): number {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  const title = normalize(document.title);
  const description = normalize(document.description);
  const metadata = normalize([document.category, ...document.tags].join(' '));
  const content = normalize(document.content);

  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 8;
    if (metadata.includes(term)) return score + 5;
    if (description.includes(term)) return score + 3;
    return content.includes(term) ? score + 1 : score;
  }, 0);
}

export default function GlobalSearch({ indexUrl, config }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<SearchDocument[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const results = useMemo(() => {
    if (!documents || !query.trim()) return [];

    return documents
      .map((document) => ({ document, score: getSearchScore(document, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title))
      .slice(0, config.resultLimit)
      .map(({ document }) => document);
  }, [config.resultLimit, documents, query]);

  const closeSearch = () => {
    setOpen(false);
    setQuery('');
  };

  const openSearch = () => {
    setLoadError(false);
    setOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || documents || loadError) return;

    let isCurrent = true;

    void fetch(indexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
        return response.json() as Promise<SearchDocument[]>;
      })
      .then((nextDocuments) => {
        if (isCurrent) setDocuments(nextDocuments);
      })
      .catch(() => {
        if (isCurrent) setLoadError(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [documents, indexUrl, loadError, open]);

  return (
    <div className="global-search">
      <button
        className="global-search-trigger"
        type="button"
        onClick={openSearch}
        aria-label={config.label}
      >
        <SearchIcon />
        <span>{config.label}</span>
        <kbd aria-hidden="true">Ctrl K</kbd>
      </button>

      <Modal
        open={open}
        title={config.label}
        width="min(42rem, calc(100vw - 2rem))"
        footer={null}
        typewriter={false}
        onClose={closeSearch}
        className="global-search-modal"
      >
        <div className="global-search-content">
          <Input
            key={open ? 'open' : 'closed'}
            className="global-search-input"
            size="large"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            placeholder={config.placeholder}
            prefix={<SearchIcon />}
            allowClear
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
          />

          <div className="global-search-results" aria-live="polite">
            {loadError ? (
              <p className="global-search-state">{config.loadError}</p>
            ) : !documents ? (
              <p className="global-search-state">{config.loadingHint}</p>
            ) : !query.trim() ? (
              <p className="global-search-state">{config.emptyHint}</p>
            ) : results.length === 0 ? (
              <p className="global-search-state">{config.noResults}</p>
            ) : (
              <ul>
                {results.map((result) => (
                  <li key={result.href}>
                    <a href={result.href} onClick={closeSearch}>
                      <span className="global-search-result-copy">
                        <strong>{result.title}</strong>
                        <span>{result.description}</span>
                      </span>
                      {(result.category || result.tags.length > 0) && (
                        <span className="global-search-result-meta">
                          {[result.category, ...result.tags].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="10.75" cy="10.75" r="6.25" />
      <path d="m16 16 4 4" />
    </svg>
  );
}
