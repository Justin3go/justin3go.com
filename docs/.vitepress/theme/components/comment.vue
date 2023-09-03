<template>
	<div class="comments">
		<component
			v-if="showComment"
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
			:data-theme='isDark ? "dark" : "light"'
			:data-loading="giscusConfig.loading"
		/>
	</div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, nextTick } from "vue";
import { useData, useRoute } from "vitepress";

const route = useRoute();

const { title, isDark } = useData();

// params generate in https://giscus.app/zh-CN
const giscusConfig = reactive({
	repo: "justin3go/justin3go.github.io",
	repoId: "R_kgDOJq6kjw",
	category: "Q&A",
	categoryId: "DIC_kwDOJq6kj84CW7-N",
	mapping: "title",
	strict: "0",
	reactionsEnabled: "1",
	emitMetadata: "0",
	inputPosition: "top",
	// theme: isDark.value ? "dark" : "light", // 需要写在页面里面才会有响应式
	lang: "zh-CN",
	loading: "lazy",
});

const showComment = ref(true);
watch(
	() => route.path,
	() => {
		showComment.value = false;
		nextTick(() => {
			showComment.value = true;
		})
	},
	{
		immediate: true,
	}
);

watch(
	isDark,
	() => {
		showComment.value = false;
		nextTick(() => {
			showComment.value = true;
		})
	},
	{
		immediate: true,
	}
);
</script>
<style>
.comments {
	padding: 20px;
	border-radius: 10px;
}
</style>
