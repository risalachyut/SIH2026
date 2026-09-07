'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { CourseWithModules, Enrollment } from '@/types/database';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Award,
  Bot,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', id)
          .order('order_index');

        if (courseData) {
          setCourse({ ...courseData, modules: modulesData || [] });
          if (modulesData?.[0]) {
            setActiveModule(modulesData[0].id);
          }
        }

        if (user) {
          const { data: enrollmentData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .single();

          setEnrollment(enrollmentData);
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id, user]);

  const isModuleCompleted = (moduleId: string): boolean => {
    return enrollment?.completed_modules?.includes(moduleId) || false;
  };

  const completeModule = async (moduleId: string) => {
    if (!user || !enrollment || isModuleCompleted(moduleId)) return;

    setCompleting(true);
    const newCompleted = [...(enrollment.completed_modules || []), moduleId];
    const totalModules = course?.modules.length || 1;
    const newProgress = Math.round((newCompleted.length / totalModules) * 100);
    const isComplete = newProgress >= 100;

    await supabase
      .from('enrollments')
      .update({
        completed_modules: newCompleted,
        progress: newProgress,
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq('id', enrollment.id);

    setEnrollment({
      ...enrollment,
      completed_modules: newCompleted,
      progress: newProgress,
      completed_at: isComplete ? new Date().toISOString() : null,
    });

    setCompleting(false);
  };

  const generateCertificate = async () => {
    if (!user || !course) return;

    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, course_id: course.id }),
      });

      if (response.ok) {
        router.push('/dashboard/certificates');
      }
    } catch (err) {
      console.error('Failed to generate certificate:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="spinner" style={{ color: 'var(--accent-indigo)' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <h3>Course not found</h3>
        <Link href="/dashboard/courses" className="btn btn-secondary">
          Back to Courses
        </Link>
      </div>
    );
  }

  const activeModuleData = course.modules.find((m) => m.id === activeModule);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Link
          href="/dashboard/courses"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.375rem' }}>{course.title}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">{course.category.replace('_', ' ')}</span>
              <span className="badge badge-indigo">{course.difficulty}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <BookOpen size={14} /> {course.modules.length} modules
              </span>
            </div>
          </div>

          {enrollment && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                {enrollment.progress}% complete
              </div>
              <div className="progress-bar" style={{ width: '200px' }}>
                <div className="progress-bar-fill" style={{ width: `${enrollment.progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Module list sidebar */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Modules
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {course.modules.map((mod) => {
                const completed = isModuleCompleted(mod.id);
                const active = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`sidebar-link ${active ? 'active' : ''}`}
                    style={{ textAlign: 'left' }}
                  >
                    {completed ? (
                      <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    ) : (
                      <Circle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {mod.title}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        <Clock size={10} style={{ display: 'inline', verticalAlign: '-1px' }} /> {mod.duration_minutes} min
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI assistant shortcut */}
            <Link
              href="/dashboard/ai-chat"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <Bot size={14} /> Ask AI about this course
            </Link>

            {/* Certificate action */}
            {enrollment?.progress === 100 && !enrollment.completed_at && (
              <button
                className="btn btn-success btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={generateCertificate}
              >
                <Award size={14} /> Get Certificate
              </button>
            )}
          </div>

          {/* Module content */}
          <div className="glass-card-static" style={{ padding: '2rem', minHeight: '400px' }}>
            {activeModuleData ? (
              <>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{activeModuleData.title}</h2>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  <span><Clock size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> {activeModuleData.duration_minutes} minutes</span>
                  <span>Module {activeModuleData.order_index + 1} of {course.modules.length}</span>
                </div>

                <div style={{ lineHeight: 1.8, fontSize: '0.9375rem' }}>
                  <ReactMarkdown>{activeModuleData.content}</ReactMarkdown>
                </div>

                {/* Complete button */}
                {enrollment && !isModuleCompleted(activeModuleData.id) && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '2rem' }}
                    onClick={() => completeModule(activeModuleData.id)}
                    disabled={completing}
                  >
                    {completing ? (
                      <Loader2 size={16} className="spinner" />
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Mark as Complete
                      </>
                    )}
                  </button>
                )}

                {isModuleCompleted(activeModuleData.id) && (
                  <div
                    style={{
                      marginTop: '2rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--accent-emerald)',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={16} /> Module completed!
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>Select a module from the sidebar to start learning.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
