<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import FlowSculpture from './FlowSculpture.vue'
import ProfileProjects from './ProfileProjects.vue'
import ProfileTimeline from './ProfileTimeline.vue'

const props = withDefaults(defineProps<{ locale?: 'zh' | 'en' }>(), { locale: 'zh' })
const en = computed(() => props.locale === 'en')
const page = ref<HTMLElement>()
const paused = ref(false)
const reduced = ref(false)
const motion = computed(() => !paused.value && !reduced.value)
const active = ref('projects')
const progress = ref(0)
let media: MediaQueryList | undefined
let revealObserver: IntersectionObserver | undefined
let frame = 0

const copy = computed(() => en.value ? {
  hello: 'Hi, I’m Justin3go.', role: 'Independent maker · Beijing, China',
  headline: ['Ideas into', 'everyday things.'],
  intro: 'Build with AI. Stay human.',
  detail: 'I write code, make products, and document the little things. A work in progress, on and off the screen.',
  work: 'Explore my work', blog: 'Read the blog',
  nav: ['Work', 'About', 'Journey', 'Contact'],
  workTitle: 'Made to be used.', workIntro: 'Small ideas, real products. A selection of the tools and experiments I keep building.',
  aboutTitle: 'More than a screen.',
  about: 'My background is in software engineering. What keeps me going is turning a real problem into something useful, then making it a little better.',
  aboutMore: 'I enjoy open source and sharing what I learn. Finish something, learn from it, and keep going.',
  photo: 'Seeing the everyday', photoBody: 'Landscapes, street corners, and the light on an ordinary day. Usually with a Sony A7C II.',
  sport: 'Time away from the desk', sportBody: 'About eight hours of badminton a week. A different kind of focus, and a good reason to close the laptop.',
  journeyTitle: 'Still on the way.', journeyIntro: 'From learning to build, to building things that matter to me.',
  future: '2101: hopefully still here. 3001: still figuring things out.',
  contactTitle: 'Let’s make a connection.', contactIntro: 'An idea, a question, or a simple hello — my inbox is open. A little context is always welcome.',
  motto: 'Execution wins. Persistence compounds.', pause: 'Pause motion', play: 'Resume motion', static: 'Reduced motion',
  photography: 'PHOTOGRAPHY', badminton: 'BADMINTON', top: 'Back to top', social: ['WeChat', 'X / Twitter', 'GitHub', 'Juejin', 'WeChat articles']
} : {
  hello: 'Hi，我是 Justin3go。', role: '独立产品创造者 · 中国北京',
  headline: ['把想法，', '变成日常。'],
  intro: 'AI 创造一切，也保持活人感。',
  detail: '写代码、做产品，也拍照、打球。把好奇心变成作品，把生活里的小事认真记录。',
  work: '看看我的作品', blog: '阅读博客',
  nav: ['作品', '关于', '经历', '联系'],
  workTitle: '做些真正用得上的东西。', workIntro: '从一个小念头开始，做成可以打开、可以使用的产品。这里是我的一些实践。',
  aboutTitle: '屏幕之外，也有热爱。',
  about: '我的职业背景是软件工程。比起罗列使用过的框架，我更在意有没有解决真实问题，把产品做出来，再一点点打磨好。',
  aboutMore: '喜欢开源、分享，也习惯公开记录。先完成，再学习，然后继续创造。',
  photo: '留住普通的一天', photoBody: '风光、街角、生活里的光线。拿着 Sony A7C II，把走过的日常多看一眼。',
  sport: '给生活换个节奏', sportBody: '每周大约八小时羽毛球。离开屏幕，专心接好下一拍，也希望球价能早日降下来。',
  journeyTitle: '一路走来，继续向前。', journeyIntro: '从学习如何写代码，到慢慢找到自己想创造的东西。',
  future: '2101，希望我还活着；3001，千年修为，我还在修炼。',
  contactTitle: '聊聊你的想法。', contactIntro: '关于产品、技术，或者打个招呼。如果你从博客而来，记得简单介绍一下来意。',
  motto: '赢在执行力，贵在坚持。', pause: '暂停动效', play: '开启动效', static: '已减少动态效果',
  photography: 'PHOTOGRAPHY / 摄影', badminton: 'BADMINTON / 羽毛球', top: '回到顶部', social: ['微信', 'X / 推特', 'GitHub', '掘金', '公众号']
})
const sections = ['projects', 'about', 'journey', 'contact']
const socialUrls = ['https://oss.justin3go.com/weixin.jpg', 'https://x.com/Justin1024go', 'https://github.com/Justin3go', 'https://juejin.cn/user/220366354020749/posts', 'https://oss.justin3go.com/qrcode.jpg']

