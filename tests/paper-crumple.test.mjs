import assert from 'node:assert/strict'
import test from 'node:test'
import { createCrumpleMesh, createPaperPath } from '../docs/.vitepress/theme/components/paperCrumplePath.ts'
import { crumplePhase } from '../docs/.vitepress/theme/components/paperCrumple.ts'

test('the print changes only while the paper is fully crumpled, in either direction', () => {
  assert.deepEqual(crumplePhase(0), { fold: 0, next: 0 })
  assert.deepEqual(crumplePhase(1), { fold: 0, next: 1 })
  for (let i = 0; i <= 100; i++) {
    const mix = i / 100
    const phase = crumplePhase(mix)
    assert.ok(Math.abs(phase.fold - crumplePhase(1 - mix).fold) < 1e-12)
    assert.ok(phase.next >= 0 && phase.next <= 1)
    if (mix >= .44 && mix <= .56) assert.equal(phase.fold, 1)
  }
})

test('the paper perimeter lifts toward the printed side before it is compressed', () => {
  const { original, indices } = createCrumpleMesh()
  const samples = createPaperPath(original, indices, 1, 6, .6, .65, 7)
  let rim = 0, rimCount = 0, centre = 0, centreCount = 0
  for (let i = 0; i < original.length; i += 3) {
    const radius = Math.max(Math.abs(original[i]), Math.abs(original[i + 1]))
    if (radius > .4) { rim += samples[16][i + 2]; rimCount++ }
    if (radius < .15) { centre += samples[16][i + 2]; centreCount++ }
  }
  assert.ok(rim / rimCount > centre / centreCount + .01)
  assert.ok(crumplePhase(.4999).next < crumplePhase(.5001).next)
  assert.ok(crumplePhase(.5001).next - crumplePhase(.4999).next < .01)
})

test('the connected mesh contracts into a finite 3D wad and restores its exact flat frame', () => {
  const { original, indices } = createCrumpleMesh()
  const samples = createPaperPath(original, indices, 1, 6, .6, .65, 7)
  assert.deepEqual(samples[0], original)
  assert.equal(samples.length, 65)
  for (const sample of samples) assert.ok(sample.every(Number.isFinite))
  const end = samples.at(-1)
  const span = axis => {
    const values = Array.from(end).filter((_, i) => i % 3 === axis)
    return Math.max(...values) - Math.min(...values)
  }
  assert.ok(span(0) < .55 && span(1) < .55, 'paper must compress, not scatter')
  assert.ok(span(2) > .1, 'folds must have real depth')
  assert.ok(indices.every(index => index >= 0 && index < original.length / 3))
})
