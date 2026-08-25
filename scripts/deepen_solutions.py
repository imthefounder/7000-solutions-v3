#!/usr/bin/env python3
"""
Deepen the catalog: long descriptions + step-by-step build guides.

For every solution without a guide, generates:
  - long_description (2 editorial paragraphs)
  - steps (4-step implementation guide: title + detail)
  - estimated_cost, timeline, partners

Resume-safe: only processes solutions with no row in solution_guides.
Provider: DeepSeek (off-peak) by default; Groq if GROQ_API_KEY set.

Usage:
  DEEPSEEK_API_KEY=... python scripts/deepen_solutions.py [--categories "A,B,C"]
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

import psycopg2

DB_DSN = dict(
    host='db.vysmztsfeduwwhmdkzyi.supabase.co',
    port=5432, dbname='postgres', user='postgres',
    password=os.environ.get('SUPABASE_DB_PASSWORD', '@Lastname3687'),
    sslmode='require', connect_timeout=20,
)

CATEGORY_CONTEXT = {
    'Education': 'schools, teachers, students, digital literacy, workforce readiness, after-school and adult learning',
    'Healthcare': 'access to care, mental health, prevention, telehealth, community clinics, chronic disease',
    'Public Safety': 'community policing, emergency response, violence prevention, safer streets, 911 alternatives',
    'Environment': 'climate resilience, green space, energy, waste, water quality, air quality, urban nature',
    'Transportation': 'transit, mobility, walkability, bike infrastructure, first/last mile, road safety',
    'Economic Development': 'small business, jobs, workforce, entrepreneurship, local procurement, downtown vitality',
    'Housing': 'affordability, vacancy, home repair, homelessness, tenant rights, land use, eviction prevention',
    'Digital Equity': 'internet access, devices, digital skills, online inclusion, tech support',
    'Food Security': 'food access, hunger, urban agriculture, food waste, nutrition, food deserts',
    'Youth': 'young people, teens, education-to-work, engagement, recreation, mentoring',
    'Aging': 'older adults, senior health, social isolation, mobility, benefits navigation, elder care',
    'Arts & Culture': 'arts, culture, heritage, creative economy, public art, venues, cultural programming',
}

BATCH = 5  # solutions per API call

PROMPT_TEMPLATE = """You are a civic implementation strategist. Write the in-depth content for one solution in the "7000 Solutions" catalog.

CATEGORY — {category}: {category_desc}.
CITY: {city} (use "National" if none).

SOLUTION:
Title: {title}
Summary: {description}
AI usage: {ai_usage}
Expected impact: {impact}

TASK: Output ONLY a JSON object (no prose, no markdown):
{{
  "long_description": "2 short editorial paragraphs (~110 words total) on why this matters, how it works, and what success looks like. Concrete, grounded, no marketing fluff.",
  "steps": [
    {{"title": "step name (max 6 words)", "detail": "what to do, who does it, in 1-2 sentences (max 45 words)"}}
  ],
  "estimated_cost": "one line, realistic ranges, e.g. '$40k-$90k startup; $12k/yr operating'",
  "timeline": "one line, e.g. '4-6 months to first pilot'",
  "partners": ["2-3 realistic local partner names for this city", "..."]
}}

