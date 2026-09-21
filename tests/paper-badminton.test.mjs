import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { BADMINTON_FRAMES, BADMINTON_SHEET } from '../docs/.vitepress/theme/components/paperBadminton.ts'

test('the eight ordered poses retain native HD alpha assets and body registration', () => {
  assert.equal(BADMINTON_FRAMES.length, 8)
  assert.equal(BADMINTON_SHEET.src, 'https://oss.justin3go.com/paper-journey/paper-journey/badminton-hd/sprite-4x2.webp')
  assert.equal(BADMINTON_SHEET.columns, 4)
  assert.equal(BADMINTON_SHEET.frameWidth, 1024)
  assert.equal(BADMINTON_SHEET.frameHeight, 1536)
  BADMINTON_FRAMES.forEach((frame, i) => {
    const localFrame = `../docs/public/paper-journey/badminton-hd/frame-${i + 1}`
    const png = readFileSync(new URL(`${localFrame}.png`, import.meta.url))
    assert.equal(png.subarray(1, 4).toString(), 'PNG')
    assert.equal(png.readUInt32BE(16), 1024)
    assert.equal(png.readUInt32BE(20), 1536)
    assert.equal(png[25], 6, 'RGBA preserves the generated torn-paper alpha')
    const webp = readFileSync(new URL(`${localFrame}.webp`, import.meta.url))
    assert.equal(webp.subarray(0, 4).toString(), 'RIFF')
    assert.equal(webp.subarray(8, 12).toString(), 'WEBP')
    assert.ok(frame.bodyTop > 0 && frame.bodyTop < 500)
    assert.ok(frame.bodySpan >= 1160 && frame.bodySpan <= 1240)
  })
})
