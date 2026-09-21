import assert from 'node:assert/strict'
import test from 'node:test'
import { paperAreaScale, PAPER_TARGET_AREA, PAPER_PRINT_SIZE, PAPER_PRINT_Y, PAPER_BASELINE, PAPER_PERSON_SCALE, paperFramePlacement } from '../docs/.vitepress/theme/components/paperLayout.ts'

test('different silhouette areas converge on the same visible area, not height', () => {
  for (const areas of [[30000, 40000], [60000, 65000], [90000, 90000]]) {
    const scale = paperAreaScale(areas, 300, 350)
    const area = areas.reduce((a, b) => a + b) / areas.length * (scale * PAPER_PRINT_SIZE / 1024) ** 2
    assert.ok(Math.abs(area - PAPER_TARGET_AREA) < 1e-8)
  }
})

test('one group scale preserves pose proportions and the planted baseline', () => {
  const poses = [38000, 40000, 44000]
  const scale = paperAreaScale(poses, 280, 460)
  assert.equal(scale, paperAreaScale([...poses].reverse(), 280, 460))
  assert.ok(Math.abs((poses[0] * scale ** 2) / (poses[2] * scale ** 2) - poses[0] / poses[2]) < 1e-12)
  assert.equal(PAPER_BASELINE, PAPER_PRINT_Y + PAPER_PRINT_SIZE)
})

test('the original coffee scene sets the area, without silently shrinking tall poses', () => {
  assert.equal(PAPER_TARGET_AREA, 600 ** 2 * .262)
  const areas = [10000, 12000]
  const scale = paperAreaScale(areas, 400, 490)
  assert.ok(Math.abs(11000 * (scale * PAPER_PRINT_SIZE / 1024) ** 2 - PAPER_TARGET_AREA) < 1e-8)
  assert.equal(paperAreaScale([], 0, 0), 1)
  assert.equal(paperAreaScale([0, 0], 300, 400), 1)
})

test('person corrections retain coffee and reduce prop-light standing scenes', () => {
  assert.equal(PAPER_PERSON_SCALE.chat, 1)
  for (const scene of ['walk', 'badminton', 'photo']) {
    const factor = PAPER_PERSON_SCALE[scene]
    assert.ok(factor >= .85 && factor <= .88)
    const placement = paperFramePlacement(factor)
    assert.equal(placement.y + placement.size, PAPER_BASELINE)
    assert.ok(Math.abs(placement.x + placement.size / 2 - 300) < 1e-10)
  }
})
