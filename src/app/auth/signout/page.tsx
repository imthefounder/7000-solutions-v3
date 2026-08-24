'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear the Supabase session cookies too, not just NextAuth.
    try {
      createClient().auth.signOut();
    } catch {
      // Non-fatal
    }
    signOut({ redirect: false }).then(() => {
      router.push('/');
      router.refresh();
    });
  }, [router]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-slate-500">Signing you out…</p>
    </div>
  );
}
