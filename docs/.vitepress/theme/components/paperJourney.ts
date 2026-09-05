export type PaperScene = 'code' | 'photo' | 'badminton' | 'walk' | 'chat'

export const PAPER_SCENES: readonly PaperScene[] = [
  'code',
  'photo',
  'badminton',
  'walk',
  'chat',
]

const DEFAULT_ANCHORS = [0, 1000, 2000, 3000, 4000]
const DEFAULT_TRANSITION = 180
const LOW_SPEED_LOOP = 0.65

function validAnchors(anchors: number[]): anchors is [number, number, number, number, number] {
  if (!Array.isArray(anchors) || anchors.length !== PAPER_SCENES.length) return false
  return anchors.every((anchor, index) => {
    if (!Number.isFinite(anchor)) return false
    return index === 0 || anchor > anchors[index - 1]
  })
}

function normaliseAnchors(anchors: number[]): [number, number, number, number, number] {
  if (validAnchors(anchors)) return anchors
  return [...DEFAULT_ANCHORS] as [number, number, number, number, number]
}

function normaliseScroll(scroll: number, anchors: [number, number, number, number, number]): number {
  if (Number.isNaN(scroll)) return anchors[0]
  if (scroll === Number.POSITIVE_INFINITY) return anchors[anchors.length - 1]
  if (scroll === Number.NEGATIVE_INFINITY) return anchors[0]
  return Number.isFinite(scroll) ? scroll : anchors[0]
}

function normaliseTransition(transition: number): number {
  if (!Number.isFinite(transition)) return DEFAULT_TRANSITION
  return Math.max(0, transition)
}

function smoothstep(value: number): number {
  const clamped = Math.max(0, Math.min(1, value))
  return clamped * clamped * (3 - 2 * clamped)
}

function frameBoundaryFloor(value: number): number {
  // Correct only floating point noise near an exact frame boundary. Using a
  // machine epsilon keeps values that are genuinely just below the boundary
  // in the preceding frame.
  return Math.floor(value + Number.EPSILON * Math.max(1, Math.abs(value)) * 8)
}

/**
 * Resolve the paper scene pair at a scroll coordinate.
 *
 * Each anchor starts its scene. The transition into the next scene occupies
 * the final `transition` pixels before that next anchor. A transition is
 * capped at the distance between the two anchors, so short intervals never
 * overlap. When a transition fills a whole interval, the exact starting
 * anchor remains the current scene and blending begins immediately after it.
 * Invalid anchors (anything other than five finite, strictly
 * increasing values) use the deterministic 0/1000/2000/3000/4000 fallback.
 * NaN scroll uses the first anchor; positive and negative infinity resolve to
 * the last and first anchors respectively. Non-finite transition values use
 * the default 180 pixels, while non-positive values disable blending.
 */
export function sceneBlend(
  scroll: number,
  anchors: number[],
  transition = DEFAULT_TRANSITION,
): { from: PaperScene; to: PaperScene; mix: number; scatter: number } {
  const resolvedAnchors = normaliseAnchors(anchors)
  const resolvedScroll = normaliseScroll(scroll, resolvedAnchors)
  const requestedTransition = normaliseTransition(transition)

  for (let sceneIndex = 0; sceneIndex < PAPER_SCENES.length - 1; sceneIndex += 1) {
    const nextAnchor = resolvedAnchors[sceneIndex + 1]
    const interval = nextAnchor - resolvedAnchors[sceneIndex]
    const duration = Math.min(requestedTransition, interval)
    if (duration <= 0) continue

    const blendStart = nextAnchor - duration
    const startsAfterAnchor = duration >= interval
      ? resolvedScroll > blendStart
      : resolvedScroll >= blendStart
    if (startsAfterAnchor && resolvedScroll < nextAnchor) {
      const mix = smoothstep((resolvedScroll - blendStart) / duration)
      return {
        from: PAPER_SCENES[sceneIndex],
        to: PAPER_SCENES[sceneIndex + 1],
        mix,
        scatter: mix <= 0 || mix >= 1 ? 0 : Math.sin(Math.PI * mix),
      }
    }
  }

  let sceneIndex = 0
  while (
    sceneIndex < PAPER_SCENES.length - 1
    && resolvedScroll >= resolvedAnchors[sceneIndex + 1]
  ) {
    sceneIndex += 1
  }
  return {
    from: PAPER_SCENES[sceneIndex],
    to: PAPER_SCENES[sceneIndex],
    mix: 0,
    scatter: 0,
  }
}

