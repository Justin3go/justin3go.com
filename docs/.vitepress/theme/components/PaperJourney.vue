<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { PAPER_SCENES, fragmentTransform, poseFrame, badmintonPose, type PaperScene } from './paperJourney'
import { stageShot, interpolateStage, type StageShot } from './paperStage'
import { loadPaperSprite } from './paperSprite'

type JourneyScene = PaperScene | 'intro'
const JOURNEY_SCENES: readonly JourneyScene[] = ['intro', ...PAPER_SCENES]

const props = withDefaults(defineProps<{ motion: boolean; locale?: 'zh' | 'en'; inlineScene?: PaperScene }>(), { locale: 'zh' })
const layer = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const caption = ref<HTMLElement>()
const mounted = ref(false)
const ready = ref(false)
const current = ref<JourneyScene>(props.inlineScene ?? 'intro')
const inHero = ref(true)
const sceneNumber = computed(() => JOURNEY_SCENES.indexOf(current.value) + 1)
const descriptions = computed(() => props.locale === 'en' ? {
  intro: ['Hi, I’m Justin3go.', 'Welcome to my little corner of the world.'],
  code: ['A little idea, made real.', 'One line of code at a time.'],
  photo: ['A different point of view.', 'There is a story in the everyday.'],
  badminton: ['Find another rhythm.', 'Eyes on the next shot.'],
  walk: ['Still on the way.', 'Every step becomes part of the story.'],
  chat: ['And now, over to you.', 'Every conversation is a new beginning.'],
} : {
  intro: ['你好，我是 Justin3go。', '很高兴，在这里遇见你。'],
  code: ['把小想法，写成日常。', '故事，从一行代码开始。'],
  photo: ['换个角度，看世界。', '平凡的一天，也值得留住。'],
  badminton: ['给生活，换个节奏。', '下一拍，继续全力以赴。'],
  walk: ['一路走来，继续向前。', '每一步，都算数。'],
  chat: ['接下来，听你说。', '新的故事，从一句你好开始。'],
})

const sprites = new Map<JourneyScene, HTMLCanvasElement>()
let poseCanvas: HTMLCanvasElement | undefined
const pending = new Set<JourneyScene>()
const failed = new Set<JourneyScene>()
// Matching jagged seams, so six pieces reassemble without rectangular gaps.
const seams = [
  [[0, 0], [.5, 0], [.48, .14], [.52, .22], [.5, .34], [.31, .32], [.19, .35], [0, .33]],
  [[.5, 0], [1, 0], [1, .33], [.79, .35], [.67, .32], [.5, .34], [.52, .22], [.48, .14]],
  [[0, .33], [.19, .35], [.31, .32], [.5, .34], [.48, .48], [.52, .58], [.5, .67], [.29, .65], [.17, .69], [0, .66]],
  [[.5, .34], [.67, .32], [.79, .35], [1, .33], [1, .66], [.79, .69], [.69, .65], [.5, .67], [.52, .58], [.48, .48]],
  [[0, .66], [.17, .69], [.29, .65], [.5, .67], [.48, .81], [.51, .92], [.5, 1], [0, 1]],
  [[.5, .67], [.69, .65], [.79, .69], [1, .66], [1, 1], [.5, 1], [.51, .92], [.48, .81]],
]
let root: HTMLElement | null = null
let hero: HTMLElement | null = null
let shots: { section: HTMLElement; anchor: HTMLElement; scene: JourneyScene }[] = []
let shot: StageShot = { from: 0, to: 0, mix: 0 }
let mobile = false
let context: CanvasRenderingContext2D | null = null
let observer: ResizeObserver | undefined
let themeObserver: MutationObserver | undefined
let raf = 0
let alive = true
let dirty = true
let lastPaint = 0
let pointer = Number.NaN
let pointerY = 0
let pointerAt = 0
let scrollPosition = 0
let previousScroll = 0
let scrollEnergy = 0
let size = 440
let accent = '#2949a4'
let ink = '#313136'
let paper = '#fff'
let line = '#e0e0e5'
let isVisible = true
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }

