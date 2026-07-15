import { useState } from 'react'
import { Board } from './components/Board'
import { COLOR_HEX } from './colors'
import { cycleMark, MAX_RADIUS, maxMines, MIN_RADIUS, newGame, PRIMARIES, reveal } from './game'
import type { GameState, Primary } from './types'

const RADII = Array.from({ length: MAX_RADIUS - MIN_RADIUS + 1 }, (_, i) => MIN_RADIUS + i)
const DEFAULT_RADIUS = 4
const DEFAULT_MINES = 12

export default function App() {
  const [radius, setRadius] = useState(DEFAULT_RADIUS)
  const [mineCount, setMineCount] = useState(DEFAULT_MINES)
  const [mineInput, setMineInput] = useState(String(DEFAULT_MINES))
  const [game, setGame] = useState<GameState>(() => newGame(DEFAULT_RADIUS, DEFAULT_MINES))

  const restart = (r: number, mines: number) => {
    setGame(newGame(r, mines))
  }

  const handleRadiusChange = (r: number) => {
    const clamped = Math.min(mineCount, maxMines(r))
    setRadius(r)
    setMineCount(clamped)
    setMineInput(String(clamped))
    restart(r, clamped)
  }

  const handleMineInput = (value: string) => {
    setMineInput(value)
    const n = Number.parseInt(value, 10)
    if (Number.isInteger(n) && n >= 1 && n <= maxMines(radius) && n !== mineCount) {
      setMineCount(n)
      restart(radius, n)
    }
  }

  const handleMineBlur = () => {
    const n = Number.parseInt(mineInput, 10)
    const clamped = Number.isInteger(n) ? Math.min(Math.max(n, 1), maxMines(radius)) : mineCount
    setMineInput(String(clamped))
    if (clamped !== mineCount) {
      setMineCount(clamped)
      restart(radius, clamped)
    }
  }

  const marksByColor = new Map<Primary, number>(PRIMARIES.map((c) => [c, 0]))
  let totalMarks = 0
  for (const cell of game.board.values()) {
    if (!cell.revealed && cell.mark) {
      totalMarks++
      marksByColor.set(cell.mark, marksByColor.get(cell.mark)! + 1)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>ColorSweeper</h1>
        <p className="hint">Left click reveals. Right click cycles a color mark — win by revealing every safe cell and marking every mine with its true color.</p>
      </header>

      <div className="controls">
        <label>
          Radius
          <select value={radius} onChange={(e) => handleRadiusChange(Number(e.target.value))}>
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mines
          <input
            type="number"
            min={1}
            max={maxMines(radius)}
            value={mineInput}
            onChange={(e) => handleMineInput(e.target.value)}
            onBlur={handleMineBlur}
          />
          <span className="max-note">max {maxMines(radius)}</span>
        </label>
        <button onClick={() => restart(radius, mineCount)}>New game</button>
      </div>

      <div className="hud">
        <span className="hud-total">
          Marked {totalMarks} / {mineCount}
        </span>
        {PRIMARIES.map((color) => (
          <span key={color} className="hud-color">
            <span className="swatch" style={{ background: COLOR_HEX[color] }} />
            {marksByColor.get(color)}
          </span>
        ))}
      </div>

      <div className="board-wrap">
        <Board
          game={game}
          radius={radius}
          onReveal={(key) => setGame((g) => reveal(g, key))}
          onMark={(key) => setGame((g) => cycleMark(g, key))}
        />
        {game.status !== 'playing' && (
          <div className={`banner ${game.status}`}>
            <strong>{game.status === 'won' ? 'You won!' : 'Boom — that was a mine.'}</strong>
            <button onClick={() => restart(radius, mineCount)}>Play again</button>
          </div>
        )}
      </div>
    </div>
  )
}
