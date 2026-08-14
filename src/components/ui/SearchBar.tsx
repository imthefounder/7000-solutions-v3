'use client';

import { useState } from 'react';

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
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search solutions… (try “flood prevention” or “youth employment”)"
          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
