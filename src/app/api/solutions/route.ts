import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Public solutions listing API with optional filters:
//   ?category=Education
//   ?city=Detroit
//   ?q=keyword
//   ?limit=50
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const q = searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100);

  const supabase = createServerSupabase();
  let query = supabase.from('solutions').select('*');

  if (category) query = query.eq('category', category);
  if (city) query = query.eq('city', city);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count: data?.length ?? 0 });
}
