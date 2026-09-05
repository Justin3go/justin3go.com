import assert from 'node:assert/strict'
import test from 'node:test'
import { flowLines, flowScroll, FLOW_LINES } from '../docs/.vitepress/theme/components/flowGeometry.ts'

test('sculpture stays finite and inside its viewBox across a full rotation', () => {
  for (let angle = 0; angle < Math.PI * 2; angle += .2) {
    const lines = flowLines(angle, .25, .24)
    assert.equal(lines.length, FLOW_LINES)
    assert.equal(new Set(lines.map(line => line.id)).size, FLOW_LINES)
    for (const line of lines) {
      assert.ok(line.path.endsWith('Z'))
      assert.ok(line.opacity > 0 && line.opacity <= 1)
      const points = line.path.match(/-?\d+\.\d+/g).map(Number)
      assert.ok(points.every(point => Number.isFinite(point) && point > 0 && point < 480))
    }
  }
})

test('scroll projection is continuous, bounded and reversible', () => {
  assert.equal(flowScroll(100, 800), 0)
  assert.equal(flowScroll(-400, 800), .5)
  assert.equal(flowScroll(-1200, 800), 1)
  assert.equal(flowScroll(-1, 0), 1)
  const forward = Array.from({length: 81}, (_, i) => flowScroll(-i * 10, 800))
  const backward = Array.from({length: 81}, (_, i) => flowScroll(-(80 - i) * 10, 800))
  assert.deepEqual(forward, backward.reverse())
})

test('geometry is deterministic for SSR and changes with camera movement', () => {
  assert.deepEqual(flowLines(), flowLines())
  assert.notEqual(flowLines(.01)[0].path, flowLines()[0].path)
})
