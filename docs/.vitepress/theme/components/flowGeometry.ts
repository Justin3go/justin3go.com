export type FlowLine = { id: number; path: string; opacity: number }
export const FLOW_LINES = 42
const SAMPLES = 88

/** A closed, twisted torus projected into a 480 × 480 viewBox. */
export function flowLines(rotation = 0, tilt = 0, phase = 0): FlowLine[] {
  const yaw = rotation + .35
  const pitch = tilt - .64
  const cy = Math.cos(yaw), sy = Math.sin(yaw)
  const cp = Math.cos(pitch), sp = Math.sin(pitch)
  return Array.from({ length: FLOW_LINES }, (_, id) => {
    const v = id / FLOW_LINES * Math.PI * 2
    let depth = 0
    const points = Array.from({ length: SAMPLES }, (_, i) => {
      const u = i / SAMPLES * Math.PI * 2
      const twist = v + 2 * u + phase
      const radius = 1.35 + .19 * Math.cos(3 * u + phase)
      const x = (radius + .47 * Math.cos(twist)) * Math.cos(u)
      const z = (radius + .47 * Math.cos(twist)) * Math.sin(u)
      const y = .58 * Math.sin(twist) + .15 * Math.sin(3 * u + phase)
      const rx = x * cy + z * sy
      const rz = z * cy - x * sy
      const ry = y * cp - rz * sp
      const dz = y * sp + rz * cp
      depth += dz
      const perspective = 4.8 / (4.8 + dz * .24)
      return `${(240 + rx * 106 * perspective).toFixed(2)},${(238 + ry * 106 * perspective).toFixed(2)}`
    })
    return { id, path: `M${points.join('L')}Z`, opacity: .34 + (depth / SAMPLES + 1) * .14 }
  })
}

export function flowScroll(top: number, height: number): number {
  return Math.max(0, Math.min(1, -top / Math.max(height, 1)))
}
