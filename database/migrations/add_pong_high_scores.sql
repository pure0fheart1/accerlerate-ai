-- Pong High Scores Table
-- This table stores high scores for the Pong game

CREATE TABLE IF NOT EXISTS pong_high_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pong_high_scores_user_id ON pong_high_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_pong_high_scores_score ON pong_high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_pong_high_scores_created_at ON pong_high_scores(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pong_high_scores ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own scores
CREATE POLICY "Users can insert their own Pong scores" ON pong_high_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow everyone to read high scores
CREATE POLICY "Anyone can view Pong high scores" ON pong_high_scores
  FOR SELECT
  USING (true);

-- Create policy to prevent updates (scores are immutable once submitted)
CREATE POLICY "Prevent updates to Pong scores" ON pong_high_scores
  FOR UPDATE
  USING (false);

-- Create policy to prevent deletes (for data integrity)
CREATE POLICY "Prevent deletes of Pong scores" ON pong_high_scores
  FOR DELETE
  USING (false);

COMMENT ON TABLE pong_high_scores IS 'Stores high scores for the Pong game';
COMMENT ON COLUMN pong_high_scores.score IS 'The final score achieved by the player (points scored before opponent reached winning score)';