# ColorSweeper

A hexagonal minesweeper variant where mines are primary colors and clues are color mixes.

## Rules

- The board is a hexagon of hexagonal cells. Every mine is randomly red, yellow, or blue, and no cell ever has more than 3 adjacent mines.
- A revealed safe cell shows a mix of its neighboring mine colors:
  - **Opacity** encodes the count: 1 mine = 0.33, 2 = 0.66, 3 = fully opaque.
  - **Hue** encodes the unique colors present: one primary shows as itself; two primaries show their secondary (orange, purple, or green); all three show brown. Duplicates collapse — red+red+yellow and red+yellow+yellow both read as orange, and that ambiguity is part of the game.
- Cells with no adjacent mines flood-fill open, as in classic minesweeper.
- Mines are placed after your first click, which is guaranteed to land on a white cell (no mine, no adjacent mines).
- **Right click** cycles a color mark on a covered cell (red → yellow → blue → none).
- **Win** by revealing every safe cell *and* marking every mine with its correct color. Wrong marks don't lose the game; they just block the win.
- **Lose** by revealing a mine.

Use the controls to pick a board radius (3–8) and mine count (capped at ~1/3 of cells).

## Development

```bash
npm install
npm run dev
```

Built with Vite, React, and TypeScript. Game logic is pure and lives in `src/game.ts`; rendering is SVG (`src/components/`).
