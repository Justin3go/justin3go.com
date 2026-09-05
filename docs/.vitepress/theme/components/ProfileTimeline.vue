<template>
	<ol class="profile-timeline">
		<li v-for="(item, index) in items" :key="item.time" :class="{ current: index === 0 }">
			<span class="timeline-dot" aria-hidden="true"></span>
			<time>{{ item.time }}</time>
			<div>
				<strong>{{ item.title }}</strong>
				<p>{{ item.description }}</p>
			</div>
		</li>
	</ol>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ locale?: "zh" | "en" }>(), {
	locale: "zh",
});

const zhItems = [
	{ time: "2001", title: "故事开始", description: "出生。从这里开始，慢慢认识世界。" },
	{ time: "2019 — 2023", title: "计算机科学与技术", description: "本科就读计算机科学与技术，开始探索前端与产品开发。" },
	{ time: "2022.07 — 2022.10", title: "互联网大厂 · 前端实习", description: "走进真实业务，学习团队协作与产品交付。" },
	{ time: "2023.03 — 2025.09", title: "国企 · 前端工程师", description: "积累工程经验，也开始把个人想法做成独立产品。" },
	{ time: "2025.09 — 至今", title: "互联网大厂 · 前端工程师", description: "继续打磨前端工程能力，探索 AI 与独立开发的更多可能。" },
];

const enItems = [
	{ time: "2001", title: "The story begins", description: "Born. The start of a lifelong curiosity about the world." },
	{ time: "2019 — 2023", title: "Computer Science", description: "Studied Computer Science and began exploring frontend engineering and product development." },
	{ time: "2022.07 — 2022.10", title: "Frontend intern · Internet company", description: "Joined a real product team and learned how to collaborate and ship." },
	{ time: "2023.03 — 2025.09", title: "Frontend engineer · State-owned enterprise", description: "Built engineering experience while turning personal ideas into independent products." },
	{ time: "2025.09 — Present", title: "Frontend engineer · Internet company", description: "Deepening my frontend craft and exploring what AI can bring to independent product development." },
];

const items = computed(() => [...(props.locale === "en" ? enItems : zhItems)].reverse());
</script>

<style scoped>
.profile-timeline { list-style: none; padding: 0; margin: 0; }
.profile-timeline li { position: relative; margin: 0; padding: 0 0 30px 28px; border-left: 1px solid var(--vp-c-divider); }
.profile-timeline li:last-child { padding-bottom: 0; border-left-color: transparent; }
.timeline-dot { position: absolute; left: -4px; top: 5px; width: 7px; height: 7px; border: 1px solid var(--vp-c-text-3); border-radius: 50%; background: var(--vp-c-bg); }
.current .timeline-dot { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 4px var(--vp-c-brand-soft); }
.profile-timeline time { display: block; margin-bottom: 8px; font: 10px var(--vp-font-family-mono); color: var(--vp-c-text-2); }
.current time { color: var(--vp-c-brand-1); }
.profile-timeline strong { font-size: 15px; line-height: 1.6; font-weight: 550; }
.profile-timeline p { margin: 7px 0 0; font-size: 13px; line-height: 1.8; color: var(--vp-c-text-2); }
@media (max-width: 640px) { .profile-timeline li { padding-left: 25px; } }
</style>
