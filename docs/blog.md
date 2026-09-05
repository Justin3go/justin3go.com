---
# https://vitepress.dev/reference/default-theme-home-page
layout: doc
title: 博客
description: Justin3go 的技术博客，记录 AI、独立开发、前端工程与持续创造。
editLink: false
lastUpdated: false
isNoComment: true
isNoBackBtn: true
---

<!-- 之所以将代码写在 md 里面，而非单独封装为 Vue 组件，因为 aside 不会动态刷新，参考 https://github.com/vuejs/vitepress/issues/2686 -->
<template v-for="post in curPosts" :key="post.url">
  <h2 :id="post.title" class="post-title">
    <a :href="post.url">{{ post.title }}</a>
    <a
      class="header-anchor"
      :href="`#${post.title}`"
      :aria-label="`Permalink to &quot;${post.title}&quot;`"
      >​</a
    >
    <div class="post-date hollow-text source-han-serif">{{ post.date.string }}</div>
  </h2>
  <t-tag
    v-for="tag in post.tags"
    class="mr-2"
    variant="outline"
    shape="round"
    >{{ tag }}</t-tag
  >
  <div v-if="post.excerpt" v-html="post.excerpt"></div>
</template>

<!-- <Pagination /> -->
<div class="pagination-container">
  <t-pagination
    v-model="current"
    v-model:pageSize="pageSize"
    :total="total"
    size="small"
    :showPageSize="false"
    :showPageNumber="!isMobile()"
    :showJumper="isMobile()"
    @current-change="onCurrentChange"
  />
</div>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vitepress";
// 非 Vue 组件需要手动引入
import {
	MessagePlugin,
	PaginationProps,
	Pagination as TPagination,
  Tag as TTag,
} from "tdesign-vue-next";

import { data as posts } from "./.vitepress/theme/posts.data.mts";
import { isMobile } from "./.vitepress/theme/utils/mobile.ts";

const route = useRoute();

const getPage = () => {
  const search = route.query
  const searchParams = new URLSearchParams(search);

  return Number(searchParams.get("page") || "1");
}

const current = ref(getPage())
const pageSize = ref(10);
const total = ref(posts.length);

// 在首页有page参数时，从NAV跳转到当前页，清空了参数，但没有刷新页面内容的问题，需要手动更新current
const router = useRouter();
router.onAfterRouteChange = (to) => {
  current.value = getPage();
}

const curPosts = computed(() => {
	return posts.slice(
		(current.value - 1) * pageSize.value,
		current.value * pageSize.value
	);
});

const onCurrentChange: PaginationProps["onCurrentChange"] = (
	index,
	pageInfo
) => {
	// MessagePlugin.success(`转到第${index}页`);

	const url = new URL(window.location as any);
	url.searchParams.set("page", index.toString());
	window.history.replaceState({}, "", url);

	window.scrollTo({
		top: 0,
	});
};
</script>
<style lang="scss" scoped>
/* 去掉.vp-doc li + li 的 margin-top */
.pagination-container {
	margin-top: 60px;

	:deep(li) {
		margin-top: 0px;
	}
}

.mr-2 {
	margin-right: 2px;
}

.post-title {
	margin-bottom: 6px;
	margin-top: 60px;
	border-top: 0px;
	position: relative;
	top: 0;
	left: 0;

	> a {
		font-weight: 400;
	}

	.post-date {
		position: absolute;
		top: -12px;
		left: -10px;

		z-index: -1;
		opacity: .16;
		font-size:76px;
		font-weight: 900;
	}

	@media (max-width: 425px) {
		.post-date {
			font-size: 60px !important;
		}
	}

	&:first-child {
		margin-top: 20px;
	}
}

.hollow-text {

  /* 设置文本颜色为透明 */
  color: var(--vp-c-bg);

	-webkit-text-stroke: 1px var(--vp-c-text-1);
}
</style>
