// sudokuUtils.ts
export interface SudokuCell {
  value: number | null;
  isGiven: boolean; // Pre-filled cells (unchangeable)
  isError?: boolean; // Temp flag for invalid moves
}

export type SudokuBoard = SudokuCell[][];

// Validation helpers
export const isValidMove = (board: SudokuBoard, row: number, col: number, num: number): boolean => {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c].value === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col].value === num) return false;
  }
  // Check 3x3 subgrid
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c].value === num) return false;
    }
  }
  return true;
};

// Backtracking solver (used for generation and completion check)
const solveBoard = (board: SudokuBoard): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col].value = num;
            if (solveBoard(board)) return true;
            board[row][col].value = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate a full solved board from seed
const generateFullBoard = (seed: number): SudokuBoard => {
  const board: SudokuBoard = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ value: null, isGiven: false }))
  );

  const rng = new SeededRandom(seed);

  const shuffle = (arr: number[]) => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Fill diagonal 3x3 blocks first (guarantees solvability)
  for (let block = 0; block < 9; block += 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[block + i][block + j].value = nums[idx++];
      }
    }
  }

  // Solve the rest
  solveBoard(board);
  return board;
};

// Create puzzle by removing cells based on difficulty
const createPuzzle = (fullBoard: SudokuBoard, difficulty: 'easy' | 'medium' | 'hard' | 'expert', level: number, seed: number): SudokuBoard => {
  const board = fullBoard.map(row => row.map(cell => ({ ...cell, isGiven: false })));
  const clueCounts = { easy: 55, medium: 45, hard: 35, expert: 25 };
  const clues = clueCounts[difficulty] + (level % 5); // Slight variation per level
  const cellsToRemove = 81 - clues;

  const rng = new SeededRandom(seed + 1000);

  // Randomly remove cells
  const positions = Array.from({ length: 81 }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const pos = positions[i];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    board[row][col].value = null;
    board[row][col].isGiven = false;
  }

  // Set givens
  board.forEach(row => row.forEach(cell => {
    if (cell.value !== null) cell.isGiven = true;
  }));

  return board;
};

// Get difficulty from level (cycles every 40 levels)
export const getDifficultyFromLevel = (level: number): 'easy' | 'medium' | 'hard' | 'expert' => {
  const cycle = (level - 1) % 40;
  if (cycle < 10) return 'easy';
  if (cycle < 20) return 'medium';
  if (cycle < 30) return 'hard';
  return 'expert';
};

// Generate puzzle for level
export const generatePuzzle = (level: number): SudokuBoard => {
  const seed = level * 12345; // Simple seed for reproducibility
  const fullBoard = generateFullBoard(seed);
  const difficulty = getDifficultyFromLevel(level);
  return createPuzzle(fullBoard, difficulty, level, seed);
};

// Check if board is complete and solved
export const isBoardComplete = (board: SudokuBoard): boolean => {
  // Check if all cells are filled
  const allFilled = board.every(row => row.every(cell => cell.value !== null));
  if (!allFilled) return false;

  // Check if all rows, columns, and boxes are valid
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const num = board[i][j].value;
      if (num === null) return false;

      // Temporarily remove the value to check validity
      board[i][j].value = null;
      const valid = isValidMove(board, i, j, num);
      board[i][j].value = num;

      if (!valid) return false;
    }
  }

  return true;
};

// Get empty cells count for progress
export const getEmptyCells = (board: SudokuBoard): number => {
  return board.flat().filter(cell => cell.value === null).length;
};
