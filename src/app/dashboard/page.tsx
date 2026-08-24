import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import DashboardStats from '@/components/ui/DashboardStats';
import ProgressChart from '@/components/ui/ProgressChart';
import KarmaDisplay from '@/components/ui/KarmaDisplay';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const visitorId = cookieStore.get('visitor_id')?.value ?? '';

  // Signed-in users see their own data; anonymous visitors see the data
  // attached to their browser's visitor id (prototype mode).
  const userId =
    session?.user?.id ?? (UUID_RE.test(visitorId) ? visitorId.toLowerCase() : null);

  const supabase = createServiceRoleClient();

  if (!userId) {
    // Fresh browser with no visitor id yet — the client Providers component
    // creates one on first render, then a reload shows this user's data.
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  const { data: feedback } = await supabase
    .from('solution_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

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

      <DashboardStats feedback={feedback ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProgressChart feedback={feedback ?? []} />
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">City Actions</h3>
          {feedback && feedback.length > 0 ? (
            <ul className="space-y-3">
              {feedback.slice(0, 10).map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{f.solution_id}</p>
                    {f.notes && (
                      <p className="text-slate-500 text-xs truncate">{f.notes}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
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
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">
              No tracked solutions yet. Browse solutions and click “Track This Solution” to
              start.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
