import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Compass, Clock, DollarSign, Building2, Sparkles, Wrench } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import FeedbackForm from '@/components/ui/FeedbackForm';
import TeachingForm from '@/components/ui/TeachingForm';
import KarmaDisplay from '@/components/ui/KarmaDisplay';
import SolutionTabs, { TabKey } from '@/components/ui/SolutionTabs';
import ShareButton from '@/components/ui/ShareButton';
import SolutionCard from '@/components/ui/SolutionCard';
import type { Solution, SolutionGuide } from '@/types';

export const dynamic = 'force-dynamic';

function GuideSection({ guide }: { guide: SolutionGuide | null }) {
  if (!guide || !guide.steps || guide.steps.length === 0) {
    return (
      <div className="card text-center py-12">
        <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="font-semibold text-lg mb-2">Build guide coming soon</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Our community is writing the step-by-step implementation guide for this
          solution. Check back shortly — or contribute one yourself on GitHub.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card !p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Timeline</p>
            <p className="font-medium text-sm">{guide.timeline ?? 'Not yet estimated'}</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Estimated Cost</p>
            <p className="font-medium text-sm">{guide.estimated_cost ?? 'Not yet estimated'}</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Key Partners</p>
            <p className="font-medium text-sm">
              {guide.partners && guide.partners.length > 0
                ? guide.partners.slice(0, 2).join(', ')
                : 'Community-led'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" /> Step-by-Step Build Guide
        </h2>
        <ol className="space-y-4">
          {guide.steps.map((step, idx) => (
            <li key={idx} className="card !p-5 flex gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center text-sm shadow-md">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default async function SolutionPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: solution, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !solution) {
    notFound();
  }

  const s = solution as unknown as Solution;

  const [{ data: guideData }, { data: relatedData }] = await Promise.all([
    supabase.from('solution_guides').select('*').eq('solution_id', s.id).maybeSingle(),
    supabase
      .from('solutions')
      .select('*')
      .eq('category', s.category)
      .neq('id', s.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const guide = (guideData as unknown as SolutionGuide) ?? null;
  const related = (relatedData as unknown as Solution[]) ?? [];

  const renderTab = (tab: TabKey) => {
    if (tab === 'guide') {
      return <GuideSection guide={guide} />;
    }
    if (tab === 'impact') {
      return (
        <div className="space-y-6">
          {s.impact && s.impact.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Expected Impact
              </h2>
              <ul className="space-y-2">
                {s.impact.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeedbackForm solutionId={s.id} />
            <TeachingForm solutionId={s.id} />
          </div>
          <KarmaDisplay />
        </div>
      );
    }
    // overview
    return (
      <div className="space-y-6">
        <div className="card">
          <h2 className="font-semibold text-lg mb-3">About This Solution</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {s.long_description || s.description}
          </p>
        </div>
        {s.ai_usage && (
          <div className="card">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> How AI Was Used
            </h2>
            <p className="text-slate-600 whitespace-pre-line">{s.ai_usage}</p>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { key: 'overview' as TabKey, label: 'Overview', content: renderTab('overview') },
    { key: 'guide' as TabKey, label: 'Build Guide', content: renderTab('guide') },
    { key: 'impact' as TabKey, label: 'Impact & Track', content: renderTab('impact') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm flex-wrap">
        <span className="inline-block bg-teal-50 text-primary font-semibold px-2.5 py-1 rounded-full border border-teal-100">
          {s.category}
        </span>
        <span className="inline-block bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
          Sprint {s.sprint}
        </span>
        {s.city && (
          <span className="inline-block bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
            {s.city}
          </span>
        )}
        <div className="ml-auto">
          <ShareButton title={s.title} />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{s.title}</h1>
      <p className="text-lg text-slate-600 mb-8 whitespace-pre-line">{s.description}</p>

      <SolutionTabs tabs={tabs} />

      {related.length > 0 && (
        <div className="mt-14">
          <div className="divider-glow mb-6" />
          <h2 className="font-semibold text-xl mb-4">More in {s.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <SolutionCard key={r.id} solution={r} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/browse?category=${encodeURIComponent(s.category)}`} className="chip">
              View all {s.category} solutions →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
