export const keyOf = (q: number, r: number): string => `${q},${r}`

export const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

/** Axial coordinates of a hexagon-shaped board of the given radius. */
export function hexagonCoords(radius: number): Array<[number, number]> {
  const coords: Array<[number, number]> = []
  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius)
    const rMax = Math.min(radius, -q + radius)
    for (let r = rMin; r <= rMax; r++) coords.push([q, r])
  }
  return coords
}

/** Center of a pointy-top hex cell, in pixels. `size` is the corner radius. */
export function axialToPixel(q: number, r: number, size: number): { x: number; y: number } {
  return {
    x: size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: size * (3 / 2) * r,
  }
}

/** SVG polygon `points` string for a pointy-top hex centered at (cx, cy). */
export function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${(cx + size * Math.cos(angle)).toFixed(2)},${(cy + size * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
}
