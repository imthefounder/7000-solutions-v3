'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lightbulb, LayoutDashboard, FileText, MapPin } from 'lucide-react';
import { getVisitorId } from '@/lib/anon';

const PILOT_CITIES = (process.env.NEXT_PUBLIC_PILOT_CITIES ?? 'Detroit,St. Louis')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [city, setCity] = useState<string>('all');

  // Ensure the anonymous visitor identity exists from the very first visit
  useEffect(() => {
    getVisitorId();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('city');
    if (c) setCity(c);
  }, [pathname]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCity(value);
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'all') params.set('city', value);
    else params.delete('city');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/60">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <Lightbulb className="w-6 h-6 text-primary" />
          7000 Solutions
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-primary transition-colors">Home</Link>
          <Link href="/browse" className="text-slate-600 hover:text-primary transition-colors">Browse</Link>
          <Link href="/whitepaper" className="text-slate-600 hover:text-primary transition-colors">Whitepaper</Link>
          <Link href="/dashboard" className="text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-500" />
            <select
              value={city}
              onChange={handleCityChange}
              className="bg-white/70 border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by city"
            >
              <option value="all" className="text-slate-900">All Cities</option>
              {PILOT_CITIES.map((c) => (
                <option key={c} value={c} className="text-slate-900">{c}</option>
              ))}
            </select>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-primary text-white hover:bg-opacity-90 rounded-md px-3 py-1.5 text-sm transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
