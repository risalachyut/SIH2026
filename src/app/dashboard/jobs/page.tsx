'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { JobWithApplication } from '@/types/database';
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Loader2,
  CheckCircle2,
  Send,
  DollarSign,
} from 'lucide-react';

const JOB_TYPE_COLORS: Record<string, string> = {
  'full-time': 'badge-indigo',
  'part-time': 'badge-amber',
  contract: 'badge-blue',
  internship: 'badge-emerald',
};

export default function JobsPage() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplication[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        let query = supabase
          .from('jobs')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: jobsData }: { data: any } = await query;

        if (jobsData && user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: applications }: { data: any } = await supabase
            .from('job_applications')
            .select('*')
            .eq('user_id', user.id);

          const enriched: JobWithApplication[] = jobsData.map((job: any) => ({
            ...job,
            application: applications?.find((a: any) => a.job_id === job.id) || null,
          }));

          setJobs(enriched);
        } else {
          setJobs((jobsData as unknown as JobWithApplication[]) || []);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [search, user]);

  const handleApply = async (jobId: string) => {
    if (!user) return;

    await supabase.from('job_applications').insert({
      job_id: jobId,
      user_id: user.id,
      status: 'applied',
    });

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              application: {
                id: '',
                job_id: jobId,
                user_id: user.id,
                cover_letter: null,
                status: 'applied' as const,
                created_at: new Date().toISOString(),
              },
            }
          : j
      )
    );
  };

  // Compute skill match score
  const getSkillMatch = (requiredSkills: string[]): number => {
    if (!profile?.skills?.length || !requiredSkills?.length) return 0;
    const userSkills = new Set(profile.skills.map((s) => s.toLowerCase()));
    const matched = requiredSkills.filter((s) => userSkills.has(s.toLowerCase()));
    return Math.round((matched.length / requiredSkills.length) * 100);
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1>
            <Briefcase size={24} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '0.5rem' }} />
            Job Board
          </h1>
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
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '220px' }}
            />
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={32} className="spinner" style={{ color: 'var(--accent-indigo)' }} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Briefcase size={28} />
            </div>
            <h3>No jobs available</h3>
            <p style={{ maxWidth: '400px' }}>
              Job listings from cooperatives will appear here. Check back soon or adjust your search.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map((job) => {
              const matchScore = getSkillMatch(job.skills_required);
              return (
                <div key={job.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.0625rem' }}>{job.title}</h4>
                        <span className={`badge ${JOB_TYPE_COLORS[job.job_type]}`}>
                          {job.job_type}
                        </span>
                        {matchScore > 0 && (
                          <span className="badge badge-emerald">
                            {matchScore}% match
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {job.description?.slice(0, 200)}
                        {(job.description?.length || 0) > 200 ? '...' : ''}
                      </p>

                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {job.cooperative_name && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Briefcase size={13} /> {job.cooperative_name}
                          </span>
                        )}
                        {job.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={13} /> {job.location}
                          </span>
                        )}
                        {job.salary_range && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <DollarSign size={13} /> {job.salary_range}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} />{' '}
                          {new Date(job.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      {/* Skill tags */}
                      {job.skills_required?.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                          {job.skills_required.map((skill) => (
                            <span
                              key={skill}
                              style={{
                                padding: '0.15rem 0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {job.application ? (
                        <span className="badge badge-emerald" style={{ padding: '0.5rem 1rem' }}>
                          <CheckCircle2 size={14} /> Applied
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApply(job.id)}
                        >
                          <Send size={14} /> Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
