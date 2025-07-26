/*
  # Initial Schema for ShellCraft Platform

  1. New Tables
    - `challenges`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `instructions` (text)
      - `difficulty` (enum: Beginner, Intermediate, Advanced)
      - `category` (text)
      - `points` (integer)
      - `examples` (jsonb)
      - `test_cases` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (text, unique) - Clerk user ID
      - `username` (text)
      - `email` (text)
      - `avatar_url` (text, nullable)
      - `total_score` (integer, default 0)
      - `rank` (text, default 'Beginner')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (text) - References user_profiles.user_id
      - `challenge_id` (uuid) - References challenges.id
      - `completed` (boolean, default false)
      - `score` (integer, default 0)
      - `solution` (text)
      - `completed_at` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for admin users to manage challenges
*/

-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  instructions text NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'Beginner',
  category text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  examples jsonb DEFAULT '[]'::jsonb,
  test_cases text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  username text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  total_score integer DEFAULT 0,
  rank text DEFAULT 'Beginner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  solution text DEFAULT '',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable Row Level Security
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Anyone can view challenges"
  ON challenges
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage challenges"
  ON challenges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    )
  );

-- User profiles policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_score ON user_profiles(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_challenge_id ON user_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();