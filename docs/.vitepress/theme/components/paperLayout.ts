// Keep the original 600-unit horizontal layout; tall poses get more headroom.
export const PAPER_STAGE_SIZE = 600
export const PAPER_STAGE_HEIGHT = 780
export const PAPER_PRINT_SIZE = 720
export const PAPER_PRINT_X = (PAPER_STAGE_SIZE - PAPER_PRINT_SIZE) / 2
export const PAPER_PRINT_Y = 0
export const PAPER_BASELINE = PAPER_PRINT_Y + PAPER_PRINT_SIZE
// Original chat / coffee cutout covered approximately 26.2% of the 600² stage.
export const PAPER_TARGET_AREA = PAPER_STAGE_SIZE ** 2 * .262

/** One scale per animation, measured from source alpha without downsampling first. */
export function paperAreaScale(areas: readonly number[], width: number, height: number, cell = 1024) {
  const mean = areas.reduce((sum, area) => sum + area, 0) / areas.length
  if (!(mean > 0) || !(width > 0) || !(height > 0)) return 1
  return Math.sqrt(PAPER_TARGET_AREA / mean) * cell / PAPER_PRINT_SIZE
}

// Optical corrections reviewed against the person in the coffee scene.
// These are art-direction values, not claims of semantic person segmentation:
// alpha coverage includes furniture, props and the paper border.
export const PAPER_PERSON_SCALE = {
  intro: .87, code: .94, photo: .85, badminton: .88, walk: .86, chat: 1,
} as const

export function paperFramePlacement(scale = 1) {
  const size = PAPER_PRINT_SIZE * scale
  return { x: (PAPER_STAGE_SIZE - size) / 2, y: PAPER_BASELINE - size, size }
}
