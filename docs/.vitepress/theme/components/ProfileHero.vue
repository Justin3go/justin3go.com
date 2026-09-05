<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { frameAt, frameTile, PORTRAIT_SEQUENCE as sequence } from './heroCamera'

const props = withDefaults(defineProps<{ locale?: 'zh' | 'en'; placement?: 'inline' | 'aside' }>(), { placement: 'inline' })
const root = ref<HTMLElement>()
const frameStyle = ref<Record<string, string>>({})
const ready = ref(false)
const posterFailed = ref(false)
const drawnFrame = ref(0)
const sheets = new Map<number, HTMLImageElement>()
const pending = new Map<number, Promise<void>>()
const failed = new Set<number>()
let motionQuery: MediaQueryList | undefined
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let reduced = false
let visible = false
let disposed = false
let request = 0
let measure = true
let target = 0
let current = 0
let lastDrawn = -1

function queue(needsMeasure = false) {
  measure ||= needsMeasure
  if (!disposed && visible && !reduced && !request) request = requestAnimationFrame(paint)
}
function evict() {
  const center = frameTile(target).sheet
  for (const key of sheets.keys()) if (Math.abs(key - center) > 1) sheets.delete(key)
}
function loadSheet(index: number) {
  if (index < 0 || index >= sequence.count / sequence.framesPerSheet || reduced || disposed) return
  if (sheets.has(index) || pending.has(index) || failed.has(index)) return
  const work = new Promise<void>((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = async () => {
      try {
        await image.decode()
        if (!disposed && !reduced) {
          sheets.set(index, image)
          evict()
          queue()
        }
      } catch { failed.add(index) }
      resolve()
    }
    image.onerror = () => { failed.add(index); resolve() }
    image.src = withBase(`/hero/turntable/sheet-${index}.webp`)
  }).finally(() => pending.delete(index))
  pending.set(index, work)
}
function paint() {
  request = 0
  if (disposed || reduced || !visible || !root.value) return
  if (measure) {
    const bounds = root.value.getBoundingClientRect()
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height')) || 64
    const heading = root.value.closest('.VPDoc')?.querySelector('h1')
    const origin = Math.max(0, scrollY + (heading?.getBoundingClientRect().top ?? bounds.top) - nav - 48)
    target = frameAt(scrollY, origin, props.placement === 'aside' ? 360 : Math.max(80, bounds.height * .9))
    measure = false
  }
  // Smooth the playhead, never the page's native scroll position.
  current += (target - current) * .24
  if (Math.abs(target - current) < .02) current = target
  const destination = frameTile(target)
  loadSheet(destination.sheet)
  loadSheet(destination.sheet + 1)
  loadSheet(destination.sheet - 1)
  const tile = frameTile(current)
  // During a fast scroll, jump to a ready destination rather than request old sheets.
  const selected = sheets.has(tile.sheet) ? tile : destination
  const image = sheets.get(selected.sheet)
  if (image && lastDrawn !== selected.index) {
    frameStyle.value = {
      backgroundImage: `url("${image.src}")`,
      backgroundPosition: `${selected.x / sequence.width * 50}% ${selected.y / sequence.height * 50}%`,
    }
    lastDrawn = selected.index
    drawnFrame.value = selected.index
    ready.value = true
  }
  evict()
  if (current !== target) queue()
}
function scrollChanged() { queue(true) }
function motionChanged() {
  reduced = motionQuery?.matches ?? false
  cancelAnimationFrame(request)
  request = 0
  if (reduced) {
    ready.value = false
    current = target = 0
    lastDrawn = -1
    drawnFrame.value = 0
    sheets.clear()
  } else queue(true)
}

onMounted(() => {
  motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  motionChanged()
  motionQuery.addEventListener('change', motionChanged)
  addEventListener('scroll', scrollChanged, { passive: true })
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) queue(true)
    else { cancelAnimationFrame(request); request = 0; sheets.clear() }
  })
  observer.observe(root.value!)
  resizeObserver = new ResizeObserver(scrollChanged)
  resizeObserver.observe(root.value!)
})
onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(request)
  removeEventListener('scroll', scrollChanged)
  motionQuery?.removeEventListener('change', motionChanged)
  observer?.disconnect()
  resizeObserver?.disconnect()
  sheets.clear()
})
</script>

<template>
  <div ref="root" class="profile-portrait" :class="`portrait-${placement}`" aria-hidden="true" :data-frame="drawnFrame">
    <img :src="withBase(posterFailed ? '/ava.png' : '/hero/turntable/poster.webp')" alt=""
      :width="sequence.width" :height="sequence.height" fetchpriority="high"
      :class="{ 'is-covered': ready }" @error="posterFailed = true">
    <div class="portrait-frame" :class="{ 'is-ready': ready }" :style="frameStyle"></div>
  </div>
</template>

<style scoped>
.profile-portrait { position: relative; float: right; width: 220px; max-width: 35%; aspect-ratio: 448 / 300; margin: 0 0 20px 24px; pointer-events: none; }
.portrait-aside { display: none; }
.profile-portrait img { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: 0; cursor: default; }
.portrait-frame { position: absolute; inset: 0; visibility: hidden; background-size: 300% 300%; background-repeat: no-repeat; }
.portrait-frame.is-ready { visibility: visible; }
.profile-portrait img.is-covered { visibility: hidden; }
@media (max-width: 600px) { .profile-portrait { width: 140px; max-width: 34%; margin: 0 0 12px 14px; } }
@media (min-width: 1280px) { .portrait-inline { display: none; } .portrait-aside { display: block; float: none; width: 100%; max-width: 224px; margin: 0 0 24px; } }
@media (prefers-reduced-motion: reduce) { .portrait-frame { display: none; } .profile-portrait img.is-covered { visibility: visible; } }
</style>