RULES:
- exactly 4 steps, ordered: convene/plan -> fund -> pilot -> scale.
- Steps must be actionable for a neighborhood group or city department.
- Costs/timelines realistic for a mid-size US city; never invent official stats.
"""


def call_llm(prompt):
    key = os.environ.get('DEEPSEEK_API_KEY')
    url = 'https://api.deepseek.com/chat/completions'
    model = 'deepseek-chat'
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Authorization': f'Bearer {key}',
    }
    body = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 1800,
        'temperature': 0.8,
        'response_format': {'type': 'json_object'},
    }).encode()
    req = urllib.request.Request(url, data=body, method='POST', headers=headers)
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read())
    return data['choices'][0]['message']['content']


def extract_json(text):
    text = text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[-1]
        if text.endswith('```'):
            text = text[:-3]
    return json.loads(text)


def deepen_one(row, retries=5):
    prompt = PROMPT_TEMPLATE.format(
        category=row['category'],
        category_desc=CATEGORY_CONTEXT.get(row['category'], ''),
        city=row['city'] or 'National',
        title=row['title'],
        description=row['description'],
        ai_usage=row['ai_usage'] or 'Not specified',
        impact=', '.join(row['impact'] or []),
    )
    last_err = None
    for attempt in range(retries):
        try:
            raw = call_llm(prompt)
            d = extract_json(raw)
            steps = d.get('steps') or []
            if not isinstance(steps, list) or len(steps) < 3:
                raise ValueError(f'bad steps: {len(steps)}')
            steps = [
                {'title': str(s.get('title', ''))[:80],
                 'detail': str(s.get('detail', ''))[:400]}
                for s in steps if isinstance(s, dict) and s.get('title')
            ][:6]
            if len(steps) < 3:
                raise ValueError('steps too short after cleaning')
            partners = [str(p)[:80] for p in (d.get('partners') or []) if p][:4]
            return {
                'long_description': str(d.get('long_description', ''))[:2500],
                'steps': steps,
                'estimated_cost': str(d.get('estimated_cost', ''))[:120] or None,
                'timeline': str(d.get('timeline', ''))[:120] or None,
                'partners': partners,
            }
        except (urllib.error.HTTPError, urllib.error.URLError, ValueError, KeyError, TypeError, json.JSONDecodeError) as e:
            last_err = e
            if isinstance(e, urllib.error.HTTPError) and e.code == 429:
                time.sleep(45)
            else:
                time.sleep(6 + attempt * 6)
    raise RuntimeError(f'failed after retries: {last_err}')


def main():
    cats = None
    if '--categories' in sys.argv:
        cats = [c.strip() for c in sys.argv[sys.argv.index('--categories') + 1].split(',')]

    conn = psycopg2.connect(**DB_DSN)
    conn.autocommit = True
    cur = conn.cursor()

    where = ''
    params = []
    if cats:
        placeholders = ','.join(['%s'] * len(cats))
        where = f" AND category IN ({placeholders})"
        params = cats

    cur.execute(f"""
        SELECT s.id, s.title, s.category, s.city, s.description, s.ai_usage, s.impact
        FROM solutions s
        LEFT JOIN solution_guides g ON g.solution_id = s.id
        WHERE g.solution_id IS NULL {where}
        ORDER BY s.created_at
    """, params)
    rows = [dict(zip(['id', 'title', 'category', 'city', 'description', 'ai_usage', 'impact'], r)) for r in cur.fetchall()]
    total = len(rows)
    print(f'[{", ".join(cats) if cats else "all"}] solutions to deepen: {total}', flush=True)

    done = 0
    fail = 0
    for row in rows:
        try:
            content = deepen_one(row)
        except RuntimeError as e:
            fail += 1
            print(f'  [FAIL] {row["title"][:50]}: {e}', flush=True)
            if fail >= 10:
                print('too many failures, aborting', flush=True)
                break
            continue
        cur.execute(
            'UPDATE solutions SET long_description = %s WHERE id = %s',
            (content['long_description'], row['id']),
        )
        cur.execute("""
            INSERT INTO solution_guides (solution_id, steps, estimated_cost, timeline, partners)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (solution_id) DO UPDATE SET
              steps = EXCLUDED.steps,
              estimated_cost = EXCLUDED.estimated_cost,
              timeline = EXCLUDED.timeline,
              partners = EXCLUDED.partners,
              updated_at = now()
        """, (row['id'], json.dumps(content['steps']), content['estimated_cost'],
              content['timeline'], json.dumps(content['partners'])))
        done += 1
        if done % 25 == 0 or done == total:
            print(f'  deepened {done}/{total} (fail {fail})', flush=True)
        time.sleep(1)

    print(f'DONE: {done} deepened, {fail} failed', flush=True)
    conn.close()


if __name__ == '__main__':
    main()