async function ensure(scene: JourneyScene) {
  if (!alive || sprites.has(scene) || pending.has(scene) || failed.has(scene)) return
  pending.add(scene)
  try {
    const sprite = await loadPaperSprite(`https://oss.justin3go.com/paper-journey/paper-journey/${scene}.png`, scene === 'badminton'
      ? Array.from({ length: 8 }, (_, i) => ({ x: (i % 4) / 4, y: i < 4 ? 0 : .474, width: .25, height: i < 4 ? .474 : .526 }))
      : undefined, scene === 'badminton')
    if (!alive) return
    sprites.set(scene, sprite)
    ready.value = true
    schedule()
  } catch {
    // An unavailable decorative asset never prevents reading or navigation.
    failed.add(scene)
  } finally { pending.delete(scene) }
}

function measure() {
  if (props.inlineScene && layer.value) {
    dirty = false
    mobile = innerWidth < 860
    const rect = layer.value.getBoundingClientRect()
    size = rect.width
    isVisible = mobile && size > 0 && rect.bottom > 64 && rect.top < innerHeight
    measureCanvas()
    return
  }
  if (!root || !hero || !shots.length || !stage.value || !caption.value || !layer.value) return
  dirty = false
  scrollPosition = window.scrollY
  mobile = innerWidth < 860
  const heroRect = hero.getBoundingClientRect()
  // Every chapter uses the hero's actual width. There is no miniature dock.
  size = heroRect.width
  const restingY = Math.max(144, (innerHeight - size) / 2 + 15)
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight)
  const stops = shots.map(({ section }, index) => index === 0 ? 0 :
    section.getBoundingClientRect().top + scrollPosition + parseFloat(getComputedStyle(section).paddingTop) - restingY)
  // The last chapter must be reachable even in unusually tall viewports.
  if (stops[stops.length - 1] > maxScroll) {
    const ratio = maxScroll / stops[stops.length - 1]
    for (let i = 1; i < stops.length; i++) stops[i] *= ratio
  }
  shot = mobile ? { from: 0, to: 0, mix: 0 } : stageShot(scrollPosition, stops, Math.min(940, size * 1.65))
  if (!props.motion && shot.from !== shot.to) {
    const index = shot.mix < .5 ? shot.from : shot.to
    shot = { from: index, to: index, mix: 0 }
  }
  inHero.value = shot.from === 0 && shot.to === 0
  const point = (index: number) => {
    const rect = shots[index].anchor.getBoundingClientRect()
    // On phones the illustration remains in normal hero flow and scrolls away.
    // Desktop shots stay alongside the text, with their centres below the nav.
    return { x: rect.left + (rect.width - size) / 2, y: mobile ? heroRect.top : index === 0 ? Math.max(144, heroRect.top) : restingY }
  }
  const position = interpolateStage(point(shot.from), point(shot.to), shot.mix, size)
  const { x } = position
  // Once the closing spread aligns, its illustration and caption leave with the text.
  const closingSection = shots[shots.length - 1].section
  const closingTop = closingSection.getBoundingClientRect().top + parseFloat(getComputedStyle(closingSection).paddingTop)
  const y = mobile ? position.y : Math.min(position.y, closingTop, root.getBoundingClientRect().bottom - size - 125)
  stage.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
  stage.value.style.width = `${size}px`
  stage.value.style.height = `${size}px`
  caption.value.style.transform = `translate3d(${x}px, ${y + size * .89}px, 0)`
  caption.value.style.width = `${size}px`
  caption.value.style.opacity = shot.from !== shot.to ? `${1 - Math.sin(Math.PI * shot.mix)}` : '1'
  isVisible = y + size + 70 > 64 && y < innerHeight && root.getBoundingClientRect().bottom > 64
  if (mobile) isVisible = isVisible && heroRect.bottom > 64
  layer.value.style.visibility = isVisible ? 'visible' : 'hidden'

  measureCanvas()
}

