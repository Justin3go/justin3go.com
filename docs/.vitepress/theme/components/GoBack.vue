<template>
	<t-button
		v-if="isPosts && !frontmatter.isNoBackBtn"
		theme="default"
		variant="dashed"
		style="margin-bottom: 10px"
		@click="goBack"
	>
		<template #icon><RollbackIcon /></template>
		{{ isEN ? "Go back " : "返回上一页" }}
	</t-button>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useData } from "vitepress";
import { RollbackIcon } from "tdesign-icons-vue-next";

const route = useRoute();
const isEN = computed(() => route.path.startsWith("/en"));
const isPosts = computed(() => route.path.startsWith("/posts") || route.path.startsWith("/en/posts"));
const { frontmatter } = useData();

function goBack() {
	if (window.history.length <= 1) {
		location.href = "/";
	} else {
		window.history.go(hashChangeCount.value);
		hashChangeCount.value = -1;
	}
}

const hashChangeCount = ref(-1);
onMounted(() => {
	window.onhashchange = () => {
		hashChangeCount.value--;
	}
})

onUnmounted(() => {
	window.onhashchange = null;
})
</script>
<style scoped>
.img-container {
	height: 105px;
	width: 100px;
}

img {
	height: 100px;
	border-radius: 5px;
	margin-top: 5px;
}
</style>