function readScroll() {
  frame = 0
  if (!page.value) return
  progress.value = Math.max(0, Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)))
  let current = sections[0]
  for (const id of sections) {
    const section = page.value.querySelector(`#${id}`)
    if (section && section.getBoundingClientRect().top < innerHeight * .45) current = id
  }
  active.value = current
}
function scroll() { if (!frame) frame = requestAnimationFrame(readScroll) }
function mediaChanged() { reduced.value = media?.matches ?? false }
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)')
  mediaChanged()
  media.addEventListener('change', mediaChanged)
  readScroll()
  addEventListener('scroll', scroll, { passive: true })
  addEventListener('resize', scroll)
  // Content is visible in SSR and without JS. Motion adds only a small entrance.
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      if (motion.value) entry.target.classList.add('has-arrived')
      revealObserver?.unobserve(entry.target)
    }
  }, { threshold: .08 })
  page.value?.querySelectorAll('[data-reveal], .profile-project-card, .profile-timeline li').forEach(el => revealObserver?.observe(el))
})
onUnmounted(() => {
  cancelAnimationFrame(frame)
  removeEventListener('scroll', scroll)
  removeEventListener('resize', scroll)
  media?.removeEventListener('change', mediaChanged)
  revealObserver?.disconnect()
})
</script>

