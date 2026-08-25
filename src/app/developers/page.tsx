import Link from 'next/link';
import { Github, Code2, TerminalSquare, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/solutions',
    desc: 'List solutions with optional filters.',
    example:
      '/api/solutions?category=Education&city=Detroit&q=wifi&limit=10&offset=0',
    params: ['category', 'city', 'q (title/description)', 'limit (≤100)', 'offset'],
  },
  {
    method: 'POST',
    path: '/api/feedback',
    desc: 'Track implementation status for a solution (anonymous visitor or signed-in).',
    example:
      '{ "solution_id": "…", "status": "in_progress", "notes": "…", "user_id": "<visitor-id>" }',
    params: ['solution_id', 'status: planned|in_progress|completed', 'notes', 'user_id'],
  },
  {
    method: 'POST',
    path: '/api/teaching',
    desc: 'Log a Watch-Build-Teach session — awards +5 karma to the teacher.',
    example:
      '{ "solution_id": "…", "student_email": "…", "teacher_id": "<visitor-id>" }',
    params: ['solution_id', 'student_email', 'teacher_id'],
  },
  {
    method: 'GET',
    path: '/api/karma',
    desc: "Read a visitor's or user's karma balance.",
    example: '/api/karma?user_id=<visitor-id>',
    params: ['user_id'],
  },
];

const CONTRIBUTION_LANES = [
  {
    icon: Code2,
    title: 'Write solutions',
    text: 'Add new solutions to the catalog via the generator pipeline or a pull request to the seed data.',
  },
  {
    icon: TerminalSquare,
    title: 'Build guides',
    text: 'The step-by-step guides are open content — improve accuracy, costs, and timelines for your city.',
  },
  {
    icon: Github,
    title: 'Ship features',
    text: 'The app is MIT-licensed Next.js + Supabase. Pick an issue, fork, build, and open a PR.',
  },
];

export default function DevelopersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        For Developers
      </h1>
      <p className="text-slate-500 mb-10">
        7000 Solutions is <strong>open source</strong> — MIT licensed. Citizens use it,
        developers build it, cities run it.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {CONTRIBUTION_LANES.map((lane) => (
          <div key={lane.title} className="card">
            <lane.icon className="w-8 h-8 text-primary mb-3" />
            <h2 className="font-semibold text-lg mb-2">{lane.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{lane.text}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">Public API</h2>
      <p className="text-slate-500 mb-6 text-sm">
        No API key required — the catalog is public data. Endpoints are rate-limited
        and designed for community tooling.
      </p>

      <div className="space-y-4 mb-12">
        {API_ENDPOINTS.map((ep) => (
          <div key={ep.path + ep.method} className="card">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  ep.method === 'GET'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {ep.method}
              </span>
              <code className="text-sm font-semibold">{ep.path}</code>
            </div>
            <p className="text-sm text-slate-600 mb-2">{ep.desc}</p>
            <pre className="bg-slate-900 text-teal-200 text-xs rounded-lg p-3 overflow-x-auto mb-2">
              {ep.example}
            </pre>
            {ep.params && (
              <p className="text-xs text-slate-400">
                Params: {ep.params.join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="card !py-10 text-center">
        <Heart className="w-8 h-8 text-secondary mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Build with us</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          The full source, content pipeline, and contribution guide live on GitHub.
          Every solution, every guide, every line — open.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="https://github.com/imthefounder/7000-solutions-v3"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient inline-flex items-center gap-2"
          >
            <Github className="w-4 h-4" /> GitHub Repository
          </Link>
          <Link href="/browse" className="btn-ghost">
            Browse the Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
