---
title: 简单优化一下个人博客首页(迁移 vitepress-beta 版)
date: 2023-06-06
tags: 
  - VitePress
  - 个人博客
  - 优化
  - 迁移
  - Giscus
  - CI/CD
---

# 简单优化一下个人博客首页(迁移 vitepress-beta 版)

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇博客中分享了将个人博客从 VitePress alpha 版本迁移到 beta 版本的过程，并进行了首页样式的优化。

迁移的主要原因是 beta 版本提供了更稳定的体验和官方本地搜索功能，取代了之前使用的第三方插件。

此外，笔者将评论系统从 Gitalk 替换为 Giscus，因其界面更美观且功能丰富，如开源、无需数据库等。博客首页还实现了视频自适应背景和最近发布文章的展示，旨在提升用户体验。通过简单的递归遍历侧边栏数据，笔者提取最近的 10 篇文章。同时，笔者分享了 CI/CD 的配置，确保博客的自动化部署。整个过程不仅展示了技术细节，也体现了笔者对博客优化的热情与坚持。

<!-- DESC SEP -->

## 前言

笔者也算是 vitepress 的忠实用户了，尽管隔壁 Astro 看起来有多吸引人，我还是使用 vitepress 搭建个人博客。好吧，我承认主要还是懒😛

笔者前面已经从 0.xx.xx 版本迁移过 alpha 版本过一次，上次就是 alpha 版本中有很多吸引我的地方，所以迁移了，想详细了解的和想要入门 vitepress 的读者可以查看这篇文章--[玩转 vitepress1.0](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2022/06%E7%8E%A9%E8%BD%ACvitepress.html)

> 注意，本文不会讲 vitepress 的基础搭建，如标题所示，本文的工作一是迁移，二是首页样式优化。至于基础，上述那篇文章里面都有讲解，如果你对 vitepress 不太熟悉，可以先查看上述文章

这次之所以想要从 alpha.22 版本迁移到 beta 版本，除了该版本更加稳定之外，主要还是因为增加了本地搜索的功能，试了一下非常不错，笔者之前是使用的[第三方插件](https://github.com/emersonbottero/vitepress-plugin-search)实现的本地搜索，现在官方支持了，自然得来玩玩...

如下是实现效果，你可以自己的[justin3go.com](https://justin3go.com)中进行体验；并且，博客已开源至 github，本文所有代码可以在[该链接](https://github.com/Justin3go/justin3go.github.io)中找到。

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230606220148.png)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230606220212.png)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230606220249.png)

## 集成 giscus 评论组件

### 简介

之前笔者使用的是 gitalk 实现静态博客的评论功能，这类组件都是利用 github 的 api 实现无需自建后端系统，即可实现评论系统的功能，总之非常方便，毕竟博客面向程序员，谁会没有 github 账号呢？

至于为什么笔者将 gitalk 替换为了 giscus，主要还是因为颜值，更好看（始于颜值，忠于社区已经有 4k stars 了）。

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230606222509.png)

