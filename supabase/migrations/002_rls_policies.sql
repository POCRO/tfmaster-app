-- Row Level Security Policies
-- Phase 2.1: Secure access to words and user_words tables

-- Enable RLS on tables
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;

-- Words table policies: public read, no write
CREATE POLICY "Words are viewable by everyone"
  ON words FOR SELECT
  USING (true);

-- User words policies: users can only access their own data
CREATE POLICY "Users can view own progress"
  ON user_words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_words FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_words FOR DELETE
  USING (auth.uid() = user_id);
