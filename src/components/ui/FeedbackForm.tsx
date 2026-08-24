'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2 } from 'lucide-react';
import { getVisitorId } from '@/lib/anon';

type FeedbackFormProps = {
  solutionId: string;
};

export default function FeedbackForm({ solutionId }: FeedbackFormProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'completed'>('planned');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const userId = session?.user?.id ?? getVisitorId();
    if (!userId) {
      setSaving(false);
      return;
    }

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solution_id: solutionId,
        user_id: userId,
        status,
        notes: notes || null,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="font-semibold text-lg mb-4">Track This Solution</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What's happening with this solution in your city?"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save Progress'}
      </button>
      {submitted && (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="w-4 h-4" /> Saved successfully!
        </p>
      )}
    </form>
  );
}
