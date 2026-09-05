import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fragmentTransform,
  PAPER_SCENES,
  poseFrame,
  badmintonPose,
  sceneBlend,
} from '../docs/.vitepress/theme/components/paperJourney.ts'

const anchors = [100, 500, 900, 1300, 1700]

test('paper scenes blend in the final transition range of each interval', () => {
  assert.deepEqual(PAPER_SCENES, ['code', 'photo', 'badminton', 'walk', 'chat'])
  assert.deepEqual(sceneBlend(100, anchors), {
    from: 'code',
    to: 'code',
    mix: 0,
    scatter: 0,
  })

  const start = sceneBlend(500 - 180, anchors)
  assert.equal(start.from, 'code')
  assert.equal(start.to, 'photo')
  assert.equal(start.mix, 0)
  assert.equal(start.scatter, 0)

  const middle = sceneBlend(500 - 90, anchors)
  assert.equal(middle.from, 'code')
  assert.equal(middle.to, 'photo')
  assert.equal(middle.mix, 0.5)
  assert.equal(middle.scatter, 1)

  assert.deepEqual(sceneBlend(500, anchors), {
    from: 'photo',
    to: 'photo',
    mix: 0,
    scatter: 0,
  })
  assert.deepEqual(sceneBlend(2200, anchors), {
    from: 'chat',
    to: 'chat',
    mix: 0,
    scatter: 0,
  })
})

test('the scene timeline is exactly reversible when sampled in either direction', () => {
  const scrolls = Array.from({ length: 241 }, (_, index) => 100 + index * 7.5)
  const forward = scrolls.map(scroll => sceneBlend(scroll, anchors))
  const reverse = [...scrolls].reverse().map(scroll => sceneBlend(scroll, anchors)).reverse()
  assert.deepEqual(forward, reverse)

  for (let index = 1; index < forward.length; index += 1) {
    assert.ok(forward[index].mix >= 0 && forward[index].mix <= 1)
    assert.ok(forward[index].scatter >= 0 && forward[index].scatter <= 1)
  }
})

test('short anchor intervals cap the transition and never overlap the next scene', () => {
  const shortAnchors = [0, 20, 35, 80, 81]
  for (let index = 0; index < shortAnchors.length - 1; index += 1) {
    const atStart = sceneBlend(shortAnchors[index], shortAnchors)
    assert.equal(atStart.from, PAPER_SCENES[index])
    assert.equal(atStart.to, PAPER_SCENES[index])
    assert.equal(atStart.mix, 0)
    assert.equal(atStart.scatter, 0)

    const atEnd = sceneBlend(shortAnchors[index + 1], shortAnchors)
    assert.equal(atEnd.from, PAPER_SCENES[index + 1])
    assert.equal(atEnd.to, PAPER_SCENES[index + 1])
    assert.equal(atEnd.mix, 0)
    assert.equal(atEnd.scatter, 0)
  }
})

test('invalid anchors use the documented finite fallback without leaking NaN', () => {
  const fallback = sceneBlend(1250, [0, 1000, 2000, 3000, 4000])
  const invalidInputs = [
    [],
    [0, 1000, 2000, 3000],
    [0, 1000, 900, 3000, 4000],
    [0, 1000, Number.NaN, 3000, 4000],
    [0, 1000, Number.POSITIVE_INFINITY, 3000, 4000],
  ]
  for (const invalid of invalidInputs) {
    assert.deepEqual(sceneBlend(1250, invalid), fallback)
  }
  assert.deepEqual(sceneBlend(Number.NaN, anchors), sceneBlend(anchors[0], anchors))
  assert.deepEqual(sceneBlend(Number.POSITIVE_INFINITY, anchors), sceneBlend(anchors.at(-1), anchors))
  assert.deepEqual(sceneBlend(Number.NEGATIVE_INFINITY, anchors), sceneBlend(anchors[0], anchors))
})

