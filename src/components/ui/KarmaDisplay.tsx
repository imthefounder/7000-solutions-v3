'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Award } from 'lucide-react';
import { getVisitorId } from '@/lib/anon';

export default function KarmaDisplay() {
  const { data: session } = useSession();
  const [karma, setKarma] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const userId = session?.user?.id ?? getVisitorId();
    if (!userId) {
      setKarma(0);
      return;
    }

    fetch(`/api/karma?user_id=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setKarma(d.karma_balance ?? 0);
      })
      .catch(() => {
        if (!cancelled) setKarma(0);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return (
    <div className="card flex items-center gap-3">
      <Award className="w-8 h-8 text-amber-500" />
      <div>
        <p className="font-semibold">Karma Balance</p>
        <p className="text-2xl font-bold text-primary">{karma ?? '—'} points</p>
        <p className="text-xs text-slate-500">
          Earn karma by teaching solutions and contributing to your city.
        </p>
      </div>
    </div>
  );
}
