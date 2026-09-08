'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isOnline, onOnlineStatusChange } from '@/lib/offlineStorage';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Award,
  Briefcase,
  LogOut,
  GraduationCap,
  Menu,
  X,
  WifiOff,
  Users,
} from 'lucide-react';

const learnerNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
  { href: '/dashboard/ai-chat', icon: Bot, label: 'AI Assistant' },
  { href: '/dashboard/certificates', icon: Award, label: 'Certificates' },
  { href: '/dashboard/jobs', icon: Briefcase, label: 'Job Board' },
];

const adminNavItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Admin Dashboard' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [online, setOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setOnline(isOnline());
    return onOnlineStatusChange(setOnline);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div>
      {/* Offline Banner */}
      {!online && (
        <div className="offline-banner" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <WifiOff size={14} />
          <span>You&apos;re offline — cached content is available. Some features need internet.</span>
        </div>
      )}

      {/* Mobile toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 60,
          display: 'none',
        }}
        id="mobile-menu-toggle"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={20} />
          </div>
          <span className="sidebar-logo-text">NCCT Platform</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">Main Menu</span>

          {/* Dynamic Navigation Based on Role */}
          {(profile?.role === 'admin' ? adminNavItems : learnerNavItems).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="sidebar-link-icon" size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile?.full_name || 'User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div className={online ? 'online-indicator' : 'offline-indicator'} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => signOut()}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" style={{ marginTop: !online ? '36px' : 0 }}>
        {children}
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
