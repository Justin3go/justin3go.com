<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import PaperJourney from './PaperJourney.vue'
import ProfileProjects from './ProfileProjects.vue'
import ProfileTimeline from './ProfileTimeline.vue'
import ContactImageDialog from './ContactImageDialog.vue'

const props = withDefaults(defineProps<{ locale?: 'zh' | 'en' }>(), { locale: 'zh' })
const en = computed(() => props.locale === 'en')
const page = ref<HTMLElement>()
const reduced = ref(false)
const motion = computed(() => !reduced.value)
const active = ref('projects')
let media: MediaQueryList | undefined
let revealObserver: IntersectionObserver | undefined
let frame = 0
let hashFrame = 0

const copy = computed(() => en.value ? {
  hello: 'Hi, I’m Justin3go.', role: 'Independent maker · Beijing, China',
  headline: ['Little pieces of', 'work & life.'],
  intro: 'Write code. Collect moments.',
  detail: 'Independent projects, photography, and badminton. Turning curiosity into things I make, and ordinary days into moments I keep.',
  work: 'Explore my work', blog: 'Read the blog',
  nav: ['Work', 'About', 'Journey', 'Contact'],
  workTitle: 'Made to be used.', workIntro: 'Small ideas, real products. A selection of the tools and experiments I keep building.',
  aboutTitle: 'More than a screen.',
  about: 'My background is in software engineering. What keeps me going is turning a real problem into something useful, then making it a little better.',
  aboutMore: 'I enjoy open source and sharing what I learn. Finish something, learn from it, and keep going.',
  photo: 'Seeing the everyday', photoBody: 'Landscapes, street corners, and the light on an ordinary day. Usually with a Sony A7C II.',
  sport: 'Time away from the desk', sportBody: 'At least three hours of badminton a week. A different kind of focus, and a good reason to close the laptop.',
  journeyTitle: 'Still on the way.', journeyIntro: 'From learning to build, to building things that matter to me.',
  future: '2101: hopefully still here. 3001: still figuring things out.',
  contactTitle: 'Let’s make a connection.', contactIntro: 'An idea, a question, or a simple hello — my inbox is open. A little context is always welcome.',
  motto: 'Execution wins. Persistence compounds.', journal: 'Read blog',
  photography: 'PHOTOGRAPHY', badminton: 'BADMINTON', top: 'Back to top', social: ['WeChat', 'X / Twitter', 'GitHub', 'Juejin', 'WeChat articles']
} : {
  hello: 'Hi，我是 Justin3go。', role: '独立产品创造者 · 中国北京',
  headline: ['把想法，', '拼成日常。'],
  intro: '写代码，也收集生活的碎片。',
  detail: '独立开发、摄影、羽毛球。把好奇心做成作品，把普通的一天认真收藏。',
  work: '看看我的作品', blog: '阅读博客',
  nav: ['作品', '关于', '经历', '联系'],
  workTitle: '做些真正用得上的东西。', workIntro: '从一个小念头开始，做成可以打开、可以使用的产品。这里是我的一些实践。',
  aboutTitle: '屏幕之外，也有热爱。',
  about: '我的职业背景是软件工程。比起罗列使用过的框架，我更在意有没有解决真实问题，把产品做出来，再一点点打磨好。',
  aboutMore: '喜欢开源、分享，也习惯公开记录。先完成，再学习，然后继续创造。',
  photo: '留住普通的一天', photoBody: '风光、街角、生活里的光线。拿着 Sony A7C II，把走过的日常多看一眼。',
  sport: '给生活换个节奏', sportBody: '每周至少 3 小时羽毛球。离开屏幕，专心接好下一拍，也希望球价能早日降下来。',
  journeyTitle: '一路走来，继续向前。', journeyIntro: '从学习如何写代码，到慢慢找到自己想创造的东西。',
  future: '2101，希望我还活着；3001，千年修为，我还在修炼。',
  contactTitle: '聊聊你的想法。', contactIntro: '关于产品、技术，或者打个招呼。如果你从博客而来，记得简单介绍一下来意。',
  motto: '赢在执行力，贵在坚持。', journal: '阅读博客',
  photography: 'PHOTOGRAPHY / 摄影', badminton: 'BADMINTON / 羽毛球', top: '回到顶部', social: ['微信', 'X / 推特', 'GitHub', '掘金', '公众号']
})
const sections = ['projects', 'about', 'journey', 'contact']
const socialUrls = ['https://oss.justin3go.com/weixin.jpg', 'https://x.com/Justin1024go', 'https://github.com/Justin3go', 'https://juejin.cn/user/220366354020749/posts', 'https://oss.justin3go.com/wxgzh.jpg']

