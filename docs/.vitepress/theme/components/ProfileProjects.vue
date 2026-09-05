<template>
	<div class="profile-projects" :class="{ 'is-motion-disabled': !props.motion || reducedMotion }">
		<a
			v-for="(project, index) in projects"
			:key="project.name"
			class="profile-project-card"
			:class="{ 'profile-project-card--featured': index < 2 }"
			:href="project.url"
			target="_blank"
			rel="noopener noreferrer"
		>
			<div class="profile-project-media" @pointermove="handlePointerMove" @pointerleave="resetPointer">
				<div class="profile-project-browserbar" aria-hidden="true">
					<span class="profile-project-number">{{ String(index + 1).padStart(2, "0") }}</span>
					<span class="profile-project-domain">{{ project.domain }}</span>
					<span class="profile-project-arrow">↗</span>
				</div>
				<img :src="withBase(project.image)" :alt="`${project.name} ${previewLabel}`" width="1200" height="675" loading="lazy" />
			</div>
			<div class="profile-project-copy">
				<div class="profile-project-title">
					<strong>{{ project.name }}</strong>
					<span aria-hidden="true">↗</span>
				</div>
				<p>{{ project.description }}</p>
			</div>
		</a>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { withBase } from "vitepress";

const props = withDefaults(defineProps<{ locale?: "zh" | "en"; motion?: boolean }>(), {
	locale: "zh",
	motion: true,
});

const baseProjects = [
	{ name: "Turbo0", domain: "turbo0.com", url: "https://turbo0.com", image: "/projects/turbo0.png" },
	{ name: "Edit0", domain: "edit0.com", url: "https://edit0.com", image: "/projects/edit0.png" },
	{ name: "心之链 · Xin2link", domain: "xin2.link", url: "https://xin2.link", image: "/projects/xin2link.png" },
	{ name: "SearchSearchGo", domain: "ssgo.app", url: "https://ssgo.app", image: "/projects/ssgo.png" },
	{ name: "Template0", domain: "template0.com", url: "https://template0.com", image: "/projects/template0.png" },
	{ name: "HUNT0", domain: "hunt0.com", url: "https://hunt0.com", image: "/projects/hunt0.png" },
	{ name: "OG Image Download", domain: "ogimage.download", url: "https://ogimage.download", image: "/projects/og-image-download.png" },
	{ name: "PDFuck", domain: "pdfuck.com", url: "https://pdfuck.com", image: "/projects/pdfuck.png" },
];

const zhDescriptions = [
	"面向内容创作者的工具与资源导航站。",
	"支持版本管理与对话式操作的 AI 图像编辑器。",
	"基于换位思考、AI 分析与可视化对比的心理问卷小程序。",
	"面向阿里云盘资源的轻量搜索引擎。",
	"近千份免费前端模板，可按用途、技术栈与预览图筛选。",
	"支持 AI 提交与声望系统的产品发布平台。",
	"一键获取并下载网站 OG 图片的浏览器扩展。",
	"40+ 纯浏览器运行、注重隐私的免费 PDF 工具。",
];

const enDescriptions = [
	"A curated directory of tools and resources for content creators.",
	"A conversational AI image editor with version management.",
	"A psychological questionnaire mini program using empathy, AI analysis, and visual comparison.",
	"A lightweight search engine for resources shared through Alibaba Cloud Drive.",
	"Nearly a thousand free front-end templates, filterable by use case, stack, and preview.",
	"A product launchpad with AI-assisted submissions and a reputation system.",
	"A browser extension for finding and downloading website Open Graph images.",
	"40+ free, privacy-focused PDF tools that run entirely in the browser.",
];

const projects = computed(() => {
	const descriptions = props.locale === "en" ? enDescriptions : zhDescriptions;
	return baseProjects.map((project, index) => ({ ...project, description: descriptions[index] }));
});

const previewLabel = computed(() => (props.locale === "en" ? "project preview" : "项目预览图"));

const reducedMotion = ref(false);
let motionQuery: MediaQueryList | undefined;

function syncMotionPreference() {
	reducedMotion.value = motionQuery?.matches ?? false;
}

function handlePointerMove(event: PointerEvent) {
	if (!props.motion || reducedMotion.value || (event.pointerType && event.pointerType !== "mouse")) return;
	const media = event.currentTarget as HTMLElement | null;
	if (!media) return;

	const bounds = media.getBoundingClientRect();
	if (!bounds.width || !bounds.height) return;

	const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
	const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
	media.style.setProperty("--project-tilt-x", `${(-y * 6).toFixed(2)}deg`);
	media.style.setProperty("--project-tilt-y", `${(x * 6).toFixed(2)}deg`);
	media.style.setProperty("--project-shift-x", `${(x * 4).toFixed(2)}px`);
	media.style.setProperty("--project-shift-y", `${(y * 4).toFixed(2)}px`);
	media.style.setProperty("--project-scale", "1.018");
}