function measureCanvas() {
  if (!root) return
  const styles = getComputedStyle(root)
  accent = styles.getPropertyValue('--vp-c-brand-1').trim() || accent
  ink = styles.getPropertyValue('--vp-c-text-1').trim() || ink
  paper = styles.getPropertyValue('--vp-c-bg').trim() || paper
  line = styles.getPropertyValue('--vp-c-divider').trim() || line
  const pixels = Math.round(Math.max(150, size) * Math.min(devicePixelRatio || 1, 2))
  if (canvas.value && canvas.value.width !== pixels) {
    canvas.value.width = pixels
    canvas.value.height = pixels
  }
}

function path(points: number[][], close = false) {
  if (!context) return
  context.beginPath()
  points.forEach(([x, y], i) => i ? context!.lineTo(x, y) : context!.moveTo(x, y))
  if (close) context.closePath()
}

function paperCard(x: number, y: number, width: number, height: number, angle: number, kind: JourneyScene, alpha: number) {
  const ctx = context!
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = paper
  ctx.strokeStyle = line
  ctx.lineWidth = 1.5
  path([[0, 3], [width * .2, 0], [width * .44, 3], [width * .7, 0], [width, 2], [width - 2, height * .52], [width, height], [width * .6, height - 2], [width * .25, height + 2], [0, height - 1]], true)
  ctx.fill(); ctx.stroke()
  ctx.strokeStyle = accent
  ctx.fillStyle = accent
  if (kind === 'code') {
    ctx.globalAlpha = alpha * .55
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(14 + (i % 2) * 9, 22 + i * 13, (width - 38) * (i % 2 ? .7 : 1), 2)
    }
    ctx.beginPath(); ctx.arc(14, 11, 2, 0, Math.PI * 2); ctx.fill()
  } else if (kind === 'photo') {
    ctx.globalAlpha = alpha * .28
    ctx.fillRect(10, 10, width - 20, height - 28)
    ctx.globalAlpha = alpha * .7
    path([[10, height - 18], [width * .4, height * .35], [width * .62, height * .58], [width * .8, height * .3], [width - 10, height - 18]])
    ctx.stroke(); ctx.beginPath(); ctx.arc(width * .7, 25, 7, 0, Math.PI * 2); ctx.stroke()
  } else if (kind === 'chat') {
    ctx.globalAlpha = alpha * .6
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(width / 2 - 17 + i * 17, height / 2, 3, 0, Math.PI * 2); ctx.fill() }
  } else {
    ctx.globalAlpha = alpha * .45
    path([[14, height - 14], [width * .45, 15], [width - 14, height - 14]])
    ctx.stroke()
  }
  ctx.restore()
}

function drawSet(scene: JourneyScene, opacity: number, scatter: number, tick: number) {
  if (opacity <= 0) return
  const ctx = context!
  const drift = props.motion ? Math.sin(tick * .55) * 5 : 0
  if (scene !== 'intro') {
  paperCard(65 - scatter * 70, 160 + drift - scatter * 35, 123, 91, -.14 - scatter * .35, scene, opacity * .82)
  paperCard(423 + scatter * 50, 302 - drift + scatter * 30, 104, 82, .15 + scatter * .35, scene, opacity * .68)
  }
  ctx.save()
  ctx.globalAlpha = opacity * .4
  ctx.strokeStyle = accent
  ctx.fillStyle = accent
  ctx.lineWidth = 1.25
  if (scene === 'intro') {
    for (const [x, y] of [[139, 159], [439, 260]]) {
      path([[x - 9, y], [x + 9, y]]); ctx.stroke()
      path([[x, y - 9], [x, y + 9]]); ctx.stroke()
    }
    path([[432, 115], [440, 103], [453, 109]]); ctx.stroke()
  } else if (scene === 'photo') {
    path([[174, 120], [174, 98], [199, 98]]); ctx.stroke()
    path([[401, 98], [426, 98], [426, 120]]); ctx.stroke()
    path([[174, 374], [174, 398], [199, 398]]); ctx.stroke()
    path([[401, 398], [426, 398], [426, 374]]); ctx.stroke()
  } else if (scene === 'badminton') {
    const swing = props.motion ? Math.sin(tick * 1.8 + scrollPosition / 160) : 0
    ctx.translate(420 + swing * 65, 125 - Math.cos(swing) * 35)
    ctx.rotate(swing * .7 + .4)
    path([[-13, -23], [-5, 4], [5, 4], [13, -23], [-13, -23]]); ctx.stroke()
    path([[-4, -22], [-2, 4], [2, 4], [4, -22]]); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 6, 5, 0, Math.PI); ctx.stroke()
  } else if (scene === 'walk') {
    ctx.setLineDash([3, 9]); ctx.lineDashOffset = props.motion ? -scrollPosition / 7 : 0
    ctx.beginPath(); ctx.moveTo(90, 478); ctx.bezierCurveTo(210, 415, 381, 544, 529, 435); ctx.stroke()
  } else if (scene === 'code') {
    ctx.font = '22px monospace'; ctx.fillText('{ }', 438, 156)
    path([[106, 325], [121, 336], [106, 347]]); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.arc(439, 126, 17, 0, Math.PI * 1.8); ctx.stroke()
    path([[443, 142], [439, 153], [455, 145]]); ctx.stroke()
  }
  ctx.restore()
}

