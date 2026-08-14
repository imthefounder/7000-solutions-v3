import Link from 'next/link';
import type { Solution } from '@/types';

type SolutionCardProps = {
  solution: Solution;
  showSimilarity?: boolean;
};

export default function SolutionCard({ solution, showSimilarity = false }: SolutionCardProps) {
  return (
    <Link href={`/solution/${solution.id}`} className="card block hover:border-primary transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="inline-block bg-teal-50 text-primary text-xs font-semibold px-2 py-1 rounded">
          {solution.category}
        </span>
        {solution.city && (
          <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
            {solution.city}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{solution.title}</h3>
      <p className="text-sm text-slate-600 mb-3 line-clamp-3">{solution.description}</p>
      {showSimilarity && typeof solution.similarity === 'number' && (
        <div className="text-xs text-slate-400">
          Relevance: {Math.round(solution.similarity * 100)}%
        </div>
      )}
    </Link>
  );
}