function readScroll() {
  frame = 0
  if (!page.value) return
  let current = sections[0]
  for (const id of sections) {
    const section = page.value.querySelector(`#${id}`)
    if (section && section.getBoundingClientRect().top < innerHeight * .45) current = id
  }
  active.value = current
}
function scroll() { if (!frame) frame = requestAnimationFrame(readScroll) }
function jumpTo(event: MouseEvent, id: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  const target = id === 'profile-top' ? page.value : page.value?.querySelector<HTMLElement>(`#${id}`)
  if (!target) return
  target.scrollIntoView({ behavior: motion.value ? 'smooth' : 'instant', block: 'start' })
  history.replaceState(history.state, '', `#${id}`)
}
function alignHash() {
  cancelAnimationFrame(hashFrame)
  // VitePress uses its blog offset in a capture-phase handler and schedules
  // hash scrolling for the next frame. Align this page's deeper sticky stack
  // after that initial pass, including direct links and browser Back/Forward.
  hashFrame = requestAnimationFrame(() => {
    hashFrame = requestAnimationFrame(() => {
      let id = ''
      try { id = decodeURIComponent(location.hash.slice(1)) } catch { return }
      const target = document.getElementById(id)
      if (target && page.value?.contains(target)) target.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
  })
}
function mediaChanged() { reduced.value = media?.matches ?? false }
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)')
  mediaChanged()
  media.addEventListener('change', mediaChanged)
  readScroll()
  addEventListener('scroll', scroll, { passive: true })
  addEventListener('resize', scroll)
  addEventListener('hashchange', alignHash)
  addEventListener('popstate', alignHash)
  alignHash()
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
  cancelAnimationFrame(hashFrame)
  removeEventListener('scroll', scroll)
  removeEventListener('resize', scroll)
  removeEventListener('hashchange', alignHash)
  removeEventListener('popstate', alignHash)
  media?.removeEventListener('change', mediaChanged)
  revealObserver?.disconnect()
})
</script>


