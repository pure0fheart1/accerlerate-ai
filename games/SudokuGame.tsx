import React, { useState, useEffect, useCallback } from 'react';
import { SudokuBoard, SudokuCell, generatePuzzle, isBoardComplete, getEmptyCells, isValidMove, getDifficultyFromLevel } from '../lib/sudokuUtils';

const SudokuGame: React.FC = () => {
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [history, setHistory] = useState<SudokuBoard[]>([]); // For undo
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [level, setLevel] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Generate puzzle on level change
  useEffect(() => {
    const newBoard = generatePuzzle(level);
    setBoard(newBoard);
    setHistory([newBoard]);
    setIsComplete(false);
    setSelectedCell(null);
    setStartTime(Date.now());
    setTimeElapsed(0);
    setIsPaused(false);
  }, [level]);

  // Timer
  useEffect(() => {
    if (!startTime || isPaused || isComplete) return;
    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, isPaused, isComplete]);

  // Handle number input
  const handleInput = useCallback((num: number) => {
    if (!selectedCell || isComplete || board[selectedCell.row][selectedCell.col].isGiven) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell, isError: false })));
    const { row, col } = selectedCell;

    if (isValidMove(newBoard, row, col, num)) {
      newBoard[row][col].value = num;
      newBoard[row][col].isError = false;
      setHistory(prev => [newBoard, ...prev.slice(0, 20)]); // Limit history to 20 steps
    } else {
      newBoard[row][col].isError = true;
      setTimeout(() => {
        setBoard(prev => prev.map(r => r.map(c => ({ ...c, isError: false }))));
      }, 500);
    }
    setBoard(newBoard);

    // Check completion
    if (isBoardComplete(newBoard)) {
      setIsComplete(true);
    }
  }, [selectedCell, board, isComplete]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (!isComplete) {
      setSelectedCell({ row, col });
    }
  };

  // Handle clear cell
  const handleClear = useCallback(() => {
    if (!selectedCell || isComplete || board[selectedCell.row][selectedCell.col].isGiven) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell, isError: false })));
    newBoard[selectedCell.row][selectedCell.col].value = null;
    setBoard(newBoard);
    setHistory(prev => [newBoard, ...prev.slice(0, 20)]);
  }, [selectedCell, board, isComplete]);

  // Undo
  const handleUndo = () => {
    if (history.length > 1) {
      const prevBoard = history[1];
      setBoard(prevBoard);
      setHistory(prev => prev.slice(1));
    }
  };

  // Navigation
  const handleNextLevel = () => setLevel(prev => prev + 1);
  const handlePrevLevel = () => setLevel(prev => Math.max(1, prev - 1));
  const handleRestart = () => setLevel(prev => prev); // Triggers useEffect to regenerate

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    return `${mins}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Render cell
  const renderCell = (cell: SudokuCell, row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInSameRow = selectedCell?.row === row;
    const isInSameCol = selectedCell?.col === col;
    const isInSameBox = selectedCell &&
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3);

    return (
      <div
        key={`${row}-${col}`}
        className={`
          w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center
          text-base sm:text-lg font-bold select-none cursor-pointer transition-all
          ${isSelected ? 'bg-blue-300 dark:bg-blue-700 ring-2 ring-blue-500' : ''}
          ${!isSelected && (isInSameRow || isInSameCol || isInSameBox) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
          ${cell.isGiven ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 font-extrabold' : 'text-blue-600 dark:text-blue-400'}
          ${cell.isError ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : ''}
          ${col % 3 === 2 && col !== 8 ? 'border-r-2 border-gray-600 dark:border-gray-400' : 'border-r border-gray-300 dark:border-gray-600'}
          ${row % 3 === 2 && row !== 8 ? 'border-b-2 border-gray-600 dark:border-gray-400' : 'border-b border-gray-300 dark:border-gray-600'}
          hover:bg-blue-100 dark:hover:bg-blue-800
        `}
        onClick={() => handleCellClick(row, col)}
      >
        {cell.value || ''}
      </div>
    );
  };

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isComplete) return;

      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key));
      }
      if ((e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') && selectedCell) {
        handleClear();
      }
      if (e.key === 'z' && e.ctrlKey) {
        e.preventDefault();
        handleUndo();
      }

      // Arrow key navigation
      if (selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let newRow = selectedCell.row;
        let newCol = selectedCell.col;

        if (e.key === 'ArrowUp') newRow = Math.max(0, newRow - 1);
        if (e.key === 'ArrowDown') newRow = Math.min(8, newRow + 1);
        if (e.key === 'ArrowLeft') newCol = Math.max(0, newCol - 1);
        if (e.key === 'ArrowRight') newCol = Math.min(8, newCol + 1);

        setSelectedCell({ row: newRow, col: newCol });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleInput, selectedCell, handleClear, isComplete]);

  const difficulty = getDifficultyFromLevel(level);
  const emptyCells = getEmptyCells(board);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 max-w-2xl w-full">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-800 dark:text-white text-center">
          🧩 Sudoku
        </h1>
        <div className="text-center mb-4">
          <span className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
            Level {level}
          </span>
          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
            difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            difficulty === 'hard' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {difficulty.toUpperCase()}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            onClick={handlePrevLevel}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={handleRestart}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
          >
            🔄 Restart
          </button>
          <button
            onClick={handleNextLevel}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
          >
            Next →
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={handleUndo}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={history.length <= 1}
          >
            ↶ Undo
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          <div className="font-semibold">⏱️ Time: {formatTime(timeElapsed)}</div>
          <div className="font-semibold">📊 Remaining: {emptyCells}</div>
          {isComplete && (
            <div className="text-green-600 dark:text-green-400 font-bold animate-pulse">
              ✅ Completed! 🎉
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex justify-center mb-4">
          <div className="grid grid-cols-9 gap-0 bg-gray-800 dark:bg-gray-600 p-1 rounded-lg shadow-xl border-2 border-gray-600 dark:border-gray-400">
            {board.map((row, rowIdx) => row.map((cell, colIdx) => renderCell(cell, rowIdx, colIdx)))}
          </div>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-5 gap-2 mb-4 max-w-md mx-auto">
          {Array.from({ length: 9 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handleInput(i + 1)}
              className="w-full aspect-square bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-lg sm:text-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-full aspect-square bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-base sm:text-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Clear
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto text-center space-y-1">
          <p>🖱️ Click a cell, then enter 1-9 or use number pad</p>
          <p>⌨️ Arrow keys to navigate • Backspace/Delete to clear</p>
          <p>💡 Ctrl+Z to undo • Invalid moves flash red</p>
        </div>
      </div>
    </div>
  );
};

export default SudokuGame;