function resetPointer(event: PointerEvent) {
	const media = event.currentTarget as HTMLElement | null;
	if (!media) return;
	media.style.removeProperty("--project-tilt-x");
	media.style.removeProperty("--project-tilt-y");
	media.style.removeProperty("--project-shift-x");
	media.style.removeProperty("--project-shift-y");
	media.style.removeProperty("--project-scale");
}

onMounted(() => {
	motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
	syncMotionPreference();
	motionQuery.addEventListener("change", syncMotionPreference);
});

onUnmounted(() => {
	motionQuery?.removeEventListener("change", syncMotionPreference);
});
</script>

<style scoped>
.profile-projects {
	display: grid;
	grid-template-columns: repeat(6, minmax(0, 1fr));
	gap: 20px;
	width: 100%;
	max-width: 100%;
	margin: 28px auto 40px;
}

.profile-project-card {
	display: flex;
	grid-column: span 2;
	flex-direction: column;
	overflow: hidden;
	border: 1px solid var(--vp-c-divider);
	border-radius: 14px;
	background: var(--vp-c-bg);
	color: var(--vp-c-text-1);
	cursor: pointer;
	text-decoration: none !important;
	transition: border-color 180ms ease, color 180ms ease;
}

.profile-project-card--featured {
	grid-column: span 3;
}

.profile-project-card:hover {
	border-color: var(--vp-c-brand-1);
	text-decoration: none !important;
}

.profile-project-card:focus-visible {
	outline: 2px solid var(--vp-c-brand-1);
	outline-offset: 4px;
}

.profile-project-media {
	position: relative;
	overflow: hidden;
	background: var(--vp-c-bg-soft);
	--project-tilt-x: 0deg;
	--project-tilt-y: 0deg;
	--project-shift-x: 0px;
	--project-shift-y: 0px;
	--project-scale: 1;
}

.profile-project-browserbar {
	display: flex;
	align-items: center;
	gap: 10px;
	min-height: 25px;
	box-sizing: border-box;
	padding: 0 12px;
	border-bottom: 1px solid var(--vp-c-divider);
	background: var(--vp-c-bg-soft);
	color: var(--vp-c-text-3);
	font-family: var(--vp-font-family-mono);
	font-size: 10px;
	line-height: 1;
	letter-spacing: 0.02em;
}

.profile-project-number {
	flex: 0 0 auto;
	color: var(--vp-c-brand-1);
	font-variant-numeric: tabular-nums;
}

.profile-project-domain {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.profile-project-arrow {
	margin-left: auto;
	font-size: 12px;
}

.profile-project-media > img {
	display: block;
	width: 100%;
	aspect-ratio: 16 / 9;
	margin: 0;
	border: 0;
	border-radius: 0;
	object-fit: cover;
	cursor: inherit;
	transform: perspective(900px) rotateX(var(--project-tilt-x)) rotateY(var(--project-tilt-y)) translate3d(var(--project-shift-x), var(--project-shift-y), 0) scale(var(--project-scale));
	transform-origin: center;
	transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
	will-change: auto;
}

.profile-project-copy {
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 14px 16px 16px;
}

.profile-project-title {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 12px;
}

.profile-project-title strong {
	font-size: 15px;
	font-weight: 600;
	line-height: 1.4;
}

.profile-project-title span {
	font-size: 13px;
	color: var(--vp-c-text-3);
}

.profile-project-card:hover .profile-project-title strong {
	color: var(--vp-c-brand-1);
}

.profile-project-copy p {
	margin: 8px 0 0;
	font-size: 13px;
	line-height: 1.65;
	color: var(--vp-c-text-2);
}

.profile-project-card:hover .profile-project-title strong,
.profile-project-card:hover .profile-project-arrow {
	color: var(--vp-c-brand-1);
}


.profile-projects.is-motion-disabled .profile-project-media > img {
	transform: none;
	transition: none;
	will-change: auto;
}

@media (prefers-reduced-motion: reduce) {
	.profile-project-media > img {
		transform: none;
		transition: none;
		will-change: auto;
	}
}

@media (max-width: 850px) {
	.profile-projects {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.profile-project-card,
	.profile-project-card--featured {
		grid-column: span 1;
	}
}

@media (max-width: 600px) {
	.profile-projects {
		grid-template-columns: 1fr;
	}

	.profile-project-copy {
		padding: 14px 16px 16px;
	}
}
</style>
