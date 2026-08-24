#!/usr/bin/env python3
"""
7000 Solutions content generator.

Generates the full 7,000-solution catalog: 12 categories x ~583 solutions,
split Detroit / St. Louis / national, and upserts into Supabase via psycopg2
(ON CONFLICT (title, COALESCE(city,'')) DO NOTHING — resume-safe).

Providers (in order): GROQ_API_KEY (openai/gpt-oss-120b, free lane) then
DEEPSEEK_API_KEY (deepseek-chat). Keys come from the environment.

Usage:
  GROQ_API_KEY=... python scripts/generate_solutions.py [--target 7000]
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

CATEGORIES = [
    'Education', 'Healthcare', 'Public Safety', 'Environment', 'Transportation',
    'Economic Development', 'Housing', 'Digital Equity', 'Food Security',
    'Youth', 'Aging', 'Arts & Culture',
]

CITY_CONTEXT = {
    'Detroit': (
        'Detroit is a majority-Black, post-industrial city with extensive vacant '
        'lots, a strong nonprofit fabric, and a growing tech/creative scene. '
        'Solutions should be grounded, affordable, and community-led.'),
    'St. Louis': (
        'St. Louis is a fragmented metro with historic neighborhoods, strong '
        'anchor institutions (universities, health systems), and significant '
        'poverty and segregation challenges. Solutions should be practical, '
        'collaborative, and locally grounded.'),
}

BATCH = 20  # solutions per API call
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL = os.environ.get('GROQ_MODEL', 'openai/gpt-oss-120b')
DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
DEEPSEEK_MODEL = 'deepseek-chat'

CATEGORY_CONTEXT = {
    'Education': 'schooling, teachers, students, digital literacy, workforce readiness, after-school and adult learning',
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

PROMPT_TEMPLATE = """You are a civic innovation strategist writing the "7000 Solutions" catalog: actionable, realistic, city-scale solutions to world issues.

DOMAIN — {category}: {category_desc}.

CONTEXT — {city}:
{CITY_CONTEXT}

TASK: Generate exactly {count} NEW, distinct solutions in the {category} domain for {city} and national programs. Every solution MUST clearly belong to the {category} domain. Output ONLY a JSON array of {count} objects, no prose, no markdown:
[{{"title": "...", "description": "...", "ai_usage": "...", "impact": ["...", "..."]}}, ...]

