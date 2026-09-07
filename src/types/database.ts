/**
 * Database types derived from the Supabase schema.
 * These match the tables defined in supabase/migrations/001_initial_schema.sql
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Course, 'id'>>;
      };
      modules: {
        Row: Module;
        Insert: Omit<Module, 'id' | 'created_at'>;
        Update: Partial<Omit<Module, 'id'>>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, 'id' | 'created_at'>;
        Update: Partial<Omit<Enrollment, 'id'>>;
      };
      certificates: {
        Row: Certificate;
        Insert: Omit<Certificate, 'id' | 'issued_at'>;
        Update: Partial<Omit<Certificate, 'id'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'>;
        Update: Partial<Omit<Payment, 'id'>>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, 'id' | 'created_at'>;
        Update: Partial<Omit<Job, 'id'>>;
      };
      job_applications: {
        Row: JobApplication;
        Insert: Omit<JobApplication, 'id' | 'created_at'>;
        Update: Partial<Omit<JobApplication, 'id'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id'>>;
      };
    };
  };
}

/* ============================================================
   Table Row Types
   ============================================================ */

export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'learner' | 'cooperative_member';
  phone: string | null;
  cooperative_name: string | null;
  skills: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: 'cooperative_law' | 'accounting' | 'management' | 'skills' | 'technology' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url: string | null;
  price: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  duration_minutes: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_modules: string[];
  completed_at: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  qr_code_url: string | null;
  pdf_url: string | null;
  payment_id: string | null;
  issued_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  course_id: string | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  reference_id: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string | null;
  cooperative_name: string | null;
  skills_required: string[];
  location: string | null;
  salary_range: string | null;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  posted_by: string | null;
  status: 'open' | 'closed' | 'filled';
  created_at: string;
  expires_at: string | null;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  created_at: string;
}

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  source: string | null;
  embedding: number[] | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  context_sources: Record<string, unknown>[];
  session_id: string | null;
  created_at: string;
}

/* ============================================================
   Extended / Composite Types (for frontend use)
   ============================================================ */

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface CourseWithEnrollment extends Course {
  enrollment?: Enrollment | null;
  module_count?: number;
}

export interface CertificateWithCourse extends Certificate {
  course?: Course;
}

export interface JobWithApplication extends Job {
  application?: JobApplication | null;
}
