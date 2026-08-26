'use client';

import { useState } from 'react';
import { Search, X, Loader2, Sparkles } from 'lucide-react';

type SearchBarProps = {
  onSearch: (query: string) => void;
  initialQuery?: string;
  loading?: boolean;
};

const SUGGESTIONS = ['food deserts', 'potholes', 'youth jobs', 'flood prevention'];

export default function SearchBar({ onSearch, initialQuery = '', loading = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-strong flex gap-2 p-2 rounded-2xl transition-shadow focus-within:ring-2 focus-within:ring-teal-500/50">
        <div className="flex-1 flex items-center gap-2.5 px-3">
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <input
            id="catalog-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search solutions… (try “flood prevention” or “youth employment”)"
            className="flex-1 py-2.5 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onSearch('');
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="submit" className="btn-gradient px-6 py-2.5 text-sm cursor-pointer disabled:opacity-60" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {!query && !loading && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs text-slate-400 mr-1">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
                onSearch(s);
              }}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/70 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 hover:bg-teal-50/60 transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
