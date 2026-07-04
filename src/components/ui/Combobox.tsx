import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ComboboxProps<T> {
  items: T[];
  value: T | null;
  onChange: (item: T) => void;
  getKey: (item: T) => string;
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  renderValue?: (item: T) => ReactNode;
  placeholder?: string;
  emptyMessage?: string;
  id?: string;
}

/** Custom searchable select — keyboard-navigable (arrows/enter/escape), no
 *  component library (§0). Filters on typed text. */
export function Combobox<T>({
  items,
  value,
  onChange,
  getKey,
  getSearchText,
  renderItem,
  renderValue,
  placeholder = 'Search…',
  emptyMessage = 'No matches',
  id,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => getSearchText(i).toLowerCase().includes(q));
  }, [items, query, getSearchText]);

  useEffect(() => setActive(0), [query, open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const select = (item: T) => {
    onChange(item);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && filtered[active]) {
        e.preventDefault();
        select(filtered[active]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {value && !open ? (
        <button
          type="button"
          id={id}
          onClick={() => {
            setOpen(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="flex h-9 w-full items-center justify-between rounded-md border border-border-subtle bg-raised px-3 text-13 text-text-primary hover:border-border-strong"
        >
          <span className="flex items-center gap-2">{(renderValue ?? renderItem)(value)}</span>
          <Chevron />
        </button>
      ) : (
        <div
          className={cn(
            'flex h-9 items-center gap-2 rounded-md border bg-raised px-3',
            open ? 'border-border-strong' : 'border-border-subtle',
            'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]',
          )}
        >
          <SearchGlyph />
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            value={query}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-full w-full bg-transparent text-13 text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <Chevron />
        </div>
      )}

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-border-subtle bg-raised p-1 shadow-popover"
        >
          {filtered.length === 0 && (
            <li className="px-2.5 py-2 text-13 text-text-tertiary">{emptyMessage}</li>
          )}
          {filtered.map((item, i) => (
            <li key={getKey(item)} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => select(item)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-13 transition-colors',
                  i === active ? 'bg-sunken text-text-primary' : 'text-text-secondary',
                )}
              >
                {renderItem(item)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-text-tertiary" aria-hidden>
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-text-tertiary" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