test('active pose selection stays in scene atlas bounds and respects scene-specific timing', () => {
  assert.equal(poseFrame(Number.NaN, 1, 'code', false), 0)
  assert.equal(poseFrame(-10, 1, 'photo', false), 0)

  assert.deepEqual(
    [-1, -0.5, 0, 0.5, 1].map(pointer => poseFrame(pointer, 0, 'photo', true)),
    [0, 1, 2, 3, 3],
  )
  assert.equal(poseFrame(-100, 0, 'badminton', true), 0)
  assert.equal(poseFrame(100, 0, 'chat', true), 3)

  assert.deepEqual(
    [0, 0.24, 0.48, 0.72, 0.96].map(tick => poseFrame(0, tick, 'code', true)),
    [0, 1, 2, 3, 0],
  )
  assert.deepEqual(
    [0, 0.18, 0.36, 0.54, 0.72].map(tick => poseFrame(0, tick, 'walk', true)),
    [0, 1, 2, 3, 0],
  )
  assert.deepEqual(
    [0, 0.1625, 0.325, 0.4875, 0.65].map(tick => poseFrame(Number.NaN, tick, 'photo', true)),
    [0, 1, 2, 3, 0],
  )

  for (const scene of PAPER_SCENES) {
    for (const pointer of [Number.NaN, -2, -1, 0, 1, 2]) {
      for (const tick of [Number.NaN, -1, 0, 1, Number.POSITIVE_INFINITY]) {
        const frame = poseFrame(pointer, tick, scene, true)
        assert.ok(Number.isInteger(frame) && frame >= 0 && frame <= (scene === 'badminton' ? 7 : 3))
      }
    }
  }
})

test('six fragments fully reassemble at zero and interpolate deterministic offsets', () => {
  const identity = { x: 0, y: 0, rotate: 0, scale: 1 }
  for (let index = 0; index < 6; index += 1) {
    assert.deepEqual(fragmentTransform(index, 0), identity)
    const half = fragmentTransform(index, 0.5)
    const full = fragmentTransform(index, 1)
    assert.ok(Math.abs(half.x - full.x / 2) < 1e-12)
    assert.ok(Math.abs(half.y - full.y / 2) < 1e-12)
    assert.ok(Math.abs(half.rotate - full.rotate / 2) < 1e-12)
    assert.ok(Math.abs(half.scale - (full.scale + 1) / 2) < 1e-12)

    const scattered = fragmentTransform(index, 1)
    assert.ok(Math.abs(scattered.x) <= 90)
    assert.ok(Math.abs(scattered.y) <= 90)
    assert.ok(Math.abs(scattered.rotate) <= 30)
    assert.ok(scattered.scale > 0)
    assert.deepEqual(scattered, fragmentTransform(index, 1))
  }
  assert.deepEqual(fragmentTransform(6, 1), fragmentTransform(0, 1))
  assert.deepEqual(fragmentTransform(-1, 1), fragmentTransform(5, 1))
})


test('badminton completes a forward stroke independently of pointer position', () => {
  for (const pointer of [-1, 0, 1, Number.NaN]) {
    assert.deepEqual([0, .65, .85, 1.05, 1.15, 1.25, 1.5, 1.9, 2.4].map(t => poseFrame(pointer, t, 'badminton', true)), [0, 1, 2, 3, 4, 5, 6, 7, 0])
    assert.equal(poseFrame(pointer, 1.2, 'badminton', false), 0)
  }
})


test('badminton pose transitions blend forward and close the loop', () => {
  assert.deepEqual(badmintonPose(0), {from: 0, to: 1, mix: 0})
  assert.ok(badmintonPose(.5725).mix > .4 && badmintonPose(.5725).mix < .6)
  assert.deepEqual(badmintonPose(.6), {from: 1, to: 2, mix: 0})
  const ending = badmintonPose(2.399)
  assert.equal(ending.from, 7)
  assert.equal(ending.to, 0)
  assert.ok(ending.mix > .97)
  assert.deepEqual(badmintonPose(2.4), badmintonPose(0))
})
