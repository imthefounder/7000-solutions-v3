import type { SupabaseClient } from '@supabase/supabase-js';

// Fetch the complete set of guide-ready solution ids.
// Supabase caps API responses at 1,000 rows per request, so a single
// `.select()` truncates the 7,010-solution catalog — paginate to cover it.
export async function fetchGuideIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const guideIds = new Set<string>();
  const PAGE = 1000;
  for (let i = 0; i < 20; i++) {
    const { data, error } = await supabase
      .from('solution_guides')
      .select('solution_id')
      .range(i * PAGE, (i + 1) * PAGE - 1);
    if (error || !data || data.length === 0) break;
    for (const g of data) {
      guideIds.add((g as { solution_id: string }).solution_id);
    }
    if (data.length < PAGE) break;
  }
  return guideIds;
}
