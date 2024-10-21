<template></template>
<script setup lang="ts">
import { useData } from "vitepress";
import { watch } from "vue";

const { isDark } = useData();

// tdesign 暗色切换 https://tdesign.tencent.com/vue-next/dark-mode
watch(
	isDark,
	() => {
		if (typeof document !== "undefined") {
			// 使用document的代码
			if (isDark.value) {
				document.documentElement.setAttribute("theme-mode", "dark");
			} else {
				document.documentElement.removeAttribute("theme-mode");
			}
		}
	},
	{
		immediate: true,
	}
);
</script>
