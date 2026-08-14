'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
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
