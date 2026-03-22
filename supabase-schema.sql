-- OrthoLog Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project

-- ─── PROGRAMS ───
CREATE TABLE programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT,
  city TEXT,
  state TEXT,
  license_tier TEXT DEFAULT 'free' CHECK (license_tier IN ('free', 'pro', 'program')),
  invite_code TEXT UNIQUE,
  pd_user_id UUID REFERENCES auth.users(id),
  custom_logo_url TEXT,
  max_residents INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── USERS ───
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  pgy_year INTEGER CHECK (pgy_year BETWEEN 1 AND 8),
  program_id UUID REFERENCES programs(id),
  role TEXT DEFAULT 'resident' CHECK (role IN ('resident', 'fellow', 'attending', 'pa', 'admin', 'pd')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CASES ───
CREATE TABLE cases (
  id TEXT PRIMARY KEY, -- client-generated UUID
  user_id UUID REFERENCES users(id) NOT NULL,
  date DATE NOT NULL,
  patient_age INTEGER,
  patient_sex TEXT CHECK (patient_sex IN ('M', 'F', 'Other')),
  diagnosis TEXT NOT NULL,
  icd10 TEXT,
  procedures JSONB DEFAULT '[]'::jsonb, -- [{cptCode, description, modifier}]
  approach TEXT,
  implants JSONB DEFAULT '[]'::jsonb,
  reduction_aid TEXT,
  attending TEXT,
  role TEXT CHECK (role IN ('Primary Surgeon', 'First Assist', 'Second Assist', 'Observer')),
  complications TEXT,
  notes TEXT,
  is_emergency BOOLEAN DEFAULT false,
  blood_loss_ml INTEGER,
  operative_time_min INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── XRAYS ───
CREATE TABLE xrays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  description TEXT,
  timing TEXT CHECK (timing IN ('pre-op', 'intra-op', 'post-op', 'follow-up')),
  annotations JSONB DEFAULT '[]'::jsonb,
  phi_confirmed_clean BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── TIPS ───
CREATE TABLE tips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  program_id UUID REFERENCES programs(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  cpt_codes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── TIP LIKES ───
CREATE TABLE tip_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_id TEXT REFERENCES tips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tip_id, user_id)
);

-- ─── CODING PROGRESS ───
CREATE TABLE coding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  scenario_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  score NUMERIC,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scenario_id)
);

-- ─── ROW LEVEL SECURITY ───

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE xrays ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Cases: users see only their own
CREATE POLICY "Users can view own cases" ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON cases FOR DELETE USING (auth.uid() = user_id);

-- X-rays: users see only their own
CREATE POLICY "Users can view own xrays" ON xrays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xrays" ON xrays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own xrays" ON xrays FOR DELETE USING (auth.uid() = user_id);

-- Tips: visible to same program
CREATE POLICY "Users can view program tips" ON tips FOR SELECT USING (
  program_id IN (SELECT program_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Users can insert tips" ON tips FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tip likes: users can like any visible tip
CREATE POLICY "Users can view likes" ON tip_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert likes" ON tip_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON tip_likes FOR DELETE USING (auth.uid() = user_id);

-- Coding progress: users see only their own
CREATE POLICY "Users can view own progress" ON coding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON coding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON coding_progress FOR UPDATE USING (auth.uid() = user_id);

-- Programs: readable by members
CREATE POLICY "Users can view their program" ON programs FOR SELECT USING (
  id IN (SELECT program_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "PDs can update their program" ON programs FOR UPDATE USING (pd_user_id = auth.uid());

-- ─── STORAGE BUCKET ───
-- Run this in Supabase Dashboard > Storage > Create bucket
-- Name: xrays
-- Public: false (use signed URLs)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- ─── INDEXES ───
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_date ON cases(date DESC);
CREATE INDEX idx_tips_program_id ON tips(program_id);
CREATE INDEX idx_xrays_case_id ON xrays(case_id);
CREATE INDEX idx_coding_progress_user ON coding_progress(user_id);
CREATE INDEX idx_users_program ON users(program_id);

-- ─── SEED: UCF/HCA Ocala Program ───
INSERT INTO programs (name, institution, city, state, license_tier, invite_code)
VALUES (
  'UCF/HCA Florida Ocala Hospital - Orthopaedic Surgery',
  'University of Central Florida College of Medicine',
  'Ocala',
  'FL',
  'free',
  'UCF-ORTHO-2026'
);