function drawActor(from: JourneyScene, to: JourneyScene, mix: number, tick: number, mouse: number) {
  const ctx = context!
  const frameFor = (scene: JourneyScene) => poseFrame(mouse, scene === 'walk' ? (props.inlineScene ? tick : scrollPosition / 300) : (scene === 'code' || scene === 'badminton' ? tick : tick * (scene === 'intro' ? .12 : .25)), scene === 'intro' ? 'chat' : scene, props.motion)
  const draw = (scene: JourneyScene) => {
    const atlas = sprites.get(scene)
    if (!atlas) return
    const frame = frameFor(scene)
    const cell = atlas.width / 2
    ctx.save()
    // Face the project content on the right without mirroring the scene lettering.
    if (scene === 'code') { ctx.translate(600, 0); ctx.scale(-1, 1) }
    const drawFrame = (index: number) => ctx.drawImage(atlas, (index % 2) * cell, Math.floor(index / 2) * cell, cell, cell, 60, 5, 480, 480)
    if (scene === 'badminton' && props.motion) {
      const pose = badmintonPose(tick)
      poseCanvas ||= document.createElement('canvas')
      if (poseCanvas.width !== cell) { poseCanvas.width = cell; poseCanvas.height = cell }
      const blend = poseCanvas.getContext('2d')!
      blend.clearRect(0, 0, cell, cell)
      // Add premultiplied frames offscreen so shared body pixels stay opaque.
      blend.globalCompositeOperation = 'lighter'
      for (const [index, opacity] of [[pose.from, 1 - pose.mix], [pose.to, pose.mix]]) {
        blend.globalAlpha = opacity
        blend.drawImage(atlas, (index % 2) * cell, Math.floor(index / 2) * cell, cell, cell, 0, 0, cell, cell)
      }
      ctx.drawImage(poseCanvas, 60, 5, 480, 480)
    } else drawFrame(frame)
    ctx.restore()
  }
  ctx.save()
  const lean = Number.isFinite(mouse) && props.motion ? mouse * 5 : 0
  ctx.translate(lean, props.motion ? pointerY * 2 : 0)
  if (!props.motion || from === to || mix <= 0 || mix >= 1) { draw(mix >= .5 ? to : from); ctx.restore(); return }
  seams.forEach((polygon, i) => {
    const phase = smooth((mix - i * .055) / .725)
    const fragment = fragmentTransform(i, Math.sin(Math.PI * phase))
    const cx = 60 + (i % 2 ? .75 : .25) * 480
    const cy = 5 + (Math.floor(i / 2) + .5) / 3 * 480
    ctx.save()
    ctx.translate(cx + fragment.x, cy + fragment.y)
    ctx.rotate(fragment.rotate * Math.PI / 180)
    ctx.scale((.58 + .42 * Math.abs(Math.cos(Math.PI * phase))) * fragment.scale, fragment.scale)
    ctx.translate(-cx, -cy)
    path(polygon.map(([x, y]) => [60 + x * 480, 5 + y * 480]), true)
    ctx.clip()
    draw(phase < .5 ? from : to)
    ctx.restore()
  })
  ctx.restore()
}

