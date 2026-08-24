import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Feedback submission endpoint (used as a server-side alternative to direct
// client inserts; keeps karma awards atomic with feedback writes).
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { solution_id, status, notes } = await request.json();

    if (!solution_id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase.from('solution_feedback').upsert(
      {
        solution_id,
        user_id: session.user.id,
        status,
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'solution_id,user_id' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
