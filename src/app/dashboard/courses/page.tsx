'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import type { CourseWithEnrollment } from '@/types/database';
import {
  BookOpen,
  Search,
  Clock,
  BarChart3,
  ChevronRight,
  Filter,
  Loader2,
  GraduationCap,
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'cooperative_law', label: 'Cooperative Law' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'management', label: 'Management' },
  { value: 'skills', label: 'Skills' },
  { value: 'technology', label: 'Technology' },
  { value: 'general', label: 'General' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'badge-emerald',
  intermediate: 'badge-amber',
  advanced: 'badge-rose',
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        let query = supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: coursesData }: { data: any } = await query;

        if (coursesData && user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: enrollments }: { data: any } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id);

          const enriched: CourseWithEnrollment[] = coursesData.map((course: any) => ({
            ...course,
            enrollment: enrollments?.find((e: any) => e.course_id === course.id) || null,
          }));

          setCourses(enriched);
        } else {
          setCourses((coursesData as CourseWithEnrollment[]) || []);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [search, category, user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;

    await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
      progress: 0,
      completed_modules: [],
    });

    // Refresh
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              enrollment: {
                id: '',
                user_id: user.id,
                course_id: courseId,
                progress: 0,
                completed_modules: [],
                completed_at: null,
                created_at: new Date().toISOString(),
              },
            }
          : c
      )
    );
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1>
            <BookOpen size={24} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '0.5rem' }} />
            Course Catalog
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                className="input"
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', width: '220px' }}
              />
            </div>
            {/* Category */}
            <div style={{ position: 'relative' }}>
              <Filter
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ paddingLeft: '2.25rem', appearance: 'none', cursor: 'pointer', minWidth: '160px' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={32} className="spinner" style={{ color: 'var(--accent-indigo)' }} />
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <GraduationCap size={28} />
            </div>
            <h3>No courses found</h3>
            <p style={{ maxWidth: '400px' }}>
              {search || category
                ? 'Try adjusting your search or filter.'
                : 'Courses will appear here once an admin publishes them. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid-courses">
            {courses.map((course) => (
              <div key={course.id} className="glass-card course-card">
                <div className="course-card-thumbnail">
                  <BookOpen size={40} style={{ color: 'var(--accent-indigo)', opacity: 0.6, position: 'relative', zIndex: 1 }} />
                </div>
                <div className="course-card-body">
                  <div className="course-card-meta">
                    <span className={`badge ${DIFFICULTY_COLORS[course.difficulty]}`}>
                      {course.difficulty}
                    </span>
                    <span className="badge badge-blue">{course.category.replace('_', ' ')}</span>
                  </div>
                  <h4 className="course-card-title">{course.title}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flex: 1 }}>
                    {course.description?.slice(0, 120)}
                    {(course.description?.length || 0) > 120 ? '...' : ''}
                  </p>

                  {course.enrollment ? (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8125rem',
                          marginBottom: '0.375rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span style={{ color: 'var(--accent-indigo-light)', fontWeight: 600 }}>
                          {course.enrollment.progress}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${course.enrollment.progress}%` }}
                        />
                      </div>
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', marginTop: '0.75rem' }}
                      >
                        Continue Learning <ChevronRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {course.price > 0 && (
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          ₹{course.price}
                        </span>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleEnroll(course.id)}
                      >
                        {course.price > 0 ? 'Enroll Now' : 'Start Free'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