function paint(timestamp: number) {
  raf = 0
  if (!alive || document.hidden || !context || !canvas.value) return
  if (dirty) measure()
  if (!isVisible || (!props.inlineScene && !shots.length)) return
  if (timestamp - lastPaint < 32 && props.motion) { raf = requestAnimationFrame(paint); return }
  lastPaint = timestamp
  const blend = props.inlineScene ? { from: props.inlineScene, to: props.inlineScene, mix: 0, scatter: 0 } : { from: shots[shot.from].scene, to: shots[shot.to].scene, mix: shot.mix, scatter: Math.sin(Math.PI * shot.mix) }
  const scene = blend.mix >= .5 ? blend.to : blend.from
  current.value = scene
  void ensure(blend.from); void ensure(blend.to)
  const next = JOURNEY_SCENES[JOURNEY_SCENES.indexOf(scene) + 1]
  if (!props.inlineScene && !mobile && next && sprites.has(scene)) void ensure(next)
  const tick = props.motion ? timestamp / 1000 : 0
  const mouse = !props.inlineScene && timestamp - pointerAt < 1800 ? pointer : Number.NaN
  const ctx = context
  ctx.setTransform(canvas.value.width / 600, 0, 0, canvas.value.height / 600, 0, 0)
  ctx.clearRect(0, 0, 600, 600)
  ctx.save()
  // A quiet continuous contour connects all five sets; camera drift responds
  // to scrolling without changing the browser's native scroll behaviour.
  ctx.translate(300, 280)
  const camera = props.motion ? clamp(scrollEnergy / 900, -.018, .018) : 0
  ctx.rotate(camera)
  ctx.translate(-300, -280)
  scrollEnergy *= .84
  ctx.strokeStyle = line; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(93, 416); ctx.bezierCurveTo(6, 165, 422, 7, 512, 206); ctx.bezierCurveTo(604, 403, 130, 584, 82, 365); ctx.stroke()
  ctx.fillStyle = ink; ctx.globalAlpha = .055
  ctx.beginPath(); ctx.ellipse(300, 488, 122, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1
  if (props.motion) {
    drawSet(blend.from, blend.from === blend.to ? 1 : 1 - blend.mix, blend.scatter, tick)
    if (blend.to !== blend.from) drawSet(blend.to, blend.mix, blend.scatter, tick)
  } else drawSet(scene, 1, 0, 0)
  drawActor(blend.from, blend.to, blend.mix, tick, mouse)
  ctx.restore()
  if (props.motion) raf = requestAnimationFrame(paint)
}

function schedule() { if (alive && !raf && !document.hidden) raf = requestAnimationFrame(paint) }
function scroll() {
  scrollEnergy = window.scrollY - previousScroll
  previousScroll = window.scrollY
  dirty = true; schedule()
}
function refresh() { dirty = true; schedule() }
function move(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !props.motion) return
  pointer = clamp(event.clientX / innerWidth * 2 - 1, -1, 1)
  pointerY = clamp(event.clientY / innerHeight * 2 - 1, -1, 1)
  pointerAt = performance.now(); schedule()
}
function visibility() { cancelAnimationFrame(raf); raf = 0; refresh() }
watch(() => props.motion, refresh)
onMounted(() => {
  root = layer.value?.closest('.profile-home') ?? null
  hero = root?.querySelector('.hero-art') ?? null
  shots = Array.from(root?.querySelectorAll<HTMLElement>('[data-paper-section]') ?? []).flatMap(section => {
    const anchor = section.querySelector<HTMLElement>('[data-paper-anchor]')
    const scene = section.dataset.paperSection as JourneyScene
    return anchor && JOURNEY_SCENES.includes(scene) ? [{ section, anchor, scene }] : []
  })
  context = canvas.value?.getContext('2d') ?? null
  mounted.value = true
  observer = new ResizeObserver(refresh)
  if (root) observer.observe(root)
  if (hero) observer.observe(hero)
  if (props.inlineScene && layer.value) observer.observe(layer.value)
  themeObserver = new MutationObserver(refresh)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
  addEventListener('scroll', scroll, { passive: true })
  addEventListener('resize', refresh)
  addEventListener('pointermove', move, { passive: true })
  document.addEventListener('visibilitychange', visibility)
  document.fonts?.ready.then(() => { if (alive) refresh() })
  // Start at the requested section on deep links, then preload just its neighbour.
  measure()
  previousScroll = window.scrollY
  if (isVisible && (props.inlineScene || shots.length)) void ensure(props.inlineScene ?? shots[shot.from].scene)
  schedule()
})
onUnmounted(() => {
  alive = false
  cancelAnimationFrame(raf)
  observer?.disconnect(); themeObserver?.disconnect()
  removeEventListener('scroll', scroll); removeEventListener('resize', refresh)
  removeEventListener('pointermove', move)
  document.removeEventListener('visibilitychange', visibility)
  sprites.clear()
})
</script>

