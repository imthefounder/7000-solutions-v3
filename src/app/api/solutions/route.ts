import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Public solutions listing API with optional filters:
//   ?category=Education
//   ?city=Detroit
//   ?q=keyword
//   ?limit=50
//   ?offset=0
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const q = searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100);
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0);

  const supabase = createServerSupabase();
  let query = supabase.from('solutions').select('*', { count: 'exact' });

  if (category) query = query.eq('category', category);
  if (city) query = query.eq('city', city);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Guide-ready flags (two-query pattern — embed syntax is unreliable here)
  const { data: guideRows } = await supabase.from('solution_guides').select('solution_id');
  const guideIds = new Set((guideRows ?? []).map((g: { solution_id: string }) => g.solution_id));

  const rows = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    hasGuide: guideIds.has(r.id as string),
  }));

  return NextResponse.json({ data: rows, count: count ?? rows.length, offset, limit });
}
