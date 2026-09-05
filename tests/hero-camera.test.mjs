// Run: node --experimental-strip-types --test tests/hero-camera.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { frameAt, frameTile, PORTRAIT_SEQUENCE as sequence } from '../docs/.vitepress/theme/components/heroCamera.ts'

test('small scroll increments visit all 81 angles and reverse identically', () => {
  const forward = Array.from({ length: 161 }, (_, i) => frameTile(frameAt(i, 0, 160)).index)
  const reverse = Array.from({ length: 161 }, (_, i) => frameTile(frameAt(160 - i, 0, 160)).index).reverse()
  assert.deepEqual(forward, reverse)
  assert.equal(new Set(forward).size, 81)
  for (let i = 1; i < forward.length; i++) assert.ok(forward[i] - forward[i - 1] <= 1)
})

test('crossing an atlas boundary samples the next frame without a blank or duplicate tile', () => {
  assert.deepEqual(frameTile(8), { index: 8, sheet: 0, x: 896, y: 600 })
  assert.deepEqual(frameTile(9), { index: 9, sheet: 1, x: 0, y: 0 })
  assert.deepEqual(frameTile(80), { index: 80, sheet: 8, x: 896, y: 600 })
  const samples = Array.from({ length: 81 }, (_, i) => frameTile(i))
  assert.equal(new Set(samples.map(t => `${t.sheet}:${t.x}:${t.y}`)).size, 81)
})

test('scroll restoration and out-of-range values remain within the sequence', () => {
  assert.equal(frameAt(-100, 20, 160), 0)
  assert.equal(frameAt(9999, 20, 160), 80)
  assert.equal(frameAt(100, 20, 160), 40)
  assert.equal(frameAt(1, 0, 0), 0)
})

test('runtime dimensions and frame count match generated asset metadata', () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/public/hero/turntable/manifest.json', import.meta.url)))
  assert.equal(sequence.count, manifest.frames)
  assert.equal(sequence.width, manifest.frameWidth)
  assert.equal(sequence.height, manifest.frameHeight)
  assert.equal(sequence.columns, manifest.columns)
  assert.equal(sequence.count / sequence.framesPerSheet, manifest.sheets.length)
})
