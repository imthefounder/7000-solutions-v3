'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

type SearchBarProps = {
  onSearch: (query: string) => void;
  initialQuery?: string;
};

export default function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-strong flex gap-2 p-2 rounded-2xl">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search solutions… (try “flood prevention” or “youth employment”)"
            className="flex-1 py-2.5 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          className="btn-gradient px-6 py-2.5 text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
}
