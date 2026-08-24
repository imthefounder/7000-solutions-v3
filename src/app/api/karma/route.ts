import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Karma balance lookup for the current user or anonymous visitor.
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const anon = url.searchParams.get('user_id') ?? '';
  const userId = session?.user?.id ?? (UUID_RE.test(anon) ? anon.toLowerCase() : null);

  if (!userId) {
    return NextResponse.json({ karma_balance: 0 });
  }

  const supabase = createServiceRoleClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('karma_balance')
    .eq('id', userId)
    .maybeSingle();

  const res = NextResponse.json({ karma_balance: profile?.karma_balance ?? 0 });
  if (!session && userId && userId !== anon) {
    res.cookies.set('visitor_id', userId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return res;
}
