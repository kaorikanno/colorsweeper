import { useEffect } from 'react'

interface HelpModalProps {
  onClose: () => void
}

export function HelpModal({ onClose }: HelpModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How to play</h2>
          <button className="modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <h3>Goal</h3>
        <p>Reveal every safe cell and mark every mine with its true color.</p>

        <h3>Controls</h3>
        <ul>
          <li>Left click reveals a cell.</li>
          <li>Right click cycles a color mark: none → red → yellow → blue.</li>
          <li>Press 1 / 2 / 3 to switch left click into red / yellow / blue mark mode.</li>
          <li>Press space to return left click to reveal mode.</li>
        </ul>

        <h3>Colors</h3>
        <p>
          A revealed safe cell is tinted by the colors of its adjacent mines. One hue shows that
          primary; two different hues mix into a secondary (red + yellow = orange, blue + red =
          purple, blue + yellow = green); all three mix into brown. More adjacent mines means
          stronger opacity. A white cell has no adjacent mines.
        </p>

        <h3>Chord</h3>
        <p>
          Right-press-and-hold a revealed cell to highlight its covered neighbors. Releasing reveals
          them once the number of marks around the cell matches its adjacent mine count — a wrong
          guess can detonate a mine.
        </p>

        <h3>Board options</h3>
        <ul>
          <li>Radius sets the board size.</li>
          <li>Mines sets the mine density as a percentage of cells.</li>
        </ul>

        <h3>Win &amp; lose</h3>
        <p>
          Win by clearing all safe cells and correctly marking every mine with its color. Revealing
          a mine ends the game.
        </p>
      </div>
    </div>
  )
}
