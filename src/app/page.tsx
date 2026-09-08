'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Bot,
  Award,
  Briefcase,
  ArrowRight,
  Shield,
  Wifi,
  WifiOff,
  Sparkles,
  BookOpen,
  Users,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="landing-hero">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div
            className="badge badge-indigo"
            style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
          >
            <Sparkles size={12} />
            Smart India Hackathon 2026 — PS 26087
          </div>

          <h1 className="landing-title">
            AI-Powered Cooperative Capacity Building
          </h1>

          <p className="landing-subtitle">
            Empowering India&apos;s cooperative sector with intelligent training,
            AI-assisted learning, verifiable certificates, and smart employment
            matching — built to work seamlessly, even offline.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary btn-lg">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Learn More
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              justifyContent: 'center',
              marginTop: '3rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Shield size={16} style={{ color: 'var(--accent-emerald)' }} />
              Ministry of Cooperation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <WifiOff size={16} style={{ color: 'var(--accent-amber)' }} />
              Works Offline
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Wifi size={16} style={{ color: 'var(--accent-blue)' }} />
              AI-Powered
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="landing-features">
        {[
          {
            icon: <BookOpen size={24} />,
            title: 'Smart LMS',
            description:
              'Structured courses on cooperative laws, accounting, management, and vocational skills. Track progress, complete modules, and earn certificates.',
          },
          {
            icon: <Bot size={24} />,
            title: 'AI Learning Assistant',
            description:
              'RAG-powered AI chatbot that understands cooperative domain knowledge. Ask questions, get instant answers with cited sources.',
          },
          {
            icon: <Award size={24} />,
            title: 'QR-Verified Certificates',
            description:
              'Earn verifiable digital certificates with embedded QR codes. Anyone can scan to verify authenticity — works offline once downloaded.',
          },
          {
            icon: <Briefcase size={24} />,
            title: 'Employment Ecosystem',
            description:
              'AI-powered job matching connects skilled cooperative members with relevant opportunities. Skill-based recommendations and application tracking.',
          },
          {
            icon: <Users size={24} />,
            title: 'Cooperative ERP',
            description:
              'Lightweight ERP features for membership management, role-based access, and organizational tracking — purpose-built for cooperatives.',
          },
          {
            icon: <GraduationCap size={24} />,
            title: 'Offline-First Design',
            description:
              'Progressive Web App architecture ensures the platform works without internet. Courses, certificates, and cached AI responses are available offline.',
          },
        ].map((feature) => (
          <div key={feature.title} className="glass-card feature-card">
            <div
              className="feature-icon"
              style={{ 
                background: 'transparent', 
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}
            >
              {feature.icon}
            </div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7 }}>
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <p>
          NCCT Digital Platform — Smart India Hackathon 2026 • PS 26087
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Ministry of Cooperation • Theme: Smart Education
        </p>
      </footer>
    </div>
  );
}
