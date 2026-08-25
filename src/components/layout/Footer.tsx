import Link from 'next/link';
import { Lightbulb, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-white">7000 Solutions</span>
            <span className="text-sm">— AI-Powered Urban Solutions Platform</span>
          </div>
          <div className="flex gap-6 text-sm flex-wrap justify-center">
            <Link href="/browse" className="hover:text-white">Browse</Link>
            <Link href="/whitepaper" className="hover:text-white">Whitepaper</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/developers" className="hover:text-white">For Developers</Link>
          </div>
        </div>
        <div className="divider-glow my-6 opacity-40" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            Open source — <Github className="w-3.5 h-3.5" /> built with the community, for
            citizens and cities.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-secondary" /> for Detroit & St. Louis
          </p>
        </div>
      </div>
    </footer>
  );
}
