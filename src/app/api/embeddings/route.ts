import { NextResponse } from 'next/server';

// OpenAI embeddings endpoint for semantic search.
// If OPENAI_API_KEY is missing, returns an empty result so the client
// falls back to keyword search (no paid API spend on automation).
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ embedding: null }, { status: 503 });
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ embedding: null }, { status: 502 });
    }

    const data = await res.json();
    const embedding = data?.data?.[0]?.embedding;

    if (!embedding) {
      return NextResponse.json({ embedding: null }, { status: 502 });
    }

    return NextResponse.json({ embedding });
  } catch {
    return NextResponse.json({ embedding: null }, { status: 500 });
  }
}
