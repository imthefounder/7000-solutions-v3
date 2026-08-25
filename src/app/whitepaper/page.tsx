import { FileText, Download, Layers, MapPin, Sparkles, GitFork } from 'lucide-react';
import WhitepaperDownload from '@/components/ui/WhitepaperDownload';

const SECTIONS = [
  {
    n: '01',
    icon: Sparkles,
    title: 'Executive Summary',
    body: [
      'The 7,000 Solutions Platform is a blueprint for city-scale problem solving in the AI era. It combines three layers: a structured, open catalog of 7,010 AI-generated solutions to world issues; a municipal operating layer where cities track, plan, and report implementation progress; and a community flywheel — Watch, Build, Teach — that turns every solution into local action.',
      'This whitepaper covers the methodology, the taxonomy of 7,010 solutions across 12 categories, the municipal dashboard design, the karma incentive system, and the go-live status of the pilot cities — Detroit and St. Louis.',
    ],
  },
  {
    n: '02',
    icon: GitFork,
    title: 'Methodology',
    body: null,
    list: [
      'AI generation with human curation: solutions are AI-drafted in batches per category, deduplicated on (title, city), and ready for domain-expert review.',
      'Structured taxonomy: 12 categories — Education, Healthcare, Public Safety, Environment, Transportation, Economic Development, Housing, Digital Equity, Food Security, Youth, Aging, Arts & Culture.',
      'City-aware: every solution targets Detroit, St. Louis, or a national context, so pilots get relevant coverage immediately.',
      'In-depth content: each solution carries a full editorial description and a step-by-step build guide (budget, timeline, partners) for real implementation.',
      'Semantic search: natural-language queries find solutions by meaning, with a keyword fallback when no embedding provider is configured.',
    ],
  },
  {
    n: '03',
    icon: Layers,
    title: 'The Municipal Operating Layer',
    body: [
      'City officials get a live dashboard: which solutions are planned, in progress, or completed; what residents are reporting; and how the community is contributing. Transparency is built in — every status change is public, so residents can hold their city accountable.',
      'The karma system (Watch-Build-Teach) rewards residents who learn a solution, build it, or teach it to others — creating a self-reinforcing loop of local problem solving.',
    ],
  },
  {
    n: '04',
    icon: MapPin,
    title: 'Pilot Status',
    body: null,
    list: [
      'Catalog: 7,010 solutions seeded and live (Detroit 3,670 · St. Louis 3,179 · national 161).',
      'Browse + search: live with city and category filters, semantic-ready search, and per-solution build guides.',
      'Engagement: anonymous Watch-Build-Teach karma, feedback loop, and municipal dashboard are live.',
      'Open source: MIT-licensed; developers can extend the platform, add cities, and refine the catalog.',
    ],
  },
];

export default function WhitepaperPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-10">
        <span className="eyebrow">The blueprint</span>
        <h1 className="section-title mt-3 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          The 7,000 Solutions Whitepaper
        </h1>
        <p className="section-sub">
          How 7,000+ open, AI-generated solutions become real change in real cities — and how you
          can build on the platform today.
        </p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.n} className="card relative overflow-hidden">
            <div className="absolute -top-8 -right-3 text-8xl font-bold text-slate-100 select-none">
              {s.n}
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/25">
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">{s.title}</h2>
              </div>
              {s.body?.map((p, i) => (
                <p key={i} className="text-slate-600 leading-relaxed mb-3 last:mb-0">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="space-y-2.5">
                  {s.list.map((li, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                      <span className="mt-2 w-2 h-2 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0" />
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <WhitepaperDownload />
        <p className="text-xs text-slate-400 mt-3">
          Download the PDF version to share with your city team.
        </p>
      </div>
    </div>
  );
}
