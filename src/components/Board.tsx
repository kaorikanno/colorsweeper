import { adjacentMineColors, deriveOverlay } from '../game'
import { axialToPixel, keyOf } from '../hex'
import type { GameState } from '../types'
import { HexCell } from './HexCell'

const HEX_SIZE = 24
const SQRT3 = Math.sqrt(3)

interface BoardProps {
  game: GameState
  radius: number
  onReveal: (key: string) => void
  onMark: (key: string) => void
}

export function Board({ game, radius, onReveal, onMark }: BoardProps) {
  const margin = HEX_SIZE
  const halfWidth = SQRT3 * HEX_SIZE * (radius + 0.5) + margin
  const halfHeight = 1.5 * HEX_SIZE * radius + HEX_SIZE + margin
  const cells = [...game.board.values()]

  return (
    <svg
      className="board"
      viewBox={`${-halfWidth} ${-halfHeight} ${halfWidth * 2} ${halfHeight * 2}`}
      style={{ maxWidth: halfWidth * 2 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {cells.map((cell) => {
        const key = keyOf(cell.q, cell.r)
        const { x, y } = axialToPixel(cell.q, cell.r, HEX_SIZE)
        const overlay =
          cell.revealed && !cell.isMine ? deriveOverlay(adjacentMineColors(game.board, cell)) : null
        return (
          <HexCell
            key={key}
            cell={cell}
            status={game.status}
            overlay={overlay}
            x={x}
            y={y}
            size={HEX_SIZE}
            onReveal={() => onReveal(key)}
            onMark={() => onMark(key)}
          />
        )
      })}
    </svg>
  )
}
