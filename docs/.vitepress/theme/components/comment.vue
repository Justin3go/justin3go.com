<template>
	<div class="comments">
		<Giscus
      v-if="showComment"
      :repo="giscusConfig.repo"
      :repo-id="giscusConfig.repoId"
      :category="giscusConfig.category"
      :category-id="giscusConfig.categoryId"
      :mapping="giscusConfig.mapping"
      :reactions-enabled="giscusConfig.reactionsEnabled"
      :emit-metadata="giscusConfig.emitMetadata"
      :input-position="giscusConfig.inputPosition"
      :theme="isDark ? 'dark' : 'light'"
      :lang="giscusConfig.lang"
      :loading="giscusConfig.loading"
    />
	</div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, nextTick } from "vue";
import { useData, useRoute } from "vitepress";
import Giscus, { type GiscusProps } from '@giscus/vue'

const route = useRoute();

const { isDark } = useData();

// params generate in https://giscus.app/zh-CN
const giscusConfig: GiscusProps = reactive({
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

</script>
<style>
.comments {
	padding: 20px;
	border-radius: 10px;
}
</style>
