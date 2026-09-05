<template>
	<ol class="profile-timeline">
		<li v-for="item in items" :key="item.time">
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
	{ time: "2001", title: "故事开始", description: "出生，也从这里开始认识世界。" },
	{ time: "2019 — 2023", title: "计算机科学与技术", description: "完成本科学习，逐渐确认前端与产品创造是长期方向。" },
	{ time: "2022.07 — 2022.10", title: "互联网大厂 · 前端实习", description: "第一次在真实业务中理解工程协作与产品交付。" },
	{ time: "2023.03 — 2025.09", title: "国企 · 前端工程师", description: "持续积累工程经验，并开始更系统地做独立产品。" },
	{ time: "2025.09 — 至今", title: "互联网大厂 · 前端工程师", description: "继续深耕技术，同时把 AI 与独立开发带入更多真实项目。" },
];

const enItems = [
	{ time: "2001", title: "The story begins", description: "Born, and started discovering the world from here." },
	{ time: "2019 — 2023", title: "Computer Science", description: "Completed my bachelor’s degree and chose front-end engineering and product making as long-term directions." },
	{ time: "2022.07 — 2022.10", title: "Frontend intern · Internet company", description: "Learned engineering collaboration and product delivery in a real business for the first time." },
	{ time: "2023.03 — 2025.09", title: "Frontend engineer · State-owned enterprise", description: "Built engineering experience and began creating indie products more systematically." },
	{ time: "2025.09 — Present", title: "Frontend engineer · Internet company", description: "Continuing to deepen my craft while bringing AI and indie development into more real products." },
];

const items = computed(() => (props.locale === "en" ? enItems : zhItems));
</script>

<style scoped>
.profile-timeline {
	margin: 24px 0 32px;
	padding: 0;
	list-style: none;
	border-top: 1px solid var(--vp-c-divider);
}

.profile-timeline li {
	display: grid;
	grid-template-columns: 150px minmax(0, 1fr);
	gap: 24px;
	padding: 18px 0;
	border-bottom: 1px solid var(--vp-c-divider);
}

.profile-timeline time {
	padding-top: 2px;
	font-family: var(--vp-font-family-mono);
	font-size: 13px;
	font-weight: 600;
	color: var(--vp-c-brand-1);
}

.profile-timeline strong {
	font-size: 15px;
	font-weight: 600;
}

.profile-timeline p {
	margin: 6px 0 0;
	font-size: 14px;
	line-height: 1.7;
	color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
	.profile-timeline li {
		grid-template-columns: 1fr;
		gap: 6px;
		padding: 16px 0;
	}
}
</style>
