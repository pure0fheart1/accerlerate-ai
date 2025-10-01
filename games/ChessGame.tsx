import React, { useState, useCallback, useEffect } from 'react';
import { getGamepadState, useGamepad, isButtonJustPressed, type GamepadState } from '../lib/gamepadUtils';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

interface Position {
  row: number;
  col: number;
}

interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  notation: string;
}

const ChessGame: React.FC = () => {
  const [board, setBoard] = useState<(Piece | null)[][]>(initializeBoard());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('white');
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [isStalemate, setIsStalemate] = useState(false);
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[], black: Piece[] }>({
    white: [],
    black: []
  });
  const [cursorPosition, setCursorPosition] = useState<Position>({ row: 7, col: 4 }); // Start at white king
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [previousGamepadState, setPreviousGamepadState] = useState<GamepadState | null>(null);

  // Gamepad support
  useEffect(() => {
    const cleanup = useGamepad((connected) => {
      setGamepadConnected(connected);
    });

    return cleanup;
  }, []);

  // Gamepad polling
  useEffect(() => {
    if (!gamepadConnected) return;

    const gameLoop = setInterval(() => {
      const currentState = getGamepadState();
      if (!currentState) return;

      // D-Pad navigation
      if (isButtonJustPressed('dpadUp', previousGamepadState, currentState)) {
        setCursorPosition(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
      }
      if (isButtonJustPressed('dpadDown', previousGamepadState, currentState)) {
        setCursorPosition(prev => ({ ...prev, row: Math.min(7, prev.row + 1) }));
      }
      if (isButtonJustPressed('dpadLeft', previousGamepadState, currentState)) {
        setCursorPosition(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
      }
      if (isButtonJustPressed('dpadRight', previousGamepadState, currentState)) {
        setCursorPosition(prev => ({ ...prev, col: Math.min(7, prev.col + 1) }));
      }

      // A button to select/move
      if (isButtonJustPressed('a', previousGamepadState, currentState)) {
        handleSquareClick(cursorPosition.row, cursorPosition.col);
      }

      // B button to deselect
      if (isButtonJustPressed('b', previousGamepadState, currentState)) {
        setSelectedSquare(null);
        setValidMoves([]);
      }

      // Start button to reset game
      if (isButtonJustPressed('start', previousGamepadState, currentState)) {
        resetGame();
      }

      setPreviousGamepadState(currentState);
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [gamepadConnected, previousGamepadState, cursorPosition]);

  // Initialize chess board with starting positions
  function initializeBoard(): (Piece | null)[][] {
    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Black pieces
    board[0][0] = { type: 'rook', color: 'black' };
    board[0][1] = { type: 'knight', color: 'black' };
    board[0][2] = { type: 'bishop', color: 'black' };
    board[0][3] = { type: 'queen', color: 'black' };
    board[0][4] = { type: 'king', color: 'black' };
    board[0][5] = { type: 'bishop', color: 'black' };
    board[0][6] = { type: 'knight', color: 'black' };
    board[0][7] = { type: 'rook', color: 'black' };
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: 'pawn', color: 'black' };
    }

    // White pieces
    for (let col = 0; col < 8; col++) {
      board[6][col] = { type: 'pawn', color: 'white' };
    }
    board[7][0] = { type: 'rook', color: 'white' };
    board[7][1] = { type: 'knight', color: 'white' };
    board[7][2] = { type: 'bishop', color: 'white' };
    board[7][3] = { type: 'queen', color: 'white' };
    board[7][4] = { type: 'king', color: 'white' };
    board[7][5] = { type: 'bishop', color: 'white' };
    board[7][6] = { type: 'knight', color: 'white' };
    board[7][7] = { type: 'rook', color: 'white' };

    return board;
  }

  // Get piece unicode symbol
  const getPieceSymbol = (piece: Piece): string => {
    const symbols = {
      white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
      black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
    };
    return symbols[piece.color][piece.type];
  };

  // Check if position is valid
  const isValidPosition = (pos: Position): boolean => {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  };

  // Get all valid moves for a piece
  const getValidMoves = useCallback((pos: Position, board: (Piece | null)[][], checkForCheck = true): Position[] => {
    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Forward move
        const forward = { row: pos.row + direction, col: pos.col };
        if (isValidPosition(forward) && !board[forward.row][forward.col]) {
          moves.push(forward);

          // Double move from start
          const doubleForward = { row: pos.row + 2 * direction, col: pos.col };
          if (pos.row === startRow && !board[doubleForward.row][doubleForward.col]) {
            moves.push(doubleForward);
          }
        }

        // Captures
        const captures = [
          { row: pos.row + direction, col: pos.col - 1 },
          { row: pos.row + direction, col: pos.col + 1 }
        ];
        for (const cap of captures) {
          if (isValidPosition(cap) && board[cap.row][cap.col]?.color !== piece.color && board[cap.row][cap.col]) {
            moves.push(cap);
          }
        }

        // En passant
        const lastMove = moveHistory[moveHistory.length - 1];
        if (lastMove?.piece.type === 'pawn' && Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
          if (lastMove.to.row === pos.row && Math.abs(lastMove.to.col - pos.col) === 1) {
            moves.push({ row: pos.row + direction, col: lastMove.to.col });
          }
        }
        break;

      case 'knight':
        const knightMoves = [
          { row: pos.row - 2, col: pos.col - 1 }, { row: pos.row - 2, col: pos.col + 1 },
          { row: pos.row - 1, col: pos.col - 2 }, { row: pos.row - 1, col: pos.col + 2 },
          { row: pos.row + 1, col: pos.col - 2 }, { row: pos.row + 1, col: pos.col + 2 },
          { row: pos.row + 2, col: pos.col - 1 }, { row: pos.row + 2, col: pos.col + 1 }
        ];
        for (const move of knightMoves) {
          if (isValidPosition(move) && board[move.row][move.col]?.color !== piece.color) {
            moves.push(move);
          }
        }
        break;

      case 'bishop':
        const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of bishopDirections) {
          for (let i = 1; i < 8; i++) {
            const newPos = { row: pos.row + dr * i, col: pos.col + dc * i };
            if (!isValidPosition(newPos)) break;
            if (board[newPos.row][newPos.col]) {
              if (board[newPos.row][newPos.col]?.color !== piece.color) {
                moves.push(newPos);
              }
              break;
            }
            moves.push(newPos);
          }
        }
        break;

      case 'rook':
        const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of rookDirections) {
          for (let i = 1; i < 8; i++) {
            const newPos = { row: pos.row + dr * i, col: pos.col + dc * i };
            if (!isValidPosition(newPos)) break;
            if (board[newPos.row][newPos.col]) {
              if (board[newPos.row][newPos.col]?.color !== piece.color) {
                moves.push(newPos);
              }
              break;
            }
            moves.push(newPos);
          }
        }
        break;

      case 'queen':
        const queenDirections = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for (const [dr, dc] of queenDirections) {
          for (let i = 1; i < 8; i++) {
            const newPos = { row: pos.row + dr * i, col: pos.col + dc * i };
            if (!isValidPosition(newPos)) break;
            if (board[newPos.row][newPos.col]) {
              if (board[newPos.row][newPos.col]?.color !== piece.color) {
                moves.push(newPos);
              }
              break;
            }
            moves.push(newPos);
          }
        }
        break;

      case 'king':
        const kingMoves = [
          { row: pos.row - 1, col: pos.col - 1 }, { row: pos.row - 1, col: pos.col }, { row: pos.row - 1, col: pos.col + 1 },
          { row: pos.row, col: pos.col - 1 }, { row: pos.row, col: pos.col + 1 },
          { row: pos.row + 1, col: pos.col - 1 }, { row: pos.row + 1, col: pos.col }, { row: pos.row + 1, col: pos.col + 1 }
        ];
        for (const move of kingMoves) {
          if (isValidPosition(move) && board[move.row][move.col]?.color !== piece.color) {
            moves.push(move);
          }
        }

        // Castling
        if (!piece.hasMoved && checkForCheck) {
          // Kingside castling
          const kingsideRook = board[pos.row][7];
          if (kingsideRook?.type === 'rook' && !kingsideRook.hasMoved &&
              !board[pos.row][5] && !board[pos.row][6]) {
            if (!isSquareUnderAttack({ row: pos.row, col: 4 }, piece.color, board) &&
                !isSquareUnderAttack({ row: pos.row, col: 5 }, piece.color, board) &&
                !isSquareUnderAttack({ row: pos.row, col: 6 }, piece.color, board)) {
              moves.push({ row: pos.row, col: 6 });
            }
          }

          // Queenside castling
          const queensideRook = board[pos.row][0];
          if (queensideRook?.type === 'rook' && !queensideRook.hasMoved &&
              !board[pos.row][1] && !board[pos.row][2] && !board[pos.row][3]) {
            if (!isSquareUnderAttack({ row: pos.row, col: 4 }, piece.color, board) &&
                !isSquareUnderAttack({ row: pos.row, col: 3 }, piece.color, board) &&
                !isSquareUnderAttack({ row: pos.row, col: 2 }, piece.color, board)) {
              moves.push({ row: pos.row, col: 2 });
            }
          }
        }
        break;
    }

    // Filter out moves that would put own king in check
    if (checkForCheck) {
      return moves.filter(move => {
        const testBoard = board.map(row => [...row]);
        testBoard[move.row][move.col] = testBoard[pos.row][pos.col];
        testBoard[pos.row][pos.col] = null;
        return !isKingInCheck(piece.color, testBoard);
      });
    }

    return moves;
  }, [moveHistory]);

  // Check if a square is under attack
  const isSquareUnderAttack = (pos: Position, color: PieceColor, board: (Piece | null)[][]): boolean => {
    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.color === opponentColor) {
          const moves = getValidMoves({ row, col }, board, false);
          if (moves.some(m => m.row === pos.row && m.col === pos.col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Find king position
  const findKing = (color: PieceColor, board: (Piece | null)[][]): Position | null => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  };

  // Check if king is in check
  const isKingInCheck = (color: PieceColor, board: (Piece | null)[][]): boolean => {
    const kingPos = findKing(color, board);
    if (!kingPos) return false;
    return isSquareUnderAttack(kingPos, color, board);
  };

  // Get move notation
  const getMoveNotation = (from: Position, to: Position, piece: Piece, captured?: Piece): string => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fromFile = files[from.col];
    const toFile = files[to.col];
    const toRank = (8 - to.row).toString();

    if (piece.type === 'pawn') {
      if (captured) {
        return `${fromFile}x${toFile}${toRank}`;
      }
      return `${toFile}${toRank}`;
    }

    const pieceSymbol = piece.type === 'knight' ? 'N' : piece.type.charAt(0).toUpperCase();
    const captureSymbol = captured ? 'x' : '';
    return `${pieceSymbol}${captureSymbol}${toFile}${toRank}`;
  };

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    if (isCheckmate || isStalemate || promotionSquare) return;

    const clickedPiece = board[row][col];

    // If no square selected, select this square if it has a piece of current turn
    if (!selectedSquare) {
      if (clickedPiece?.color === currentTurn) {
        setSelectedSquare({ row, col });
        setValidMoves(getValidMoves({ row, col }, board));
      }
      return;
    }

    // If clicking the same square, deselect
    if (selectedSquare.row === row && selectedSquare.col === col) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // If clicking another piece of the same color, select that instead
    if (clickedPiece?.color === currentTurn) {
      setSelectedSquare({ row, col });
      setValidMoves(getValidMoves({ row, col }, board));
      return;
    }

    // Check if this is a valid move
    const isValid = validMoves.some(m => m.row === row && m.col === col);
    if (isValid) {
      makeMove(selectedSquare, { row, col });
    }

    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Make a move
  const makeMove = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    if (!piece) return;

    const captured = newBoard[to.row][to.col];
    const notation = getMoveNotation(from, to, piece, captured || undefined);

    // Handle castling
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const isKingside = to.col > from.col;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? 5 : 3;
      newBoard[from.row][rookToCol] = newBoard[from.row][rookFromCol];
      newBoard[from.row][rookFromCol] = null;
      if (newBoard[from.row][rookToCol]) {
        newBoard[from.row][rookToCol]!.hasMoved = true;
      }
    }

    // Handle en passant capture
    if (piece.type === 'pawn' && from.col !== to.col && !captured) {
      newBoard[from.row][to.col] = null;
    }

    // Move piece
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
    newBoard[from.row][from.col] = null;

    // Check for pawn promotion
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      setPromotionSquare(to);
    }

    // Update captured pieces
    if (captured) {
      setCapturedPieces(prev => ({
        ...prev,
        [captured.color]: [...prev[captured.color], captured]
      }));
    }

    // Update move history
    setMoveHistory(prev => [...prev, { from, to, piece, captured: captured || undefined, notation }]);

    setBoard(newBoard);

    // Check game state
    const nextTurn = currentTurn === 'white' ? 'black' : 'white';
    setCurrentTurn(nextTurn);

    // Check for check/checkmate/stalemate
    const inCheck = isKingInCheck(nextTurn, newBoard);
    setIsCheck(inCheck);

    // Check if player has any valid moves
    let hasValidMoves = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (newBoard[r][c]?.color === nextTurn) {
          const moves = getValidMoves({ row: r, col: c }, newBoard);
          if (moves.length > 0) {
            hasValidMoves = true;
            break;
          }
        }
      }
      if (hasValidMoves) break;
    }

    if (!hasValidMoves) {
      if (inCheck) {
        setIsCheckmate(true);
      } else {
        setIsStalemate(true);
      }
    }
  };

  // Handle pawn promotion
  const handlePromotion = (pieceType: PieceType) => {
    if (!promotionSquare) return;

    const newBoard = board.map(row => [...row]);
    newBoard[promotionSquare.row][promotionSquare.col] = {
      type: pieceType,
      color: currentTurn === 'white' ? 'black' : 'white',
      hasMoved: true
    };

    setBoard(newBoard);
    setPromotionSquare(null);
  };

  // Reset game
  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn('white');
    setMoveHistory([]);
    setIsCheck(false);
    setIsCheckmate(false);
    setIsStalemate(false);
    setPromotionSquare(null);
    setCapturedPieces({ white: [], black: [] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">♔ Chess {gamepadConnected && '🎮'}</h1>
                    <p className="text-gray-300">
                      {isCheckmate
                        ? `Checkmate! ${currentTurn === 'white' ? 'Black' : 'White'} wins!`
                        : isStalemate
                        ? 'Stalemate! Draw.'
                        : isCheck
                        ? `${currentTurn === 'white' ? 'White' : 'Black'} is in check!`
                        : `${currentTurn === 'white' ? 'White' : 'Black'}'s turn`}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {gamepadConnected && (
                      <div className="text-white/80 text-sm">
                        D-Pad: Move | A: Select | B: Cancel | Start: New Game
                      </div>
                    )}
                    <button
                      onClick={resetGame}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
                    >
                      New Game
                    </button>
                  </div>
                </div>
              </div>

              {/* Chess Board */}
              <div className="p-8 bg-gray-900 flex items-center justify-center">
                <div className="inline-block border-4 border-gray-700 rounded-lg shadow-2xl">
                  {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((piece, colIndex) => {
                        const isLight = (rowIndex + colIndex) % 2 === 0;
                        const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
                        const isValidMove = validMoves.some(m => m.row === rowIndex && m.col === colIndex);
                        const isLastMove = moveHistory.length > 0 && (
                          (moveHistory[moveHistory.length - 1].from.row === rowIndex && moveHistory[moveHistory.length - 1].from.col === colIndex) ||
                          (moveHistory[moveHistory.length - 1].to.row === rowIndex && moveHistory[moveHistory.length - 1].to.col === colIndex)
                        );
                        const isCursor = gamepadConnected && cursorPosition.row === rowIndex && cursorPosition.col === colIndex;

                        return (
                          <div
                            key={colIndex}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                            className={`
                              w-16 h-16 flex items-center justify-center text-6xl cursor-pointer relative
                              transition-all duration-150
                              ${isLight ? 'bg-amber-100' : 'bg-amber-700'}
                              ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                              ${isLastMove ? 'bg-yellow-300 bg-opacity-50' : ''}
                              ${isCursor ? 'ring-4 ring-green-400 ring-inset' : ''}
                              hover:brightness-110
                            `}
                          >
                            {piece && (
                              <span
                                className={`font-bold ${
                                  piece.color === 'white'
                                    ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]'
                                    : 'text-gray-900 drop-shadow-[0_2px_3px_rgba(255,255,255,0.4)]'
                                }`}
                                style={{
                                  filter: piece.color === 'white'
                                    ? 'brightness(1.15) contrast(1.2)'
                                    : 'brightness(0.3) contrast(1.3)'
                                }}
                              >
                                {getPieceSymbol(piece)}
                              </span>
                            )}
                            {isValidMove && (
                              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                                <div className={`rounded-full ${piece ? 'w-14 h-14 border-4 border-green-500' : 'w-4 h-4 bg-green-500'}`} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Move History */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Move History</h3>
              <div className="h-96 overflow-y-auto space-y-2">
                {moveHistory.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No moves yet</p>
                ) : (
                  moveHistory.map((move, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 rounded-lg p-3 text-white"
                    >
                      <span className="font-bold text-gray-400">
                        {Math.floor(index / 2) + 1}.
                        {index % 2 === 0 ? ' ' : '... '}
                      </span>
                      {move.notation}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Captured Pieces */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Captured</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">White</p>
                  <div className="flex flex-wrap gap-1">
                    {capturedPieces.white.map((piece, index) => (
                      <span key={index} className="text-2xl">
                        {getPieceSymbol(piece)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Black</p>
                  <div className="flex flex-wrap gap-1">
                    {capturedPieces.black.map((piece, index) => (
                      <span key={index} className="text-2xl">
                        {getPieceSymbol(piece)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promotion Modal */}
        {promotionSquare && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border-4 border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Promotion</h3>
              <div className="flex gap-4">
                {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map(type => {
                  const piece = { type, color: currentTurn === 'white' ? 'black' : 'white' } as Piece;
                  return (
                    <button
                      key={type}
                      onClick={() => handlePromotion(type)}
                      className="w-20 h-20 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-200"
                    >
                      <span
                        className={`text-6xl font-bold ${
                          piece.color === 'white'
                            ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]'
                            : 'text-gray-900 drop-shadow-[0_2px_3px_rgba(255,255,255,0.4)]'
                        }`}
                        style={{
                          filter: piece.color === 'white'
                            ? 'brightness(1.15) contrast(1.2)'
                            : 'brightness(0.3) contrast(1.3)'
                        }}
                      >
                        {getPieceSymbol(piece)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGame;