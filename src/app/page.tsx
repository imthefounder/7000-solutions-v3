import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Eye,
  Hammer,
  GraduationCap,
  Sparkles,
  Github,
  GraduationCap as EduIcon,
  HeartPulse,
  Shield,
  Leaf,
  Bus,
  Briefcase,
  Home as HomeIcon,
  Wifi,
  Sprout,
  Rocket,
  Users,
  Palette,
  BookOpen,
} from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import SolutionCard from '@/components/ui/SolutionCard';

export const dynamic = 'force-dynamic';

const CATEGORY_META: { name: string; icon: React.ElementType; grad: string }[] = [
  { name: 'Education', icon: EduIcon, grad: 'from-teal-600 to-cyan-500' },
  { name: 'Healthcare', icon: HeartPulse, grad: 'from-teal-500 to-emerald-500' },
  { name: 'Public Safety', icon: Shield, grad: 'from-cyan-600 to-sky-500' },
  { name: 'Environment', icon: Leaf, grad: 'from-emerald-600 to-teal-500' },
  { name: 'Transportation', icon: Bus, grad: 'from-sky-600 to-cyan-500' },
  { name: 'Economic Development', icon: Briefcase, grad: 'from-teal-700 to-teal-500' },
  { name: 'Housing', icon: HomeIcon, grad: 'from-cyan-700 to-teal-500' },
  { name: 'Digital Equity', icon: Wifi, grad: 'from-sky-500 to-cyan-400' },
  { name: 'Food Security', icon: Sprout, grad: 'from-emerald-500 to-teal-400' },
  { name: 'Youth', icon: Rocket, grad: 'from-cyan-500 to-teal-400' },
  { name: 'Aging', icon: Users, grad: 'from-teal-500 to-cyan-600' },
  { name: 'Arts & Culture', icon: Palette, grad: 'from-cyan-500 to-sky-400' },
];

