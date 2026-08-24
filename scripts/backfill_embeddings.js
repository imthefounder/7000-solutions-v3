/**
 * Backfill embeddings for solutions that have none.
 *
 * Usage (from project root):
 *   node scripts/backfill_embeddings.js
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 * in .env.local (or exported in the shell).
 *
 * Generates an embedding per solution from title + description + category
 * (text-embedding-3-small, 1536 dims to match the schema) and updates the row.
 * Idempotent: only touches rows where embedding IS NULL.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
if (!openaiKey) {
  console.error('Missing OPENAI_API_KEY — semantic search needs it. Aborting (no changes made).');
  process.exit(1);
}

const supabase = createClient(url, key);

async function embed(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

(async () => {
  // All solutions missing an embedding (chunked fetch to stay under URL limits)
  const { data: rows, error } = await supabase
    .from('solutions')
    .select('id, title, description, category')
    .is('embedding', null)
    .limit(200);
  if (error) throw new Error(`Select failed: ${error.message}`);
  console.log(`${rows.length} solutions need embeddings.`);

  let ok = 0, fail = 0;
  for (const s of rows) {
    const text = `Category: ${s.category}. Title: ${s.title}. Description: ${s.description}`;
    try {
      const embedding = await embed(text);
      const { error: upErr } = await supabase
        .from('solutions')
        .update({ embedding })
        .eq('id', s.id);
      if (upErr) throw upErr;
      ok++;
      console.log(`  [${ok}] embedded ${s.title}`);
    } catch (e) {
      fail++;
      console.error(`  [FAIL] ${s.title}: ${e.message}`);
      if (fail >= 3) { console.error('Too many failures, stopping.'); break; }
    }
  }
  console.log(`Done: ${ok} embedded, ${fail} failed.`);
  process.exit(fail > 0 ? 1 : 0);
})();
