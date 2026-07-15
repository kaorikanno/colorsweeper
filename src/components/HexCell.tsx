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
  onMark: () => void
  onChordStart: () => void
  onChordEnd: () => void
  onChordCancel: () => void
}

export function HexCell({
  cell,
  status,
  overlay,
  highlighted,
  x,
  y,
  size,
  onReveal,
  onMark,
  onChordStart,
  onChordEnd,
  onChordCancel,
}: HexCellProps) {
  const points = hexPoints(x, y, size * 0.94)
  const showMineAtGameEnd = status !== 'playing' && cell.isMine

  const handleMark = (e: React.MouseEvent) => {
    e.preventDefault()
    onMark()
  }

  const handleChordDown = (e: React.MouseEvent) => {
    if (e.button !== 2) return
    e.preventDefault()
    onChordStart()
  }

  const handleChordUp = (e: React.MouseEvent) => {
    if (e.button !== 2) return
    onChordEnd()
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
      <g
        className="cell revealed"
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleChordDown}
        onMouseUp={handleChordUp}
        onMouseLeave={onChordCancel}
      >
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
      onContextMenu={handleMark}
    >
      <polygon points={points} className="covered-base" />
      {highlighted && <polygon points={hexPoints(x, y, size * 0.72)} className="highlight-ring" />}
      {cell.mark && (
        <circle cx={x} cy={y} r={size * 0.32} fill={COLOR_HEX[cell.mark]} stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />
      )}
    </g>
  )
}
