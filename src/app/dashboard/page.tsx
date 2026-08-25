import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import KarmaDisplay from '@/components/ui/KarmaDisplay';
import ImpactCard from '@/components/dashboard/ImpactCard';
import StatusDonut from '@/components/dashboard/StatusDonut';
import CategoryBars from '@/components/dashboard/CategoryBars';
import Link from 'next/link';
import {
  Target,
  GraduationCap,
  MessagesSquare,
  MapPin,
  Clock,
  Activity,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_META: Record<string, { icon: React.ElementType; cls: string }> = {
  planned: { icon: Clock, cls: 'bg-slate-100 text-slate-600' },
  in_progress: { icon: Activity, cls: 'bg-teal-100 text-teal-700' },
  completed: { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700' },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const visitorId = cookieStore.get('visitor_id')?.value ?? '';

  const userId =
    session?.user?.id ?? (UUID_RE.test(visitorId) ? visitorId.toLowerCase() : null);

  const supabase = createServiceRoleClient();

  if (!userId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <span className="eyebrow">Your impact</span>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-3">Municipal Dashboard</h1>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Track solutions your city is implementing. Your progress is saved on this device.
        </p>
        <div className="card p-10 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/25">
            <Target className="w-7 h-7 text-white" />
          </div>
          <p className="text-lg font-semibold mb-2">Start tracking your impact</p>
          <p className="text-slate-500 text-sm">
            Browse solutions and click “Track This Solution” to begin building your city&apos;s
            action plan.
          </p>
          <Link href="/browse" className="btn-gradient mt-6 inline-flex items-center gap-2">
            Browse solutions <ArrowRight className="w-4 h-4" />
          </Link>
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
      supabase.from('teaching_events').select('id').eq('teacher_id', userId),
      supabase
        .from('solution_feedback')
        .select('solution_id, solutions(title), status, updated_at')
        .eq('user_id', userId)
        .limit(10),
    ]);

  const feedbackRows = feedback ?? [];
  const teachingCount = teaching?.length ?? 0;
  const trackedRows = tracked ?? [];

  // Category breakdown for charting (real data)
  const ids = Array.from(new Set(feedbackRows.map((f) => f.solution_id))).slice(0, 300);
  const { data: solCats } = ids.length
    ? await supabase.from('solutions').select('id, category').in('id', ids)
    : { data: [] };
  const catMap = new Map((solCats ?? []).map((s) => [s.id, s.category]));

  const statusCounts = ['planned', 'in_progress', 'completed'].map((status) => ({
    status,
    value: feedbackRows.filter((f) => f.status === status).length,
  }));
  const statusTotal = statusCounts.reduce((a, b) => a + b.value, 0);

  const catAcc = new Map<string, number>();
  for (const f of feedbackRows) {
    const cat = catMap.get(f.solution_id) ?? 'Other';
    catAcc.set(cat, (catAcc.get(cat) ?? 0) + 1);
  }
  const catData = Array.from(catAcc.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const role = profile?.city ? `${profile.city} City Official` : 'Community Member';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="eyebrow">Your impact</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-3xl md:text-4xl font-bold">Municipal Dashboard</h1>
        <span className="badge badge-teal inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {role}
        </span>
      </div>
      <p className="text-slate-500 mb-8">
        Track solutions your city is implementing, earn karma, and show your neighbors the way.
      </p>

      <div className="mb-8">
        <KarmaDisplay />
      </div>

      {/* Impact bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <ImpactCard
          icon={<Target className="w-6 h-6 text-white" />}
          value={feedbackRows.length}
          label="Solutions tracked"
          hint="Across your city action plan"
        />
        <ImpactCard
          icon={<MessagesSquare className="w-6 h-6 text-white" />}
          value={statusTotal}
          label="With a status"
          hint={`${statusCounts.find((s) => s.status === 'completed')?.value ?? 0} completed`}
          grad="from-cyan-600 to-sky-500"
        />
        <ImpactCard
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          value={teachingCount}
          label="Teaching sessions"
          hint="+5 karma for every session"
          grad="from-teal-500 to-emerald-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StatusDonut counts={statusCounts} total={statusTotal} />
        <CategoryBars data={catData} total={feedbackRows.length} />
      </div>

      {/* City Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-lg">City Actions</h3>
          <span className="text-xs text-slate-400">{trackedRows.length} most recent</span>
        </div>
        {trackedRows.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {trackedRows.slice(0, 10).map((f: any) => {
              const title = (f.solutions as any)?.title ?? 'Solution';
              const solutionId = f.solution_id;
              const meta = STATUS_META[f.status] ?? STATUS_META.planned;
              const Icon = meta.icon;
              return (
                <li key={f.id} className="py-3 flex items-center gap-3 text-sm">
                  <span
                    className={`shrink-0 w-8 h-8 rounded-lg ${meta.cls} flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/solution/${solutionId}`}
                      className="font-medium truncate block hover:text-primary transition-colors"
                    >
                      {title}
                    </Link>
                    {f.notes && (
                      <p className="text-slate-500 text-xs truncate mt-0.5">{f.notes}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${meta.cls}`}
                    >
                      {f.status.replace('_', ' ')}
                    </span>
                    {f.updated_at && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(f.updated_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">
              No tracked solutions yet.{' '}
              <Link href="/browse" className="text-primary hover:underline font-medium">
                Browse solutions
              </Link>{' '}
              and click “Track This Solution” to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
