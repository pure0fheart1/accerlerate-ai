import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { PongHighScoreService, PongHighScore } from '../services/pongHighScoreService';
import { getGamepadState, useGamepad, isButtonJustPressed, type GamepadState } from '../lib/gamepadUtils';

interface GameState {
  ballX: number;
  ballY: number;
  ballVelX: number;
  ballVelY: number;
  playerY: number;
  aiY: number;
  playerScore: number;
  aiScore: number;
  gameStarted: boolean;
  gameOver: boolean;
  paused: boolean;
}

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState<PongHighScore[]>([]);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [previousGamepadState, setPreviousGamepadState] = useState<GamepadState | null>(null);
  const { user } = useAuth();
  const { profile } = useUserProfile();

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 100;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 14;
  const AI_SPEED = 5;
  const INITIAL_BALL_SPEED = 5;
  const MAX_BALL_SPEED = 15;
  const WINNING_SCORE = 11;

  // Use ref for game state to avoid stale closures and ensure smooth updates
  const gameStateRef = useRef<GameState>({
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVelX: INITIAL_BALL_SPEED,
    ballVelY: INITIAL_BALL_SPEED,
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    playerScore: 0,
    aiScore: 0,
    gameStarted: false,
    gameOver: false,
    paused: false
  });

  // Keep a state version for triggering re-renders when needed
  const [, forceUpdate] = useState({});

  // Gamepad detection
  useEffect(() => {
    const cleanup = useGamepad((connected) => {
      setGamepadConnected(connected);
    });

    return cleanup;
  }, []);

  // Load high scores
  const loadHighScores = useCallback(async () => {
    const scores = await PongHighScoreService.getTopScores(10);
    setHighScores(scores);
  }, []);

  useEffect(() => {
    loadHighScores();
  }, [loadHighScores]);

  // Submit score when game ends
  const submitScore = useCallback(async (score: number) => {
    if (!user || !profile) return;

    const playerName = profile.display_name || user.email?.split('@')[0] || 'Player';
    await PongHighScoreService.submitScore(user.id, playerName, score);
    await loadHighScores();
  }, [user, profile, loadHighScores]);

  // Reset ball position
  const resetBall = useCallback(() => {
    const angle = (Math.random() * Math.PI / 4) - Math.PI / 8; // Random angle between -22.5 and 22.5 degrees
    const direction = Math.random() > 0.5 ? 1 : -1;

    gameStateRef.current.ballX = CANVAS_WIDTH / 2;
    gameStateRef.current.ballY = CANVAS_HEIGHT / 2;
    gameStateRef.current.ballVelX = Math.cos(angle) * INITIAL_BALL_SPEED * direction;
    gameStateRef.current.ballVelY = Math.sin(angle) * INITIAL_BALL_SPEED;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Only update game state if game is active
    if (state.gameStarted && !state.gameOver && !state.paused) {
      // Update ball position
      state.ballX += state.ballVelX;
      state.ballY += state.ballVelY;

      // Ball collision with top and bottom walls
      if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
        state.ballVelY = -state.ballVelY;
        state.ballY = state.ballY <= 0 ? 0 : CANVAS_HEIGHT - BALL_SIZE;
      }

      // Ball collision with player paddle
      if (
        state.ballX <= PADDLE_WIDTH &&
        state.ballY + BALL_SIZE >= state.playerY &&
        state.ballY <= state.playerY + PADDLE_HEIGHT
      ) {
        const relativeIntersectY = (state.playerY + PADDLE_HEIGHT / 2) - (state.ballY + BALL_SIZE / 2);
        const normalizedIntersect = relativeIntersectY / (PADDLE_HEIGHT / 2);
        const bounceAngle = normalizedIntersect * (Math.PI / 4);

        const speed = Math.min(Math.sqrt(state.ballVelX ** 2 + state.ballVelY ** 2) * 1.05, MAX_BALL_SPEED);
        state.ballVelX = speed * Math.cos(bounceAngle);
        state.ballVelY = -speed * Math.sin(bounceAngle);
        state.ballX = PADDLE_WIDTH;
      }

      // Ball collision with AI paddle
      if (
        state.ballX >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        state.ballY + BALL_SIZE >= state.aiY &&
        state.ballY <= state.aiY + PADDLE_HEIGHT
      ) {
        const relativeIntersectY = (state.aiY + PADDLE_HEIGHT / 2) - (state.ballY + BALL_SIZE / 2);
        const normalizedIntersect = relativeIntersectY / (PADDLE_HEIGHT / 2);
        const bounceAngle = normalizedIntersect * (Math.PI / 4);

        const speed = Math.min(Math.sqrt(state.ballVelX ** 2 + state.ballVelY ** 2) * 1.05, MAX_BALL_SPEED);
        state.ballVelX = -speed * Math.cos(bounceAngle);
        state.ballVelY = -speed * Math.sin(bounceAngle);
        state.ballX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
      }

      // Scoring
      if (state.ballX <= 0) {
        state.aiScore++;
        resetBall();
      } else if (state.ballX >= CANVAS_WIDTH) {
        state.playerScore++;
        resetBall();
      }

      // Check for game over
      if (state.playerScore >= WINNING_SCORE || state.aiScore >= WINNING_SCORE) {
        state.gameOver = true;
        state.gameStarted = false;

        // Submit score if player won
        if (state.playerScore >= WINNING_SCORE) {
          submitScore(state.playerScore);
        }
      }

      // AI movement (follows ball with slight lag for difficulty)
      const aiPaddleCenter = state.aiY + PADDLE_HEIGHT / 2;
      const ballCenter = state.ballY + BALL_SIZE / 2;

      if (ballCenter < aiPaddleCenter - 10) {
        state.aiY = Math.max(0, state.aiY - AI_SPEED);
      } else if (ballCenter > aiPaddleCenter + 10) {
        state.aiY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY + AI_SPEED);
      }

      // Player movement from keyboard
      const keys = (window as any).pressedKeys || {};
      if ((keys['w'] || keys['ArrowUp']) && state.playerY > 0) {
        state.playerY = Math.max(0, state.playerY - PADDLE_SPEED);
      }
      if ((keys['s'] || keys['ArrowDown']) && state.playerY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
        state.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.playerY + PADDLE_SPEED);
      }

      // Player movement from gamepad
      if (gamepadConnected) {
        const gamepadState = getGamepadState();
        if (gamepadState) {
          if (gamepadState.axes.leftStickY < -0.3 || gamepadState.buttons.dpadUp) {
            state.playerY = Math.max(0, state.playerY - PADDLE_SPEED);
          } else if (gamepadState.axes.leftStickY > 0.3 || gamepadState.buttons.dpadDown) {
            state.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.playerY + PADDLE_SPEED);
          }
        }
      }
    }

    // Render
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Center line
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(0, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI paddle
    ctx.fillStyle = '#ff0088';
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(state.ballX, state.ballY, BALL_SIZE, BALL_SIZE);

    // Scores
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#ffffff40';
    ctx.textAlign = 'center';
    ctx.fillText(state.playerScore.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(state.aiScore.toString(), (CANVAS_WIDTH / 4) * 3, 60);

    // Game over text
    if (state.gameOver) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px monospace';
      ctx.textAlign = 'center';
      const winner = state.playerScore >= WINNING_SCORE ? 'YOU WIN!' : 'AI WINS!';
      ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

      ctx.font = 'bold 24px monospace';
      ctx.fillText('Press SPACE or A Button to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } else if (!state.gameStarted) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE or A Button to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

      ctx.font = 'bold 20px monospace';
      ctx.fillText('W/S or Arrow Keys or Left Stick to move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } else if (state.paused) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gamepadConnected, resetBall, submitScore]);

  // Start game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  // Keyboard controls
  useEffect(() => {
    (window as any).pressedKeys = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      (window as any).pressedKeys[e.key] = true;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const state = gameStateRef.current;
        if (state.gameOver) {
          state.ballX = CANVAS_WIDTH / 2;
          state.ballY = CANVAS_HEIGHT / 2;
          state.ballVelX = INITIAL_BALL_SPEED;
          state.ballVelY = INITIAL_BALL_SPEED;
          state.playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          state.aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          state.playerScore = 0;
          state.aiScore = 0;
          state.gameStarted = true;
          state.gameOver = false;
          state.paused = false;
        } else if (!state.gameStarted) {
          state.gameStarted = true;
        }
      }

      if (e.key === 'Escape' || e.key === 'p') {
        const state = gameStateRef.current;
        if (state.gameStarted && !state.gameOver) {
          state.paused = !state.paused;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete (window as any).pressedKeys[e.key];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gamepad button controls
  useEffect(() => {
    if (!gamepadConnected) return;

    const checkGamepadButtons = () => {
      const currentState = getGamepadState();
      if (!currentState) return;

      // A button or Start button to start/restart game
      if (isButtonJustPressed('a', previousGamepadState, currentState) ||
          isButtonJustPressed('start', previousGamepadState, currentState)) {
        const state = gameStateRef.current;
        if (state.gameOver) {
          state.ballX = CANVAS_WIDTH / 2;
          state.ballY = CANVAS_HEIGHT / 2;
          state.ballVelX = INITIAL_BALL_SPEED;
          state.ballVelY = INITIAL_BALL_SPEED;
          state.playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          state.aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          state.playerScore = 0;
          state.aiScore = 0;
          state.gameStarted = true;
          state.gameOver = false;
          state.paused = false;
        } else if (!state.gameStarted) {
          state.gameStarted = true;
        }
      }

      // Back button to pause
      if (isButtonJustPressed('back', previousGamepadState, currentState)) {
        const state = gameStateRef.current;
        if (state.gameStarted && !state.gameOver) {
          state.paused = !state.paused;
        }
      }

      setPreviousGamepadState(currentState);
    };

    const interval = setInterval(checkGamepadButtons, 16); // ~60fps
    return () => clearInterval(interval);
  }, [gamepadConnected, previousGamepadState]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">🏓 PONG</h1>
                <p className="text-blue-100">Classic arcade game - First to {WINNING_SCORE} wins!</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  {isFullscreen ? '📺 Exit Fullscreen' : '⛶ Fullscreen'}
                </button>
                <button
                  onClick={() => setShowHighScores(!showHighScores)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  🏆 High Scores
                </button>
              </div>
            </div>
            {gamepadConnected && (
              <div className="mt-4 px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                <p className="text-green-200 text-sm">🎮 Xbox Controller Connected - Left Stick/D-Pad: Move | A/Start: Start | Back: Pause</p>
              </div>
            )}
          </div>

          {/* Game Canvas */}
          <div className="flex items-center justify-center p-8 bg-gray-900">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-4 border-gray-700 rounded-lg shadow-2xl"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Controls Info */}
          <div className="bg-gray-800 p-6 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-3xl mb-2">⌨️</div>
                <div className="font-bold text-white mb-1">Keyboard</div>
                <div className="text-gray-300 text-sm">W/S or Arrow Keys</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-3xl mb-2">🎮</div>
                <div className="font-bold text-white mb-1">Xbox Controller</div>
                <div className="text-gray-300 text-sm">Left Stick or D-Pad</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-bold text-white mb-1">Controls</div>
                <div className="text-gray-300 text-sm">Space/A to Start | ESC to Pause</div>
              </div>
            </div>
          </div>
        </div>

        {/* High Scores Modal */}
        {showHighScores && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-4 border-yellow-500">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-white">🏆 High Scores</h2>
                  <button
                    onClick={() => setShowHighScores(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {highScores.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-gray-400">No high scores yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {highScores.map((score, index) => (
                      <div
                        key={score.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg scale-105'
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                            : index === 2
                            ? 'bg-gradient-to-r from-orange-700 to-orange-800'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`text-3xl font-bold ${
                            index === 0 ? 'text-yellow-200' :
                            index === 1 ? 'text-gray-100' :
                            index === 2 ? 'text-orange-200' :
                            'text-gray-300'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">{score.player_name}</div>
                            <div className="text-sm text-gray-300">
                              {new Date(score.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white">
                          {score.score}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PongGame;