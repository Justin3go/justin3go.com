<template>
	<div class="comments" v-if="!frontmatter.isNoComment">
		<!-- params generate in https://giscus.app/zh-CN -->
		<Giscus
			v-if="showComment"
			repo="Justin3go/FAV0"
			repo-id="R_kgDOMAyo3w"
			category="General"
			category-id="DIC_kwDOMAyo384Cfno-"
			mapping="specific"
			:term="term"
			strict="1"
			reactions-enabled="1"
			emit-metadata="0"
			input-position="top"
			:theme="theme"
			:lang="lang"
			loading="lazy"
			crossorigin="anonymous"
		/>
	</div>
</template>
<script lang="ts" setup>
import { ref, watch, nextTick, computed } from "vue";
import { useData, useRoute } from "vitepress";
import Giscus from "@giscus/vue";

const route = useRoute();
const { isDark, frontmatter } = useData();

const term = computed(() => route.path.slice(-3));
const theme = computed(() => (isDark.value ? "noborder_dark" : "noborder_light"));
const lang = computed(() => route.path.startsWith("/en") ? 'en' : 'zh-Hans');

// language变化不会触发重新加载，这里v-if强制刷新
const showComment = ref(true);
watch(
	() => route.path,
	() => {
		showComment.value = false;
		nextTick(() => {
			showComment.value = true;
		});
	},
	{
		immediate: true,
	}
);
</script>
<style lang="scss" scoped>
.comments {
	margin-top: 80px;
}
</style>
