'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';
import { Award } from 'lucide-react';

export default function KarmaDisplay() {
  const { data: session } = useSession();
  const supabase = createClient();
  const [karma, setKarma] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    supabase
      .from('profiles')
      .select('karma_balance')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setKarma(data.karma_balance ?? 0);
      });
  }, [session?.user?.id, supabase]);

  if (!session) return null;

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
