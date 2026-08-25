'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowUpDown, ChevronDown, Lightbulb, RotateCcw, Loader2 } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import CategoryFilter from '@/components/ui/CategoryFilter';
import SolutionCard from '@/components/ui/SolutionCard';
import SolutionCardSkeleton from '@/components/ui/SolutionCardSkeleton';
import { createClient } from '@/lib/supabase/client';
import type { Solution } from '@/types';

const PAGE_SIZE = 50;

type SortKey = 'newest' | 'sprint' | 'title';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'sprint', label: 'Sprint' },
  { key: 'title', label: 'Title A–Z' },
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
  const [sort, setSort] = useState<SortKey>('newest');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortOpen, setSortOpen] = useState(false);

  const toSolution = (r: any): Solution => ({
    ...r,
    hasGuide: Array.isArray(r.solution_guides) && r.solution_guides.length > 0,
    solution_guides: undefined,
  });

  const fetchSolutions = useCallback(
    async (append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const from = append ? visibleCount : 0;

      let supabaseQuery = supabase
        .from('solutions')
        .select('*', { count: 'exact' });

      if (category) supabaseQuery = supabaseQuery.eq('category', category);
      if (city && city !== 'all') supabaseQuery = supabaseQuery.eq('city', city);

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
                setTotal(filtered.length);
                setSearchMode('semantic');
                setLoading(false);
                setLoadingMore(false);
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

      // Guide-ready flags — two-query pattern (embed syntax is unreliable)
      let guideIds = new Set<string>();
      if (!append) {
        const { data: guideRows } = await supabase.from('solution_guides').select('solution_id');
        guideIds = new Set((guideRows ?? []).map((g: { solution_id: string }) => g.solution_id));
      }

      const { data, error: dbError, count } = await ordered.range(from, from + (append ? PAGE_SIZE : visibleCount) - 1);

      if (dbError) {
        setError(dbError.message);
        if (!append) setSolutions([]);
      } else {
        const rows = ((data as any[]) ?? []).map((r: any) => ({
          ...toSolution(r),
          hasGuide: guideIds.has(r.id),
        }));
        setSolutions((prev) => (append ? [...prev, ...rows] : rows));
        if (count !== null) setTotal(count);
      }
      setSearchMode('keyword');
      setLoading(false);
      setLoadingMore(false);
    },
    [query, category, city, sort, supabase, visibleCount]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    fetchSolutions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, city, sort]);

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

  const clearAll = () => {
    setQuery('');
    setCategory('');
    setCity('all');
    router.push('/browse');
  };

  const activeFilterCount = (query ? 1 : 0) + (category ? 1 : 0) + (city !== 'all' ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <span className="eyebrow">The catalog</span>
      <h1 className="text-3xl md:text-4xl font-bold mt-2">
        Browse <span className="text-gradient">7,000+ Solutions</span>
      </h1>
      <p className="text-slate-500 mt-2 mb-6">
        {searchMode === 'semantic'
          ? 'Semantic search — AI-ranked by meaning, not just keywords.'
          : 'Search by keyword, category, or city — every solution includes a step-by-step build guide.'}
      </p>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} initialQuery={query} loading={loading} />
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
              className={`chip cursor-pointer ${city === c ? 'chip-active' : 'hover:border-primary/40 hover:text-primary'}`}
            >
              {c === 'all' ? 'All Cities' : c}
            </button>
          ))}
        </div>

        <div className="ml-auto relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="chip flex items-center gap-2 cursor-pointer hover:border-primary/40"
            aria-haspopup="menu"
            aria-expanded={sortOpen}
          >
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            {SORT_OPTIONS.find((o) => o.key === sort)?.label}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 mt-2 z-50 glass-strong rounded-xl p-1.5 min-w-[170px] shadow-xl" role="menu">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    role="menuitem"
                    onClick={() => {
                      setSort(o.key);
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      sort === o.key ? 'bg-teal-50 text-primary font-semibold' : 'text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {!loading && !error && (
        <p className="text-sm text-slate-400 mb-4">
          {total !== null
            ? `${solutions.length} shown of ${total.toLocaleString()} solution${total === 1 ? '' : 's'}${
                activeFilterCount > 0 ? ` · ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : ''
              }`
            : `${solutions.length} solution${solutions.length === 1 ? '' : 's'} shown${
                activeFilterCount > 0 ? ` · ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : ''
              }`}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SolutionCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && <p className="text-red-600 bg-red-50 rounded-xl px-4 py-3">Error: {error}</p>}

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
          <div className="glass-strong rounded-3xl p-10 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/25">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <p className="text-lg font-semibold mb-2">No solutions found</p>
            <p className="text-slate-500 text-sm">
              Try a different search, or clear your filters to see the full catalog.
            </p>
            <button onClick={clearAll} className="btn-gradient mt-6 inline-flex items-center gap-2 cursor-pointer">
              <RotateCcw className="w-4 h-4" /> Clear all filters
            </button>
          </div>
        </div>
      )}

      {!loading && !error && solutions.length > 0 && searchMode === 'keyword' && total !== null && solutions.length < total && (
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              setVisibleCount((v) => v + PAGE_SIZE);
              fetchSolutions(true);
            }}
            className="btn-ghost inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            disabled={loadingMore}
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            Load more ({solutions.length} of {total.toLocaleString()})
          </button>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SolutionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
