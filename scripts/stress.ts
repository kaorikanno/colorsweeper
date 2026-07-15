import { adjacentMineColors, deriveOverlay, maxMines, newGame, reveal } from '../src/game'
import type { Primary } from '../src/types'

let failures = 0

for (let radius = 3; radius <= 8; radius++) {
  const mines = maxMines(radius)
  const start = performance.now()
  for (let i = 0; i < 200; i++) {
    const game = newGame(radius, mines)
    const keys = [...game.board.keys()]
    const firstKey = keys[Math.floor(Math.random() * keys.length)]
    const { board } = reveal(game, firstKey)

    const first = board.get(firstKey)!
    if (first.isMine || !first.revealed || adjacentMineColors(board, first).length !== 0) {
      console.error(`FIRST CLICK NOT WHITE r=${radius} key=${firstKey}`)
      failures++
    }

    let mineTotal = 0
    for (const cell of board.values()) {
      if (cell.isMine) mineTotal++
      const adj = adjacentMineColors(board, cell).length
      if (adj > 3) {
        console.error(`VIOLATION r=${radius} cell=(${cell.q},${cell.r}) adjacent=${adj}`)
        failures++
      }
    }
    if (mineTotal !== mines) {
      console.error(`COUNT MISMATCH r=${radius}: ${mineTotal} != ${mines}`)
      failures++
    }
  }
  const ms = (performance.now() - start) / 200
  console.log(`radius ${radius}: 200 first-click boards at max ${mines} mines, avg ${ms.toFixed(2)}ms/board`)
}

const cases: Array<[Primary[], string, number]> = [
  [['red'], 'red', 0.33],
  [['red', 'yellow'], 'orange', 0.66],
  [['red', 'red'], 'red', 0.66],
  [['red', 'red', 'yellow'], 'orange', 1],
  [['red', 'yellow', 'yellow'], 'orange', 1],
  [['blue', 'red'], 'purple', 0.66],
  [['blue', 'yellow'], 'green', 0.66],
  [['red', 'yellow', 'blue'], 'brown', 1],
  [['blue', 'blue', 'blue'], 'blue', 1],
]
for (const [input, color, opacity] of cases) {
  const o = deriveOverlay(input)!
  if (o.color !== color || o.opacity !== opacity) {
    console.error(`MIX FAIL ${input}: got ${o.color}@${o.opacity}, want ${color}@${opacity}`)
    failures++
  }
}
console.log(deriveOverlay([]) === null ? 'empty mix ok' : (failures++, 'MIX FAIL empty'))

console.log(failures === 0 ? 'ALL OK' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
