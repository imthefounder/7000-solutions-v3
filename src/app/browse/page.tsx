'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import CategoryFilter from '@/components/ui/CategoryFilter';
import SolutionCard from '@/components/ui/SolutionCard';
import { createClient } from '@/lib/supabase/client';
import type { Solution } from '@/types';

const PAGE_SIZE = 50;

type SortKey = 'newest' | 'sprint' | 'title';

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
  const [sort, setSort] = useState<SortKey>('newest');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

    // Keyword path — matches title OR description
    if (query.trim()) {
      const q = query.trim().replace(/'/g, "''");
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,ai_usage.ilike.%${q}%`
      );
    }

    let ordered = supabaseQuery;
    if (sort === 'newest') ordered = ordered.order('created_at', { ascending: false });
    else if (sort === 'sprint') ordered = ordered.order('sprint', { ascending: true });
    else ordered = ordered.order('title', { ascending: true });

    const { data, error: dbError } = await ordered.range(0, visibleCount - 1);

    if (dbError) {
      setError(dbError.message);
      setSolutions([]);
    } else {
      setSolutions((data as Solution[]) ?? []);
    }
    setSearchMode('keyword');
    setLoading(false);
  }, [query, category, city, sort, supabase, visibleCount]);

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

  const activeFilterCount =
    (query ? 1 : 0) + (category ? 1 : 0) + (city !== 'all' ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Browse <span className="text-gradient">7,000+ Solutions</span>
      </h1>
      <p className="text-slate-500 mb-6">
        {searchMode === 'semantic'
          ? 'Semantic search — AI-ranked by meaning, not just keywords.'
          : 'Search by keyword, category, or city — every solution includes a step-by-step build guide.'}
      </p>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} initialQuery={query} />
      </div>

      <div className="mb-6">
        <CategoryFilter selected={category} onSelect={handleCategory} />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {['all', 'Detroit', 'St. Louis'].map((c) => (
            <button
              key={c}
              onClick={() => handleCity(c)}
              className={`chip ${city === c ? 'chip-active' : ''}`}
            >
              {c === 'all' ? 'All Cities' : c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="chip cursor-pointer appearance-none pr-8"
            aria-label="Sort solutions"
          >
            <option value="newest">Newest</option>
            <option value="sprint">Sprint</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>

      {!loading && !error && (
        <p className="text-sm text-slate-400 mb-4">
          {solutions.length > 0
            ? `${solutions.length} solution${solutions.length === 1 ? '' : 's'} shown${
                activeFilterCount > 0 ? ` · ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : ''
              }`
            : ''}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-white/40" />
          ))}
        </div>
      )}
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
        <div className="text-center py-16">
          <div className="glass-strong rounded-2xl p-10 max-w-md mx-auto">
            <p className="text-lg font-semibold mb-2">No solutions found.</p>
            <p className="text-slate-500">
              Try a different search, or clear filters to see everything.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && solutions.length > 0 && searchMode === 'keyword' && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            className="chip px-8 py-3"
          >
            Load More ({solutions.length} shown)
          </button>
          <p className="text-xs text-slate-400 mt-2">
            Showing {solutions.length} of the full catalog — load more to keep browsing.
          </p>
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