async function getData() {
  const supabase = createServerSupabase();

  const [{ count }, { data: featured }, { data: cats }] = await Promise.all([
    supabase.from('solutions').select('id', { count: 'exact', head: true }),
    supabase.from('solutions').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('solutions').select('category').limit(20000),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const row of cats ?? []) {
    categoryCounts.set(row.category, (categoryCounts.get(row.category) ?? 0) + 1);
  }

  return { total: count ?? 0, featured: featured ?? [], categoryCounts };
}

export default async function HomePage() {
  const { total, featured, categoryCounts } = await getData();

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden mesh-bg">
        {/* ambient orbs */}
        <div className="orb w-96 h-96 bg-teal-400/40 -top-24 right-[8%]" />
        <div className="orb w-72 h-72 bg-sky-400/30 top-40 -left-24" style={{ animationDelay: '-6s' }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          {/* Copy */}
          <div>
            <span className="badge badge-teal mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Open-source · Detroit & St. Louis pilots
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              {total.toLocaleString()} AI-Powered{' '}
              <span className="text-gradient">Solutions</span> to World Issues
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Explore 7,000+ actionable solutions across 12 categories — each with an in-depth
              write-up, a step-by-step build guide, and a community ready to watch, build, and teach.
            </p>

            {/* Search — plain GET form, no JS needed */}
            <form action="/browse" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  name="q"
                  placeholder="Try “How do we fix food deserts?”"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-strong text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60"
                />
              </div>
              <button type="submit" className="btn-gradient shrink-0">
                Search solutions
              </button>
            </form>

            {/* Real stats */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
              {[
                { v: total.toLocaleString(), l: 'Solutions' },
                { v: '12', l: 'Categories' },
                { v: '2', l: 'Pilot cities' },
                { v: '3', l: 'Ways to engage' },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl px-4 py-3 bg-slate-900/85 backdrop-blur-md border border-white/10 shadow-lg shadow-slate-900/15">
                  <div className="text-2xl font-bold text-white">{s.v}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Memorable moment: floating glass solution cards */}
          <div className="relative hidden lg:block h-[520px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 rounded-full bg-gradient-to-br from-teal-500/25 to-sky-400/25 blur-2xl" />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-teal-500/15" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-teal-500/10" />

            {featured.slice(0, 3).map((s, i) => (
              <Link
                key={s.id}
                href={`/solution/${s.id}`}
                className={`absolute glass rounded-2xl p-4 w-64 shadow-2xl float-slow group/link cursor-pointer hover:shadow-teal-900/20 ${
                  i === 0 ? 'top-8 left-8' : i === 1 ? 'top-[42%] right-0' : 'bottom-4 left-6'
                }`}
                style={{ animationDelay: `${i * -2}s` }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {s.category}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 -translate-x-1 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100" />
                </div>
                <div className="font-semibold text-sm leading-snug line-clamp-2 group-hover/link:text-primary transition-colors">
                  {s.title}
                </div>
                <div className="text-xs text-slate-500 mt-1.5 line-clamp-2">{s.description}</div>
                <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-medium text-teal-700">
                  <BookOpen className="w-3 h-3" /> Step-by-step guide
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="eyebrow">The flywheel</span>
          <h2 className="section-title mt-3">Watch. Build. Teach.</h2>
          <p className="section-sub mx-auto">
            The community loop that turns 7,000+ written solutions into real change in real cities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              n: '01',
              icon: Eye,
              title: 'Watch',
              body: 'Browse 7,000+ solutions across 12 categories and find the ones your neighborhood actually needs.',
            },
            {
              n: '02',
              icon: Hammer,
              title: 'Build',
              body: 'Follow the step-by-step build guide — budget, timeline, and partners included. Track progress on your dashboard.',
            },
            {
              n: '03',
              icon: GraduationCap,
              title: 'Teach',
              body: 'Log a teaching session when you show someone the solution. Earn +5 karma for spreading the impact.',
            },
          ].map((s) => (
            <div key={s.n} className="card relative overflow-hidden group">
              <div className="absolute -top-6 -right-2 text-7xl font-bold text-slate-100 group-hover:text-teal-50 transition-colors">
                {s.n}
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25 mb-4">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="eyebrow">Fresh from the catalog</span>
            <h2 className="section-title mt-3">Featured Solutions</h2>
          </div>
          <Link href="/browse" className="btn-ghost shrink-0 hidden sm:inline-flex">
            View all <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((s) => (
            <SolutionCard key={s.id} solution={s} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/browse" className="btn-ghost inline-flex">
            View all <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <div className="mb-8">
          <span className="eyebrow">Find your lane</span>
          <h2 className="section-title mt-3">Explore by Category</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORY_META.map((c) => {
            const count = categoryCounts.get(c.name) ?? 0;
            return (
              <Link
                key={c.name}
                href={`/browse?category=${encodeURIComponent(c.name)}`}
                className="card group flex items-center gap-4 !py-5 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110`}
                >
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold group-hover:text-primary transition-colors">{c.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {count > 0 ? `${count.toLocaleString()} solutions` : 'View solutions'}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= OPEN SOURCE CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 md:px-14 text-center">
          <div className="orb w-80 h-80 bg-teal-500/20 -top-20 -right-16" />
          <div className="orb w-64 h-64 bg-sky-500/15 -bottom-24 -left-10" style={{ animationDelay: '-8s' }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Built in the open. <span className="text-gradient">Built with you.</span>
            </h2>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
              This platform is MIT-licensed. Developers extend it, citizens use it, cities run it.
              Read the docs, pick an issue, ship a solution.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/developers" className="btn-gradient">
                For developers <ArrowRight className="w-4 h-4 ml-1.5 inline" />
              </Link>
              <Link
                href="https://github.com/imthefounder/7000-solutions-v3"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !text-slate-200 !border-white/15 !bg-white/5 hover:!bg-white/10 hover:!text-white"
              >
                <Github className="w-4 h-4 mr-1.5 inline" /> GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
