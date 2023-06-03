<template>
	<div class="comments">
		<component
			src="https://giscus.app/client.js"
			:is="'script'"
			:key="title"
			:data-repo="giscusConfig.repo"
			:data-repo-id="giscusConfig.repoId"
			:data-category="giscusConfig.category"
			:data-category-id="giscusConfig.categoryId"
			:data-mapping="giscusConfig.mapping"
			:data-strict="giscusConfig.strict"
			:data-reactions-enabled="giscusConfig.reactionsEnabled"
			:data-emit-metadata="giscusConfig.emitMetadata"
			:data-input-position="giscusConfig.inputPosition"
			:data-lang="giscusConfig.lang"
			:data-theme="giscusConfig.theme"
			:data-loading="giscusConfig.loading"
		/>
	</div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { useData } from "vitepress";

const { title } = useData();

// params generate in https://giscus.app/zh-CN
const giscusConfig = reactive({
	repo: "justin3go/justin3go.github.io",
	repoId: "R_kgDOJq6kjw",
	category: "Announcements",
	categoryId: "DIC_kwDOJq6kj84CW7-L",
	mapping: "title",
	strict: "0",
	reactionsEnabled: "1",
	emitMetadata: "0",
	inputPosition: "top",
	theme: "light",
	lang: "zh-CN",
	loading: "eager",
});
</script>
<style>
/* // TODO 使用giscus自定义主题结合vitepress主题切换 */
.comments {
	background-color: #ffffff;
	padding: 20px;
	border-radius: 10px;
}
</style>