function frameInLoop(tick: number, frameDuration: number): number {
  const safeTick = Number.isFinite(tick) ? tick : 0
  const loopDuration = frameDuration * 4
  const cyclePosition = ((safeTick % loopDuration) + loopDuration) % loopDuration
  return Math.min(3, frameBoundaryFloor(cyclePosition / frameDuration))
}

function lowSpeedFrame(tick: number): number {
  const safeTick = Number.isFinite(tick) ? tick : 0
  const cyclePosition = ((safeTick % LOW_SPEED_LOOP) + LOW_SPEED_LOOP) % LOW_SPEED_LOOP
  return Math.min(3, frameBoundaryFloor((cyclePosition / LOW_SPEED_LOOP) * 4))
}

function isPaperScene(scene: PaperScene): scene is PaperScene {
  return PAPER_SCENES.includes(scene)
}

/**
 * Pick one of four paper poses. Pointer input uses four equal bins from left
 * to right: [-1,-.5), [-.5,0), [0,.5), [.5,1]. Values outside that range are
 * clamped. A non-finite pointer means no mouse input, so the interactive
 * scenes use a complete four-frame loop every 0.65 seconds. Invalid scenes
 * fall back to the code loop. Inactive animation is always pose 0.
 */
export function poseFrame(
  pointerX: number,
  tick: number,
  scene: PaperScene,
  active: boolean,
): number {
  if (!active) return 0

  const resolvedScene = isPaperScene(scene) ? scene : 'code'
  if (resolvedScene === 'code') return frameInLoop(tick, 0.24)
  if (resolvedScene === 'walk') return frameInLoop(tick, 0.18)
  if (resolvedScene === 'badminton') return badmintonPose(tick).from
  if (!Number.isFinite(pointerX)) return lowSpeedFrame(tick)

  const normalisedPointer = Math.max(-1, Math.min(1, pointerX))
  return Math.max(0, Math.min(3, Math.floor((normalisedPointer + 1) * 2)))
}

/** Video-referenced clear: load, accelerate, contact, follow through, recover. */
export function badmintonPose(tick: number): { from: number; to: number; mix: number } {
  const durations = [.6, .22, .18, .1, .1, .18, .28, .74]
  const period = 2.4
  const safeTick = Number.isFinite(tick) ? tick : 0
  let local = ((safeTick % period) + period) % period
  let from = 0
  while (from < durations.length - 1 && local >= durations[from] - 1e-9) {
    local -= durations[from++]
  }
  // Brief frame blending softens paper edges without a long double-arm ghost.
  const dissolve = Math.min(.055, durations[from] * .3)
  return { from, to: (from + 1) % durations.length,
    mix: smoothstep((local - durations[from] + dissolve) / dissolve) }
}

const FRAGMENT_OFFSETS = [
  { x: -86, y: -48, rotate: -27, scale: -0.04 },
  { x: -52, y: 64, rotate: 18, scale: 0.06 },
  { x: 74, y: -18, rotate: -11, scale: -0.03 },
  { x: 86, y: 48, rotate: 27, scale: 0.04 },
  { x: 52, y: -64, rotate: -18, scale: -0.06 },
  { x: -74, y: 18, rotate: 11, scale: 0.03 },
] as const

function fragmentIndex(index: number): number {
  if (!Number.isFinite(index)) return 0
  const integerIndex = Math.trunc(index)
  return ((integerIndex % FRAGMENT_OFFSETS.length) + FRAGMENT_OFFSETS.length)
    % FRAGMENT_OFFSETS.length
}

/**
 * Return a deterministic, linearly reversible transform for one of six
 * fragments. Scatter is clamped to [0,1]; zero is the fully reassembled
 * identity transform and one reaches the fixed offsets (at most 90px and
 * 30deg). Fractional scatter values interpolate continuously without noise.
 */
export function fragmentTransform(
  index: number,
  scatter: number,
): { x: number; y: number; rotate: number; scale: number } {
  const amount = Number.isFinite(scatter) ? Math.max(0, Math.min(1, scatter)) : 0
  if (amount === 0) return { x: 0, y: 0, rotate: 0, scale: 1 }
  const offset = FRAGMENT_OFFSETS[fragmentIndex(index)]
  return {
    x: offset.x * amount,
    y: offset.y * amount,
    rotate: offset.rotate * amount,
    scale: 1 + offset.scale * amount,
  }
}
