/**
 * Упрощённая версия Minesweeper без styled-components
 * Использует обычный CSS и React hooks
 */

import { useState, useEffect, useCallback } from 'react';
import './Minesweeper.css';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isQuestioned: boolean;
  neighborMines: number;
}

type GameState = 'idle' | 'playing' | 'won' | 'lost';

interface MinesweeperProps {
  rows?: number;
  cols?: number;
  mines?: number;
}

export function Minesweeper({ rows = 9, cols = 9, mines = 10 }: MinesweeperProps) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [flagCount, setFlagCount] = useState(mines);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [explodedCell, setExplodedCell] = useState<{ row: number; col: number } | null>(null);

  // Инициализация доски
  const initBoard = useCallback(() => {
    const newBoard: Cell[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            isQuestioned: false,
            neighborMines: 0,
          }))
      );

    // Расставляем мины
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Подсчитываем соседние мины
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameState('idle');
    setFlagCount(mines);
    setTime(0);
    setTimerActive(false);
    setExplodedCell(null);
  }, [rows, cols, mines]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Таймер
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTime((t) => Math.min(t + 1, 999));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  // Открыть ячейку
  const revealCell = useCallback(
    (row: number, col: number) => {
      if (gameState === 'won' || gameState === 'lost') return;

      const newBoard = board.map((r) => r.map((c) => ({ ...c })));
      const cell = newBoard[row][col];

      if (cell.isRevealed || cell.isFlagged || cell.isQuestioned) return;

      if (gameState === 'idle') {
        setGameState('playing');
        setTimerActive(true);
      }

      cell.isRevealed = true;

      // Если мина - проигрыш
      if (cell.isMine) {
        setGameState('lost');
        setExplodedCell({ row, col });
        setTimerActive(false);
        // Открыть все мины
        newBoard.forEach((r) => r.forEach((c) => {
          if (c.isMine) c.isRevealed = true;
        }));
        setBoard(newBoard);
        return;
      }

      // Если пустая ячейка - открыть соседние
      if (cell.neighborMines === 0) {
        const queue: [number, number][] = [[row, col]];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const [r, c] = queue.shift()!;
          const key = `${r},${c}`;
          if (visited.has(key)) continue;
          visited.add(key);

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                !newBoard[nr][nc].isRevealed &&
                !newBoard[nr][nc].isFlagged
              ) {
                newBoard[nr][nc].isRevealed = true;
                if (newBoard[nr][nc].neighborMines === 0) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }

      setBoard(newBoard);

      // Проверка на победу
      const allNonMinesRevealed = newBoard.every((r) =>
        r.every((c) => c.isMine || c.isRevealed)
      );
      if (allNonMinesRevealed) {
        setGameState('won');
        setTimerActive(false);
      }
    },
    [board, gameState, rows, cols]
  );

  // Переключить флаг
  const toggleFlag = useCallback(
    (row: number, col: number) => {
      if (gameState === 'won' || gameState === 'lost') return;

      const newBoard = board.map((r) => r.map((c) => ({ ...c })));
      const cell = newBoard[row][col];

      if (cell.isRevealed) return;

      if (gameState === 'idle') {
        setGameState('playing');
        setTimerActive(true);
      }

      if (!cell.isFlagged && !cell.isQuestioned) {
        cell.isFlagged = true;
        setFlagCount((count) => Math.max(0, count - 1));
      } else if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.isQuestioned = true;
        setFlagCount((count) => count + 1);
      } else if (cell.isQuestioned) {
        cell.isQuestioned = false;
      }
      setBoard(newBoard);
    },
    [board, gameState]
  );

  // Обработчики событий
  const handleCellClick = (row: number, col: number) => {
    revealCell(row, col);
  };

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    toggleFlag(row, col);
  };

  // Рендер цифры (3 разряда)
  const renderCounter = (value: number) => {
    const digits = String(Math.max(0, Math.min(999, value)))
      .padStart(3, '0')
      .split('');
    return (
      <div className="minesweeper-counter">
        {digits.map((digit, i) => (
          <div key={i} className={`minesweeper-digit minesweeper-digit-${digit}`} />
        ))}
      </div>
    );
  };

  // Смайлик
  const getSmileyClass = () => {
    if (gameState === 'won') return 'minesweeper-smiley-win';
    if (gameState === 'lost') return 'minesweeper-smiley-lose';
    return 'minesweeper-smiley-smile';
  };

  return (
    <div className="minesweeper-container">
      {/* Scoreboard */}
      <div className="minesweeper-scoreboard">
        {renderCounter(flagCount)}
        <button className="minesweeper-reset-button" onClick={initBoard}>
          <div className={`minesweeper-smiley ${getSmileyClass()}`} />
        </button>
        {renderCounter(time)}
      </div>

      {/* Minefield */}
      <div className="minesweeper-minefield">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="minesweeper-row">
            {row.map((cell, colIndex) => {
              const isRevealed = cell.isRevealed;
              const isFlagged = cell.isFlagged;
              const isMine = cell.isMine;
              const neighborMines = cell.neighborMines;

              let cellClass = 'minesweeper-cell ';
              if (isRevealed) {
                cellClass += 'minesweeper-cell-revealed';
              } else if (isFlagged) {
                cellClass += 'minesweeper-cell-flagged';
              } else {
                cellClass += 'minesweeper-cell-covered';
              }

              let content = null;
              if (isRevealed) {
                if (isMine) {
                  const mineClass =
                    explodedCell && explodedCell.row === rowIndex && explodedCell.col === colIndex
                      ? 'minesweeper-sprite-mine-exploded'
                      : 'minesweeper-sprite-mine';
                  content = <div className={`minesweeper-cell-sprite ${mineClass}`} />;
                } else if (neighborMines > 0) {
                  content = <div className={`minesweeper-cell-sprite minesweeper-sprite-${neighborMines}`} />;
                } else {
                  content = <div className="minesweeper-cell-sprite minesweeper-sprite-0" />;
                }
              } else if (cell.isFlagged) {
                content = <div className="minesweeper-cell-sprite minesweeper-sprite-flag" />;
              } else if (cell.isQuestioned) {
                content = <div className="minesweeper-cell-sprite minesweeper-sprite-question" />;
              }

              return (
                <div
                  key={colIndex}
                  className={cellClass}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Статус игры */}
      {gameState === 'won' && (
        <div className="mt-4 text-green-600 font-bold">🎉 Победа!</div>
      )}
      {gameState === 'lost' && (
        <div className="mt-4 text-red-600 font-bold">💥 Проигрыш!</div>
      )}
    </div>
  );
}

