<template>
	<template v-for="post in curPosts" :key="post.url">
		<h2 :id="post.title" class="post-title">
			<a :href="post.url">{{ post.title }}</a>
			<a
				class="header-anchor"
				:href="`#${post.title}`"
				:aria-label="`Permalink to &quot;${post.title}&quot;`"
				>​</a
			>
			<div class="post-date hollow-text">{{ post.date.string }}</div>
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
			:showPageNumber="isMobile"
			:showJumper="!isMobile"
			@current-change="onCurrentChange"
		/>
	</div>
</template>
<script lang="ts" setup>
import { ref, computed } from "vue";
import {
	MessagePlugin,
	PaginationProps,
	Pagination as TPagination,
} from "tdesign-vue-next";

import { data as posts } from "../../posts.data.mts";
import { isMobile } from "../../utils/mobile.ts";

const search = window.location.search.slice(1);
const searchParams = new URLSearchParams(search);
const page = searchParams.get("page") || 1;

const current = ref(+page);
const pageSize = ref(10);
const total = ref(posts.length);

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
	MessagePlugin.success(`转到第${index}页`);

	const url = new URL(window.location as any);
	url.searchParams.set("page", index.toString());
	window.history.replaceState({}, "", url);

	window.scrollTo({
		top: 0,
	});
};
</script>
<style lang="scss" scoped>
/* 去掉.vp-doc li + li的margin-top */
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
	border-top: 0px;
	position: relative;
	top: 0;
	left: 0;

	.post-date {
		position: absolute;
		top: -6px;
		left: -10px;

		z-index: -1;
		opacity: .08;
		font-size: 66px;
		font-weight: 900;
	}
}

.hollow-text {
  
  /* 设置文本颜色为透明 */
  color: var(--vp-c-bg);
  
	-webkit-text-stroke: 1px var(--vp-c-text-1);
}
</style>
