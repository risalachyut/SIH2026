'use client';

import { useEffect, useState, use } from 'react';
import { CheckCircle2, XCircle, Award, Loader2, GraduationCap } from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    certificate_number: string;
    holder_name: string;
    course_title: string;
    course_category: string;
    issued_at: string;
  };
  error?: string;
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const response = await fetch(`/api/certificates/${id}/verify`);
        const data = await response.json();
        setResult(data);
      } catch {
        setResult({ valid: false, error: 'Verification service unavailable' });
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [id]);

  return (
    <div className="verify-page">
      <div className="glass-card-static verify-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-indigo)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Verifying certificate...</p>
          </div>
        ) : result?.valid ? (
          <>
            <div className="verify-badge verify-badge-valid">
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
              Certificate Verified ✓
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              This certificate is authentic and was issued by the NCCT Digital Platform.
            </p>

            <div
              style={{
                width: '100%',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.5rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Certificate Number
                  </div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9375rem' }}>
                    {result.certificate?.certificate_number}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Issued To
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    {result.certificate?.holder_name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Course
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    {result.certificate?.course_title}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Issued On
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    {result.certificate?.issued_at
                      ? new Date(result.certificate.issued_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: 'var(--accent-emerald)',
              }}
            >
              <Award size={16} />
              Issued by NCCT Digital Platform • Ministry of Cooperation
            </div>
          </>
        ) : (
          <>
            <div className="verify-badge verify-badge-invalid">
              <XCircle size={40} />
            </div>

            <h2 style={{ color: 'var(--accent-rose)', marginBottom: '0.5rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {result?.error || 'This certificate could not be verified. It may be invalid or expired.'}
            </p>
          </>
        )}

        {/* Platform branding */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}
        >
          <GraduationCap size={14} />
          NCCT Digital Platform — SIH 2026
        </div>
      </div>
    </div>
  );
}
