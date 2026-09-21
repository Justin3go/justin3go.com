import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { BADMINTON_FRAMES } from '../docs/.vitepress/theme/components/paperBadminton.ts'

test('the eight ordered poses retain native HD alpha assets and body registration', () => {
  assert.equal(BADMINTON_FRAMES.length, 8)
  BADMINTON_FRAMES.forEach((frame, i) => {
    assert.equal(frame.src, `/paper-journey/badminton-hd/frame-${i + 1}.webp`)
    const png = readFileSync(new URL(`../docs/public${frame.src.replace(/\.webp$/, ".png")}`, import.meta.url))
    assert.equal(png.subarray(1, 4).toString(), 'PNG')
    assert.equal(png.readUInt32BE(16), 1024)
    assert.equal(png.readUInt32BE(20), 1536)
    assert.equal(png[25], 6, 'RGBA preserves the generated torn-paper alpha')
    const webp = readFileSync(new URL(`../docs/public${frame.src}`, import.meta.url))
    assert.equal(webp.subarray(0, 4).toString(), 'RIFF')
    assert.equal(webp.subarray(8, 12).toString(), 'WEBP')
    assert.ok(frame.bodyTop > 0 && frame.bodyTop < 500)
    assert.ok(frame.bodySpan >= 1160 && frame.bodySpan <= 1240)
  })
})
