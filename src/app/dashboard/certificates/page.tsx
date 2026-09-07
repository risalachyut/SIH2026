'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CertificateWithCourse } from '@/types/database';
import { Award, Download, ExternalLink, Loader2, QrCode } from 'lucide-react';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const { data } = await supabase
          .from('certificates')
          .select('*, course:courses(title, category)')
          .order('issued_at', { ascending: false });

        setCertificates((data as unknown as CertificateWithCourse[]) || []);
      } catch (err) {
        console.error('Failed to fetch certificates:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  return (
    <div>
      <div className="page-header">
        <h1>
          <Award size={24} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '0.5rem' }} />
          My Certificates
        </h1>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={32} className="spinner" style={{ color: 'var(--accent-indigo)' }} />
          </div>
        ) : certificates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Award size={28} />
            </div>
            <h3>No certificates yet</h3>
            <p style={{ maxWidth: '400px' }}>
              Complete courses and make the required payment to earn verifiable digital certificates
              with QR codes.
            </p>
          </div>
        ) : (
          <div className="grid-certificates">
            {certificates.map((cert) => (
              <div key={cert.id} className="glass-card cert-card">
                {/* QR Code */}
                <div className="cert-card-qr">
                  <QrCode size={60} style={{ color: 'var(--bg-primary)' }} />
                </div>

                {/* Certificate Info */}
                <div style={{ width: '100%' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {cert.course?.title || 'Course Certificate'}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Certificate #{cert.certificate_number}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Issued: {new Date(cert.issued_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => window.open(`/api/certificates/${cert.id}/download`, '_blank')}
                  >
                    <Download size={14} /> Download
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() =>
                      window.open(`${appUrl}/verify/${cert.id}`, '_blank')
                    }
                  >
                    <ExternalLink size={14} /> Verify
                  </button>
                </div>

                <span className="badge badge-emerald">✓ Verified</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
