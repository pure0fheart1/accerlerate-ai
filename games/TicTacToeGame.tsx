// src/games/TicTacToeGame.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Type definitions
type Player = 'X' | 'O' | null;
type Board = Player[][];

// Constants
const BOARD_SIZE = 3;
const INITIAL_BOARD: Board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

const TicTacToeGame: React.FC = () => {
  const { user } = useAuth();

  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X'); // Human is X, AI is O
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [score, setScore] = useState({ human: 0, ai: 0, draws: 0 });
  const [highScore, setHighScore] = useState(0); // Longest win streak
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium'); // AI difficulty

  useEffect(() => {
    if (user) {
      fetchHighScore();
    }
  }, [user]);

  // Fetch high score from Supabase
  const fetchHighScore = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('high_scores')
        .select('score')
        .eq('user_id', user.id)
        .eq('game', 'TicTacToe')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching high score:', error);
      } else if (data) {
        setHighScore(data.score || 0);
      }
    } catch (error) {
      console.error('Error in fetchHighScore:', error);
    }
  };

  // Update high score in Supabase
  const updateHighScore = async (newScore: number) => {
    if (!user || newScore <= highScore) return;
    try {
      const { error } = await supabase
        .from('high_scores')
        .upsert({
          user_id: user.id,
          game: 'TicTacToe',
          score: newScore,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating high score:', error);
      } else {
        setHighScore(newScore);
      }
    } catch (error) {
      console.error('Error in updateHighScore:', error);
    }
  };

  // Check for winner
  const checkWinner = (board: Board): Player | 'Draw' | null => {
    // Rows, columns, diagonals
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) return board[i][0];
      if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) return board[0][i];
    }
    if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) return board[0][0];
    if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) return board[0][2];

    // Draw
    if (board.every(row => row.every(cell => cell !== null))) return 'Draw';

    return null;
  };

  // Handle cell click
  const handleClick = (row: number, col: number) => {
    if (board[row][col] || winner || currentPlayer !== 'X') return;

    const newBoard = board.map(r => r.slice());
    newBoard[row][col] = 'X';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      handleGameEnd(result);
    } else {
      setCurrentPlayer('O');
      // Delay AI move for better UX
      setTimeout(() => aiMove(newBoard), 300);
    }
  };

  // AI Move logic (simple for easy, minimax for hard)
  const aiMove = (currentBoard: Board) => {
    let move: [number, number] | null = null;

    if (difficulty === 'easy') {
      // Random move
      const emptyCells: [number, number][] = [];
      currentBoard.forEach((r, ri) => r.forEach((c, ci) => { if (!c) emptyCells.push([ri, ci]); }));
      move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (difficulty === 'medium') {
      // Try to win or block
      move = findBestMove(currentBoard, 'O') || findBestMove(currentBoard, 'X') || randomMove(currentBoard);
    } else {
      // Hard: Minimax
      move = minimaxMove(currentBoard);
    }

    if (move) {
      const [row, col] = move;
      const newBoard = currentBoard.map(r => r.slice());
      newBoard[row][col] = 'O';
      setBoard(newBoard);

      const result = checkWinner(newBoard);
      if (result) {
        handleGameEnd(result);
      } else {
        setCurrentPlayer('X');
      }
    }
  };

  // Helper: Find move to win or block for player
  const findBestMove = (board: Board, player: Player): [number, number] | null => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!board[row][col]) {
          const testBoard = board.map(r => r.slice());
          testBoard[row][col] = player;
          if (checkWinner(testBoard) === player) return [row, col];
        }
      }
    }
    return null;
  };

  // Helper: Random move
  const randomMove = (board: Board): [number, number] => {
    const emptyCells: [number, number][] = [];
    board.forEach((r, ri) => r.forEach((c, ci) => { if (!c) emptyCells.push([ri, ci]); }));
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  // Minimax for hard difficulty
  const minimaxMove = (board: Board): [number, number] => {
    let bestScore = -Infinity;
    let bestMove: [number, number] = [0, 0];

    board.forEach((r, row) => {
      r.forEach((c, col) => {
        if (!c) {
          board[row][col] = 'O';
          const score = minimax(board, 0, false);
          board[row][col] = null;
          if (score > bestScore) {
            bestScore = score;
            bestMove = [row, col];
          }
        }
      });
    });

    return bestMove;
  };

  const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(board);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let best = -Infinity;
      board.forEach((r, row) => r.forEach((c, col) => {
        if (!c) {
          board[row][col] = 'O';
          best = Math.max(best, minimax(board, depth + 1, false));
          board[row][col] = null;
        }
      }));
      return best;
    } else {
      let best = Infinity;
      board.forEach((r, row) => r.forEach((c, col) => {
        if (!c) {
          board[row][col] = 'X';
          best = Math.min(best, minimax(board, depth + 1, true));
          board[row][col] = null;
        }
      }));
      return best;
    }
  };

  // Handle game end
  const handleGameEnd = (result: Player | 'Draw') => {
    setWinner(result);
    setIsGameOver(true);

    if (result === 'X') {
      setScore(prev => ({ ...prev, human: prev.human + 1 }));
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      updateHighScore(newStreak);
    } else if (result === 'O') {
      setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
      setCurrentStreak(0);
    } else {
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      setCurrentStreak(0);
    }
  };

  // Reset game
  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('X');
    setWinner(null);
    setIsGameOver(false);
  };

  // Reset all stats
  const resetStats = () => {
    resetGame();
    setScore({ human: 0, ai: 0, draws: 0 });
    setCurrentStreak(0);
  };

  // Change difficulty
  const handleDifficultyChange = (diff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(diff);
    resetGame();
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-slate-100">Tic-Tac-Toe vs AI</h2>

      {/* Difficulty selector */}
      <div className="mb-6 w-full">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => handleDifficultyChange(e.target.value as 'easy' | 'medium' | 'hard')}
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="easy">Easy (Random AI)</option>
          <option value="medium">Medium (Strategic AI)</option>
          <option value="hard">Hard (Unbeatable AI)</option>
        </select>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {board.map((row, ri) => (
          row.map((cell, ci) => (
            <button
              key={`${ri}-${ci}`}
              onClick={() => handleClick(ri, ci)}
              className={`w-24 h-24 text-5xl font-bold border-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                cell === 'X'
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300'
                  : cell === 'O'
                  ? 'bg-red-100 dark:bg-red-900 border-red-500 text-red-600 dark:text-red-300'
                  : 'bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
              } ${
                isGameOver || cell !== null || currentPlayer !== 'X'
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:scale-105'
              }`}
              disabled={isGameOver || cell !== null || currentPlayer !== 'X'}
            >
              {cell}
            </button>
          ))
        ))}
      </div>

      {/* Status */}
      {winner && (
        <div className={`text-xl font-bold mb-4 px-6 py-3 rounded-lg ${
          winner === 'X'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : winner === 'O'
            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
        }`}>
          {winner === 'Draw' ? "It's a Draw!" : winner === 'X' ? '🎉 You Win!' : '🤖 AI Wins!'}
        </div>
      )}

      {!winner && currentPlayer === 'O' && (
        <div className="text-lg mb-4 text-gray-600 dark:text-slate-400 animate-pulse">
          AI is thinking...
        </div>
      )}

      {/* Scores */}
      <div className="w-full bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center mb-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400">You</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score.human}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400">Draws</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-slate-400">{score.draws}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400">AI</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{score.ai}</p>
          </div>
        </div>
        <div className="border-t border-gray-300 dark:border-slate-600 pt-3 text-center">
          <p className="text-sm text-gray-700 dark:text-slate-300">
            Current Streak: <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentStreak}</span>
          </p>
          {user && (
            <p className="text-sm text-gray-700 dark:text-slate-300">
              High Score: <span className="font-bold text-purple-600 dark:text-purple-400">{highScore}</span>
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={resetGame}
          className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
        >
          New Game
        </button>
        <button
          onClick={resetStats}
          className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Reset Stats
        </button>
      </div>

      {!user && (
        <p className="mt-4 text-sm text-gray-600 dark:text-slate-400 text-center">
          Sign in to save your high scores!
        </p>
      )}
    </div>
  );
};

export default TicTacToeGame;
