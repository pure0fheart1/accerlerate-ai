import { supabase } from '../lib/supabase';

export interface PongHighScore {
  id: string;
  user_id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export class PongHighScoreService {
  // Submit a new high score
  static async submitScore(
    userId: string,
    playerName: string,
    score: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pong_high_scores')
        .insert({
          user_id: userId,
          player_name: playerName,
          score
        });

      if (error) {
        console.error('Error submitting Pong high score:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in submitScore:', error);
      return false;
    }
  }

  // Get top N high scores
  static async getTopScores(limit = 10): Promise<PongHighScore[]> {
    try {
      const { data, error } = await supabase
        .from('pong_high_scores')
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching Pong high scores:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTopScores:', error);
      return [];
    }
  }

  // Get user's best score
  static async getUserBestScore(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('pong_high_scores')
        .select('score')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return 0;
      }

      return data.score;
    } catch (error) {
      return 0;
    }
  }

  // Get user's rank (position in leaderboard)
  static async getUserRank(userId: string): Promise<number | null> {
    try {
      const userBestScore = await this.getUserBestScore(userId);
      if (userBestScore === 0) return null;

      const { count, error } = await supabase
        .from('pong_high_scores')
        .select('*', { count: 'exact', head: true })
        .gt('score', userBestScore);

      if (error) {
        console.error('Error getting user rank:', error);
        return null;
      }

      return (count || 0) + 1;
    } catch (error) {
      console.error('Error in getUserRank:', error);
      return null;
    }
  }

  // Get all scores for a specific user
  static async getUserScores(userId: string, limit = 20): Promise<PongHighScore[]> {
    try {
      const { data, error } = await supabase
        .from('pong_high_scores')
        .select('*')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user Pong scores:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserScores:', error);
      return [];
    }
  }
}