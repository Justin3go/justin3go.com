<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { flowLines, flowScroll } from './flowGeometry'

const props = withDefaults(defineProps<{ motion?: boolean }>(), { motion: true })
const root = ref<HTMLElement>()
const lines = ref(flowLines())
let frame = 0, previous = 0, elapsed = 0
let visible = false, mounted = false
let pointerX = 0, pointerY = 0, x = 0, y = 0, progress = 0, targetProgress = 0
let observer: IntersectionObserver | undefined
let media: MediaQueryList | undefined

function allowed() { return mounted && props.motion && visible && !document.hidden && !media?.matches }
function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0 }
function sync() { stop(); if (allowed()) frame = requestAnimationFrame(draw) }
function draw(time: number) {
  frame = 0
  if (!allowed()) return
  if (!previous) previous = time
  const delta = time - previous
  if (delta >= 32) {
    elapsed += Math.min(delta, 64) / 1000
    previous = time
    x += (pointerX - x) * .1
    y += (pointerY - y) * .1
    progress += (targetProgress - progress) * .12
    lines.value = flowLines(elapsed * .07 + progress * 1.8 + x, y, Math.sin(elapsed * .15) * .24)
  }
  frame = requestAnimationFrame(draw)
}
function move(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !allowed() || !root.value) return
  const rect = root.value.getBoundingClientRect()
  pointerX = ((event.clientX - rect.left) / rect.width - .5) * .6
  pointerY = ((event.clientY - rect.top) / rect.height - .5) * .5
}
function leave() { pointerX = pointerY = 0 }
function scroll() {
  if (visible && root.value) targetProgress = flowScroll(root.value.getBoundingClientRect().top, innerHeight)
}
onMounted(() => {
  mounted = true
  media = matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', sync)
  document.addEventListener('visibilitychange', sync)
  addEventListener('scroll', scroll, { passive: true })
  observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; scroll(); sync() })
  observer.observe(root.value!)
})
watch(() => props.motion, sync)
onUnmounted(() => {
  mounted = false
  stop()
  observer?.disconnect()
  media?.removeEventListener('change', sync)
  document.removeEventListener('visibilitychange', sync)
  removeEventListener('scroll', scroll)
})
</script>

<template>
  <div ref="root" class="flow-sculpture" aria-hidden="true" @pointermove="move" @pointerleave="leave">
    <div class="flow-grid"></div>
    <svg viewBox="0 0 480 480" fill="none" class="flow-object">
      <path v-for="line in lines" :key="line.id" :d="line.path" :opacity="line.opacity" />
    </svg>
    <span class="flow-cross cross-one">+</span><span class="flow-cross cross-two">+</span>
    <div class="flow-caption"><span>FIG. 01</span><span>AN IDEA, TAKING SHAPE</span><span>↗</span></div>
  </div>
</template>

<style scoped>
.flow-sculpture { position: relative; isolation: isolate; width: 100%; aspect-ratio: 1; color: var(--vp-c-brand-1); }
.flow-grid { position: absolute; inset: 3%; z-index: -1; background-image: radial-gradient(var(--vp-c-divider) .8px, transparent .8px); background-size: 22px 22px; mask-image: radial-gradient(ellipse at center, #000 20%, transparent 68%); }
.flow-object { display: block; width: 100%; height: 100%; overflow: visible; }
.flow-object path { stroke: currentColor; stroke-width: .85; vector-effect: non-scaling-stroke; }
.flow-cross { position: absolute; font: 300 20px var(--vp-font-family-mono); color: var(--vp-c-text-3); }
.cross-one { left: 9%; top: 14%; }.cross-two { right: 9%; bottom: 18%; }
.flow-caption { display: flex; justify-content: space-between; gap: 12px; position: absolute; bottom: 5%; left: 9%; right: 9%; font: 9px var(--vp-font-family-mono); letter-spacing: .06em; color: var(--vp-c-text-2); }
</style>