<template>
  <main ref="page" class="profile-home" :class="{ 'motion-off': !motion, 'is-english': en }" id="profile-top">
    <section class="home-hero" aria-labelledby="hero-title">
      <span id="关于我" class="anchor-alias"></span><span id="about-me" class="anchor-alias"></span>
      <div class="hero-copy">
        <div class="identity"><img :src="withBase('/ava.png')" alt="" width="40" height="40"><div><p>{{ copy.hello }}</p><span>{{ copy.role }}</span></div></div>
        <h1 id="hero-title"><span>{{ copy.headline[0] }}</span><span class="hero-accent">{{ copy.headline[1] }}</span></h1>
        <p class="hero-intro">{{ copy.intro }}</p>
        <p class="hero-detail">{{ copy.detail }}</p>
        <div class="hero-links"><a class="primary-link" href="#projects">{{ copy.work }} <span aria-hidden="true">↘</span></a><a class="text-link" :href="withBase(en ? '/en/blog' : '/blog')">{{ copy.blog }} <span aria-hidden="true">↗</span></a></div>
      </div>
      <div class="hero-art"><FlowSculpture :motion="motion" /></div>
      <div class="hero-footnote"><span>CREATE. EXPLORE. REPEAT.</span><span>{{ copy.motto }}</span></div>
    </section>

    <nav class="section-nav" :aria-label="en ? 'On this page' : '页面章节'">
      <div class="section-links"><a v-for="(id, i) in sections" :key="id" :href="`#${id}`" :aria-current="active === id ? 'location' : undefined"><span class="nav-number">0{{ i + 1 }}</span>{{ copy.nav[i] }}</a></div>
      <button class="motion-toggle" :disabled="reduced" :aria-pressed="paused" @click="paused = !paused"><span aria-hidden="true">{{ motion ? 'Ⅱ' : '▷' }}</span>{{ reduced ? copy.static : paused ? copy.play : copy.pause }}</button>
      <span class="reading-progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true"></span>
    </nav>

    <section id="projects" class="home-section projects-section" aria-labelledby="projects-title">
      <header class="section-heading" data-reveal><div><p class="eyebrow">01 / SELECTED WORK</p><h2 id="projects-title">{{ copy.workTitle }}</h2></div><p class="section-description">{{ copy.workIntro }}</p></header>
      <ProfileProjects :locale="locale" :motion="motion" />
    </section>

    <section id="about" class="home-section about-section" aria-labelledby="about-title">
      <span id="生活之外" class="anchor-alias"></span><span id="beyond-work" class="anchor-alias"></span>
      <div class="about-intro" data-reveal><div><p class="eyebrow">02 / OFF THE SCREEN</p><h2 id="about-title">{{ copy.aboutTitle }}</h2></div><div class="about-copy"><p>{{ copy.about }}</p><p>{{ copy.aboutMore }}</p></div></div>
      <div class="life-grid">
        <article class="life-card camera-card" data-reveal><div class="life-illustration camera-illustration" aria-hidden="true"><svg viewBox="0 0 240 140" fill="none"><path d="M51 44h33l9-14h54l10 14h32a12 12 0 0 1 12 12v60H39V56a12 12 0 0 1 12-12Z"/><circle cx="121" cy="80" r="32"/><circle cx="121" cy="80" r="23"/><circle cx="121" cy="80" r="12"/><path d="M58 57h14M166 58h17M51 108h138"/><path class="focus-corner" d="M20 44V20h24M196 20h24v24M20 110v20h24M196 130h24v-20"/></svg></div><p class="eyebrow">{{ copy.photography }}</p><h3>{{ copy.photo }}</h3><p class="life-description">{{ copy.photoBody }}</p></article>
        <article class="life-card badminton-card" data-reveal><div class="life-illustration badminton-illustration" aria-hidden="true"><svg viewBox="0 0 240 140" fill="none"><g transform="rotate(24 120 70)"><path d="m84 30 24 69h24l24-69M96 29l18 70m6-71v71m24-70-18 70M83 30q37 15 74 0M96 66q24 12 48 0M108 99v8a12 12 0 0 0 24 0v-8Z"/><path d="M77 33q-5-9 5-10t12 6q0-15 12-11t14 10q5-17 16-10t9 12q12-13 17-3t-7 8"/></g><path class="shuttle-trail" d="M60 88q5 23 31 33M51 99q6 17 19 24"/></svg></div><p class="eyebrow">{{ copy.badminton }}</p><h3>{{ copy.sport }}</h3><p class="life-description">{{ copy.sportBody }}</p></article>
      </div>
    </section>

    <section id="journey" class="home-section journey-section" aria-labelledby="journey-title">
      <span id="经历" class="anchor-alias"></span><span id="experience" class="anchor-alias"></span>
      <header class="journey-heading" data-reveal><p class="eyebrow">03 / THE JOURNEY</p><h2 id="journey-title">{{ copy.journeyTitle }}</h2><p class="section-description">{{ copy.journeyIntro }}</p><span class="journey-mark" aria-hidden="true">↗</span></header>
      <div><ProfileTimeline :locale="locale" /><p class="future-note">{{ copy.future }}</p></div>
    </section>

    <section id="contact" class="home-section contact-section" aria-labelledby="contact-title" data-reveal>
      <span id="联系我" class="anchor-alias"></span><span id="contact-me" class="anchor-alias"></span>
      <p class="eyebrow">04 / SAY HELLO</p><h2 id="contact-title">{{ copy.contactTitle }}</h2><p class="contact-intro">{{ copy.contactIntro }}</p>
      <a class="email-link" href="mailto:just@justin3go.com">just@justin3go.com <span aria-hidden="true">↗</span></a>
      <div class="social-links"><a v-for="(url, i) in socialUrls" :key="url" :href="url" target="_blank" rel="noopener noreferrer">{{ copy.social[i] }} <span aria-hidden="true">↗</span></a></div>
    </section>

    <footer class="home-footer"><span>Justin3go <span class="footer-dot">·</span> {{ copy.motto }}</span><a href="#profile-top">{{ copy.top }} ↑</a></footer>
  </main>
