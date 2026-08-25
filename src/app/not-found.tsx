import Link from 'next/link';
import { Lightbulb, Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="card !py-16">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-bold mb-2">404</h1>
        <p className="text-slate-500 mb-2">
          This page hasn&apos;t been solved yet.
        </p>
        <p className="text-sm text-slate-400 mb-8">
          …but the other 7,000+ solutions are right where you left them.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/browse" className="btn-gradient inline-flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Browse Solutions
          </Link>
          <Link href="/" className="btn-ghost inline-flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
