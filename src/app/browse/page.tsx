'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import CategoryFilter from '@/components/ui/CategoryFilter';
import SolutionCard from '@/components/ui/SolutionCard';
import { createClient } from '@/lib/supabase/client';
import type { Solution } from '@/types';

const CATEGORIES = [
  'Education', 'Healthcare', 'Public Safety', 'Environment', 'Transportation',
  'Economic Development', 'Housing', 'Digital Equity', 'Food Security', 'Youth',
  'Aging', 'Arts & Culture',
];

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialCategory = searchParams.get('category') ?? '';
  const initialCity = searchParams.get('city') ?? 'all';
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    setError(null);

    let supabaseQuery = supabase.from('solutions').select('*');

    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }
    if (city && city !== 'all') {
      supabaseQuery = supabaseQuery.eq('city', city);
    }

    // Semantic search path (uses OpenAI embeddings via API route)
    if (query.trim().length > 2) {
      try {
        const res = await fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: query }),
        });
        if (res.ok) {
          const { embedding } = await res.json();
          if (embedding) {
            const { data, error: rpcError } = await supabase.rpc('match_solutions', {
              query_embedding: embedding,
              match_threshold: 0.7,
              match_count: 50,
            });
            if (!rpcError && data && data.length > 0) {
              let filtered = data;
              if (city && city !== 'all') {
                filtered = filtered.filter((s: Solution) => s.city === city);
              }
              if (category) {
                filtered = filtered.filter((s: Solution) => s.category === category);
              }
              setSolutions(filtered as unknown as Solution[]);
              setSearchMode('semantic');
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // Fall through to keyword search below
      }
    }

    // Keyword path
    if (query.trim()) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
    }

    const { data, error: dbError } = await supabaseQuery
      .order('created_at', { ascending: false })
      .limit(50);

    if (dbError) {
      setError(dbError.message);
      setSolutions([]);
    } else {
      setSolutions((data as Solution[]) ?? []);
    }
    setSearchMode('keyword');
    setLoading(false);
  }, [query, category, city, supabase]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const handleSearch = (q: string) => {
    setQuery(q);
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    router.push(`/browse?${params.toString()}`);
  };

  const handleCategory = (c: string) => {
    setCategory(c);
    const params = new URLSearchParams(searchParams.toString());
    if (c) params.set('category', c);
    else params.delete('category');
    router.push(`/browse?${params.toString()}`);
  };

  const handleCity = (c: string) => {
    setCity(c);
    const params = new URLSearchParams(searchParams.toString());
    if (c && c !== 'all') params.set('city', c);
    else params.delete('city');
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse 7,000+ Solutions</h1>
      <p className="text-slate-500 mb-6">
        {searchMode === 'semantic'
          ? 'Semantic search — AI-ranked by meaning, not just keywords.'
          : 'Search by keyword, category, or city.'}
      </p>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} initialQuery={query} />
      </div>

      <div className="mb-6">
        <CategoryFilter selected={category} onSelect={handleCategory} />
      </div>

      <div className="mb-8 flex gap-2">
        {['all', 'Detroit', 'St. Louis'].map((c) => (
          <button
            key={c}
            onClick={() => handleCity(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              city === c
                ? 'bg-primary text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
            }`}
          >
            {c === 'all' ? 'All Cities' : c}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-500">Loading solutions…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              showSimilarity={searchMode === 'semantic'}
            />
          ))}
        </div>
      )}

      {!loading && !error && solutions.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg mb-2">No solutions found.</p>
          <p>Try a different search, or clear filters to see everything.</p>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading…</div>}>
      <BrowseContent />
    </Suspense>
  );
}