<template>
  <div ref="layer" class="paper-journey" :class="{ 'is-mounted': mounted, 'is-hero': inHero && !inlineScene, 'is-inline': inlineScene }" :data-scene="current" :data-motion="motion ? 'playing' : 'paused'" aria-hidden="true">
    <div ref="stage" class="paper-stage">
      <canvas ref="canvas" class="paper-canvas" :class="{ 'is-ready': ready }"></canvas>
    </div>
    <div ref="caption" class="paper-caption">
      <div class="paper-scene-index"><span>0{{ sceneNumber }}</span><span class="paper-scene-line"></span><span>06</span></div>
      <p class="paper-scene-title">{{ descriptions[current][0] }}</p>
      <p class="paper-scene-detail">{{ descriptions[current][1] }}</p>
      <span v-if="inHero && !inlineScene" class="paper-scroll-hint">{{ locale === 'en' ? 'SCROLL TO CONTINUE THE STORY' : '向下滚动，故事继续' }} <span>↓</span></span>
    </div>
  </div>
</template>

<style scoped>
.paper-journey { position: fixed; inset: 0 auto auto 0; width: 0; height: 0; z-index: 21; pointer-events: none; opacity: 0; }
.paper-journey.is-mounted { opacity: 1; }
.paper-stage { position: absolute; top: 0; left: 0; will-change: transform; }
.paper-canvas { width: 100%; height: 100%; display: block; opacity: 0; }
.paper-canvas.is-ready { opacity: 1; transition: opacity .4s; }
.paper-caption { position: absolute; top: 0; left: 0; text-align: center; color: var(--vp-c-text-2); will-change: transform; }
.paper-scene-index { display: flex; gap: 9px; align-items: center; justify-content: center; font: 9px var(--vp-font-family-mono); letter-spacing: .08em; color: var(--vp-c-brand-1); }
.paper-scene-line { width: 45px; height: 1px; background: currentColor; opacity: .4; }
.paper-scene-title { margin: 9px 0 0 !important; font-size: 13px; letter-spacing: .035em; line-height: 1.6; color: var(--vp-c-text-1); }
.paper-scene-detail { margin: 5px 0 0 !important; font-size: 10px; line-height: 1.7; }
.paper-scroll-hint { display: block; margin-top: 23px; font: 9px var(--vp-font-family-mono); letter-spacing: .07em; opacity: .7; }.paper-scroll-hint span { margin-left: 8px; }
.paper-journey.is-inline { display: none; }
@media (max-width: 859px) {
  .paper-journey.is-inline { display: block; position: relative; inset: auto; width: 100%; height: auto; z-index: auto; }
  .is-inline .paper-stage { position: relative; width: 100%; aspect-ratio: 1; will-change: auto; }
  .is-inline .paper-caption { position: relative; width: 100%; margin-top: -8%; will-change: auto; }
}
@media (max-width: 380px) { .paper-scroll-hint { margin-top: 14px; } }
@media (prefers-reduced-motion: reduce) { .paper-canvas.is-ready { transition: none; } }
</style>
