import Link from 'next/link';
import type { Solution } from '@/types';
import { MapPin, BookOpen, GraduationCap, HeartPulse, Shield, Leaf, Bus, Briefcase, Home, Wifi, Sprout, Rocket, Users, Palette, Lightbulb } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Education: GraduationCap,
  Healthcare: HeartPulse,
  'Public Safety': Shield,
  Environment: Leaf,
  Transportation: Bus,
  'Economic Development': Briefcase,
  Housing: Home,
  'Digital Equity': Wifi,
  'Food Security': Sprout,
  Youth: Rocket,
  Aging: Users,
  'Arts & Culture': Palette,
};

const CATEGORY_GRADS: Record<string, string> = {
  Education: 'from-teal-600 to-cyan-500',
  Healthcare: 'from-teal-500 to-emerald-500',
  'Public Safety': 'from-cyan-600 to-sky-500',
  Environment: 'from-emerald-600 to-teal-500',
  Transportation: 'from-sky-600 to-cyan-500',
  'Economic Development': 'from-teal-700 to-teal-500',
  Housing: 'from-cyan-700 to-teal-500',
  'Digital Equity': 'from-sky-500 to-cyan-400',
  'Food Security': 'from-emerald-500 to-teal-400',
  Youth: 'from-cyan-500 to-teal-400',
  Aging: 'from-teal-500 to-cyan-600',
  'Arts & Culture': 'from-cyan-500 to-sky-400',
};

type SolutionCardProps = {
  solution: Solution;
  showSimilarity?: boolean;
};

export default function SolutionCard({ solution, showSimilarity = false }: SolutionCardProps) {
  const Icon = CATEGORY_ICONS[solution.category] ?? Lightbulb;
  const grad = CATEGORY_GRADS[solution.category] ?? 'from-teal-600 to-cyan-500';

  return (
    <Link
      href={`/solution/${solution.id}`}
      className="card group block cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md shrink-0 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {solution.category}
            </span>
            {solution.hasGuide && (
              <span className="badge-guide inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Guide ready
              </span>
            )}
          </div>
          <h3 className="font-semibold leading-snug mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {solution.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
        {solution.description}
      </p>

      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
        {solution.city && (
          <span className="badge inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {solution.city}
          </span>
        )}
        {showSimilarity && solution.similarity !== undefined && (
          <span className="badge badge-teal">
            {Math.round(solution.similarity * 100)}% match
          </span>
        )}
        <span className="ml-auto text-xs font-medium text-slate-400 group-hover:text-primary transition-colors">
          View solution →
        </span>
      </div>
    </Link>
  );
}
