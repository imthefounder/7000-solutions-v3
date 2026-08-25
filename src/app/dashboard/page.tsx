import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import DashboardStats from '@/components/ui/DashboardStats';
import ProgressChart from '@/components/ui/ProgressChart';
import KarmaDisplay from '@/components/ui/KarmaDisplay';
import Link from 'next/link';
import { GraduationCap, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const visitorId = cookieStore.get('visitor_id')?.value ?? '';

  const userId =
    session?.user?.id ?? (UUID_RE.test(visitorId) ? visitorId.toLowerCase() : null);

  const supabase = createServiceRoleClient();

  if (!userId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Municipal Dashboard</h1>
        <p className="text-slate-500 mb-6">
          Track solutions your city is implementing. Your progress is saved on this
          device — reload after the page finishes loading to see your dashboard.
        </p>
        <div className="card p-8 text-center">
          <p className="text-slate-500">
            Start by browsing solutions and clicking “Track This Solution”.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: profile }, { data: feedback }, { data: teaching }, { data: tracked }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase
        .from('solution_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
      supabase
        .from('teaching_events')
        .select('id')
        .eq('teacher_id', userId),
      supabase
        .from('solution_feedback')
        .select('solution_id, solutions(title)')
        .eq('user_id', userId)
        .limit(10),
    ]);

  const feedbackRows = feedback ?? [];
  const teachingCount = teaching?.length ?? 0;
  const trackedRows = tracked ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Municipal Dashboard</h1>
      <p className="text-slate-500 mb-6">
        {profile?.city ? `${profile.city} City Official` : 'Community Member'} — track solutions
        your city is implementing.
      </p>

      <div className="mb-8">
        <KarmaDisplay />
      </div>

      <DashboardStats feedback={feedbackRows} />

      {/* Your Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{feedbackRows.length}</p>
            <p className="text-sm text-slate-500">Solutions tracked</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{teachingCount}</p>
            <p className="text-sm text-slate-500">Teaching sessions logged</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProgressChart feedback={feedbackRows} />
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">City Actions</h3>
          {trackedRows.length > 0 ? (
            <ul className="space-y-3">
              {trackedRows.slice(0, 10).map((f: any) => {
                const title = (f.solutions as any)?.title ?? 'Solution';
                const solutionId = f.solution_id;
                return (
                  <li key={f.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <Link
                        href={`/solution/${solutionId}`}
                        className="font-medium truncate block hover:text-primary"
                      >
                        {title}
                      </Link>
                      {f.notes && (
                        <p className="text-slate-500 text-xs truncate">{f.notes}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : f.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {f.status.replace('_', ' ')}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">
              No tracked solutions yet.{' '}
              <Link href="/browse" className="text-primary hover:underline">
                Browse solutions
              </Link>{' '}
              and click “Track This Solution” to start.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
