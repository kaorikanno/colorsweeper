import { useState } from 'react'
import { Board } from './components/Board'
import { COLOR_HEX } from './colors'
import { DEFAULT_MINE_PERCENTAGE, DEFAULT_RADIUS, MAX_RADIUS, MIN_RADIUS, MINE_PERCENTAGE_OPTIONS } from './constants'
import { adjacentCells, canChord, cellCount, chordReveal, cycleMark, newGame, PRIMARIES, reveal } from './game'
import { keyOf } from './hex'
import type { GameState, Primary } from './types'

const RADII = Array.from({ length: MAX_RADIUS - MIN_RADIUS + 1 }, (_, i) => MIN_RADIUS + i)

function minesFor(radius: number, minePercentage: number): number {
  return Math.floor((cellCount(radius) * minePercentage) / 100)
}

export default function App() {
  const [radius, setRadius] = useState(DEFAULT_RADIUS)
  const [minePercentage, setMinePercentage] = useState(DEFAULT_MINE_PERCENTAGE)
  const [game, setGame] = useState<GameState>(() =>
    newGame(DEFAULT_RADIUS, minesFor(DEFAULT_RADIUS, DEFAULT_MINE_PERCENTAGE)),
  )
  const [highlightedKeys, setHighlightedKeys] = useState<Set<string>>(() => new Set())
  const mineCount = minesFor(radius, minePercentage)

  const restart = (r: number, percentage: number) => {
    setHighlightedKeys(new Set())
    setGame(newGame(r, minesFor(r, percentage)))
  }

  const handleReveal = (key: string) => {
    setHighlightedKeys(new Set())
    setGame((g) => reveal(g, key))
  }

  const handleMark = (key: string) => {
    if (game.status !== 'playing') return
    setGame((g) => cycleMark(g, key))
  }

  const handleChordStart = (key: string) => {
    if (game.status !== 'playing') return
    const cell = game.board.get(key)
    if (!cell || !cell.revealed || cell.isMine) return
    const covered = adjacentCells(game.board, cell)
      .filter((n) => !n.revealed)
      .map((n) => keyOf(n.q, n.r))
    setHighlightedKeys(new Set(covered))
  }

  const handleChordEnd = (key: string) => {
    setHighlightedKeys(new Set())
    if (game.status !== 'playing') return
    const cell = game.board.get(key)
    if (!cell || !cell.revealed || cell.isMine) return
    if (canChord(game.board, cell)) setGame((g) => chordReveal(g, key))
  }

  const handleChordCancel = () => setHighlightedKeys(new Set())

  const handleRadiusChange = (r: number) => {
    setRadius(r)
    restart(r, minePercentage)
  }

  const handleMinePercentageChange = (percentage: number) => {
    setMinePercentage(percentage)
    restart(radius, percentage)
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
          <select
            value={minePercentage}
            onChange={(e) => handleMinePercentageChange(Number(e.target.value))}
          >
            {MINE_PERCENTAGE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}%
              </option>
            ))}
          </select>
          <span className="max-note">{mineCount} mines</span>
        </label>
        <button onClick={() => restart(radius, minePercentage)}>New game</button>
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
          highlightedKeys={highlightedKeys}
          onReveal={handleReveal}
          onMark={handleMark}
          onChordStart={handleChordStart}
          onChordEnd={handleChordEnd}
          onChordCancel={handleChordCancel}
        />
        {game.status !== 'playing' && (
          <div className={`banner ${game.status}`}>
            <strong>{game.status === 'won' ? 'You won!' : 'Boom — that was a mine.'}</strong>
            <button onClick={() => restart(radius, minePercentage)}>Play again</button>
          </div>
        )}
      </div>
    </div>
  )
}
