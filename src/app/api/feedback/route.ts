import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Feedback submission endpoint.
// Signed-in users: user_id comes from the NextAuth session (server-verified).
// Anonymous (prototype mode): user_id is a per-browser visitor id; a profile
// row is created on first use so the existing schema keeps working.
export async function POST(request: Request) {
  let body: { solution_id?: string; status?: string; notes?: string; user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { solution_id, status, notes } = body;
  if (!solution_id || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (!['planned', 'in_progress', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  let userId = session?.user?.id ?? null;

  if (!userId) {
    const anon = body.user_id ?? '';
    if (!UUID_RE.test(anon)) {
      return NextResponse.json({ error: 'Missing user identity' }, { status: 401 });
    }
    userId = anon.toLowerCase();
  }

  const supabase = createServiceRoleClient();

  // Ensure a profile row exists (anonymous visitors don't have one yet)
  const { error: profileError } = await supabase.rpc('ensure_anonymous_profile', {
    anon_id: userId,
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error } = await supabase.from('solution_feedback').upsert(
    {
      solution_id,
      user_id: userId,
      status,
      notes: notes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'solution_id,user_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  if (!session && body.user_id) {
    // Persist the visitor id server-side too so the dashboard can read it
    res.cookies.set('visitor_id', userId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return res;
}
