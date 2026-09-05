/** The webpage plays pre-rendered angles; it does not load a 3D engine. */
export const PORTRAIT_SEQUENCE = {
  count: 81,
  columns: 3,
  framesPerSheet: 9,
  width: 448,
  height: 300,
} as const

export function frameAt(scroll: number, origin: number, distance: number) {
  if (!Number.isFinite(scroll) || !Number.isFinite(origin) || distance <= 0) return 0
  return Math.min(1, Math.max(0, (scroll - origin) / distance)) * (PORTRAIT_SEQUENCE.count - 1)
}

export function frameTile(frame: number) {
  const index = Math.min(PORTRAIT_SEQUENCE.count - 1, Math.max(0, Math.round(frame)))
  const local = index % PORTRAIT_SEQUENCE.framesPerSheet
  return {
    index,
    sheet: Math.floor(index / PORTRAIT_SEQUENCE.framesPerSheet),
    x: (local % PORTRAIT_SEQUENCE.columns) * PORTRAIT_SEQUENCE.width,
    y: Math.floor(local / PORTRAIT_SEQUENCE.columns) * PORTRAIT_SEQUENCE.height,
  }
}
