import { COLOR_HEX } from '../colors'
import { hexPoints } from '../hex'
import type { Cell, GameStatus, Overlay } from '../types'

interface HexCellProps {
  cell: Cell
  status: GameStatus
  overlay: Overlay | null
  highlighted: boolean
  x: number
  y: number
  size: number
  onReveal: () => void
  onSecondaryClick: () => void
}

export function HexCell({ cell, status, overlay, highlighted, x, y, size, onReveal, onSecondaryClick }: HexCellProps) {
  const points = hexPoints(x, y, size * 0.94)
  const showMineAtGameEnd = status !== 'playing' && cell.isMine

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onSecondaryClick()
  }

  if (cell.revealed && cell.isMine) {
    return (
      <g className="cell exploded">
        <polygon points={points} fill={COLOR_HEX[cell.mineColor!]} />
        <circle cx={x} cy={y} r={size * 0.3} fill="rgba(0,0,0,0.55)" />
      </g>
    )
  }

  if (cell.revealed) {
    return (
      <g className="cell revealed" onContextMenu={handleContextMenu}>
        <polygon points={points} className="revealed-base" />
        {overlay && <polygon points={points} fill={COLOR_HEX[overlay.color]} fillOpacity={overlay.opacity} />}
      </g>
    )
  }

  if (showMineAtGameEnd) {
    return (
      <g className="cell revealed-mine">
        <polygon points={points} fill={COLOR_HEX[cell.mineColor!]} />
        <polygon points={hexPoints(x, y, size * 0.62)} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2} />
      </g>
    )
  }

  return (
    <g
      className={`cell covered${status === 'playing' ? ' interactive' : ''}`}
      onClick={onReveal}
      onContextMenu={handleContextMenu}
    >
      <polygon points={points} className="covered-base" />
      {highlighted && <polygon points={hexPoints(x, y, size * 0.72)} className="highlight-ring" />}
      {cell.mark && (
        <circle cx={x} cy={y} r={size * 0.32} fill={COLOR_HEX[cell.mark]} stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />
      )}
    </g>
  )
}
