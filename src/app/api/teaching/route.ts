import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Teaching session logging (Watch-Build-Teach): +5 karma to the teacher.
// Works for signed-in users and anonymous visitors (prototype mode).
export async function POST(request: Request) {
  let body: { solution_id?: string; student_email?: string; teacher_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { solution_id, student_email } = body;
  if (!solution_id || !student_email || typeof student_email !== 'string') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const email = student_email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid student email' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  let teacherId = session?.user?.id ?? null;

  if (!teacherId) {
    const anon = body.teacher_id ?? '';
    if (!UUID_RE.test(anon)) {
      return NextResponse.json({ error: 'Missing teacher identity' }, { status: 401 });
    }
    teacherId = anon.toLowerCase();
  }

  const supabase = createServiceRoleClient();

  // Teacher profile (anonymous visitors get one created)
  const { error: teacherProfileError } = await supabase.rpc('ensure_anonymous_profile', {
    anon_id: teacherId,
  });
  if (teacherProfileError) {
    return NextResponse.json({ error: teacherProfileError.message }, { status: 500 });
  }

  // Student profile: look up or create
  const { data: student, error: studentError } = await supabase.rpc(
    'find_or_create_profile_by_email',
    { target_email: email }
  );
  if (studentError || !student || student.length === 0) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  if (student[0].id === teacherId) {
    return NextResponse.json({ error: 'You cannot teach yourself' }, { status: 400 });
  }

  // Record the teaching event
  const { error: insertError } = await supabase.from('teaching_events').insert({
    teacher_id: teacherId,
    student_id: student[0].id,
    solution_id,
    verified: false,
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Award +5 karma
  const { error: karmaError } = await supabase.rpc('add_karma', {
    target_user_id: teacherId,
    amount: 5,
    reason: 'Taught a solution to a student',
  });
  if (karmaError) {
    return NextResponse.json({ error: karmaError.message }, { status: 500 });
  }

  // Return the updated balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('karma_balance')
    .eq('id', teacherId)
    .maybeSingle();

  const res = NextResponse.json({
    ok: true,
    karma_balance: profile?.karma_balance ?? 5,
  });
  if (!session && body.teacher_id) {
    res.cookies.set('visitor_id', teacherId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return res;
}
