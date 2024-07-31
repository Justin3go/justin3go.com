---
title: 给 vitepress 增加短链接生成功能
date: 2023-08-18
tags: 
  - vitepress
  - 短链接
  - MD5
  - 截断
  - 递归
  - 侧边栏
---

# 给 vitepress 增加短链接生成功能

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中介绍了为 VitePress 博客增加短链接生成功能的过程。最初，笔者希望通过语义化 URL 来优化链接，但由于包含中文字符的长链接变得过于复杂，决定实现短链接以便于分享。短链接的生成采用 MD5 截断算法，确保同一 URL 生成的短链接始终一致。笔者实现了长链接与短链接之间的映射，并通过递归遍历 VitePress 的侧边栏生成链接。

此外，笔者创建了一个跳转页面和一个复制短链接的按钮，使用户可以方便地获取短链接。这些功能的实现充分利用了 VitePress 的高扩展性，笔者通过简单的代码示例展示了具体实现。最终，笔者希望通过这种方式提升博客的分享体验，并计划每月写至少四篇博客。

<!-- DESC SEP -->

## 前言-背景

由于笔者的 URL 路径中带有中文，最开始的目的就是想要语义化 URL，所以是以日期+文章标题为 URL 的，比如像这样：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230818141015.png)

看起来就非常不错，但是一旦 URL 编码之后（想要复制链接分享出去），这串 URL 将又臭又长，如下：

```
https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/08/17%E6%B5%85%E8%B0%88%E6%90%9C%E7%B4%A2%E5%BC%95%E6%93%8E%E5%8E%9F%E7%90%86.html
```

终于，今天笔者忍不了了，想着来使用短链接来优化一下，大致想了想思路，嗯！可以做~

话不多说，先演示：

![](https://oss.justin3go.com/blogs/%E9%9D%99%E6%80%81%E5%8D%9A%E5%AE%A2%E7%9F%AD%E9%93%BE%E6%8E%A5%E5%8A%9F%E8%83%BD%E6%BC%94%E7%A4%BA.gif)
## 概述

简单介绍一下短链接是什么，其实看了背景你也应该就知道了，就是为了社交平台中传播分享，将那些又臭又长的链接映射为可爱的短链接，然后用户访问该短链接时，即可自动跳转到对应的长链接页面上。

与平常常见的短链接服务不一样，笔者这里需要实现的短链接功能仅仅运用在自己的静态博客上，所以会简单许多，比如：

1. 由于目前加起来也才 100 多篇文章，笔者这辈子都不用考虑哈希碰撞
2. 静态博客，所以短链接与长链接的映射关系直接静态存储，无需持久化存储，每次使用直接重新生成即可
3. 安全？不管不管
4. 性能？不管不管
5. 监控？做这干嘛

确实是简单了非常多😅
## 哈希算法选用

### 全局自增序列算法

其实最开始笔者考虑的是使用全局自增序列算法，就是和数据库中的自增 ID 是一样的，然后再将 10 进制转换为 62 进制就可以了（62 进制代表 0-9、大小写字母 a-z）这样，仅 3 位就可以表示`62^3=238,328`这么多链接了，八辈子都够用了。

并且由于是静态博客，也不需要担心被人遍历爬取这类的安全性考虑，可谓是简单又好用。

但是，有一个问题就是每次短链接与长链接的映射关系**是重新生成的，但文章的顺序是变化的**，当笔者新增一篇文章之后，意味着有可能同一个长链接在之前生成的短链接与现在生成的将会不一致。

这个不一致性问题就非常大了，比如我分享给朋友的文章是 a 文章，然后我更新了，他过几天看就成了 x 文章了

所以，该算法不可取，就需要选用同一个 URL 无论多少次生成的短链接，只要 URL 不变，那短链接都是一致的，所以这里选用下面这种方案--MD5 截断算法
### MD5 截断算法

得益于 JS 的库非常丰富，实现起来也非常简单，就是一个 MD5 算法将长连接进行摘要处理，由于会生成 32 位字符，所以继续截断前 11 位字符作为短链接的 key：

```shell
# install
pnpm add blueimp-md5
pnpm add -D @types/blueimp-md5
```

```ts
// import 
import md5 from "blueimp-md5";
```

```ts
// use
const shortUrl = md5(link).slice(0, 11);
```

## 生成 short2long 及 long2short 键值对

这步就是通过递归遍历 vitepress 的 sideBar，提取除其中所有链接，生成对应的短链接，并保存键值对，如下代码供参考：

```ts
import { TAB, createSidebar } from "./createSidebar";
import md5 from "blueimp-md5";

export interface IShortUrlMap {
	[key: string]: string;
}

export function createShortUrlMap() {
	const allSideBar = createSidebar();
	const tabs = Object.keys(allSideBar) as TAB[];
	const long2short: IShortUrlMap = {};
	const short2long: IShortUrlMap = {};
	function findItems(items: (typeof allSideBar)[TAB.BLOG]) {
		for (const item of items) {
			if (item["items"]) {
				findItems(item["items"]);
			} else {
				const link = item.link;
				const shortUrl = md5(link).slice(0, 11);
				long2short[link] = shortUrl;
				short2long[shortUrl] = link;
			}
		}
	}
	tabs.forEach((tab) => {
		findItems(allSideBar[tab]);
	});

	return [long2short, short2long];
}

export const [long2short, short2long] = createShortUrlMap();
```

以上所有代码都可以在[该仓库](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/utils/shortUrl.ts)找到

键值对映射大约长这个样子：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230818150406.png)
## 创建跳转页面

