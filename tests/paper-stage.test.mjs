// Run: node --experimental-strip-types --test tests/paper-stage.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { centerFirstFold, interpolateStage, paperFoldProgress, stageShot } from '../docs/.vitepress/theme/components/paperStage.ts'

const stops = [100, 500, 900, 1300, 1700, 2100]

test('stage transitions occupy the final range before each next stop', () => {
  assert.deepEqual(stageShot(100, stops, 100), { from: 0, to: 0, mix: 0 })
  assert.deepEqual(stageShot(399, stops, 100), { from: 0, to: 0, mix: 0 })
  assert.deepEqual(stageShot(400, stops, 100), { from: 0, to: 1, mix: 0 })
  assert.deepEqual(stageShot(450, stops, 100), { from: 0, to: 1, mix: 0.5 })
  assert.deepEqual(stageShot(500, stops, 100), { from: 1, to: 1, mix: 0 })
  assert.deepEqual(stageShot(1700, stops, 100), { from: 4, to: 4, mix: 0 })
  assert.deepEqual(stageShot(9999, stops, 100), { from: 5, to: 5, mix: 0 })
})

test('stage sampling is exactly reversible and mix stays bounded', () => {
  const scrolls = Array.from({ length: 481 }, (_, index) => 100 + index * 4.25)
  const forward = scrolls.map(scroll => stageShot(scroll, stops, 160))
  const reverse = [...scrolls].reverse().map(scroll => stageShot(scroll, stops, 160)).reverse()
  assert.deepEqual(forward, reverse)
  for (const shot of forward) assert.ok(shot.mix >= 0 && shot.mix <= 1)
})

test('short intervals cap transitions without crossing a stop boundary', () => {
  const shortStops = [0, 20, 35, 80, 81]
  for (let index = 0; index < shortStops.length - 1; index += 1) {
    const atStart = stageShot(shortStops[index], shortStops, 100)
    assert.deepEqual(atStart, { from: index, to: index, mix: 0 })

    const justAfterStart = stageShot(shortStops[index] + 1e-9, shortStops, 100)
    assert.equal(justAfterStart.from, index)
    assert.equal(justAfterStart.to, index + 1)
    assert.ok(justAfterStart.mix >= 0 && justAfterStart.mix <= 1)

    const atEnd = stageShot(shortStops[index + 1], shortStops, 100)
    assert.deepEqual(atEnd, { from: index + 1, to: index + 1, mix: 0 })
  }
})

test('invalid stops and non-finite scrolls resolve safely', () => {
  const invalidStops = [
    [],
    [0, 0],
    [0, 20, 19],
    [0, Number.NaN, 40],
    [0, Number.POSITIVE_INFINITY, 40],
  ]
  for (const invalid of invalidStops) {
    assert.deepEqual(stageShot(10, invalid, 10), { from: 0, to: 0, mix: 0 })
  }

  assert.deepEqual(stageShot(Number.NaN, stops, 100), stageShot(stops[0], stops, 100))
  assert.deepEqual(stageShot(Number.NEGATIVE_INFINITY, stops, 100), stageShot(stops[0], stops, 100))
  assert.deepEqual(stageShot(Number.POSITIVE_INFINITY, stops, 100), stageShot(stops.at(-1), stops, 100))
  assert.deepEqual(stageShot(900, [900], 100), { from: 0, to: 0, mix: 0 })
})

test('invalid or non-positive transitions disable blending', () => {
  for (const transition of [0, -10, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.deepEqual(stageShot(450, stops, transition), { from: 0, to: 0, mix: 0 })
    assert.deepEqual(stageShot(500, stops, transition), { from: 1, to: 1, mix: 0 })
  }
})

test('stage interpolation clamps mix, normalises coordinates, and preserves size', () => {
  assert.deepEqual(interpolateStage({ x: 0, y: 20 }, { x: 100, y: 60 }, 0.5, 720), {
    x: 50,
    y: 40,
    size: 720,
  })
  assert.deepEqual(interpolateStage({ x: 0, y: 20 }, { x: 100, y: 60 }, -2, 720), {
    x: 0,
    y: 20,
    size: 720,
  })
  assert.deepEqual(interpolateStage({ x: 0, y: 20 }, { x: 100, y: 60 }, 2, 720), {
    x: 100,
    y: 60,
    size: 720,
  })
  assert.deepEqual(interpolateStage({ x: Number.NaN, y: Number.POSITIVE_INFINITY }, { x: 100, y: 60 }, Number.NaN, 0), {
    x: 0,
    y: 0,
    size: 480,
  })
  assert.deepEqual(interpolateStage({ x: 0, y: 0 }, { x: 100, y: 100 }, 0.5, Number.NaN), {
    x: 50,
    y: 50,
    size: 480,
  })
})

test('canvas size remains the initial valid size across the whole stage', () => {
  const size = 640
  const positions = [
    { x: 0, y: 0 },
    { x: 120, y: -20 },
    { x: 240, y: 30 },
    { x: 360, y: -10 },
    { x: 480, y: 40 },
    { x: 600, y: 0 },
  ]
  for (const scroll of [100, 450, 900, 1300, 1700, 2100]) {
    const shot = stageShot(scroll, stops, 100)
    const stage = interpolateStage(positions[shot.from], positions[shot.to], shot.mix, size)
    assert.equal(stage.size, size)
  }
})

test('the first fold reaches viewport center and rejoins both endpoints', () => {
  const stageY = -90
  const viewportHeight = 1206
  const printCenterY = 336
  assert.equal(centerFirstFold(stageY, 0, viewportHeight, printCenterY), stageY)
  assert.ok(centerFirstFold(stageY, .12, viewportHeight, printCenterY) > stageY)
  assert.ok(Math.abs(centerFirstFold(stageY, .22, viewportHeight, printCenterY) - (stageY + (viewportHeight / 2 - printCenterY - stageY) / 4)) < 1e-10)
  assert.ok(Math.abs(centerFirstFold(stageY, .5, viewportHeight, printCenterY) + printCenterY - viewportHeight / 2) < 1e-10)
  assert.ok(Math.abs(centerFirstFold(stageY, 1, viewportHeight, printCenterY) - stageY) < 1e-10)
  assert.ok(Math.abs(centerFirstFold(stageY, .44, viewportHeight, printCenterY) - centerFirstFold(stageY, .56, viewportHeight, printCenterY)) < 1e-10)
})

test('first scene starts folding with scroll while later scenes retain their easing', () => {
  const eased = stageShot(200, stops, 500)
  const introductory = stageShot(200, stops, 500, true)
  assert.equal(introductory.from, 0)
  assert.ok(introductory.mix > eased.mix)
  assert.ok(paperFoldProgress(introductory.mix) > paperFoldProgress(eased.mix))
  assert.deepEqual(stageShot(600, stops, 500, true), stageShot(600, stops, 500))
})

test('the intro sheet travels smoothly into and out of the center', () => {
  const nextStop = 815
  let previousY = 2
  for (let scroll = 1; scroll < nextStop; scroll++) {
    const { mix } = stageShot(scroll, [0, nextStop], 924, true)
    const { y } = interpolateStage({ x: 0, y: 2 - scroll }, { x: 0, y: 204 }, mix, 560)
    const centeredY = centerFirstFold(y, mix, 1206, 336)
    assert.ok(Math.abs(centeredY - previousY) < 2.5, `stage jumped at scroll ${scroll}`)
    previousY = centeredY
  }
})
