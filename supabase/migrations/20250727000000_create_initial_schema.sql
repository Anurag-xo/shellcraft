-- Check if difficulty_level type exists, create if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
    CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
    RAISE NOTICE 'Type difficulty_level created.';
  ELSE
    RAISE NOTICE 'Type difficulty_level already exists.';
  END IF;
END
$$;

-- Create challenges table (CHANGED id to text to match existing data)
CREATE TABLE IF NOT EXISTS challenges (
  id text PRIMARY KEY, -- CHANGED from uuid to text
  title text NOT NULL,
  description text NOT NULL,
  instructions text NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'Beginner',
  category text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  examples jsonb DEFAULT '[]'::jsonb,
  -- Legacy column, consider removing after full migration to validation_rules
  test_cases text[] DEFAULT ARRAY[]::text[], 
  -- NEW: Structured validation rules for the generic engine
  validation_rules jsonb DEFAULT '[]'::jsonb, 
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL, -- Clerk user ID
  username text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  total_score integer DEFAULT 0,
  rank text DEFAULT 'Beginner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table (Note: Ensure completed_at is timestamptz)
-- CHANGED challenge_id reference to text to match challenges.id
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  challenge_id text NOT NULL REFERENCES challenges(id) ON DELETE CASCADE, -- CHANGED to text
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  solution text DEFAULT '',
  -- Ensure this is timestamptz
  completed_at timestamptz, 
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable Row Level Security (These are generally safe to run multiple times)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Challenges policies (Assuming these are idempotent or you handle existing policies)
-- Note: You might need to DROP POLICY IF EXISTS first if they exist and you want to redefine them strictly.
-- For simplicity here, we'll assume they are created once or you manage policy updates separately.
CREATE POLICY "Anyone can view challenges"
ON challenges FOR SELECT
TO authenticated, anon
USING (true);

-- Placeholder for admin policy (implement based on your admin logic)
-- CREATE POLICY "Admins can manage challenges"
-- ON challenges FOR ALL
-- TO authenticated
-- USING (is_clerk_user_admin()); -- You need a function to determine admin status

-- User profiles policies
CREATE POLICY "Users can view all profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage own profile"
ON user_profiles FOR ALL
TO authenticated
USING (user_id = auth.jwt() ->> 'sub')
WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- User progress policies
CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
TO authenticated
USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage own progress"
ON user_progress FOR ALL
TO authenticated
USING (user_id = auth.jwt() ->> 'sub')
WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Create indexes for better performance (IF NOT EXISTS is helpful)
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_score ON user_profiles(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_challenge_id ON user_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed);

-- Create function to update updated_at timestamp (Check if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (Check if exists by dropping and recreating or handle via migration logic)
-- A robust way is to drop and recreate if needed, or check within a DO block.
-- For simplicity, we'll drop and recreate, assuming the function might change.
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON challenges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at -- Corrected trigger name
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Note: user_progress doesn't have an updated_at column in the original schema,
-- but if it did, you'd add a trigger here too.
-- If it should have one, add the column and trigger:
-- ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
-- CREATE TRIGGER update_user_progress_updated_at
-- BEFORE UPDATE ON user_progress
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updated_at_column();
