import * as THREE from 'three'
import { PAPER_PRINT_SIZE, PAPER_PRINT_X, PAPER_PRINT_Y, PAPER_STAGE_HEIGHT } from './paperLayout.ts'

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}

export function crumplePhase(mix: number) {
  return {
    // Hold the compact shape while the print changes, without a shape jump.
    fold: smooth(Math.min(mix / .44, (1 - mix) / .44)),
    next: smooth((mix - .44) / .12),
  }
}

export function createPaperCrumple() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setClearColor(0, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-300, 300, PAPER_STAGE_HEIGHT / 2, -PAPER_STAGE_HEIGHT / 2, .1, 2000)
  camera.position.z = 1000
  const geometry = new THREE.BufferGeometry()
  const source = document.createElement('canvas')
  source.width = source.height = PAPER_PRINT_SIZE * 2
  const texture = new THREE.CanvasTexture(source)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  const lighting = { value: 0 }
  const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide,
    roughness: .92, metalness: 0, alphaTest: .035, alphaToCoverage: true })
  material.onBeforeCompile = shader => {
    shader.uniforms.paperLighting = lighting
    shader.fragmentShader = 'uniform float paperLighting;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      if (!gl_FrontFacing) {
        diffuseColor.rgb = vec3(.91, .89, .85);
      }
    `)
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      outgoingLight = mix(diffuseColor.rgb, outgoingLight, paperLighting);
      #include <opaque_fragment>
    `)
  }
  const sheet = new THREE.Mesh(geometry, material)
  sheet.scale.setScalar(PAPER_PRINT_SIZE)
  // Match the flat actor exactly, including the area-normalised atlas.
  sheet.position.y = PAPER_STAGE_HEIGHT / 2 - PAPER_PRINT_Y - PAPER_PRINT_SIZE / 2
  sheet.frustumCulled = false
  scene.add(sheet, new THREE.AmbientLight(0xffffff, 1.5))
  const light = new THREE.DirectionalLight(0xffffff, 2.5)
  light.position.set(-350, 500, 800)
  scene.add(light)
  let samples: Float32Array[] | undefined
  let indices: number[] = []
  let neighbors: number[][] = []
  let faceNormals = new Float32Array()
  let previousFold = -1
  let failed = false
  const worker = new Worker(new URL('./paperCrumple.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = ({ data }) => {
    samples = data.samples
    indices = data.indices
    neighbors = Array.from({ length: data.uvs.length / 2 }, () => [])
    indices.forEach((index, i) => neighbors[index].push(Math.floor(i / 3) * 3))
    faceNormals = new Float32Array(indices.length)
    const uv = new Float32Array(indices.length * 2)
    indices.forEach((index, i) => { uv[i * 2] = data.uvs[index * 2]; uv[i * 2 + 1] = data.uvs[index * 2 + 1] })
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(indices.length * 3), 3).setUsage(THREE.DynamicDrawUsage))
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(indices.length * 3), 3))
    worker.terminate()
  }
  worker.onerror = () => { failed = true; worker.terminate() }
  const contextLost = (event: Event) => { event.preventDefault(); failed = true }
  renderer.domElement.addEventListener('webglcontextlost', contextLost)

  return {
    draw(ctx: CanvasRenderingContext2D, mix: number, pixels: number,
      drawPrint: (target: CanvasRenderingContext2D, next: number) => void) {
      if (!samples || failed) return false
      const { fold, next } = crumplePhase(mix)
      const paint = source.getContext('2d')!
      paint.clearRect(0, 0, source.width, source.height)
      paint.save()
      paint.scale(2, 2)
      paint.imageSmoothingQuality = 'high'
      paint.translate(-PAPER_PRINT_X, -PAPER_PRINT_Y)
      drawPrint(paint, next)
      paint.restore()
      texture.needsUpdate = true
      if (fold !== previousFold) {
        const frame = fold * (samples.length - 1)
        const low = Math.floor(frame), high = Math.min(low + 1, samples.length - 1)
        const position = geometry.getAttribute('position') as THREE.BufferAttribute
        indices.forEach((index, i) => {
          for (let axis = 0; axis < 3; axis++) {
            const at = index * 3 + axis
            position.array[i * 3 + axis] = samples![low][at] + (samples![high][at] - samples![low][at]) * (frame - low)
          }
        })
        position.needsUpdate = true
        // Smooth neighboring facets only across shallow bends. Sharp folds
        // retain a crease, as in the reference, without a low-poly ball look.
        const normals = geometry.getAttribute('normal') as THREE.BufferAttribute
        const p = position.array
        for (let face = 0; face < indices.length; face += 3) {
          const a = face * 3, b = a + 3, c = a + 6
          const bx = p[b] - p[a], by = p[b + 1] - p[a + 1], bz = p[b + 2] - p[a + 2]
          const cx = p[c] - p[a], cy = p[c + 1] - p[a + 1], cz = p[c + 2] - p[a + 2]
          const nx = by * cz - bz * cy, ny = bz * cx - bx * cz, nz = bx * cy - by * cx
          const length = Math.hypot(nx, ny, nz) || 1
          faceNormals.set([nx / length, ny / length, nz / length], face)
        }
        indices.forEach((index, i) => {
          const face = Math.floor(i / 3) * 3
          let nx = 0, ny = 0, nz = 0
          for (const neighbor of neighbors[index]) {
            const dot = faceNormals[face] * faceNormals[neighbor] + faceNormals[face + 1] * faceNormals[neighbor + 1] + faceNormals[face + 2] * faceNormals[neighbor + 2]
            const weight = smooth((dot - .8) / .18)
            nx += faceNormals[neighbor] * weight
            ny += faceNormals[neighbor + 1] * weight
            nz += faceNormals[neighbor + 2] * weight
          }
          const length = Math.hypot(nx, ny, nz) || 1
          normals.setXYZ(i, nx / length, ny / length, nz / length)
        })
        normals.needsUpdate = true
        lighting.value = smooth(fold / .4)
        // Let the inward-curled sheet turn with the squeeze, presenting its
        // existing reverse. Alpha always comes from the original paper cutout.
        sheet.rotation.set(.1 * smooth((fold - .2) / .8), 2.9 * smooth((fold - .2) / .8), 0, 'YXZ')
        previousFold = fold
      }
      if (renderer.domElement.width !== pixels) renderer.setSize(pixels, Math.round(pixels * PAPER_STAGE_HEIGHT / 600), false)
      renderer.render(scene, camera)
      ctx.drawImage(renderer.domElement, 0, 0, 600, PAPER_STAGE_HEIGHT)
      return true
    },
    dispose() {
      worker.terminate()
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      texture.dispose(); material.dispose(); geometry.dispose(); renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
