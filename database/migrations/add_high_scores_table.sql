-- Generic High Scores Table
-- This table stores high scores for multiple games in the platform

CREATE TABLE IF NOT EXISTS high_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game TEXT NOT NULL CHECK (game IN ('TicTacToe', 'Chess', 'Pong', 'WeaponDodge')),
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one record per user per game
  UNIQUE(user_id, game)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_high_scores_user_id ON high_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_high_scores_game ON high_scores(game);
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_user_game ON high_scores(user_id, game);

-- Enable Row Level Security
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own scores
CREATE POLICY "Users can insert their own scores" ON high_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own scores
CREATE POLICY "Users can update their own scores" ON high_scores
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow everyone to read high scores
CREATE POLICY "Anyone can view high scores" ON high_scores
  FOR SELECT
  USING (true);

-- Create policy to prevent deletes (for data integrity)
CREATE POLICY "Prevent deletes of scores" ON high_scores
  FOR DELETE
  USING (false);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_high_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_high_scores_updated_at_trigger
  BEFORE UPDATE ON high_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_high_scores_updated_at();

COMMENT ON TABLE high_scores IS 'Stores high scores for various games in the platform';
COMMENT ON COLUMN high_scores.game IS 'The name of the game (TicTacToe, Chess, Pong, WeaponDodge)';
COMMENT ON COLUMN high_scores.score IS 'The high score achieved by the player (meaning varies by game)';
COMMENT ON COLUMN high_scores.updated_at IS 'Timestamp of the last score update';
