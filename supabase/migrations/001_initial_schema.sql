-- ============================================================
-- NCCT Digital Platform — Initial Database Schema
-- SIH 26087: AI-Enabled Cooperative Capacity Building
-- Run this in Supabase SQL Editor after creating your project
-- ============================================================

-- Enable pgvector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner'
    CHECK (role IN ('admin', 'learner', 'cooperative_member')),
  phone TEXT,
  cooperative_name TEXT,
  skills TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('cooperative_law', 'accounting', 'management', 'skills', 'technology', 'general')),
  difficulty TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id, order_index);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_modules UUID[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  pdf_url TEXT,
  payment_id UUID,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT 'mock',
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cooperative_name TEXT,
  skills_required TEXT[] DEFAULT '{}',
  location TEXT,
  salary_range TEXT,
  job_type TEXT DEFAULT 'full-time'
    CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  posted_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'filled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'reviewing', 'shortlisted', 'rejected', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- ============================================================
-- RAG DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  source TEXT,
  embedding VECTOR(384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHAT HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_sources JSONB DEFAULT '[]',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courses
CREATE POLICY "courses_read" ON courses FOR SELECT USING (is_published = true OR created_by = auth.uid());
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (true);

-- Modules
CREATE POLICY "modules_read" ON modules FOR SELECT USING (true);
CREATE POLICY "modules_insert" ON modules FOR INSERT WITH CHECK (true);

-- Enrollments
CREATE POLICY "enrollments_read" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "enrollments_insert" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enrollments_update" ON enrollments FOR UPDATE USING (auth.uid() = user_id);

-- Certificates
CREATE POLICY "certificates_read" ON certificates FOR SELECT USING (true);
CREATE POLICY "certificates_insert" ON certificates FOR INSERT WITH CHECK (true);

-- Payments
CREATE POLICY "payments_read" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);

-- Jobs
CREATE POLICY "jobs_read" ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert" ON jobs FOR INSERT WITH CHECK (true);

-- Job Applications
CREATE POLICY "applications_read" ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "applications_insert" ON job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Documents (for RAG)
CREATE POLICY "documents_read" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (true);

-- Chat
CREATE POLICY "chat_read" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_insert" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
