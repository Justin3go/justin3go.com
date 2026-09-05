<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ src: string; label: string; en: boolean }>()
const trigger = ref<HTMLButtonElement>()
const dialog = ref<HTMLDialogElement>()
const requested = ref(false)
const loaded = ref(false)
const failed = ref(false)
let observer: IntersectionObserver | undefined

function preload() { requested.value = true }
function open() {
  preload()
  dialog.value?.showModal()
}
async function retry() {
  requested.value = false
  failed.value = false
  loaded.value = false
  await nextTick()
  preload()
}
function backdrop(event: MouseEvent) {
  const element = dialog.value
  if (!element || event.target !== element) return
  const rect = element.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) element.close()
}
onMounted(() => {
  // Attach the real image before the modal opens, as soon as its button enters view.
  observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return
    preload()
    observer?.disconnect()
  })
  if (trigger.value) observer.observe(trigger.value)
})
onUnmounted(() => {
  observer?.disconnect()
  dialog.value?.close()
})
</script>

<template>
  <button ref="trigger" type="button" class="contact-image-trigger" aria-haspopup="dialog" @click="open">{{ label }} <span aria-hidden="true">▧</span></button>
  <Teleport to="body">
    <dialog ref="dialog" class="contact-image-dialog" :aria-label="label" @click="backdrop">
      <header><h2>{{ label }}</h2><button type="button" class="close-image" :aria-label="en ? 'Close' : '关闭'" autofocus @click="dialog?.close()">×</button></header>
      <div class="contact-image-body" :aria-busy="requested && !loaded && !failed">
        <img v-if="requested" v-show="loaded" :src="src" :alt="en ? `${label} QR code` : `${label}二维码`" loading="eager" @load="loaded = true; failed = false" @error="failed = true">
        <p v-if="failed" role="status">{{ en ? 'Unable to load the image.' : '图片加载失败。' }} <button type="button" @click="retry">{{ en ? 'Retry' : '重新加载' }}</button></p>
        <p v-else-if="!loaded" role="status">{{ en ? 'Loading image…' : '正在加载图片…' }}</p>
      </div>
      <p class="scan-hint">{{ en ? 'Scan with WeChat, or save the image to scan later.' : '使用微信扫一扫，或保存图片后识别二维码。' }}</p>
    </dialog>
  </Teleport>
</template>

<style scoped>
.contact-image-trigger { position: relative; isolation: isolate; padding: 7px 10px; color: inherit; font: inherit; cursor: pointer; }
.contact-image-trigger::before { content: ''; position: absolute; inset: 0; z-index: -1; background: var(--vp-c-bg); clip-path: var(--paper-button-edge); pointer-events: none; }
.contact-image-trigger:hover { color: var(--home-accent); }
.contact-image-trigger span { margin-left: 3px; opacity: .6; }
.contact-image-trigger:focus-visible, .contact-image-dialog button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
.contact-image-dialog { width: min(440px, calc(100vw - 32px)); max-height: calc(100dvh - 40px); margin: auto; padding: 22px; overflow: auto; color: var(--vp-c-text-1); background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); box-shadow: 6px 7px 0 color-mix(in srgb, var(--vp-c-bg-soft) 65%, transparent); }
.contact-image-dialog::backdrop { background: rgb(0 0 0 / .55); }
.contact-image-dialog header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.contact-image-dialog h2 { margin: 0; font-size: 20px; font-weight: 600; }
.close-image { width: 36px; height: 36px; font-size: 26px; cursor: pointer; }
.contact-image-body { min-height: 180px; display: grid; place-items: center; }
.contact-image-body img { display: block; max-width: 100%; max-height: calc(100dvh - 220px); height: auto; object-fit: contain; }
.contact-image-body p, .scan-hint { font-size: 13px; line-height: 1.7; color: var(--vp-c-text-2); }
.contact-image-body button { color: var(--vp-c-brand-1); text-decoration: underline; cursor: pointer; }
.scan-hint { margin: 18px 0 0; text-align: center; }
</style>
