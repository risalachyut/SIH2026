'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Bot,
  Clock,
  Star,
} from 'lucide-react';

interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
  averageProgress: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (profile?.role === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [profile, router]);
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    averageProgress: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: enrollments }: { data: any } = await supabase
          .from('enrollments')
          .select('progress, completed_at, updated_at, course:courses(title)');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: certs }: { data: any } = await supabase
          .from('certificates')
          .select('id, issued_at, course:courses(title)');

        if (enrollments) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const completed = enrollments.filter((e: any) => e.completed_at).length;
          const avgProgress = enrollments.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? Math.round(enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length)
            : 0;

          setStats({
            enrolledCourses: enrollments.length,
            completedCourses: completed,
            certificates: certs?.length || 0,
            averageProgress: avgProgress,
          });

          const activities = [];
          
          enrollments.forEach((e: any) => {
            if (e.progress > 0 && !e.completed_at) {
              activities.push({
                type: 'enrollment',
                title: `Continued learning: ${e.course?.title}`,
                date: new Date(e.updated_at),
                icon: <BookOpen size={16} />,
                colorClass: 'var(--accent-indigo)',
                bgClass: 'rgba(47, 141, 70, 0.1)'
              });
            } else if (e.progress === 0) {
              activities.push({
                type: 'enrollment',
                title: `Started course: ${e.course?.title}`,
                date: new Date(e.updated_at),
                icon: <BookOpen size={16} />,
                colorClass: 'var(--accent-indigo)',
                bgClass: 'rgba(47, 141, 70, 0.1)'
              });
            }
          });

          if (certs) {
            certs.forEach((c: any) => {
              activities.push({
                type: 'certificate',
                title: `Earned certificate: ${c.course?.title}`,
                date: new Date(c.issued_at),
                icon: <Award size={16} />,
                colorClass: 'var(--accent-emerald)',
                bgClass: 'rgba(34, 197, 94, 0.1)'
              });
            });
          }

          // Sort descending by date
          activities.sort((a, b) => b.date.getTime() - a.date.getTime());
          setRecentActivity(activities.slice(0, 5)); // Keep top 5
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Enrolled Courses',
      value: stats.enrolledCourses,
      icon: <BookOpen size={20} />,
      color: 'var(--accent-indigo)',
      bg: 'rgba(99, 102, 241, 0.12)',
    },
    {
      label: 'Completed',
      value: stats.completedCourses,
      icon: <Star size={20} />,
      color: 'var(--accent-emerald)',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      label: 'Certificates',
      value: stats.certificates,
      icon: <Award size={20} />,
      color: 'var(--accent-amber)',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      label: 'Avg. Progress',
      value: `${stats.averageProgress}%`,
      icon: <TrendingUp size={20} />,
      color: 'var(--accent-violet)',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
  ];

  const quickActions = [
    {
      title: 'Browse Courses',
      description: 'Explore cooperative training programs',
      href: '/dashboard/courses',
      icon: <BookOpen size={22} />,
      color: 'var(--accent-indigo)',
    },
    {
      title: 'AI Assistant',
      description: 'Ask questions about cooperatives',
      href: '/dashboard/ai-chat',
      icon: <Bot size={22} />,
      color: 'var(--accent-violet)',
    },
    {
      title: 'My Certificates',
      description: 'View and download your certificates',
      href: '/dashboard/certificates',
      icon: <Award size={22} />,
      color: 'var(--accent-emerald)',
    },
    {
      title: 'Job Board',
      description: 'Find employment opportunities',
      href: '/dashboard/jobs',
      icon: <Briefcase size={22} />,
      color: 'var(--accent-amber)',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <span className={`badge badge-${profile?.role === 'admin' ? 'indigo' : 'emerald'}`}>
            {profile?.role || 'learner'}
          </span>
        </div>
      </div>

      <div className="page-content">
        {/* Stats Grid */}
        <div className="grid-stats" style={{ marginBottom: '2rem' }}>
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card stat-card">
              <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              {loading ? (
                <div className="skeleton" style={{ height: '2rem', width: '3rem' }} />
              ) : (
                <div className="stat-value">{stat.value}</div>
              )}
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Quick Actions</h3>
        <div className="grid-stats" style={{ marginBottom: '2rem' }}>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
              <div
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: `${action.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {action.description}
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Recent Activity</h3>
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          {loading ? (
            <div className="skeleton" style={{ height: '4rem', width: '100%', marginBottom: '1rem' }} />
          ) : recentActivity.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent activity. Start your first course!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((activity, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '0.5rem', background: activity.bgClass, color: activity.colorClass, borderRadius: '50%' }}>
                    {activity.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{activity.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {activity.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Platform Info */}
        <div
          className="glass-card-static"
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
          }}
        >
          <h4 style={{ marginBottom: '0.5rem' }}>🎯 About NCCT Digital Platform</h4>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
            This platform is part of the Smart India Hackathon 2026 (PS 26087) — built for the
            Ministry of Cooperation. It provides AI-powered capacity building, verifiable
            certificates, and smart employment matching for India&apos;s cooperative sector.
          </p>
        </div>
      </div>
    </div>
  );
}