<template>
  <main ref="page" class="profile-home" :class="{ 'motion-off': !motion, 'is-english': en }" id="profile-top">
    <section class="home-hero" data-paper-section="intro" aria-labelledby="hero-title">
      <span id="关于我" class="anchor-alias"></span><span id="about-me" class="anchor-alias"></span>
      <div class="hero-copy">
        <div class="identity"><img :src="withBase('/ava.png')" alt="" width="42" height="42"><div><p>{{ copy.hello }}</p><span>{{ copy.role }}</span></div></div>
        <p class="hero-kicker">{{ en ? 'A SMALL COLLECTION OF WORK & LIFE' : '一些创造，一些生活，一直保持好奇。' }}</p>
        <h1 id="hero-title"><span class="title-paper">{{ copy.headline[0] }}</span><span class="title-paper hero-accent">{{ copy.headline[1] }}</span></h1>
        <p class="hero-intro">{{ copy.intro }}</p>
        <p class="hero-detail">{{ copy.detail }}</p>
        <div class="hero-links"><a class="primary-link vp-raw" href="#projects" @click="jumpTo($event, 'projects')">{{ copy.work }} <span aria-hidden="true">↘</span></a><a class="text-link" :href="withBase(en ? '/en/blog' : '/blog')">{{ copy.blog }} <span aria-hidden="true">↗</span></a></div>
        <span class="hero-pencil" aria-hidden="true"><svg viewBox="0 0 220 45"><path d="M5 28C54 7 113 38 199 10m-19-2 20 2-13 18"/></svg></span>
      </div>
      <div class="hero-art scene-anchor" data-paper-anchor aria-hidden="true">
        <div class="hero-paper-field"></div>
        <div class="hero-stamp"><span>JUSTIN3GO</span><span>WORK / LIFE / NOTES</span></div>
        <span class="hero-tape"></span>
        <span class="hero-scribble">hello, world.</span>
      </div>
      <div class="hero-footnote"><span>CREATE. EXPLORE. REPEAT.</span><span>{{ copy.motto }}</span></div>
    </section>

    <nav class="section-nav" :aria-label="en ? 'On this page' : '页面章节'">
      <span class="chapter-caption" aria-hidden="true"><span class="chapter-cut">▰</span>{{ en ? 'SCENE SELECT' : '故事分镜' }}</span>
      <div class="section-links vp-raw"><a v-for="(id, i) in sections" :key="id" :href="`#${id}`" :aria-current="active === id ? 'location' : undefined" @click="jumpTo($event, id)"><span class="nav-number">0{{ i + 1 }}</span>{{ copy.nav[i] }}</a></div>
      <a class="journal-link" :href="withBase(en ? '/en/blog' : '/blog')">{{ copy.journal }} <span aria-hidden="true">↗</span></a>
    </nav>

    <section id="projects" class="home-section story-spread art-left projects-section" data-paper-section="code" aria-labelledby="projects-title">
      <div class="scene-visual" aria-hidden="true"><div class="scene-anchor" data-paper-anchor><PaperJourney inline-scene="code" :motion="motion" :locale="locale" /></div></div>
      <div class="spread-copy">
        <header class="section-heading" data-reveal><p class="eyebrow">01 / SELECTED WORK</p><h2 id="projects-title">{{ copy.workTitle }}</h2><p class="section-description">{{ copy.workIntro }}</p></header>
        <ProfileProjects :locale="locale" :motion="motion" />
      </div>
    </section>

    <section id="about" class="home-section story-spread art-right about-section" data-paper-section="photo" aria-labelledby="about-title">
      <span id="生活之外" class="anchor-alias"></span><span id="beyond-work" class="anchor-alias"></span>
      <div class="scene-visual" aria-hidden="true"><div class="scene-anchor" data-paper-anchor><PaperJourney inline-scene="photo" :motion="motion" :locale="locale" /></div></div>
      <div class="spread-copy">
        <header class="section-heading" data-reveal><p class="eyebrow">02 / OFF THE SCREEN</p><h2 id="about-title">{{ copy.aboutTitle }}</h2><p class="section-description">{{ copy.about }}</p></header>
        <article class="life-card camera-card" data-reveal>
          <div class="landscape-print" aria-hidden="true">
            <svg viewBox="0 0 440 180" fill="none"><path class="sky" d="M0 0h440v180H0z"/><circle cx="327" cy="52" r="23"/><path class="mountain-back" d="m0 143 103-82 86 73 78-87 173 132H0Z"/><path class="mountain-front" d="m0 168 155-74 96 69 72-46 117 62H0Z"/><path class="landscape-line" d="M26 157c118-3 184 2 274 7s87-8 113-11"/></svg>
            <span>EVERYDAY, THROUGH MY LENS.</span>
          </div>
          <p class="eyebrow">{{ copy.photography }}</p><h3>{{ copy.photo }}</h3><p class="life-description">{{ copy.photoBody }}</p>
        </article>
        <p class="margin-note">{{ copy.aboutMore }}</p>
      </div>
    </section>

    <section id="play" class="home-section story-spread art-left play-section" data-paper-section="badminton" aria-labelledby="play-title">
      <div class="scene-visual" aria-hidden="true"><div class="scene-anchor" data-paper-anchor><PaperJourney inline-scene="badminton" :motion="motion" :locale="locale" /></div></div>
      <div class="spread-copy badminton-card">
        <p class="eyebrow">02 / A DIFFERENT RHYTHM</p>
        <h2 id="play-title">{{ copy.sport }}</h2>
        <p class="section-description">{{ copy.sportBody }}</p>
        <div class="court-note">
          <span class="note-pin" aria-hidden="true"></span>
          <svg class="court-sketch" viewBox="0 0 340 140" fill="none" aria-hidden="true"><path d="M37 12h266v115H37zM52 12v115M288 12v115M37 35h266M37 103h266M37 70h266M170 12v115"/><path class="court-flight" d="M59 95c20-100 168-95 232-39m-14-4 17 6-14 8"/></svg>
          <p>{{ en ? 'Close the laptop. Play the next shot.' : '合上电脑，接好下一拍。' }}</p>
          <span>{{ en ? 'A little focus. A lot of joy.' : '专心一点，也尽兴一点。' }}</span>
        </div>
      </div>
    </section>

    <section id="journey" class="home-section story-spread art-right journey-section" data-paper-section="walk" aria-labelledby="journey-title">
      <span id="经历" class="anchor-alias"></span><span id="experience" class="anchor-alias"></span>
      <div class="scene-visual" aria-hidden="true"><div class="scene-anchor" data-paper-anchor><PaperJourney inline-scene="walk" :motion="motion" :locale="locale" /></div></div>
      <div class="spread-copy">
        <header class="section-heading" data-reveal><p class="eyebrow">03 / THE JOURNEY</p><h2 id="journey-title">{{ copy.journeyTitle }}</h2><p class="section-description">{{ copy.journeyIntro }}</p></header>
        <ProfileTimeline :locale="locale" /><p class="future-note">{{ copy.future }}</p>
      </div>
    </section>

    <section id="contact" class="home-section story-spread art-left contact-section" data-paper-section="chat" aria-labelledby="contact-title">
      <span id="联系我" class="anchor-alias"></span><span id="contact-me" class="anchor-alias"></span>
      <div class="scene-visual" aria-hidden="true"><div class="scene-anchor" data-paper-anchor><PaperJourney inline-scene="chat" :motion="motion" :locale="locale" /></div></div>
      <div class="spread-copy contact-letter">
        <span class="letter-corner" aria-hidden="true">↗</span>
        <p class="eyebrow">04 / SAY HELLO</p><h2 id="contact-title">{{ copy.contactTitle }}</h2><p class="contact-intro">{{ copy.contactIntro }}</p>
        <a class="email-link" href="mailto:just@justin3go.com">just@justin3go.com <span aria-hidden="true">↗</span></a>
        <div class="social-links"><template v-for="(url, i) in socialUrls" :key="url"><ContactImageDialog v-if="i === 0 || i === 4" :src="url" :label="copy.social[i]" :en="en" /><a v-else :href="url" target="_blank" rel="noopener noreferrer">{{ copy.social[i] }} <span aria-hidden="true">↗</span></a></template></div>
        <p class="letter-signature">See you around,<br><span>Justin3go</span></p>
      </div>
    </section>

    <footer class="home-footer"><span>Justin3go <span class="footer-dot">·</span> {{ copy.motto }}</span><a class="vp-raw" href="#profile-top" @click="jumpTo($event, 'profile-top')">{{ copy.top }} ↑</a></footer>
    <PaperJourney :motion="motion" :locale="locale" />
  </main>
