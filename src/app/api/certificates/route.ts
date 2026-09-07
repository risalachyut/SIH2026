import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { user_id, course_id } = await request.json();

    if (!user_id || !course_id) {
      return NextResponse.json(
        { error: 'user_id and course_id are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if course is completed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: enrollment }: { data: any } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment || enrollment.progress < 100) {
      return NextResponse.json(
        { error: 'Course must be completed before generating a certificate' },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingCert }: { data: any } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (existingCert) {
      return NextResponse.json({ certificate: existingCert });
    }

    // Create mock payment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: payment }: { data: any } = await supabase
      .from('payments')
      .insert({
        user_id,
        course_id,
        amount: 0, // Free for MVP
        status: 'completed',
        payment_method: 'mock',
        reference_id: `PAY-${Date.now()}`,
      })
      .select()
      .single();

    // Generate certificate
    const certNumber = `NCCT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ncct-platform.vercel.app';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: certificate, error }: { data: any; error: any } = await supabase
      .from('certificates')
      .insert({
        user_id,
        course_id,
        certificate_number: certNumber,
        qr_code_url: `${appUrl}/verify/${certNumber}`,
        pdf_url: null, // Generated on-demand
        payment_id: payment?.id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // This would list certificates for the authenticated user
  // For MVP, the client-side queries Supabase directly
  return NextResponse.json({ message: 'Use client-side Supabase for listing certificates' });
}