RULES:
- title: short, concrete, name-like (max 8 words). Never repeat titles from the example: Community AI Literacy Hubs, Youth Coding Corps, Mobile Health Kiosks, Smart Streetlight Network, Vacant Lot Rewilding Program, Fair Fares Transit Card, Neighborhood Business Accelerator, Adaptive Reuse Housing Fund, Free Community Wi-Fi Mesh, Urban Food Oasis Network, City Youth Councils, Age-Friendly Concierge Line, Teacher AI Co-Pilot, Resilience Corps, Community Responder Units, School-Based Mental Health, Complete Streets Pilot, Buy Local Procurement Portal, Device Lending Library, Landlord Repair Accelerator, Food Rescue Dispatch.
- description: 1-2 sentences, concrete (who, what, where), no marketing fluff.
- ai_usage: 1 short sentence on how AI is used.
- impact: exactly 2 short measurable strings like "+40% digital skills" or "500 residents per hub/year".
- Mix scopes: some neighborhood-level, some citywide, some regional.
- Never invent stats that look official; use realistic orders of magnitude.
"""


def call_llm(prompt, provider):
    headers = {
        'Content-Type': 'application/json',
        # Groq's Cloudflare edge blocks the default Python-urllib UA (403/1010)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
    if provider == 'groq':
        body = json.dumps({
            'model': GROQ_MODEL,
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': 6000,
            'temperature': 0.9,
            'response_format': {'type': 'json_object'},
        }).encode()
        req = urllib.request.Request(GROQ_URL, data=body, method='POST', headers={
            **headers,
            'Authorization': f"Bearer {os.environ['GROQ_API_KEY']}",
        })
    else:
        body = json.dumps({
            'model': DEEPSEEK_MODEL,
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': 6000,
            'temperature': 1.0,
            'response_format': {'type': 'json_object'},
        }).encode()
        req = urllib.request.Request(DEEPSEEK_URL, data=body, method='POST', headers={
            **headers,
            'Authorization': f"Bearer {os.environ['DEEPSEEK_API_KEY']}",
        })
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read())
    return data['choices'][0]['message']['content']


def extract_json_array(text):
    start = text.find('[')
    if start == -1:
        raise ValueError('no array in response')
    depth = 0
    for i in range(start, len(text)):
        if text[i] == '[':
            depth += 1
        elif text[i] == ']':
            depth -= 1
            if depth == 0:
                return json.loads(text[start:i + 1])
    raise ValueError('unbalanced array in response')


def generate_batch(category, city, count, provider, retries=4):
    prompt = PROMPT_TEMPLATE.format(
        city=city, CITY_CONTEXT=CITY_CONTEXT.get(city, ''),
        category=category, category_desc=CATEGORY_CONTEXT.get(category, ''),
        count=count)
    last_err = None
    for attempt in range(retries):
        try:
            raw = call_llm(prompt, provider)
            items = extract_json_array(raw)
            if not isinstance(items, list) or len(items) == 0:
                raise ValueError('empty array')
            out = []
            seen = set()
            for it in items:
                t = str(it.get('title', '')).strip()
                if not t or t in seen:
                    continue
                seen.add(t)
                desc = str(it.get('description', '')).strip()
                if len(desc) < 60:
                    continue
                out.append({
                    'title': t[:120],
                    'description': desc[:900],
                    'ai_usage': str(it.get('ai_usage', '')).strip()[:400] or None,
                    'impact': [str(x)[:100] for x in (it.get('impact') or [])][:2],
                    'category': category,
                })
            if len(out) < max(8, count - 6):
                raise ValueError(f'only {len(out)} valid items')
            return out
        except (urllib.error.HTTPError, urllib.error.URLError, ValueError, KeyError) as e:
            last_err = e
            time.sleep(4 + attempt * 4)
            if isinstance(e, urllib.error.HTTPError) and e.code == 429:
                time.sleep(15)
    raise RuntimeError(f'batch failed after retries: {last_err}')


def main():
    target = 7000
    if '--target' in sys.argv:
        target = int(sys.argv[sys.argv.index('--target') + 1])

    # Worker mode: --model picks a Groq model (each has its own 8k token/min
    # bucket, so parallel workers across models multiply throughput) and
    # --categories restricts this worker to a subset of categories.
    global GROQ_MODEL
    if '--model' in sys.argv:
        GROQ_MODEL = sys.argv[sys.argv.index('--model') + 1]
    if '--categories' in sys.argv:
        cats = [c.strip() for c in sys.argv[sys.argv.index('--categories') + 1].split(',')]
    else:
        cats = CATEGORIES

    conn = psycopg2.connect(**DB_DSN)
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute('SELECT count(*) FROM solutions')
    total = cur.fetchone()[0]
    print(f'[{GROQ_MODEL}] starting count: {total} (categories: {len(cats)})', flush=True)

    # Each worker fills its own category share (~583 per category)
    per_cat = target // len(CATEGORIES)
    worker_target = per_cat * len(cats)
    cat_placeholders = ','.join(['%s'] * len(cats))

    provider = 'groq' if os.environ.get('GROQ_API_KEY') else 'deepseek'
    failures = 0
    batch_no = 0

    while total < target:
        cur.execute(
            f"SELECT count(*) FROM solutions WHERE category IN ({cat_placeholders})",
            cats)
        cat_total = cur.fetchone()[0]
        if cat_total >= worker_target:
            print(f'[{GROQ_MODEL}] category share reached ({cat_total} >= {worker_target}), '
                  f'global {total}', flush=True)
            break

        category = cats[batch_no % len(cats)]
        # Alternate city focus per cycle; the index-mapping below fixes the mix
        city_focus = 'Detroit' if (batch_no // len(cats)) % 2 == 0 else 'St. Louis'

        try:
            items = generate_batch(category, city_focus, BATCH, provider)
        except RuntimeError as e:
            failures += 1
            print(f'[{GROQ_MODEL}] [fail] {category} ({city_focus}): {e}', flush=True)
            if failures >= 5 and provider == 'groq' and os.environ.get('DEEPSEEK_API_KEY'):
                provider = 'deepseek'
                print(f'[{GROQ_MODEL}] switching provider to deepseek', flush=True)
                failures = 0
                continue
            if failures >= 8:
                print(f'[{GROQ_MODEL}] too many failures, aborting', flush=True)
                break
            time.sleep(20)
            continue

        failures = 0
        sprint = f'S{(batch_no % 4) + 1}'
        rows = []
        for idx, it in enumerate(items):
            if idx < 14:
                city = city_focus
            else:
                city = None  # national
            rows.append((it['title'], it['description'], it['ai_usage'],
                         it['impact'], it['category'], sprint, city))

        cur.executemany(
            """INSERT INTO solutions
               (title, description, ai_usage, impact, category, sprint, city)
               VALUES (%s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (title, COALESCE(city, '')) DO NOTHING""",
            rows,
        )
        cur.execute('SELECT count(*) FROM solutions')
        total = cur.fetchone()[0]
        batch_no += 1
        if batch_no % 10 == 0 or total >= target:
            print(f'[{GROQ_MODEL}] [batch {batch_no}] {category} {city_focus} '
                  f'sprint {sprint} -> total {total}', flush=True)
        # Smooth pacing inside the per-model 8k token/min bucket
        time.sleep(3)

    print(f'[{GROQ_MODEL}] DONE: solutions in DB = {total}', flush=True)
    conn.close()


if __name__ == '__main__':
    main()
