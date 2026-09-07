import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Try to find by ID first, then by certificate_number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let certificate: any;
    
    const { data: byId } = await supabase
      .from('certificates')
      .select('*, course:courses(title, category, difficulty), profile:profiles(full_name)')
      .eq('id', id)
      .single();

    if (byId) {
      certificate = byId;
    } else {
      const { data: byNumber } = await supabase
        .from('certificates')
        .select('*, course:courses(title, category, difficulty), profile:profiles(full_name)')
        .eq('certificate_number', id)
        .single();
      
      certificate = byNumber;
    }

    if (!certificate) {
      return NextResponse.json({ valid: false, error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        certificate_number: certificate.certificate_number,
        holder_name: (certificate as Record<string, unknown>).profile 
          ? ((certificate as Record<string, unknown>).profile as Record<string, unknown>).full_name 
          : 'Certificate Holder',
        course_title: (certificate as Record<string, unknown>).course 
          ? ((certificate as Record<string, unknown>).course as Record<string, unknown>).title 
          : 'Course',
        course_category: (certificate as Record<string, unknown>).course 
          ? ((certificate as Record<string, unknown>).course as Record<string, unknown>).category 
          : '',
        issued_at: certificate.issued_at,
      },
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
