const SOURCE_COLUMNS = 2
const OUTPUT_CELL_SIZE = 512
const CUTOUT_HEIGHT_RATIO = 0.9
const BOUND_ALPHA_THRESHOLD = 8

export type PaperSpriteRegion = {
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_REGIONS: readonly PaperSpriteRegion[] = [
  { x: 0, y: 0, width: 0.5, height: 0.5 },
  { x: 0.5, y: 0, width: 0.5, height: 0.5 },
  { x: 0, y: 0.5, width: 0.5, height: 0.5 },
  { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
]

/**
 * Remove the magenta key colour from an RGBA buffer in place.
 *
 * The generated sheet uses #ff00ff for its background. Pixels that are close
 * to that hue are also produced by antialiasing at the paper edge, so the
 * magenta amount is used to both desaturate the edge and lower its alpha. The
 * test is deliberately conservative: it requires both red and blue to be
 * present, which keeps the blue, yellow, skin and warm paper colours intact.
 */
export function keyMagenta(data: Uint8ClampedArray): void {
  for (let offset = 0; offset + 3 < data.length; offset += 4) {
    const alpha = data[offset + 3]
    if (alpha === 0) continue

    const red = data[offset]
    const green = data[offset + 1]
    const blue = data[offset + 2]
    const lowerMagentaChannel = Math.min(red, blue)
    const magentaExcess = lowerMagentaChannel - green

    // Include the darker magenta cast in the generated paper-edge shadow.
    // Blue clothing and warm skin have no shared red/blue excess over green.
    if (lowerMagentaChannel < 50 || magentaExcess <= 20) continue

    // Pixels at or beyond this range are background/edge pixels. The linear
    // ramp leaves a little coverage for a mildly pink antialiased edge while
    // making the stronger fringe transparent. Alpha is never increased.
    const spill = Math.max(0, Math.min(1, (magentaExcess - 16) / 128))
    const remaining = 1 - spill
    // Remove the shared magenta component completely, including partially
    // covered edge pixels; reducing alpha alone leaves a pink halo on white.
    const keyedRed = red - magentaExcess
    const keyedBlue = blue - magentaExcess
    const nextAlpha = Math.round(alpha * remaining)

    if (nextAlpha <= BOUND_ALPHA_THRESHOLD) {
      data[offset] = 0
      data[offset + 1] = 0
      data[offset + 2] = 0
      data[offset + 3] = 0
      continue
    }

    data[offset] = Math.round(keyedRed)
    data[offset + 2] = Math.round(keyedBlue)
    data[offset + 3] = nextAlpha
  }
}

type PixelBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

function boundsSize(bounds: PixelBounds): { width: number; height: number } {
  return {
    width: bounds.maxX - bounds.minX + 1,
    height: bounds.maxY - bounds.minY + 1,
  }
}

function findBounds(
  pixels: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): PixelBounds | null {
  let minX = right
  let minY = bottom
  let maxX = -1
  let maxY = -1

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const alphaOffset = (y * sourceWidth + x) * 4 + 3
      if (pixels[alphaOffset] <= BOUND_ALPHA_THRESHOLD) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }

  if (maxX < 0 || maxY < 0) return null
  return { minX, minY, maxX, maxY }
}

function regionPixels(
  region: PaperSpriteRegion,
  sourceWidth: number,
  sourceHeight: number,
): { left: number; top: number; right: number; bottom: number } {
  const values = [region.x, region.y, region.width, region.height]
  if (
    values.some(value => !Number.isFinite(value))
    || region.x < 0
    || region.y < 0
    || region.width <= 0
    || region.height <= 0
    || region.x + region.width > 1
    || region.y + region.height > 1
  ) {
    throw new RangeError('Paper sprite regions must stay within the 0..1 source rectangle')
  }

  const left = Math.max(0, Math.min(sourceWidth - 1, Math.floor(region.x * sourceWidth)))
  const top = Math.max(0, Math.min(sourceHeight - 1, Math.floor(region.y * sourceHeight)))
  const right = Math.max(left + 1, Math.min(sourceWidth, Math.ceil((region.x + region.width) * sourceWidth)))
  const bottom = Math.max(top + 1, Math.min(sourceHeight, Math.ceil((region.y + region.height) * sourceHeight)))
  return { left, top, right, bottom }
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function imageSize(image: HTMLImageElement): { width: number; height: number } {
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 2 || height < 2) {
    throw new Error('Paper sprite sheet has no usable dimensions')
  }
  return { width, height }
}

/**
 * Load a magenta-keyed sheet and return a normalised two-column atlas.
 * `regions` is row-major (top-left, top-right, bottom-left, bottom-right) and
 * lets a frame use a non-standard source rectangle, such as a generated pose
 * that crosses the nominal middle line. Coordinates are normalised to the
 * source image and default to equal 2 × 2 regions.
 *
 * The source is read and keyed once. Every pose is then drawn from the
 * resulting canvas, so animation only needs drawImage and never readbacks.
 */
export async function loadPaperSprite(
  src: string,
  regions: readonly PaperSpriteRegion[] = DEFAULT_REGIONS,
  alignFeet = false,
): Promise<HTMLCanvasElement> {
  if (!regions.length || regions.length % SOURCE_COLUMNS !== 0) {
    throw new RangeError('Paper sprite regions must contain a positive even number of rectangles')
  }

  const image = new Image()
  image.crossOrigin = 'anonymous'

  const imageReady = new Promise<void>((resolve, reject) => {
    let settled = false
    const resolveOnce = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const rejectOnce = (reason: unknown) => {
      if (settled) return
      settled = true
      reject(reason instanceof Error ? reason : new Error('Unable to load paper sprite sheet'))
    }

    image.onload = resolveOnce
    image.onerror = () => rejectOnce(new Error(`Unable to load paper sprite sheet: ${src}`))
    image.src = src

    // A cached image can already be complete without dispatching a new load
    // event in a few browser/embedder combinations.
    if (image.complete && image.naturalWidth > 0) resolveOnce()
  })

  await imageReady
  if (typeof image.decode === 'function') await image.decode()

  const { width: sourceWidth, height: sourceHeight } = imageSize(image)
  const sourceCanvas = makeCanvas(sourceWidth, sourceHeight)
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })
  if (!sourceContext) throw new Error('Unable to create a 2D context for paper sprite sheet')

  sourceContext.drawImage(image, 0, 0, sourceWidth, sourceHeight)
  const imageData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight)
  keyMagenta(imageData.data)
  sourceContext.putImageData(imageData, 0, 0)

  const frameBounds: Array<PixelBounds | null> = regions.map(region => {
    const { left, top, right, bottom } = regionPixels(region, sourceWidth, sourceHeight)
    return findBounds(imageData.data, sourceWidth, sourceHeight, left, top, right, bottom)
  })

  let maxWidth = 0
  let maxHeight = 0
  for (const bounds of frameBounds) {
    if (!bounds) continue
    const size = boundsSize(bounds)
    maxWidth = Math.max(maxWidth, size.width)
    maxHeight = Math.max(maxHeight, size.height)
  }

  // A racket moving outward must not move the character's planted feet.
  const centres = frameBounds.map(bounds => {
    if (!bounds) return 0
    const feet = alignFeet ? findBounds(imageData.data, sourceWidth, sourceHeight,
      bounds.minX, Math.floor(bounds.maxY - boundsSize(bounds).height * .12), bounds.maxX + 1, bounds.maxY + 1) : null
    const centre = feet ? (feet.minX + feet.maxX) / 2 : (bounds.minX + bounds.maxX) / 2
    if (alignFeet) maxWidth = Math.max(maxWidth, 2 * Math.max(centre - bounds.minX + 1, bounds.maxX - centre + 1))
    return centre
  })

  const outputCanvas = makeCanvas(OUTPUT_CELL_SIZE * SOURCE_COLUMNS, OUTPUT_CELL_SIZE * (regions.length / SOURCE_COLUMNS))
  const outputContext = outputCanvas.getContext('2d')
  if (!outputContext) throw new Error('Unable to create a 2D context for paper sprite atlas')
  outputContext.imageSmoothingEnabled = true

  if (maxWidth === 0 || maxHeight === 0) return outputCanvas

  let scale = OUTPUT_CELL_SIZE * CUTOUT_HEIGHT_RATIO / maxHeight
  if (maxWidth * scale > OUTPUT_CELL_SIZE * CUTOUT_HEIGHT_RATIO) {
    scale = OUTPUT_CELL_SIZE * CUTOUT_HEIGHT_RATIO / maxWidth
  }

  frameBounds.forEach((bounds, frameIndex) => {
    if (!bounds) return
    const size = boundsSize(bounds)
    const drawWidth = size.width * scale
    const drawHeight = size.height * scale
    const column = frameIndex % SOURCE_COLUMNS
    const row = Math.floor(frameIndex / SOURCE_COLUMNS)
    const cellLeft = column * OUTPUT_CELL_SIZE
    const cellTop = row * OUTPUT_CELL_SIZE
    const drawLeft = alignFeet
      ? cellLeft + OUTPUT_CELL_SIZE / 2 - (centres[frameIndex] - bounds.minX) * scale
      : cellLeft + (OUTPUT_CELL_SIZE - drawWidth) / 2
    const drawTop = cellTop + OUTPUT_CELL_SIZE - drawHeight

    outputContext.drawImage(
      sourceCanvas,
      bounds.minX,
      bounds.minY,
      size.width,
      size.height,
      drawLeft,
      drawTop,
      drawWidth,
      drawHeight,
    )
  })

  return outputCanvas
}
