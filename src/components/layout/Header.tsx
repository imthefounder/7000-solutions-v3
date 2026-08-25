'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lightbulb, LayoutDashboard, MapPin, Code2, Menu, X } from 'lucide-react';
import { getVisitorId } from '@/lib/anon';

const PILOT_CITIES = (process.env.NEXT_PUBLIC_PILOT_CITIES ?? 'Detroit,St. Louis')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/whitepaper', label: 'Whitepaper' },
  { href: '/developers', label: 'Developers' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [city, setCity] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState(false);

  // Ensure the anonymous visitor identity exists from the very first visit
  useEffect(() => {
    getVisitorId();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('city');
    if (c) setCity(c);
  }, [pathname]);

  const handleCityChange = (value: string) => {
    setCity(value);
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'all') params.set('city', value);
    else params.delete('city');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/60">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg md:text-xl text-slate-900 group">
          <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
            <Lightbulb className="w-5 h-5 text-white" />
          </span>
          <span className="hidden sm:inline">7000 Solutions</span>
          <span className="sm:hidden">7000</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-primary bg-teal-50/80 font-semibold'
                    : 'text-slate-600 hover:text-primary hover:bg-white/60'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white/70 shadow-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <div className="flex gap-1" role="group" aria-label="Filter by city">
              <button
                onClick={() => handleCityChange('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  city === 'all'
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-white/80'
                }`}
              >
                All
              </button>
              {PILOT_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCityChange(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    city === c
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-primary hover:bg-white/80'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/developers"
            className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors text-sm"
            title="For developers"
          >
            <Code2 className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:opacity-90 rounded-lg px-3.5 py-2 text-sm font-medium transition-all shadow-md shadow-teal-500/25"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg glass text-slate-700 hover:text-primary transition-colors cursor-pointer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/60 bg-white/70 backdrop-blur-xl px-4 py-3 space-y-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'text-primary bg-teal-50 font-semibold' : 'text-slate-700 hover:bg-white/70 hover:text-primary'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => { handleCityChange('all'); setMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  city === 'all'
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white'
                    : 'bg-white/80 text-slate-600 hover:text-primary'
                }`}
              >
                All
              </button>
              {PILOT_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { handleCityChange(c); setMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    city === c
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white'
                      : 'bg-white/80 text-slate-600 hover:text-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 mt-2 bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-lg px-3.5 py-2.5 text-sm font-medium"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
