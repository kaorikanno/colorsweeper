import { MAX_ADJACENT_MINES } from './constants'
import { hexagonCoords, keyOf, NEIGHBOR_OFFSETS } from './hex'
import type { Board, Cell, GameState, MixColor, Overlay, Primary } from './types'

export const PRIMARIES: readonly Primary[] = ['red', 'yellow', 'blue']

export function cellCount(radius: number): number {
  return 3 * radius * radius + 3 * radius + 1
}

export function maxMines(radius: number): number {
  return Math.floor(cellCount(radius) / 3)
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Randomized greedy placement with restarts: a mine may only be placed where
 * none of its neighbors would exceed MAX_ADJACENT_MINES adjacent mines.
 * Excluded keys never receive a mine.
 */
function placeMines(
  keys: string[],
  neighborsOf: Map<string, string[]>,
  count: number,
  excluded: ReadonlySet<string>,
): Set<string> {
  for (let attempt = 0; attempt < 500; attempt++) {
    const adjacent = new Map<string, number>()
    const mines = new Set<string>()
    for (const k of shuffle([...keys])) {
      if (mines.size === count) break
      if (excluded.has(k)) continue
      const neighbors = neighborsOf.get(k)!
      if (neighbors.every((n) => (adjacent.get(n) ?? 0) < MAX_ADJACENT_MINES)) {
        mines.add(k)
        for (const n of neighbors) adjacent.set(n, (adjacent.get(n) ?? 0) + 1)
      }
    }
    if (mines.size === count) return mines
  }
  throw new Error(`Could not place ${count} mines within the adjacency constraint`)
}

/** Board starts with no mines; they are placed on the first reveal. */
export function newGame(radius: number, mineCount: number): GameState {
  const board: Board = new Map()
  for (const [q, r] of hexagonCoords(radius)) {
    board.set(keyOf(q, r), { q, r, isMine: false, mineColor: null, revealed: false, mark: null })
  }
  return { board, status: 'playing', mineCount, minesPlaced: false }
}

function neighborKeys(board: Board, key: string): string[] {
  const cell = board.get(key)!
  return NEIGHBOR_OFFSETS.map(([dq, dr]) => keyOf(cell.q + dq, cell.r + dr)).filter((k) => board.has(k))
}

/**
 * Places mines everywhere except the first-clicked cell and its neighbors,
 * so the first reveal is always a white, zero-adjacent cell.
 */
function withMinesPlaced(state: GameState, safeKey: string): GameState {
  const keys = [...state.board.keys()]
  const neighborsOf = new Map(keys.map((k) => [k, neighborKeys(state.board, k)]))
  const excluded = new Set([safeKey, ...neighborsOf.get(safeKey)!])
  const mines = placeMines(keys, neighborsOf, state.mineCount, excluded)

  const board: Board = new Map()
  for (const [k, cell] of state.board) {
    board.set(
      k,
      mines.has(k)
        ? { ...cell, isMine: true, mineColor: PRIMARIES[Math.floor(Math.random() * PRIMARIES.length)] }
        : cell,
    )
  }
  return { ...state, board, minesPlaced: true }
}

export function adjacentMineColors(board: Board, cell: Cell): Primary[] {
  const colors: Primary[] = []
  for (const [dq, dr] of NEIGHBOR_OFFSETS) {
    const n = board.get(keyOf(cell.q + dq, cell.r + dr))
    if (n?.isMine && n.mineColor) colors.push(n.mineColor)
  }
  return colors
}

export function adjacentCells(board: Board, cell: Cell): Cell[] {
  const cells: Cell[] = []
  for (const [dq, dr] of NEIGHBOR_OFFSETS) {
    const n = board.get(keyOf(cell.q + dq, cell.r + dr))
    if (n) cells.push(n)
  }
  return cells
}

/**
 * A chord is allowed once the number of marks around a cell reaches its
 * adjacent mine count, regardless of whether those marks are on the actual
 * mines — so mis-marking and chording can detonate a real mine.
 */
export function canChord(board: Board, cell: Cell): boolean {
  const adjacent = adjacentCells(board, cell)
  const mineCount = adjacent.filter((n) => n.isMine).length
  const markCount = adjacent.filter((n) => n.mark !== null).length
  return markCount >= mineCount
}

const SECONDARY: Record<string, MixColor> = {
  'red,yellow': 'orange',
  'blue,red': 'purple',
  'blue,yellow': 'green',
}

const OPACITY_BY_COUNT = [0.33, 0.66, 1]

/**
 * Count drives opacity; the set of unique hues drives the color, so
 * duplicates collapse (red+red+yellow renders the same as red+yellow+yellow).
 */
export function deriveOverlay(colors: Primary[]): Overlay | null {
  if (colors.length === 0) return null
  const unique = [...new Set(colors)].sort()
  const color: MixColor =
    unique.length === 1 ? unique[0] : unique.length === 3 ? 'brown' : SECONDARY[unique.join(',')]
  return { color, opacity: OPACITY_BY_COUNT[colors.length - 1] }
}

export function checkWin(board: Board): boolean {
  for (const cell of board.values()) {
    if (cell.isMine) {
      if (cell.mark !== cell.mineColor) return false
    } else if (!cell.revealed) {
      return false
    }
  }
  return true
}

export function reveal(state: GameState, key: string): GameState {
  const target = state.board.get(key)
  if (state.status !== 'playing' || !target || target.revealed || target.mark) return state

  if (!state.minesPlaced) state = withMinesPlaced(state, key)

  const board = new Map(state.board)
  const cell = board.get(key)!
  if (cell.isMine) {
    board.set(key, { ...cell, revealed: true })
    return { ...state, board, status: 'lost' }
  }

  const stack = [key]
  const seen = new Set<string>()
  while (stack.length > 0) {
    const k = stack.pop()!
    if (seen.has(k)) continue
    seen.add(k)
    const c = board.get(k)!
    if (c.revealed || c.isMine || c.mark) continue
    board.set(k, { ...c, revealed: true })
    if (adjacentMineColors(board, c).length === 0) {
      for (const [dq, dr] of NEIGHBOR_OFFSETS) {
        const nk = keyOf(c.q + dq, c.r + dr)
        if (board.has(nk)) stack.push(nk)
      }
    }
  }
  return { ...state, board, status: checkWin(board) ? 'won' : 'playing' }
}

/**
 * Reveals every unmarked neighbor of an already-revealed safe cell once its
 * adjacent mine count is matched by marks (see `canChord`). Marks aren't
 * validated against real mines, so a wrong guess can reveal — and detonate — a mine.
 */
export function chordReveal(state: GameState, cellKey: string): GameState {
  const cell = state.board.get(cellKey)
  if (state.status !== 'playing' || !cell || !cell.revealed || cell.isMine) return state
  if (!canChord(state.board, cell)) return state

  let next = state
  for (const n of adjacentCells(state.board, cell)) next = reveal(next, keyOf(n.q, n.r))
  return next
}

const MARK_ORDER: ReadonlyArray<Primary | null> = [null, 'red', 'yellow', 'blue']

export function cycleMark(state: GameState, key: string): GameState {
  const cell = state.board.get(key)
  if (state.status !== 'playing' || !cell || cell.revealed) return state

  const next = MARK_ORDER[(MARK_ORDER.indexOf(cell.mark) + 1) % MARK_ORDER.length]
  const board = new Map(state.board)
  board.set(key, { ...cell, mark: next })
  const won = state.minesPlaced && checkWin(board)
  return { ...state, board, status: won ? 'won' : 'playing' }
}
