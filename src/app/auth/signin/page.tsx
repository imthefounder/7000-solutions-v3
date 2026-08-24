'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Show ?error=CredentialsSignin from a full-page redirect after a failed post
  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get('error');
    if (e) setError('Invalid email or password. Please try again.');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Establish the Supabase browser session first (document.cookie based,
    //    survives the navigation below). RLS-backed client features
    //    (feedback, teaching, karma) depend on this cookie.
    try {
      const supabase = createClient();
      await supabase.auth.signInWithPassword({ email, password });
    } catch {
      // Ignore — the NextAuth form post below surfaces invalid credentials.
    }

    // 2. Classic full-page form post: the browser applies the NextAuth
    //    session cookie from the navigation response, then redirects to the
    //    dashboard. Most robust across browsers (no fetch-cookie edge cases).
    await signIn('supabase', {
      email,
      password,
      callbackUrl: '/dashboard',
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-500 mt-4">
          Need an account? Ask a city admin to create one.
        </p>
        <p className="text-xs text-center text-slate-400 mt-2">
          <Link href="/" className="hover:text-primary">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
