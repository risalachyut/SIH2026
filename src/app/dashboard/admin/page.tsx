'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, Award, TrendingUp, Loader2 } from 'lucide-react';

interface LearnerStats {
  totalEnrolled: number;
  totalCompleted: number;
  avgProgress: number;
}

interface Learner {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  stats: LearnerStats;
}

export default function AdminDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    async function fetchLearners() {
      if (!profile?.id || profile?.role !== 'admin') return;

      try {
        const res = await fetch(`/api/admin/learners?userId=${profile.id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        
        const { data } = await res.json();
        setLearners(data || []);
      } catch (err) {
        console.error('Error fetching learners:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && profile?.role === 'admin') {
      fetchLearners();
    }
  }, [profile, authLoading]);

  if (authLoading || (loading && profile?.role === 'admin')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="spinner" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  const totalLearners = learners.length;
  const totalEnrollments = learners.reduce((sum, l) => sum + l.stats.totalEnrolled, 0);
  const totalCompletions = learners.reduce((sum, l) => sum + l.stats.totalCompleted, 0);
  const platformAvgProgress = totalLearners > 0 
    ? Math.round(learners.reduce((sum, l) => sum + l.stats.avgProgress, 0) / totalLearners) 
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Overview of platform learners and their progress.
        </p>
      </div>

      <div className="page-content">
        <div className="grid-stats" style={{ marginBottom: '2rem' }}>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ background: 'rgba(47, 141, 70, 0.1)', color: 'var(--accent-indigo)' }}>
              <Users size={20} />
            </div>
            <div className="stat-value">{totalLearners}</div>
            <div className="stat-label">Total Learners</div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ background: 'rgba(47, 141, 70, 0.1)', color: 'var(--accent-indigo)' }}>
              <BookOpen size={20} />
            </div>
            <div className="stat-value">{totalEnrollments}</div>
            <div className="stat-label">Total Enrollments</div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ background: 'rgba(47, 141, 70, 0.1)', color: 'var(--accent-indigo)' }}>
              <Award size={20} />
            </div>
            <div className="stat-value">{totalCompletions}</div>
            <div className="stat-label">Course Completions</div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ background: 'rgba(47, 141, 70, 0.1)', color: 'var(--accent-indigo)' }}>
              <TrendingUp size={20} />
            </div>
            <div className="stat-value">{platformAvgProgress}%</div>
            <div className="stat-label">Platform Avg. Progress</div>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem' }}>Learner Progress</h3>
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Email</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Enrollments</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Completions</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Avg. Progress</th>
              </tr>
            </thead>
            <tbody>
              {learners.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No learners found.
                  </td>
                </tr>
              ) : (
                learners.map((learner) => (
                  <tr key={learner.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{learner.full_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{learner.email}</td>
                    <td style={{ padding: '1rem' }}>{learner.stats.totalEnrolled}</td>
                    <td style={{ padding: '1rem' }}>{learner.stats.totalCompleted}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="progress-bar" style={{ width: '60px', height: '4px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${learner.stats.avgProgress}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                          {learner.stats.avgProgress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
