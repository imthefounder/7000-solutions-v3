'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lightbulb, LayoutDashboard, FileText, LogOut, MapPin } from 'lucide-react';

const PILOT_CITIES = (process.env.NEXT_PUBLIC_PILOT_CITIES ?? 'Detroit,St. Louis')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [city, setCity] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('city');
    if (c) setCity(c);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCity(value);
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'all') params.set('city', value);
    else params.delete('city');
    router.push(`${pathname}?${params.toString()}`);
    setMenuOpen(false);
  };

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Lightbulb className="w-6 h-6" />
          7000 Solutions
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:opacity-80">Home</Link>
          <Link href="/browse" className="hover:opacity-80">Browse</Link>
          <Link href="/whitepaper" className="hover:opacity-80">Whitepaper</Link>
          {session && (
            <Link href="/dashboard" className="hover:opacity-80">Dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-3" ref={menuRef}>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <select
              value={city}
              onChange={handleCityChange}
              className="bg-white/10 border border-white/20 rounded-md px-2 py-1 text-sm focus:outline-none"
              aria-label="Filter by city"
            >
              <option value="all" className="text-slate-900">All Cities</option>
              {PILOT_CITIES.map((c) => (
                <option key={c} value={c} className="text-slate-900">{c}</option>
              ))}
            </select>
          </div>

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-md px-3 py-1.5 text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{session.user?.email}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-slate-900 rounded-lg shadow-xl py-2 z-50">
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link
                    href="/whitepaper"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
                  >
                    <FileText className="w-4 h-4" /> Whitepaper
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/signin" className="bg-white text-primary px-4 py-1.5 rounded-md text-sm font-medium hover:bg-slate-100">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