</template>

<style scoped>
.profile-home {
  --home-accent: var(--vp-c-brand-1);
  --paper-sheet: color-mix(in srgb, var(--vp-c-bg) 94%, var(--vp-c-brand-1) 6%);
  --paper-ink: var(--vp-c-text-1);
  --paper-button-edge: polygon(0 7%,8% 1%,19% 5%,32% 0,46% 4%,62% 1%,77% 5%,91% 0,100% 5%,98% 31%,100% 55%,98% 77%,100% 95%,87% 100%,72% 96%,57% 100%,43% 95%,29% 100%,15% 96%,1% 100%,2% 74%,0 50%,2% 27%);
  --scene-size: min(560px, calc((100vw - 176px) / 2));
  --chapter-padding: 230px;
  --chapter-scroll-offset: calc(max(144px, calc(50vh - var(--scene-size) / 2 + 15px)) - var(--chapter-padding));
  width: min(calc(var(--vp-layout-max-width) - 64px), calc(100% - 64px)); margin: 0 auto; color: var(--paper-ink); scroll-margin-top: var(--vp-nav-height);
}
.profile-home *, .profile-home *::before, .profile-home *::after { box-sizing: border-box; }
.profile-home a { color: inherit; text-decoration: none; }
.profile-home a:focus-visible, .profile-home button:focus-visible { outline: 2px solid var(--home-accent); outline-offset: 5px; }
.profile-home p, .profile-home h1, .profile-home h2, .profile-home h3 { margin: 0; }
.home-hero { position: relative; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 80px; min-height: 770px; padding: 64px 0 124px; }
.hero-copy { position: relative; z-index: 1; padding-left: 14px; }
.identity { display: flex; align-items: center; gap: 13px; margin-bottom: 40px; }
.identity img { border-radius: 50%; object-fit: cover; }
.identity p { font-size: 14px; font-weight: 550; }.identity span { display: block; margin-top: 3px; color: var(--vp-c-text-2); font-size: 11px; }
.hero-kicker { color: var(--vp-c-text-2); font: 11px var(--vp-font-family-mono); letter-spacing: .05em; margin-bottom: 20px !important; }
.hero-copy h1 { font-size: clamp(48px, 5.7vw, 86px); line-height: 1.22; font-weight: 600; letter-spacing: -.065em; }
.title-paper { display: table; position: relative; padding: 1px 13px 8px; margin-left: -13px; transform: rotate(-1.3deg); background: var(--vp-c-bg-soft); clip-path: polygon(0 3%,16% 0,31% 2%,47% 0,67% 3%,85% 0,100% 2%,99% 97%,78% 100%,59% 97%,42% 100%,22% 97%,0 99%); }
.hero-accent { color: var(--home-accent); background: color-mix(in srgb, var(--home-accent) 11%, var(--vp-c-bg)); transform: rotate(1deg); margin-top: 5px; }
.hero-copy .hero-intro { margin-top: 30px; font-size: 18px; font-weight: 550; letter-spacing: -.02em; }
.hero-copy .hero-detail { margin-top: 13px; max-width: 420px; font-size: 14px; line-height: 1.95; color: var(--vp-c-text-2); }
.hero-links { display: flex; gap: 28px; align-items: center; margin-top: 28px; font-size: 13px; }
.hero-links a { position: relative; isolation: isolate; display: inline-flex; align-items: center; white-space: nowrap; transition: transform .2s ease; }
.hero-links a::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; clip-path: var(--paper-button-edge); background: var(--button-paper); transition: background-color .2s ease; }
.primary-link { --button-paper: var(--home-accent); gap: 27px; padding: 14px 22px; color: var(--vp-c-bg) !important; transform: rotate(-1.2deg); filter: drop-shadow(1px 3px 0 color-mix(in srgb, var(--home-accent) 18%, transparent)); }
.primary-link:hover { --button-paper: var(--vp-c-brand-2); transform: translateY(-2px) rotate(0); }
.text-link { --button-paper: color-mix(in srgb, var(--home-accent) 7%, var(--vp-c-bg-soft)); padding: 13px 18px; transform: rotate(1.2deg); filter: drop-shadow(1px 3px 0 color-mix(in srgb, var(--vp-c-divider) 50%, transparent)); }
.text-link:hover { color: var(--home-accent); transform: translateY(-2px) rotate(0); }
.hero-links a:active { transform: translateY(1px) rotate(0); }
.text-link span { margin-left: 6px; }
.hero-pencil { display: block; width: 185px; height: 40px; margin: 21px 0 -45px 145px; color: var(--home-accent); opacity: .55; }
.hero-pencil svg { width: 100%; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; }
.hero-art { position: relative; justify-self: center; isolation: isolate; }
.scene-anchor { width: var(--scene-size); aspect-ratio: 1; margin-inline: auto; }
.hero-paper-field { position: absolute; inset: 9% 10% 9% 10%; transform: rotate(7deg); background: repeating-linear-gradient(0deg, transparent 0 29px, color-mix(in srgb, var(--home-accent) 7%, transparent) 29px 30px), var(--paper-sheet); clip-path: polygon(1% 0,13% 2%,25% 0,39% 1%,52% 0,66% 2%,78% 0,91% 2%,100% 0,98% 24%,100% 45%,98% 62%,100% 78%,99% 100%,85% 98%,74% 100%,60% 99%,47% 100%,34% 98%,20% 100%,0 99%,2% 80%,0 64%,2% 42%,0 24%); }
.hero-tape { position: absolute; top: 8%; left: 40%; width: 25%; height: 31px; background: color-mix(in srgb, var(--home-accent) 14%, var(--vp-c-bg)); opacity: .65; transform: rotate(-9deg); clip-path: polygon(2% 0,100% 3%,97% 22%,100% 40%,97% 60%,100% 80%,98% 100%,0 97%,3% 80%,0 60%,3% 40%,0 20%); }
.hero-stamp { position: absolute; right: 0; top: 5%; display: grid; gap: 5px; padding: 12px; border: 1px solid var(--home-accent); color: var(--home-accent); transform: rotate(10deg); opacity: .6; font: 9px var(--vp-font-family-mono); }
.hero-stamp span:first-child { letter-spacing: .2em; }.hero-stamp span:last-child { font-size: 7px; }
.hero-scribble { position: absolute; left: 0; bottom: 4%; color: var(--home-accent); font: italic 20px Georgia, serif; transform: rotate(-7deg); }
.hero-footnote { position: absolute; left: 0; right: 0; bottom: 27px; display: flex; justify-content: space-between; font-size: 10px; color: var(--vp-c-text-2); }.hero-footnote span:first-child { font-family: var(--vp-font-family-mono); letter-spacing: .1em; }
.section-nav { position: sticky; top: var(--vp-nav-height); z-index: 20; display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: center; min-height: 64px; padding-block: 8px; isolation: isolate; }
/* Extend the opaque navigation paper without widening its content or scroll area. */
.section-nav::before { content: ''; position: absolute; inset: 0; z-index: -1; background: var(--vp-c-bg); box-shadow: 0 0 0 100vmax var(--vp-c-bg); clip-path: inset(0 -100vmax); pointer-events: none; }
.chapter-caption { display: flex; align-items: center; gap: 10px; color: var(--vp-c-text-3); font: 10px var(--vp-font-family-mono); letter-spacing: .12em; }
.chapter-cut { width: 19px; height: 14px; font-size: 0; border: 1px solid currentColor; position: relative; transform: rotate(-7deg); }
.chapter-cut::before { content: ''; position: absolute; left: -1px; right: -1px; top: -5px; height: 4px; border: 1px solid currentColor; background: repeating-linear-gradient(115deg, currentColor 0 3px, transparent 3px 7px); transform: rotate(-10deg); transform-origin: left bottom; }
.section-links { display: flex; align-items: center; gap: 12px; }
.section-links a { display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--vp-c-text-2); padding: 8px 13px; white-space: nowrap; border-radius: 2px; transition: color .2s, background-color .2s; }
.section-links a[aria-current] { color: var(--home-accent); background: color-mix(in srgb, var(--home-accent) 9%, var(--vp-c-bg)); clip-path: polygon(0 3%,22% 0,45% 3%,69% 0,100% 3%,99% 97%,77% 100%,52% 97%,28% 100%,0 97%); }
.section-links a:focus-visible { clip-path: none; }
.section-links a:hover { color: var(--home-accent); background-color: var(--vp-c-bg-soft); }
.nav-number { display: grid; place-items: center; width: 25px; height: 27px; border-inline: 1px solid currentColor; background: repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 6px) left top / 100% 2px repeat-x, repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 6px) left bottom / 100% 2px repeat-x; font: 9px var(--vp-font-family-mono); opacity: .65; }
.journal-link { justify-self: end; display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--vp-c-text-2); padding: 10px 0 10px 10px; white-space: nowrap; }.journal-link:hover { color: var(--home-accent); }.journal-link span { font-size: 12px; }
.home-section { position: relative; padding: var(--chapter-padding) 0; scroll-margin-top: var(--chapter-scroll-offset); }
.home-section + .home-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: var(--vp-c-divider); transform: rotate(-.4deg); opacity: .7; }
.story-spread { display: grid; grid-template-columns: minmax(0, var(--scene-size)) minmax(0, 1fr); gap: 32px; min-height: 880px; align-items: start; }
.scene-visual { position: sticky; top: max(144px, calc(50vh - var(--scene-size) / 2 + 15px)); align-self: start; height: calc(var(--scene-size) + 76px); }
.art-left .scene-visual { grid-column: 1; grid-row: 1; }.art-left .spread-copy { grid-column: 2; grid-row: 1; }
.art-right { grid-template-columns: minmax(0, 1fr) minmax(0, var(--scene-size)); }
.art-right .scene-visual { grid-column: 2; grid-row: 1; }.art-right .spread-copy { grid-column: 1; grid-row: 1; }
.spread-copy { min-width: 0; position: relative; }
.profile-home .eyebrow { margin-bottom: 18px; color: var(--home-accent); font: 10px var(--vp-font-family-mono); letter-spacing: .09em; }
.profile-home h2 { font-size: clamp(28px, 3vw, 43px); letter-spacing: -.04em; line-height: 1.4; font-weight: 550; }
.section-heading { margin-bottom: 35px; }.section-description { max-width: 520px; font-size: 15px; line-height: 1.95; color: var(--vp-c-text-2); margin-top: 21px !important; }
.life-card { position: relative; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); padding: 18px 22px 27px; transform: rotate(-1.2deg); box-shadow: 2px 6px 0 color-mix(in srgb, var(--vp-c-divider) 28%, transparent); }
.landscape-print { position: relative; margin-bottom: 25px; padding-bottom: 11px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); }
.landscape-print svg { display: block; width: 100%; }.landscape-print .sky { fill: color-mix(in srgb, var(--home-accent) 5%, var(--vp-c-bg)); }.landscape-print circle { fill: color-mix(in srgb, var(--home-accent) 32%, var(--vp-c-bg)); }.mountain-back { fill: color-mix(in srgb, var(--home-accent) 12%, var(--vp-c-bg)); }.mountain-front { fill: color-mix(in srgb, var(--home-accent) 22%, var(--vp-c-bg)); }.landscape-line { stroke: var(--vp-c-bg); opacity: .7; }
.landscape-print > span { display: block; padding: 10px 12px 0; color: var(--vp-c-text-3); font: 8px var(--vp-font-family-mono); letter-spacing: .08em; }
.life-card .eyebrow { margin-bottom: 9px; }.life-card h3 { font-size: 25px; line-height: 1.5; font-weight: 550; letter-spacing: -.03em; }.life-description { margin-top: 12px !important; font-size: 14px; line-height: 1.9; color: var(--vp-c-text-2); }
.margin-note { margin: 32px 14px 0 !important; font-size: 13px; line-height: 1.9; color: var(--vp-c-text-2); }
.play-section .spread-copy { padding-top: 42px; }
.court-note { position: relative; margin-top: 42px; padding: 30px 30px 25px; background: var(--paper-sheet); transform: rotate(1.5deg); clip-path: polygon(0 1%,20% 0,37% 1%,58% 0,79% 2%,100% 0,99% 100%,80% 98%,59% 100%,39% 98%,18% 100%,0 99%); }
.court-sketch { width: 100%; max-height: 180px; stroke: var(--home-accent); stroke-width: 1; opacity: .5; }.court-flight { stroke-width: 2; stroke-dasharray: 6 6; }
.court-note p { font-size: 16px; margin-top: 15px; line-height: 1.6; }.court-note > span:last-child { font-size: 12px; color: var(--vp-c-text-2); line-height: 2; }.note-pin { position: absolute; width: 60px; height: 20px; background: color-mix(in srgb, var(--home-accent) 15%, var(--vp-c-bg)); top: 0; left: 38%; transform: rotate(-8deg); }
.future-note { font-size: 12px; line-height: 1.9; color: var(--vp-c-text-2); margin-top: 32px !important; }
.contact-section { min-height: 900px; }
.contact-letter { padding: 45px 34px 32px; background: var(--paper-sheet); border: 1px solid var(--vp-c-divider); box-shadow: 5px 6px 0 color-mix(in srgb, var(--vp-c-divider) 22%, transparent); }
.letter-corner { position: absolute; right: 23px; top: 17px; color: var(--home-accent); font: 24px Georgia,serif; opacity: .5; }.contact-section h2 { font-size: clamp(29px, 3vw, 43px); }
.contact-intro { font-size: 14px; line-height: 1.9; color: var(--vp-c-text-2); margin-top: 21px !important; }
.email-link { display: inline-flex; align-items: center; gap: 16px; font-size: clamp(22px, 2.6vw, 38px); letter-spacing: -.055em; margin-top: 28px; border-bottom: 1px solid var(--vp-c-divider); padding-bottom: 8px; white-space: nowrap; }.email-link:hover { color: var(--home-accent); }.email-link span { font-size: .8em; }
.social-links { display: flex; flex-wrap: wrap; gap: 17px 20px; margin-top: 25px; font-size: 12px; color: var(--vp-c-text-2); }.social-links a { position: relative; isolation: isolate; padding: 7px 10px; }.social-links a::before { content: ''; position: absolute; inset: 0; z-index: -1; background: var(--vp-c-bg); clip-path: var(--paper-button-edge); pointer-events: none; }.social-links a:nth-child(2n) { transform: rotate(1deg); }.social-links a:hover { color: var(--home-accent); }.social-links span { margin-left: 3px; opacity: .6; }
.letter-signature { font: italic 14px/1.8 Georgia,serif; margin-top: 38px !important; color: var(--vp-c-text-2); }.letter-signature span { font-size: 24px; color: var(--home-accent); }
.home-footer { display: flex; justify-content: space-between; gap: 20px; border-top: 1px solid var(--vp-c-divider); padding: 26px 0 35px; font-size: 10px; color: var(--vp-c-text-2); }.home-footer a:hover { color: var(--home-accent); }.footer-dot { padding: 0 7px; }.anchor-alias { position: absolute; top: 0; scroll-margin-top: var(--chapter-scroll-offset); }.home-hero .anchor-alias { scroll-margin-top: var(--vp-nav-height); }
.profile-home :deep(.has-arrived) { animation: home-arrive .7s cubic-bezier(.2,.7,.2,1) both; }@keyframes home-arrive { from { opacity: .35; translate: 0 20px; } to { opacity: 1; translate: 0 0; } }
.motion-off :deep(*), .motion-off :deep(*::before), .motion-off :deep(*::after) { animation: none !important; transition: none !important; }
.is-english .hero-copy h1 { font-size: clamp(40px, 5vw, 72px); }
/* Short text and narrow portraits compose as one centered spread. */
@media (min-width: 1100px) {
  .home-hero, .journey-section { grid-template-columns: minmax(0, 520px) var(--scene-size); justify-content: center; column-gap: 40px; }
  .home-hero .hero-copy { padding-left: 0; }
}
@media (max-width: 1099px) and (min-width: 860px) {
  .profile-home { width: calc(100% - 64px); --scene-size: calc((100vw - 104px) / 2); --chapter-padding: 180px; }.home-hero { gap: 40px; }.story-spread { gap: 24px; }.home-hero { min-height: 680px; padding-top: 44px; padding-bottom: 110px; }.hero-copy { padding-left: 0; }.hero-copy h1 { font-size: 51px; }.is-english .hero-copy h1 { font-size: 43px; }.hero-kicker { font-size: 10px; }.hero-copy .hero-intro { font-size: 16px; }.story-spread { min-height: 760px; }.profile-home h2 { font-size: 30px; }.section-description { font-size: 14px; }.contact-letter { padding: 36px 23px 28px; }.email-link { font-size: 25px; gap: 10px; }.hero-stamp { right: -5px; font-size: 8px; }
}
@media (max-width: 859px) {
  .profile-home { width: calc(100% - 40px); --scene-size: min(440px, calc(100vw - 40px)); }.home-hero { display: flex; flex-direction: column; align-items: stretch; padding: 34px 0 52px; gap: 0; min-height: 0; }.hero-copy { padding-left: 7px; }.identity { margin-bottom: 28px; }.hero-kicker { font-size: 9px; margin-bottom: 17px !important; }.hero-copy h1 { font-size: clamp(47px, 10vw, 72px); }.is-english .hero-copy h1 { font-size: clamp(40px, 8.7vw, 62px); }.hero-copy .hero-intro { margin-top: 25px; font-size: 16px; }.hero-copy .hero-detail { max-width: 430px; font-size: 13px; }.hero-links { margin-top: 22px; gap: 18px; }.hero-links .text-link { padding-inline: 10px; }.hero-pencil { display: none; }.hero-art { margin: 28px auto 85px; flex-shrink: 0; }.hero-stamp { right: 6px; }.hero-scribble { left: 8px; font-size: 17px; }.hero-footnote { bottom: 19px; font-size: 8px; gap: 18px; }.hero-footnote span:last-child { text-align: right; }.hero-footnote span:first-child { letter-spacing: 0; }.hero-tape { height: 24px; }
  .section-nav { min-height: 53px; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; }.chapter-caption { display: none; }.section-links { gap: 6px; justify-content: space-between; }.section-links a { font-size: 11px; padding: 8px 7px; }.nav-number { display: none; }.journal-link { font-size: 10px; gap: 5px; }
  .story-spread { display: flex; flex-direction: column; min-height: 0; gap: 0; }.story-spread > .spread-copy { width: 100%; }.scene-visual { display: block; position: relative; top: auto; order: 1; width: 100%; height: auto; margin-top: 28px; }.scene-visual .scene-anchor { width: min(100%, 440px); height: auto; margin-inline: auto; }.home-section { padding: 66px 0; scroll-margin-top: 132px; }.anchor-alias { scroll-margin-top: 132px; }.profile-home h2 { font-size: 28px; }.section-heading { margin-bottom: 27px; }.section-description { font-size: 14px; margin-top: 18px !important; max-width: 600px; }.profile-home .eyebrow { font-size: 9px; margin-bottom: 15px; }.life-card { max-width: 560px; padding: 14px 17px 22px; margin: 0 auto; }.life-card h3 { font-size: 23px; }.landscape-print { margin-bottom: 19px; }.margin-note { margin-top: 26px !important; }.play-section .spread-copy { padding-top: 0; }.court-note { padding: 24px 22px; margin-top: 30px; }.contact-letter { padding: 32px 23px 27px; }.contact-section h2 { font-size: 28px; }.email-link { font-size: clamp(21px, 6.5vw, 34px); gap: 12px; }.home-footer { font-size: 9px; }.footer-dot { padding: 0 3px; }
}
@media (max-width: 380px) { .section-links { gap: 2px; }.section-links a { padding-inline: 6px; }.journal-link { font-size: 9px; white-space: nowrap; }.hero-copy h1 { font-size: 43px; }.is-english .hero-copy h1 { font-size: 37px; }.hero-kicker { font-size: 8px; }.hero-copy .hero-intro { font-size: 14px; }.primary-link { padding: 12px 14px; gap: 16px; }.hero-links { gap: 10px; font-size: 12px; }.hero-links .text-link { padding-inline: 8px; }.hero-links a { white-space: nowrap; }.hero-stamp { font-size: 7px; }.hero-stamp span:last-child { font-size: 6px; }.contact-letter { padding-inline: 16px; }.email-link { font-size: 21px; } }
@media (prefers-reduced-motion: reduce) { .profile-home :deep(*), .profile-home :deep(*::before), .profile-home :deep(*::after) { animation: none !important; transition: none !important; } }
</style>
<style>
.portfolio-page .VPLocalNav { display: none; }
@media (max-width: 959px) { .portfolio-page .VPNav { position: sticky; top: 0; } }
</style>
