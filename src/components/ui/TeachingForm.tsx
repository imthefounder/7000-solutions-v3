'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

type TeachingFormProps = {
  solutionId: string;
};

export default function TeachingForm({ solutionId }: TeachingFormProps) {
  const { data: session } = useSession();
  const supabase = createClient();
  const [studentEmail, setStudentEmail] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSaving(true);
    setMessage(null);

    try {
      // Look up the student by email (SECURITY DEFINER function in Supabase)
      const { data: student, error: lookupError } = await supabase.rpc(
        'find_profile_by_email',
        { target_email: studentEmail.trim() }
      );

      if (lookupError || !student || student.length === 0) {
        setMessage({ ok: false, text: 'Student not found. They need to create an account first.' });
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase.from('teaching_events').insert({
        teacher_id: session.user.id,
        student_id: student[0].id,
        solution_id: solutionId,
        verified: false,
      });

      if (insertError) {
        setMessage({ ok: false, text: insertError.message });
      } else {
        // Award karma to the teacher (+5) via the add_karma RPC
        await supabase.rpc('add_karma', {
          target_user_id: session.user.id,
          amount: 5,
          reason: 'Taught a solution to a student',
        });
        setStudentEmail('');
        setMessage({
          ok: true,
          text: 'Teaching session recorded! You earned +5 karma.',
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
      {!session ? (
        <p className="text-sm text-slate-500">
          Sign in to log a teaching session and earn karma.
        </p>
      ) : (
        <>
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
        </>
      )}
    </form>
  );
}
