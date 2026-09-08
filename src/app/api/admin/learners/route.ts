import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Verify the requesting user is an admin
    const { data: adminProfile, error: adminError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (adminError || adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all learners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: learners, error: learnersError }: { data: any, error: any } = await adminClient
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .eq('role', 'learner')
      .order('created_at', { ascending: false });

    if (learnersError) {
      throw learnersError;
    }

    // Fetch enrollments for these learners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: enrollments, error: enrollmentsError }: { data: any, error: any } = await adminClient
      .from('enrollments')
      .select('user_id, progress, completed_at, course_id');

    if (enrollmentsError) {
      throw enrollmentsError;
    }

    // Calculate progress for each learner
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const learnersWithProgress = learners.map((learner: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userEnrollments = enrollments.filter((e: any) => e.user_id === learner.id);
      const totalEnrolled = userEnrollments.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalCompleted = userEnrollments.filter((e: any) => e.completed_at).length;
      const avgProgress = totalEnrolled > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? Math.round(userEnrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / totalEnrolled)
        : 0;

      return {
        ...learner,
        stats: {
          totalEnrolled,
          totalCompleted,
          avgProgress,
        }
      };
    });

    return NextResponse.json({ data: learnersWithProgress });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Admin fetch error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