得益于`vitepress`的简单易用，一个`.md`文件对应一个`html`页面，所以我们在`docs/`下创建一个`s.md`文件，内容如下：

```vue
---
layout: false
---

<jump-link></jump-link>

<script lang="ts" setup>
import jumpLink from './.vitepress/theme/views/jumpLink.vue'
</script>
```

同样，[仓库位置点击这里](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/s.md)

然后，创建一个`jumpLink`组件，路径上述文件已经表明，具体代码如下：

> 非常简单，就是去除`short2long`中的原始链接，然后跳转即可...

```vue
<template>
	<div class="jump-link-container">
		<div class="center">
			<img class="loading" src="/loading.gif" alt="" />
			正在跳转中...
		</div>
	</div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { short2long } from "../../utils/shortUrl";

onMounted(() => {
  console.log("short2long: ", short2long)
	const shortUrl = getQueryParam("u");
	if (!shortUrl) return;
	setTimeout(() => {
		window.location.href = short2long[shortUrl] + '.html';
	}, 1000);
});

function getQueryParam(param: string) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == param) {
			return pair[1];
		}
	}
	return false;
}
</script>
<style scoped>
.jump-link-container {
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
}
.center {
	text-align: center;
}
</style>
```

## 添加按钮-复制短链接

到这里了，那用户该怎么获取每篇文章的短链接呢？所以需要给每篇文章所在的页面增加一个复制按钮，同样得益于`vitepress`的高扩展性，添加全局 button 是如此的简单。

### 1.button 效果

逻辑代码部分也非常简单，就是取得路径，获取长链接的 key，然后找到对应的短链接，并复制到剪贴板即可，这里简单加了一个复制成功的文字变化和防抖效果。

