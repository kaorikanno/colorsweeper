export type Primary = 'red' | 'yellow' | 'blue'
export type MixColor = Primary | 'orange' | 'purple' | 'green' | 'brown'

export interface Cell {
  q: number
  r: number
  isMine: boolean
  mineColor: Primary | null
  revealed: boolean
  mark: Primary | null
}

export type Board = Map<string, Cell>

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  board: Board
  status: GameStatus
  mineCount: number
  /** Mines are placed lazily on the first reveal so it always hits a white cell. */
  minesPlaced: boolean
}

/** Fill overlay of a revealed safe cell, derived from its adjacent mines. */
export interface Overlay {
  color: MixColor
  opacity: number
}
