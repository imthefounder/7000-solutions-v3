import Link from 'next/link';
import { Lightbulb } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-secondary" />
          <span className="font-semibold text-white">7000 Solutions</span>
          <span className="text-sm">— AI-Powered Urban Solutions Platform</span>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/browse" className="hover:text-white">Browse</Link>
          <Link href="/whitepaper" className="hover:text-white">Whitepaper</Link>
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
