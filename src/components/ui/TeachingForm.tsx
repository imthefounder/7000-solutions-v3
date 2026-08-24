'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { getVisitorId } from '@/lib/anon';

type TeachingFormProps = {
  solutionId: string;
};

export default function TeachingForm({ solutionId }: TeachingFormProps) {
  const { data: session } = useSession();
  const [studentEmail, setStudentEmail] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const teacherId = session?.user?.id ?? getVisitorId();
    if (!teacherId) {
      setSaving(false);
      setMessage({ ok: false, text: 'Could not create a visitor identity.' });
      return;
    }

    try {
      const res = await fetch('/api/teaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solution_id: solutionId,
          teacher_id: teacherId,
          student_email: studentEmail.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? 'Something went wrong. Please try again.' });
      } else {
        setStudentEmail('');
        setMessage({
          ok: true,
          text: `Teaching session recorded! You earned +5 karma (balance: ${data.karma_balance}).`,
        });
      }
    } catch {
      setMessage({ ok: false, text: 'Something went wrong. Please try again.' });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <GraduationCap className="w-5 h-5" /> Teach This Solution
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Taught someone this solution? Log it — earn <strong>+5 karma</strong> and help
        spread the solution.
      </p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Student Email
        </label>
        <input
          type="email"
          required
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          placeholder="student@example.com"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Recording…' : 'Log Teaching Session'}
      </button>
      {message && (
        <p
          className={`mt-3 flex items-center gap-2 text-sm ${
            message.ok ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> {message.text}
        </p>
      )}
    </form>
  );
}
