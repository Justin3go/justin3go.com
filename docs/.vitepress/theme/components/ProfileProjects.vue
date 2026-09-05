<template>
	<div class="profile-projects">
		<a
			v-for="project in projects"
			:key="project.name"
			class="profile-project-card"
			:href="project.url"
			target="_blank"
			rel="noreferrer"
		>
			<img :src="project.image" :alt="`${project.name} ${previewLabel}`" width="1200" height="675" loading="lazy" />
			<div class="profile-project-copy">
				<div class="profile-project-title">
					<strong>{{ project.name }}</strong>
					<span aria-hidden="true">↗</span>
				</div>
				<p>{{ project.description }}</p>
				<div class="profile-project-tags" aria-label="Technology tags">
					<code v-for="tag in project.tags" :key="tag">{{ tag }}</code>
				</div>
			</div>
		</a>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ locale?: "zh" | "en" }>(), {
	locale: "zh",
});

const baseProjects = [
	{ name: "Turbo0", url: "https://turbo0.com", image: "/projects/turbo0.png", tags: ["Creator Tools", "Directory"] },
	{ name: "Edit0", url: "https://edit0.com", image: "/projects/edit0.png", tags: ["AI", "Image Editor"] },
	{ name: "心之链 · Xin2link", url: "https://xin2.link", image: "/projects/xin2link.png", tags: ["AI", "Mini Program"] },
	{ name: "SearchSearchGo", url: "https://ssgo.app", image: "/projects/ssgo.png", tags: ["Search", "Cloud Drive"] },
	{ name: "Template0", url: "https://template0.com", image: "/projects/template0.png", tags: ["Templates", "Frontend"] },
	{ name: "HUNT0", url: "https://hunt0.com", image: "/projects/hunt0.png", tags: ["Launchpad", "AI"] },
	{ name: "OG Image Download", url: "https://ogimage.download", image: "/projects/og-image-download.png", tags: ["Browser Extension", "Open Graph"] },
	{ name: "PDFuck", url: "https://pdfuck.com", image: "/projects/pdfuck.png", tags: ["PDF", "Privacy First"] },
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
</script>

<style scoped>
.profile-projects {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
	margin: 24px 0 32px;
}

.profile-project-card {
	overflow: hidden;
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	background: var(--vp-c-bg);
	color: inherit;
	text-decoration: none;
	transition: border-color 0.2s ease;
}

.profile-project-card:hover {
	border-color: var(--vp-c-brand-1);
}

.profile-project-card > img {
	display: block;
	width: 100%;
	aspect-ratio: 16 / 9;
	margin: 0;
	border: 0;
	border-bottom: 1px solid var(--vp-c-divider);
	border-radius: 0;
	object-fit: cover;
	background: var(--vp-c-bg-soft);
}

.profile-project-copy {
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
}

.profile-project-title span {
	font-size: 13px;
	color: var(--vp-c-text-3);
}

.profile-project-card:hover .profile-project-title strong {
	color: var(--vp-c-brand-1);
}

.profile-project-copy p {
	min-height: 48px;
	margin: 8px 0 14px;
	font-size: 13px;
	line-height: 1.65;
	color: var(--vp-c-text-2);
}

.profile-project-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.profile-project-tags code {
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 11px;
	color: var(--vp-c-text-2);
	background: var(--vp-c-bg-soft);
}

@media (max-width: 640px) {
	.profile-projects {
		grid-template-columns: 1fr;
	}

	.profile-project-copy p {
		min-height: 0;
	}
}
</style>