当然，还有一些其他优点，这里简单贴一下[giscus 官网](https://github.com/giscus/giscus)介绍的优点(机翻)：

> - [开源](https://github.com/giscus/giscus)。🌏
> - 没有跟踪，没有广告，永远免费。📡 🚫
> - 不需要数据库。所有数据都存储在 GitHub 讨论中。
> - 支持[自定义主题](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#data-theme)！🌗
> - 支持[多种语言](https://github.com/giscus/giscus/blob/main/CONTRIBUTING.md#adding-localizations)。🌐
> - [可广泛配置](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md)。🔧
> - 自动从 GitHub 获取新评论和编辑。🔃
> - [可以自托管](https://github.com/giscus/giscus/blob/main/SELF-HOSTING.md)！🤳
> -  giscus 与 React、Vue 或 Svelte 结合使用(这个 vue 有坑)
> - 可以非常方便的从 gitalk 和 utterances 中迁移

### 封装

使用 giscus vue 版本会有一点小坑，可以在[该 Issue](https://github.com/vuejs/vitepress/issues/1776)中详细看到，所以这里使用 giscus 提供的原生的 JS 版进行封装使用：

```ts
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
			:data-theme="giscusConfig.theme"
			:data-loading="giscusConfig.loading"
		/>
	</div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { useData, useRoute } from "vitepress";

const route = useRoute();

const { title } = useData();

// params generate in https://giscus.app/zh-CN
const giscusConfig = reactive({
	repo: "justin3go/justin3go.github.io",
	repoId: "XXX",
	category: "Q&A",
	categoryId: "XXX",
	mapping: "title",
	strict: "0",
	reactionsEnabled: "1",
	emitMetadata: "0",
	inputPosition: "top",
	theme: "light",
	lang: "zh-CN",
	loading: "lazy",
});

const showComment = ref(true);
watch(
	() => route.path,
	() => {
		showComment.value = false;
		setTimeout(() => {
			showComment.value = true;
		}, 200);
	},
	{
		immediate: true,
	}
);
</script>
<style>
/* // TODO 使用 giscus 自定义主题结合 vitepress 主题切换 */
.comments {
	background-color: #ffffff;
	padding: 20px;
	border-radius: 10px;
}
</style>
```

注意上述你不知道怎么填的参数都生成至该网站[giscus.app](https://giscus.app/zh-CN)，这里就不一步步演示了，很简单的可视化操作。

上述代码可以在[github 这个位置](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/comment.vue)找到，细心的读者可能注意到了留下的`TODO: 使用 giscus 自定义主题结合 vitepress 主题切换`，这是因为当前 giscus 的自定义主题还处于实验性版本，所以就没去做白/夜模式切换适配了，目前仅加了和白色背景保证黑夜模式下可读。

### 使用

封装后使用就非常简单了，由于 vitepress 提供了[全局 doc 的插槽](https://vitepress.dev/guide/extending-default-theme#layout-slots)，所以我们直接在定义所有的文章下面`doc-after`都有该评论组件:

```ts
// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import comment from "./components/comment.vue";
import copyright from "./components/copyright.vue"

export default {
	...Theme,
	Layout: () => {
		return h(Theme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
			"doc-after": () => h(comment),
			"doc-footer-before": () => h(copyright),
		});
	},
	// ...
};
```

上述代码你可以在该[github 链接](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/index.ts)中找到完整示例

## 实现视频自适应背景

### 设计理念

一些设计理念：笔者的笔名为`Justin3go`，`Justin`为我的英文名，`3go`代表的`gogogo`，即向前冲的决心，坚持深耕技术领域。狼是我喜欢的动物，奔跑则与`gogogo`相对应。

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230606224425.png)

### 实现

由于笔者有`PhotoShop`相关的背景，所以很容易地去想 CSS 中是否有混合模式这个概念，然后就被我发现了一个这样的属性`mix-blend-mode: difference`，好，没了。当然，好像还有一种比较复杂的方式用 canvas 结合视频的 alpha 通道实现，这里不深究，仅提一下。

最后，增加一些细节：

1. 视频始终铺满屏幕
2. 开始`button`

这里不展开了，还是，感兴趣的可以在[github 的这里](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/home.vue)找到该页面的实现，下方为主要代码摘要：

```html
<div class="video-container">
	<video class="logo-video" autoplay loop muted>
		<source src="https://oss.justin3go.com/blogs/justin3go.mp4" type="video/mp4" />
	</video>
	<div class="button-container-outer" @click="handleClick">
		<div class="container-button">
			<div class="hover bt-1"></div>
			<div class="hover bt-2"></div>
			<div class="hover bt-3"></div>
			<div class="hover bt-4"></div>
			<div class="hover bt-5"></div>
			<div class="hover bt-6"></div>
			<button></button>
		</div>
	</div>
</div>
```

```css
.video-container {
	height: 100vh;
	width: 100%;
	overflow: hidden;
	display: flex;
	justify-content: center;
	position: relative;
	top: 0;
}
/* 小于 960px 会增加 return-top 那一栏并且不会透明 */
@media (max-width: 960px) {
	.video-container {
		height: calc(100vh - var(--vp-nav-height) - 47px);
	}
}

.logo-video {
	mix-blend-mode: difference;
	height: 100%;
	min-width: 100%;
	object-fit: cover;
}
```

## 实现最近发布

### 设计理念

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230606225538.png)

一些设计理念：

1. 为什么不做分页以展示全部的文章，笔者理解读者更多只会查看最近几篇文章，就和 google 搜索出来的结果 80%的人都不会点击第二页一样；
2. 至于想要查看笔者以前的文章，则直接点击笔者的博客归档就可以了，侧边栏加内容加大纲的方式是笔者理解的一种非常好的阅读页面设置；
3. 为什么不做摘要和封面，只有题目：懒🤣

### 获取最近 10 篇文章

基本思路：由于笔者博客的侧边栏就是按时间顺序排列的，如：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230606225916.png)

所以实现起来非常简单，用一个递归来转换遍历一下这个数据结构就可以了：

侧边栏的数据结构类型：

```ts
export enum TAB {
	BLOG = "/博客/",
	NOTE = "/笔记/",
}

export interface IItems {
	text: string;
	link: string;
	collapsed?: boolean;
	items?: IItems[];
}

export interface ISideBar {
	[TAB.BLOG]: IItems[];
	[TAB.NOTE]: IItems[];
}
```

实现：

```ts
import { createSidebar, TAB } from "./createSidebar";

export interface IPost {
  text: string;
  link: string;
}

export function getRecentlyPost(tab: TAB = TAB.BLOG, recentlyPostNumber = 10) {
	const allSideBar = createSidebar();
	const curSideBar = allSideBar[tab];

	// 遍历找到所有 items，如果 items 中没有包含子 items，则将其 text,link 加入，达到 5 个就跳出循环
  const posts: IPost[] = []
	function findItems(items: typeof curSideBar){
    if(posts.length >= recentlyPostNumber) return;
    for(const item of items) {
      if(item["items"]) {
        findItems(item["items"])
      } else {
        posts.push({
          text: item.text,
          link: item.link,
        })
      }
      if(posts.length >= recentlyPostNumber) return;
    }
  }
  findItems(curSideBar);
  // 由于文章本来就是按顺序排列的，所以直接返回
  return posts;
}
```

### 前端展示

![](https://oss.justin3go.com/blogs/%E6%BC%94%E7%A4%BA.gif)

然后展示在前端就可以了，为了方便，我就直接用 flex 布局+设置了只展示两行以实现自适应，多的就隐藏吧。

```html
<div class="recently-posts-head">
	<div class="title">📖最近发布文章</div>
	<link-button text="📁博客归档" link="/博客/"></link-button>
</div>
<div class="recently-posts">
	<div class="post-item" v-for="post in recentlyPosts" :key="post.date">
		<article-card :text="post.text" :link="post.link" :date="post.date"></article-card>
	</div>
</div>
```

```ts
interface IRecentlyPosts {
	text: string;
	link: string;
	date: string;
}

const initRecentlyPosts = getRecentlyPost();
const recentlyPosts: Ref<IRecentlyPosts[]> = ref(
	initRecentlyPosts.map((item) => ({
		date: item.link.substring(4, 14),
		text: item.text.substring(2),
		link: item.link,
	}))
);
```

```css
.recently-posts {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around;
	padding: 20px;
	width: calc(100vw - 40px);
	height: 340px;
	overflow: hidden;
}

.post-item {
	margin: 10px;
}

.recently-posts-head {
	display: flex;
	justify-content: space-between;
	padding: 20px 40px;
}

.recently-posts-head .title {
	font-size: 20px;
	font-weight: 900;
}
```

同样，你可以在[这个 github 链接](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/home.vue)中找到完整的代码。

## CI

具体的部署这里同样也不展开讲了，比如如何使用 github pages 这些，网上应该有非常丰富的教程。

vitepress 官网的 CI 可以在[该链接](https://vitepress.dev/guide/deploy#github-pages)中找到，基于此，我做了一些简单的修改，如使用 pnpm：

```yaml
name: Deploy
on:
  workflow_dispatch: {}
  push:
    branches:
      - master
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v2
        with:
          version: 8.6.0
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm docs:build
      - uses: actions/configure-pages@v2
      - uses: actions/upload-pages-artifact@v1
        with:
          path: docs/.vitepress/dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v1
```

自动生成 ChangeLog

```yaml
on:
  push:
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10

name: Release

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: GoogleCloudPlatform/release-please-action@v3
        id: release
        with:
          token: ${{ secrets.RELEASE_TOKEN }}
          release-type: node
          package-name: standard-version
          changelog-types: '[{"type": "types", "section":"Types", "hidden": false},{"type": "revert", "section":"Reverts", "hidden": false},{"type": "feat", "section": "Features", "hidden": false},{"type": "fix", "section": "Bug Fixes", "hidden": false},{"type": "improvement", "section": "Feature Improvements", "hidden": false},{"type": "docs", "section":"Docs", "hidden": false},{"type": "style", "section":"Styling", "hidden": false},{"type": "refactor", "section":"Code Refactoring", "hidden": false},{"type": "perf", "section":"Performance Improvements", "hidden": false},{"type": "test", "section":"Tests", "hidden": false},{"type": "build", "section":"Build System", "hidden": false},{"type": "ci", "section":"CI", "hidden":false},{"type": "chore", "section":"Chore", "hidden":false}]' 
```

上述 CI 脚本你可以在[该链接](https://github.com/Justin3go/justin3go.github.io/tree/master/.github/workflows)中找到

## 最后

感谢点赞，感谢⭐star⭐ >> [github](https://github.com/Justin3go/justin3go.github.io)，访问我的博客>>[justin3go.com](https://justin3go.com)，本次分享到这里也就结束了，已经又有好久没写博客了，今年定下了每月 4 篇+文章输出的目标，上个月 11 号写完四篇就再也没写过了😂
