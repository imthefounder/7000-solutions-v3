'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Client-side auth guard wrapper. Pages that need protection render this
// around their content; unauthenticated users are redirected to sign-in.
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-500">Loading…</div>;
  }

  if (!session) return null;

  return <>{children}</>;
}