```ts
<template>
	<div class="share-container">
		<button class="btn" @click="share" type="button">
			<strong>{{ btnText }}</strong>
			<div id="container-stars">
				<div id="stars"></div>
			</div>
			<div id="glow">
				<div class="circle"></div>
				<div class="circle"></div>
			</div>
		</button>
	</div>
	<div class="empty"></div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { long2short } from "../../utils/shortUrl";
import { copyText } from "../../utils/copyText";

const btnText = ref("复制短链接");
let timer: any;

async function share() {
	clearTimeout(timer)
	const path = window.location.pathname;
	const key = decodeURI(path).split(".html")[0];
	const shortUrl = long2short[key];
	copyText(`${window.location.host}/s?u=${shortUrl}`)
	btnText.value = "复制成功√";
	timer = setTimeout(() => {
		btnText.value = "复制短链接";
	}, 2000);
}
</script>
<style scoped>
.share-container {
	padding: 20px;
}
.btn {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 8rem;
	overflow: hidden;
	height: 3rem;
	background-size: 300% 300%;
	backdrop-filter: blur(1rem);
	border-radius: 5rem;
	transition: 0.5s;
	animation: gradient_301 5s ease infinite;
	border: double 4px transparent;
	background-image: linear-gradient(#212121, #212121),
		linear-gradient(137.48deg, #ffdb3b 10%, #fe53bb 45%, #8f51ea 67%, #0044ff 87%);
	background-origin: border-box;
	background-clip: content-box, border-box;
}

#container-stars {
	position: absolute;
	z-index: -1;
	width: 100%;
	height: 100%;
	overflow: hidden;
	transition: 0.5s;
	backdrop-filter: blur(1rem);
	border-radius: 5rem;
}

strong {
	z-index: 2;
	font-family: "Avalors Personal Use";
	font-size: 12px;
	letter-spacing: 5px;
	color: #ffffff;
	text-shadow: 0 0 4px white;
}

#glow {
	position: absolute;
	display: flex;
	width: 12rem;
}

.circle {
	width: 100%;
	height: 30px;
	filter: blur(2rem);
	animation: pulse_3011 4s infinite;
	z-index: -1;
}

.circle:nth-of-type(1) {
	background: rgba(254, 83, 186, 0.636);
}

.circle:nth-of-type(2) {
	background: rgba(142, 81, 234, 0.704);
}

.btn:hover #container-stars {
	z-index: 1;
	background-color: #212121;
}

.btn:hover {
	transform: scale(1.1);
}

.btn:active {
	border: double 4px #fe53bb;
	background-origin: border-box;
	background-clip: content-box, border-box;
	animation: none;
}

.btn:active .circle {
	background: #fe53bb;
}

#stars {
	position: relative;
	background: transparent;
	width: 200rem;
	height: 200rem;
}

#stars::after {
	content: "";
	position: absolute;
	top: -10rem;
	left: -100rem;
	width: 100%;
	height: 100%;
	animation: animStarRotate 90s linear infinite;
}

#stars::after {
	background-image: radial-gradient(#ffffff 1px, transparent 1%);
	background-size: 50px 50px;
}

#stars::before {
	content: "";
	position: absolute;
	top: 0;
	left: -50%;
	width: 170%;
	height: 500%;
	animation: animStar 60s linear infinite;
}

#stars::before {
	background-image: radial-gradient(#ffffff 1px, transparent 1%);
	background-size: 50px 50px;
	opacity: 0.5;
}

@keyframes animStar {
	from {
		transform: translateY(0);
	}

	to {
		transform: translateY(-135rem);
	}
}

@keyframes animStarRotate {
	from {
		transform: rotate(360deg);
	}

	to {
		transform: rotate(0);
	}
}

@keyframes gradient_301 {
	0% {
		background-position: 0% 50%;
	}

	50% {
		background-position: 100% 50%;
	}

	100% {
		background-position: 0% 50%;
	}
}

@keyframes pulse_3011 {
	0% {
		transform: scale(0.75);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
	}

	100% {
		transform: scale(0.75);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
	}
}
</style>
```

[仓库位置](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/share.vue)

### 2.复制到剪贴板

这部分全部使用[张旭鑫博客中提到的代码](https://www.zhangxinxu.com/wordpress/2021/10/js-copy-paste-clipboard/)

具体如下，[仓库位置](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/utils/copyText.ts)：

```ts
export function copyText(text: string) {
	if (navigator.clipboard) {
		// clipboard api 复制
		navigator.clipboard.writeText(text);
	} else {
		var textarea = document.createElement("textarea");
		document.body.appendChild(textarea);
		// 隐藏此输入框
		textarea.style.position = "fixed";
		textarea.style.clip = "rect(0 0 0 0)";
		textarea.style.top = "10px";
		// 赋值
		textarea.value = text;
		// 选中
		textarea.select();
		// 复制
		document.execCommand("copy", true);
		// 移除输入框
		document.body.removeChild(textarea);
	}
}
```

### 3.全局增加该组件

这里就能[`vitepress`的优势之一](https://vitepress.dev/guide/extending-default-theme#layout-slots)了，非常简单：

[仓库位置](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/index.ts)

```ts{15}
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import share from "./components/share.vue"

export default {
	...Theme,
	Layout: () => {
		return h(Theme.Layout, null, {
			// ...
			"aside-top": () => h(share)
		});
	},
	// ...
};
```

## 最后

今年目标是每个月写至少 4 篇博客，上两个月由于各种原因(借口)没达到目标，这个月争取写满 4 篇！😁