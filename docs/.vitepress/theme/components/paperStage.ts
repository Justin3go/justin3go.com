export type StageShot = { from: number; to: number; mix: number }

export type StagePoint = { x: number; y: number }

function validStops(stops: readonly number[]): boolean {
  if (!Array.isArray(stops) || stops.length < 1) return false
  return stops.every((stop, index) => {
    if (!Number.isFinite(stop)) return false
    return index === 0 || stop > stops[index - 1]
  })
}

function resolveScroll(scroll: number, stops: readonly number[]): number {
  if (scroll === Number.POSITIVE_INFINITY) return stops[stops.length - 1]
  if (scroll === Number.NEGATIVE_INFINITY || Number.isNaN(scroll)) return stops[0]
  return Number.isFinite(scroll) ? scroll : stops[0]
}

function smoothstep(value: number): number {
  const clamped = Math.max(0, Math.min(1, value))
  return clamped * clamped * (3 - 2 * clamped)
}

/**
 * Resolve the stage pair for a scroll coordinate. Each transition occupies
 * the final `transition` pixels before its next stop, capped by that interval.
 */
export function stageShot(
  scroll: number,
  stops: readonly number[],
  transition: number,
  linearFirst = false,
): StageShot {
  if (!validStops(stops)) return { from: 0, to: 0, mix: 0 }

  const resolvedScroll = resolveScroll(scroll, stops)
  const requestedTransition = Number.isFinite(transition) && transition > 0
    ? transition
    : 0

  for (let index = 0; index < stops.length - 1; index += 1) {
    const nextStop = stops[index + 1]
    const interval = nextStop - stops[index]
    const duration = Math.min(requestedTransition, interval)
    if (duration <= 0) continue

    const transitionStart = nextStop - duration
    const startsAfterStop = duration >= interval
      ? resolvedScroll > transitionStart
      : resolvedScroll >= transitionStart
    if (startsAfterStop && resolvedScroll < nextStop) {
      const progress = (resolvedScroll - transitionStart) / duration
      return {
        from: index,
        to: index + 1,
        mix: index === 0 && linearFirst ? progress : smoothstep(progress),
      }
    }
  }

  let index = 0
  while (index < stops.length - 1 && resolvedScroll >= stops[index + 1]) {
    index += 1
  }
  return { from: index, to: index, mix: 0 }
}

/** The same folding phase drives the mesh and the first sheet's travel. */
export function paperFoldProgress(mix: number): number {
  if (!Number.isFinite(mix)) return 0
  const progress = Math.max(0, Math.min(1, mix))
  return smoothstep(Math.min(progress / .44, (1 - progress) / .44))
}

function finiteCoordinate(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/** Interpolate two stage positions while keeping the canvas at one size. */
export function interpolateStage(
  from: StagePoint,
  to: StagePoint,
  mix: number,
  size: number,
): { x: number; y: number; size: number } {
  const fromX = finiteCoordinate(from?.x)
  const fromY = finiteCoordinate(from?.y)
  const toX = finiteCoordinate(to?.x)
  const toY = finiteCoordinate(to?.y)
  const amount = Number.isFinite(mix) ? Math.max(0, Math.min(1, mix)) : 0
  const resolvedSize = Number.isFinite(size) && size > 0 ? size : 480

  const x = fromX + (toX - fromX) * amount
  const y = fromY + (toY - fromY) * amount
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    size: resolvedSize,
  }
}

/** Keep the first folded sheet in view while its hero anchor scrolls away. */
export function centerFirstFold(stageY: number, mix: number, viewportHeight: number, printCenterY: number): number {
  if (![stageY, mix, viewportHeight, printCenterY].every(Number.isFinite)) return stageY
  const fold = paperFoldProgress(mix)
  // Let the edge curl before the print lifts away from the hero backing.
  return stageY + (viewportHeight / 2 - printCenterY - stageY) * fold * fold
}
