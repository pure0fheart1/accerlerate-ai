import React, { useEffect, useRef, useCallback, useState } from 'react';

// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;
const DASH_SPEED = 12;
const DASH_COST = 20;
const MAX_ENERGY = 100;
const ENERGY_REGEN_RATE = 0.5;

interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  score: number;
  time: number;
  combo: number;
  weaponsDodged: number;
  energy: number;
  maxEnergy: number;
  energyRegenRate: number;
  dashCost: number;
  difficulty: number;
}

interface Player {
  x: number;
  y: number;
  size: number;
  speed: number;
  dashSpeed: number;
  isDashing: boolean;
  trail: Array<{ x: number; y: number; life: number }>;
}

interface Weapon {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
  scored?: boolean;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  decay: number;
  color: string;
  size: number;
}

interface HighScore {
  score: number;
  time: number;
  weaponsDodged: number;
  date: string;
}

const WeaponDodgeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    isRunning: false,
    isPaused: false,
    score: 0,
    time: 0,
    combo: 1,
    weaponsDodged: 0,
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    energyRegenRate: ENERGY_REGEN_RATE,
    dashCost: DASH_COST,
    difficulty: 1
  });

  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    size: PLAYER_SIZE,
    speed: PLAYER_SPEED,
    dashSpeed: DASH_SPEED,
    isDashing: false,
    trail: []
  });

  const weaponsRef = useRef<Weapon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef({
    w: false, a: false, s: false, d: false,
    up: false, left: false, down: false, right: false,
    dash: false
  });
  const controllerRef = useRef<Gamepad | null>(null);
  const animationFrameRef = useRef<number>(0);

  const [showMenu, setShowMenu] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [, forceUpdate] = useState({});

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('weaponDodgeHighScores');
    if (saved) {
      try {
        setHighScores(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading high scores:', e);
      }
    }
  }, []);

  // Setup gamepad
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      controllerRef.current = e.gamepad;
      console.log('Controller connected:', e.gamepad.id);
    };

    const handleGamepadDisconnected = () => {
      controllerRef.current = null;
      console.log('Controller disconnected');
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = keysRef.current;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.w = keys.up = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.a = keys.left = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.s = keys.down = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.d = keys.right = true;
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.dash = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = keysRef.current;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.w = keys.up = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.a = keys.left = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.s = keys.down = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.d = keys.right = false;
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.dash = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updateControllerInput = useCallback(() => {
    if (!controllerRef.current) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[controllerRef.current.index];
    if (!gamepad) return;

    controllerRef.current = gamepad;
    const keys = keysRef.current;
    const deadZone = 0.2;

    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];

    keys.left = leftStickX < -deadZone;
    keys.right = leftStickX > deadZone;
    keys.up = leftStickY < -deadZone;
    keys.down = leftStickY > deadZone;

    keys.dash = gamepad.buttons[0]?.pressed ||
                gamepad.buttons[2]?.pressed ||
                gamepad.buttons[5]?.pressed ||
                (gamepad.buttons[7]?.value ?? 0) > 0.5;
  }, []);

  const createDashParticles = useCallback(() => {
    const player = playerRef.current;
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: player.x + (Math.random() - 0.5) * 20,
        y: player.y + (Math.random() - 0.5) * 20,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 1.0,
        decay: 0.05,
        color: '#ffaa00',
        size: Math.random() * 5 + 2
      });
    }
  }, []);

  const createExplosionParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: 0.02,
        color: '#ff4444',
        size: Math.random() * 8 + 3
      });
    }
  }, []);

  const createCloseCallParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < 6; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        dx: (Math.random() - 0.5) * 3,
        dy: (Math.random() - 0.5) * 3,
        life: 1.0,
        decay: 0.03,
        color: '#44ff44',
        size: Math.random() * 4 + 2
      });
    }
  }, []);

  const createWeapon = useCallback(() => {
    const state = gameStateRef.current;
    const player = playerRef.current;

    const weaponTypes = [
      { emoji: '🗡️', size: 25, speed: 3 + state.difficulty * 0.3 },
      { emoji: '🏹', size: 20, speed: 4 + state.difficulty * 0.4 },
      { emoji: '🔫', size: 15, speed: 6 + state.difficulty * 0.5 },
      { emoji: '💣', size: 30, speed: 2 + state.difficulty * 0.2 },
      { emoji: '🪓', size: 28, speed: 2.5 + state.difficulty * 0.3 },
      { emoji: '⚔️', size: 26, speed: 3.5 + state.difficulty * 0.35 }
    ];

    const type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
    const side = Math.floor(Math.random() * 4);
    let x, y, dx, dy;

    switch (side) {
      case 0: // Top
        x = Math.random() * CANVAS_WIDTH;
        y = -type.size;
        dx = (player.x - x) * 0.001;
        dy = type.speed;
        break;
      case 1: // Right
        x = CANVAS_WIDTH + type.size;
        y = Math.random() * CANVAS_HEIGHT;
        dx = -type.speed;
        dy = (player.y - y) * 0.001;
        break;
      case 2: // Bottom
        x = Math.random() * CANVAS_WIDTH;
        y = CANVAS_HEIGHT + type.size;
        dx = (player.x - x) * 0.001;
        dy = -type.speed;
        break;
      case 3: // Left
      default:
        x = -type.size;
        y = Math.random() * CANVAS_HEIGHT;
        dx = type.speed;
        dy = (player.y - y) * 0.001;
        break;
    }

    weaponsRef.current.push({
      x, y, dx, dy,
      size: type.size,
      emoji: type.emoji,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    });
  }, []);

  const updatePlayer = useCallback(() => {
    const player = playerRef.current;
    const keys = keysRef.current;
    const state = gameStateRef.current;

    let dx = 0, dy = 0;

    if (keys.left || keys.a) dx -= 1;
    if (keys.right || keys.d) dx += 1;
    if (keys.up || keys.w) dy -= 1;
    if (keys.down || keys.s) dy += 1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    let speed = player.speed;
    if (keys.dash && state.energy >= state.dashCost) {
      if (!player.isDashing) {
        state.energy -= state.dashCost;
        player.isDashing = true;
        createDashParticles();
      }
      speed = player.dashSpeed;
    } else {
      player.isDashing = false;
    }

    player.x += dx * speed;
    player.y += dy * speed;

    // Keep in bounds
    player.x = Math.max(player.size, Math.min(CANVAS_WIDTH - player.size, player.x));
    player.y = Math.max(player.size, Math.min(CANVAS_HEIGHT - player.size, player.y));

    // Trail
    if (player.isDashing || dx !== 0 || dy !== 0) {
      player.trail.push({ x: player.x, y: player.y, life: 1.0 });
      if (player.trail.length > 15) player.trail.shift();
    }

    player.trail.forEach(point => point.life -= 0.1);
    player.trail = player.trail.filter(point => point.life > 0);
  }, [createDashParticles]);

  const updateWeapons = useCallback(() => {
    weaponsRef.current.forEach(weapon => {
      weapon.x += weapon.dx;
      weapon.y += weapon.dy;
      weapon.rotation += weapon.rotationSpeed;
    });

    weaponsRef.current = weaponsRef.current.filter(weapon =>
      weapon.x > -100 && weapon.x < CANVAS_WIDTH + 100 &&
      weapon.y > -100 && weapon.y < CANVAS_HEIGHT + 100
    );
  }, []);

  const updateParticles = useCallback(() => {
    particlesRef.current.forEach(particle => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.life -= particle.decay;
      particle.dx *= 0.98;
      particle.dy *= 0.98;
    });

    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  }, []);

  const checkCollisions = useCallback(() => {
    const player = playerRef.current;
    const state = gameStateRef.current;

    for (let i = weaponsRef.current.length - 1; i >= 0; i--) {
      const weapon = weaponsRef.current[i];
      const dist = Math.hypot(weapon.x - player.x, weapon.y - player.y);

      if (dist < (weapon.size + player.size) / 2) {
        // Game over!
        createExplosionParticles(player.x, player.y);
        gameOver();
        return;
      }

      // Score for dodging
      if (!weapon.scored) {
        if ((weapon.dx > 0 && weapon.x > player.x + 50) ||
            (weapon.dx < 0 && weapon.x < player.x - 50) ||
            (weapon.dy > 0 && weapon.y > player.y + 50) ||
            (weapon.dy < 0 && weapon.y < player.y - 50)) {
          weapon.scored = true;
          state.weaponsDodged++;
          state.score += 10 * state.combo;
          state.combo = Math.min(state.combo + 0.1, 5);

          if (dist < 50) {
            state.score += 25;
            createCloseCallParticles(weapon.x, weapon.y);
          }
        }
      }
    }
  }, [createExplosionParticles, createCloseCallParticles]);

  const gameOver = useCallback(() => {
    const state = gameStateRef.current;
    state.isRunning = false;

    const newScore: HighScore = {
      score: Math.floor(state.score),
      time: Math.floor(state.time),
      weaponsDodged: state.weaponsDodged,
      date: new Date().toLocaleDateString()
    };

    const newScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setHighScores(newScores);
    localStorage.setItem('weaponDodgeHighScores', JSON.stringify(newScores));

    setShowGameOver(true);
    setShowMenu(false);
  }, [highScores]);

  const updateGameStats = useCallback(() => {
    const state = gameStateRef.current;
    state.time += 1 / 60;
    state.difficulty = 1 + state.time / 30;

    if (state.combo > 1) {
      state.combo = Math.max(1, state.combo - 0.005);
    }

    if (state.energy < state.maxEnergy) {
      state.energy = Math.min(state.maxEnergy, state.energy + state.energyRegenRate);
    }

    forceUpdate({});
  }, []);

  const spawnWeapons = useCallback(() => {
    const state = gameStateRef.current;
    const spawnRate = 0.02 + state.difficulty * 0.005;
    if (Math.random() < spawnRate) {
      createWeapon();
    }
  }, [createWeapon]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Trail
    const player = playerRef.current;
    player.trail.forEach((point, index) => {
      const alpha = point.life * (index / player.trail.length);
      const size = player.size * point.life * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = player.isDashing ? '#ffaa00' : '#ffffff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Player
    const glow = player.isDashing ? 15 : 5;
    ctx.shadowBlur = glow;
    ctx.shadowColor = player.isDashing ? '#ffaa00' : '#ffffff';
    ctx.fillStyle = player.isDashing ? '#ffaa00' : '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(player.x - 6, player.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 6, player.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();

    if (player.isDashing) {
      ctx.strokeStyle = '#ff4400';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Weapons
    weaponsRef.current.forEach(weapon => {
      ctx.save();
      ctx.translate(weapon.x, weapon.y);
      ctx.rotate(weapon.rotation);
      ctx.font = weapon.size + 'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(weapon.emoji, 0, 0);
      ctx.restore();
    });

    // Particles
    particlesRef.current.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // UI
    const state = gameStateRef.current;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px Arial';
    ctx.fillText(`Difficulty: ${state.difficulty.toFixed(1)}x`, 10, 580);
  }, []);

  const gameLoop = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.isRunning) return;

    if (!state.isPaused) {
      updateControllerInput();
      updatePlayer();
      updateWeapons();
      updateParticles();
      updateGameStats();
      spawnWeapons();
      checkCollisions();
      render();
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [updateControllerInput, updatePlayer, updateWeapons, updateParticles,
      updateGameStats, spawnWeapons, checkCollisions, render]);

  const startGame = useCallback(() => {
    gameStateRef.current = {
      isRunning: true,
      isPaused: false,
      score: 0,
      time: 0,
      combo: 1,
      weaponsDodged: 0,
      energy: MAX_ENERGY,
      maxEnergy: MAX_ENERGY,
      energyRegenRate: ENERGY_REGEN_RATE,
      dashCost: DASH_COST,
      difficulty: 1
    };

    playerRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      size: PLAYER_SIZE,
      speed: PLAYER_SPEED,
      dashSpeed: DASH_SPEED,
      isDashing: false,
      trail: []
    };

    weaponsRef.current = [];
    particlesRef.current = [];

    setShowMenu(false);
    setShowGameOver(false);

    gameLoop();
  }, [gameLoop]);

  const backToMenu = () => {
    const state = gameStateRef.current;
    state.isRunning = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setShowMenu(true);
    setShowGameOver(false);
  };

  const clearHighScores = () => {
    if (confirm('Clear all high scores?')) {
      setHighScores([]);
      localStorage.removeItem('weaponDodgeHighScores');
    }
  };

  const state = gameStateRef.current;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="relative">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-gray-700 rounded-lg bg-black mx-auto block shadow-2xl"
          />

          {/* Menu Overlay */}
          {showMenu && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center text-white space-y-6 p-8">
                <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  🎯 WEAPON DODGE ARENA
                </h2>
                <p className="text-xl mb-6">Survive the incoming weapon storm!</p>

                <div className="space-y-2 text-left bg-gray-800 bg-opacity-50 p-4 rounded-lg max-w-md mx-auto">
                  <h3 className="text-lg font-semibold mb-2">Controls:</h3>
                  <div>🎮 Xbox Controller: Left Stick to Move</div>
                  <div>⌨️ Keyboard: WASD or Arrow Keys</div>
                  <div>🔥 Space/Shift to Dash (Limited Energy)</div>
                </div>

                <button
                  onClick={startGame}
                  className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  🚀 START GAME
                </button>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {showGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center text-white space-y-6 p-8">
                <h2 className="text-5xl font-bold mb-4 text-red-500">💀 GAME OVER</h2>

                <div className="space-y-2 text-2xl">
                  <div>Score: <span className="font-bold text-yellow-400">{Math.floor(state.score)}</span></div>
                  <div>Time: <span className="font-bold">{Math.floor(state.time)}s</span></div>
                  <div>Weapons Dodged: <span className="font-bold">{state.weaponsDodged}</span></div>
                </div>

                <div className="flex gap-4 justify-center mt-8">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200"
                  >
                    🔄 PLAY AGAIN
                  </button>
                  <button
                    onClick={backToMenu}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all duration-200"
                  >
                    📋 MAIN MENU
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Stats */}
        {state.isRunning && !showMenu && !showGameOver && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4 text-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-400">Score</div>
                <div className="text-2xl font-bold">{Math.floor(state.score)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Time</div>
                <div className="text-2xl font-bold">{Math.floor(state.time)}s</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Combo</div>
                <div className="text-2xl font-bold text-yellow-400">x{state.combo.toFixed(1)}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">⚡ Dash Energy</span>
                <span>{Math.floor(state.energy)}/{state.maxEnergy}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-100"
                  style={{ width: `${(state.energy / state.maxEnergy) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* High Scores */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">🏆 High Scores</h3>
            {highScores.length > 0 && (
              <button
                onClick={clearHighScores}
                className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                🗑️ Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            {highScores.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No scores yet - be the first!</div>
            ) : (
              highScores.map((score, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-700 rounded p-2"
                >
                  <span className="text-yellow-400 font-bold">#{index + 1}</span>
                  <span className="text-sm text-gray-400">{score.date}</span>
                  <span className="font-bold">{score.score} pts</span>
                  <span className="text-sm">({score.time}s)</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeaponDodgeGame;
