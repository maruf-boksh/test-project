/**
 * GlobalSearch.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent header search box. Searches all nav modules and sub-pages,
 * groups results by module, and navigates to the selected route.
 */

import { useState, useMemo, useCallback, useEffect, useRef, useDeferredValue } from 'react';
import { AutoComplete, Input } from 'antd';
import type { InputRef } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { NAV_SEARCH_PAGES } from './navIndex';

const MAX_RESULTS = 24;
const MAX_RESULTS_PER_GROUP = 6;

// ─── Component ────────────────────────────────────────────────────────────────
export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const navigate = useNavigate();
  const inputRef = useRef<InputRef>(null);

  // Ctrl+K / ⌘K — focus the search input from anywhere in the app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Build grouped AutoComplete options whenever the query changes
  const options = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];

    const matches = [];
    for (const page of NAV_SEARCH_PAGES) {
      if (!page.searchText.includes(q)) continue;
      matches.push(page);
      if (matches.length >= MAX_RESULTS) break;
    }

    // Group matches by module name
    const grouped = new Map<string, typeof matches>();
    for (const m of matches) {
      if (!grouped.has(m.module)) grouped.set(m.module, []);
      grouped.get(m.module)!.push(m);
    }

    return Array.from(grouped.entries()).map(([module, items]) => ({
      label: (
        <span
          style={{
            fontSize: 11,
            color: '#9ca3af',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {module}
        </span>
      ),
      options: items.slice(0, MAX_RESULTS_PER_GROUP).map(item => ({
        value: item.route,
        label: (
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{item.label}</span>
            {item.group && (
              <span style={{ fontSize: 11, color: '#64748b' }}>{item.group}</span>
            )}
          </span>
        ),
      })),
    }));
  }, [deferredQuery]);

  const handleSelect = useCallback(
    (route: string) => {
      navigate(route);
      setQuery('');
    },
    [navigate],
  );

  return (
    <AutoComplete
      className="app-global-search"
      value={query}
      onChange={setQuery}
      onSelect={handleSelect}
      options={options}
      notFoundContent={
        query.trim() ? (
          <span style={{ fontSize: 13, color: '#9ca3af', padding: '4px 8px', display: 'block' }}>
            No results for "{query}"
          </span>
        ) : null
      }
      popupMatchSelectWidth={380}
      style={{ width: 340 }}
      // Close dropdown when user presses Escape
      onKeyDown={e => {
        if (e.key === 'Escape') setQuery('');
      }}
    >
      <Input
        ref={inputRef}
        prefix={<SearchOutlined style={{ color: '#6b7280', fontSize: 14 }} />}
        placeholder="Search pages or modules..."
        allowClear
        suffix={!query ? <kbd className="app-search-kbd">Ctrl K</kbd> : undefined}
        style={{
          fontSize: 13,
          height: 34,
        }}
      />
    </AutoComplete>
  );
}
