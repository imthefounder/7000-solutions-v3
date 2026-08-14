import { FileText, Download } from 'lucide-react';
import WhitepaperDownload from '@/components/ui/WhitepaperDownload';

export default function WhitepaperPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">The 7,000 Solutions Whitepaper</h1>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-3">Executive Summary</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          The 7,000 Solutions Platform is a blueprint for city-scale problem solving in the
          AI era. It combines three layers: a massive, structured catalog of AI-generated
          solutions to world issues; a municipal operating layer where cities track, plan,
          and report implementation progress; and a community flywheel (Watch-Build-Teach)
          that turns every solution into local action.
        </p>
        <p className="text-slate-600 leading-relaxed">
          This whitepaper covers the methodology, the taxonomy of 7,000 solutions, the
          municipal dashboard design, the karma incentive system, and the go-live roadmap
          for pilot cities — beginning with Detroit and St. Louis.
        </p>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-3">Methodology</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li><strong>AI generation with human curation:</strong> solutions are AI-drafted, then reviewed and refined by domain experts.</li>
          <li><strong>Structured taxonomy:</strong> 20+ categories from Education to Digital Equity, each with measurable impact criteria.</li>
          <li><strong>Impact scoring:</strong> every solution is scored on feasibility, cost, and expected community impact.</li>
          <li><strong>Semantic search:</strong> natural-language queries find solutions by meaning, not just keywords.</li>
          <li><strong>Location-aware:</strong> solutions can be pinned to specific neighborhoods and cities.</li>
        </ul>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-3">The Municipal Operating Layer</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          City officials get a live dashboard: which solutions are planned, in progress, or
          completed; which neighborhoods are covered; and how community members are
          contributing. Transparency is built in — every status change is public, so
          residents can hold their city accountable.
        </p>
        <p className="text-slate-600 leading-relaxed">
          The karma system (Watch-Build-Teach) rewards residents who learn a solution,
          implement it, or teach it to others — creating a self-reinforcing loop of local
          problem solving.
        </p>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-3">Pilot Roadmap</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-600">
          <li><strong>Phase 1 (Weeks 1–4):</strong> Seed the database with 1,000 priority solutions; onboard city staff.</li>
          <li><strong>Phase 2 (Weeks 5–8):</strong> Launch the public browse experience; open feedback and tracking.</li>
          <li><strong>Phase 3 (Weeks 9–12):</strong> Enable Watch-Build-Teach with karma; publish the first city progress reports.</li>
          <li><strong>Phase 4 (Months 4–6):</strong> Expand to all 7,000 solutions; onboard additional pilot cities.</li>
        </ol>
      </div>

      <div className="text-center">
        <WhitepaperDownload />
      </div>
    </div>
  );
}