</template>

<style scoped>
.profile-home { --home-accent: var(--vp-c-brand-1); width: min(1120px, calc(100% - 80px)); margin: 0 auto; color: var(--vp-c-text-1); }
.profile-home *, .profile-home *::before, .profile-home *::after { box-sizing: border-box; }
.profile-home a { color: inherit; text-decoration: none; }
.profile-home a:focus-visible, .profile-home button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 5px; }
.profile-home p, .profile-home h1, .profile-home h2, .profile-home h3 { margin: 0; }
.home-hero { position: relative; display: grid; grid-template-columns: 1.08fr 1fr; align-items: center; gap: 16px; min-height: 640px; padding: 60px 0 72px; }
.identity { display: flex; align-items: center; gap: 12px; margin-bottom: 38px; }
.identity img { border-radius: 50%; object-fit: cover; }
.identity p { font-size: 14px; font-weight: 550; }.identity span { display: block; margin-top: 2px; color: var(--vp-c-text-2); font-size: 11px; }
.hero-copy { position: relative; z-index: 1; }
.hero-copy h1 { font-size: clamp(48px, 5.7vw, 74px); font-weight: 600; line-height: 1.2; letter-spacing: -.055em; }
.hero-copy h1 > span { display: block; }.hero-accent { color: var(--home-accent); }
.hero-copy .hero-intro { margin-top: 27px; font-size: 17px; font-weight: 550; letter-spacing: -.02em; }
.hero-copy .hero-detail { margin-top: 12px; max-width: 375px; font-size: 14px; line-height: 1.9; color: var(--vp-c-text-2); }
.hero-links { display: flex; gap: 25px; align-items: center; margin-top: 28px; font-size: 13px; }
.hero-links .primary-link { display: inline-flex; align-items: center; gap: 25px; padding: 12px 18px; border-radius: 7px; background: var(--home-accent); color: var(--vp-c-bg); transition: background .2s, transform .2s; }
.primary-link:hover { background: var(--vp-c-brand-2); transform: translateY(-2px); }.text-link:hover { color: var(--home-accent); }
.text-link span { display: inline-block; margin-left: 6px; }
.hero-art { width: 100%; max-width: 540px; justify-self: end; }
.hero-footnote { position: absolute; left: 0; right: 0; bottom: 23px; display: flex; justify-content: space-between; font-size: 10px; color: var(--vp-c-text-2); }
.hero-footnote span:first-child { font-family: var(--vp-font-family-mono); letter-spacing: .08em; }
.section-nav { position: sticky; top: var(--vp-nav-height); z-index: 20; display: flex; justify-content: space-between; align-items: center; min-height: 60px; border-block: 1px solid var(--vp-c-divider); background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent); backdrop-filter: blur(18px); }
.section-links { display: flex; align-items: center; gap: 36px; }.section-links a { display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--vp-c-text-2); padding: 19px 0; }.section-links a[aria-current], .section-links a:hover { color: var(--home-accent); }
.nav-number { font: 9px var(--vp-font-family-mono); opacity: .65; }.motion-toggle { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--vp-c-text-2); padding: 10px 0 10px 10px; }.motion-toggle:disabled { opacity: .65; cursor: default; }.motion-toggle span { font-size: 12px; }
.reading-progress { height: 1px; background: var(--home-accent); position: absolute; bottom: -1px; left: 0; right: 0; transform-origin: left; }
.home-section { position: relative; padding: 82px 0; scroll-margin-top: 145px; }.home-section + .home-section { border-top: 1px solid var(--vp-c-divider); }
.profile-home .eyebrow { margin-bottom: 15px; color: var(--vp-c-text-2); font: 10px var(--vp-font-family-mono); letter-spacing: .08em; }
.profile-home h2 { font-size: clamp(25px, 2.6vw, 33px); letter-spacing: -.035em; line-height: 1.4; font-weight: 550; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 42px; margin-bottom: 32px; }.section-description { max-width: 340px; font-size: 13px; line-height: 1.85; color: var(--vp-c-text-2); }
.about-intro { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: start; margin-bottom: 35px; }.about-copy { font-size: 14px; color: var(--vp-c-text-2); line-height: 1.9; }.about-copy p + p { margin-top: 12px; }
.life-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }.life-card { position: relative; min-height: 260px; overflow: hidden; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); border-radius: 12px; padding: 32px; }.life-card .eyebrow { margin-top: 140px; }.life-card h3 { font-size: 20px; letter-spacing: -.025em; font-weight: 550; }.life-description { max-width: 330px; margin-top: 10px !important; font-size: 13px; line-height: 1.85; color: var(--vp-c-text-2); }
.life-illustration { position: absolute; width: 240px; height: 140px; top: 17px; right: 25px; color: var(--home-accent); }.life-illustration svg { width: 100%; height: 100%; stroke: currentColor; stroke-width: 1.15; }.focus-corner, .shuttle-trail { opacity: .35; }.life-card:hover .camera-illustration svg { transform: rotate(-4deg) translateY(-3px); }.life-card:hover .badminton-illustration svg { transform: rotate(8deg) translate(5px, -6px); }.life-illustration svg { transition: transform .5s cubic-bezier(.2,.7,.2,1); }
.journey-section { display: grid; grid-template-columns: .8fr 1.2fr; gap: 80px; }.journey-heading { position: sticky; top: 160px; align-self: start; }.journey-heading .section-description { margin-top: 15px; max-width: 245px; }.journey-mark { display: block; font-size: 72px; line-height: 1; color: var(--vp-c-divider); margin-top: 32px; }.future-note { font-size: 11px; line-height: 1.8; color: var(--vp-c-text-2); margin-top: 25px !important; }
.contact-section { padding: 84px 0 76px; }.contact-section h2 { font-size: clamp(32px, 4vw, 48px); }.contact-intro { max-width: 475px; font-size: 14px; line-height: 1.9; color: var(--vp-c-text-2); margin-top: 16px !important; }.email-link { display: inline-flex; align-items: center; gap: 40px; font-size: clamp(22px, 4.4vw, 54px); letter-spacing: -.05em; margin-top: 28px; border-bottom: 1px solid var(--vp-c-divider); padding-bottom: 12px; transition: color .2s, border-color .2s; }.email-link:hover { color: var(--home-accent); border-color: var(--home-accent); }.email-link span { font-size: .8em; }
.social-links { display: flex; flex-wrap: wrap; gap: 26px; margin-top: 30px; font-size: 12px; color: var(--vp-c-text-2); }.social-links a:hover { color: var(--home-accent); }.social-links span { margin-left: 6px; opacity: .6; }
.home-footer { display: flex; justify-content: space-between; gap: 20px; border-top: 1px solid var(--vp-c-divider); padding: 24px 0 32px; font-size: 10px; color: var(--vp-c-text-2); }.home-footer a:hover { color: var(--home-accent); }.footer-dot { padding: 0 7px; }.anchor-alias { position: absolute; top: 0; scroll-margin-top: 145px; }
.profile-home :deep(.has-arrived) { animation: home-arrive .7s cubic-bezier(.2,.7,.2,1) both; }@keyframes home-arrive { from { opacity: .35; translate: 0 20px; } to { opacity: 1; translate: 0 0; } }
.motion-off :deep(*), .motion-off :deep(*::before), .motion-off :deep(*::after) { animation: none !important; transition: none !important; }.motion-off .life-illustration svg, .motion-off .primary-link:hover { transform: none; }
.is-english .hero-copy h1 { font-size: clamp(45px, 5.25vw, 68px); }
@media (max-width: 959px) { .profile-home { width: calc(100% - 64px); }.home-hero { min-height: 590px; grid-template-columns: 1.12fr 1fr; gap: 0; padding-top: 48px; }.hero-copy h1 { font-size: 52px; }.is-english .hero-copy h1 { font-size: 46px; }.hero-art { width: 115%; margin-right: -5%; }.hero-copy .hero-intro { font-size: 15px; }.hero-copy .hero-detail { font-size: 13px; }.section-heading { gap: 32px; }.section-description { max-width: 290px; }.about-intro { gap: 36px; }.journey-section { gap: 36px; grid-template-columns: .8fr 1.2fr; }.life-card { padding: 26px; } }
@media (max-width: 640px) { .profile-home { width: calc(100% - 40px); }.home-hero { display: flex; flex-direction: column; align-items: stretch; padding: 34px 0 46px; gap: 0; }.identity { margin-bottom: 28px; }.hero-copy h1 { font-size: clamp(48px, 12.5vw, 68px); }.is-english .hero-copy h1 { font-size: clamp(44px, 11.5vw, 62px); }.hero-copy .hero-intro { margin-top: 22px; }.hero-copy .hero-detail { max-width: 340px; }.hero-links { margin-top: 22px; }.hero-art { width: 83%; max-width: 330px; margin: -6px auto -7px; }.hero-footnote { bottom: 16px; font-size: 8px; }.hero-footnote span:first-child { letter-spacing: 0; }.section-nav { min-height: 53px; }.section-links { gap: 22px; }.section-links a { font-size: 11px; padding: 17px 0; }.nav-number { display: none; }.motion-toggle { font-size: 10px; gap: 5px; }.home-section { padding: 52px 0; scroll-margin-top: 132px; }.section-heading, .about-intro { display: block; margin-bottom: 24px; }.section-heading .section-description, .about-copy { margin-top: 17px; max-width: 100%; }.profile-home h2 { font-size: 25px; }.profile-home .eyebrow { font-size: 9px; margin-bottom: 12px; }.life-grid { gap: 14px; grid-template-columns: 1fr; }.life-card { padding: 24px; min-height: 248px; }.life-card .eyebrow { margin-top: 110px; }.life-illustration { width: 200px; height: 115px; right: 20px; top: 12px; }.journey-section { display: block; }.journey-heading { position: static; margin-bottom: 30px; }.journey-heading .section-description { max-width: none; }.journey-mark { display: none; }.contact-section h2 { font-size: 32px; }.email-link { gap: 18px; font-size: clamp(21px, 6.7vw, 35px); }.social-links { column-gap: 22px; row-gap: 17px; }.home-footer { font-size: 9px; }.footer-dot { padding: 0 3px; } }
@media (max-width: 380px) { .section-links { gap: 12px; flex-shrink: 0; }.motion-toggle { font-size: 9px; white-space: nowrap; }.hero-footnote { gap: 14px; }.hero-footnote span:last-child { text-align: right; } }
@media (prefers-reduced-motion: reduce) { .profile-home :deep(*), .profile-home :deep(*::before), .profile-home :deep(*::after) { animation: none !important; transition: none !important; }.life-illustration svg, .primary-link:hover { transform: none !important; } }
</style>

<style>
/* Keep the shared navigation legible above this page's moving artwork. */
.portfolio-page .VPNavBar { background-color: color-mix(in srgb, var(--vp-c-bg) 96%, transparent) !important; backdrop-filter: blur(16px); }
.portfolio-page .VPLocalNav { display: none; }
@media (max-width: 959px) { .portfolio-page .VPNav { position: sticky; top: 0; } }
</style>
