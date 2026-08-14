import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import FeedbackForm from '@/components/ui/FeedbackForm';
import TeachingForm from '@/components/ui/TeachingForm';
import KarmaDisplay from '@/components/ui/KarmaDisplay';

export const dynamic = 'force-dynamic';

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="inline-block bg-teal-50 text-primary font-semibold px-2 py-1 rounded">
          {solution.category}
        </span>
        <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded">
          Sprint {solution.sprint}
        </span>
        {solution.city && (
          <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {solution.city}
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{solution.title}</h1>
      <p className="text-lg text-slate-600 mb-6 whitespace-pre-line">{solution.description}</p>

      {solution.ai_usage && (
        <div className="card mb-6">
          <h2 className="font-semibold text-lg mb-2">How AI Was Used</h2>
          <p className="text-slate-600 whitespace-pre-line">{solution.ai_usage}</p>
        </div>
      )}

      {solution.impact && solution.impact.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-lg mb-2">Expected Impact</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            {solution.impact.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackForm solutionId={solution.id} />
        <TeachingForm solutionId={solution.id} />
      </div>

      <div className="mt-6">
        <KarmaDisplay />
      </div>
    </div>
  );
}
