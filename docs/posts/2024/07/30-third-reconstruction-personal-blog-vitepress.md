---
title: 第三次重构个人博客（基于 Vitepress）
date: 2024-07-30
tags: 
  - 博客
  - Vitepress
  - Cloudflare
  - Giscus
  - RSS
  - TDesign
---
# 第三次重构个人博客（基于 Vitepress）

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中记录了自己第三次重构个人博客的过程，基于 Vitepress 进行了一系列的改进和优化。自 2022 年初开始使用 Vitepress 搭建博客，随着版本的更新，笔者逐渐感受到原有风格的不适，决定进行重新设计。本次重构的主要内容包括：

1. **首页设计**：采用简单的博客分页列表，利用`createContentLoader`提取文章摘要等信息。
2. **部署与域名管理**：将博客从 Github Pages 迁移至 Cloudflare Pages，并更改 DNS 服务器。
3. **国际化支持**：实现 Vitepress 和评论系统 Giscus 的国际化，支持中英双语。
4. **内容迁移**：对博客文章进行迁移，生成摘要和标签，确保旧路径的兼容性以避免外链失效。
5. **优化用户体验**：自定义字体并进行预加载，提升页面加载速度。

通过这些调整，笔者希望博客不仅在内容上丰富，同时在视觉和使用体验上也能给读者带来更好的感受。最终，笔者强调了博客设计对写作心情的重要性，认为整理环境能够促进创作灵感的流动。

<!-- DESC SEP -->

## 前言

欢迎来到笔者的第三次博客折腾记录！生命不息，折腾不止~

从 2022 年 01 月开始用 Vitepress 搭建我的博客网站，那时候 Vitepress 才 0.XX 版本，还没有正式发布呢。当时关于 Vitepress 的资料也非常少，网上一搜全是关于 Vuepress 的，官方文档也不完善；

后面 Vitepress 发布了 1.0 的 Beta 版本，我将我的个人博客几乎重做了一遍，比如重新做了首页，最近发布的文章，评论从 Gitalk 转到 Giscus，用 Vitepress 自带的本地搜索而非使用第三方搜索插件等等；

最近一段时间，其实也没有什么契机，就越来越看自己的博客不顺眼了，又花又丑，可能自己喜欢的风格变化了吧，甚至影响到我想写博客的心情了；

所以，那就继续折腾吧，以简单顺眼为主。

## 概览

在线地址：[justin3go.com](https://justin3go.com/)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240730212505.png)

本次博客折腾大约做了这些事情，这里先简单总结一下：

1. 首页采取简单直接的博客分页列表，使用`createContentLoader`提取所有博客的摘要、标签、时间等信息，同时解决了 aside 在 page 变化后不更新的问题
2. 部署方式由 Github Page 更改为 Cloudflare Pages
3. 域名 DNS 服务器从阿里云迁移到 Cloudflare
4. 兼容以前的中文路径，将`/博客/**`及`/笔记/**`自动重定向到`/posts/**`和`/notes/**`，避免丢失外链
5. Vitepress 的国际化
6. Giscus 国际化及深浅切换，以及中英多语言时使用同一个评论框
7. RSS 国际化
8. TDesign 国际化及深浅切换
9. 自定义正文字体，以及字体预加载，导入非默认字体的 theme 以减少体积
10. 博客文章迁移、摘要标签生成，Giscus 评论迁移等体力活

当然还有一些以前就存在的功能，搬来用了，比如：

1. [大图预览](https://justin3go.com/posts/2023/09/29vitepress%E4%B8%AD%E5%BC%95%E5%85%A5Tdesign%E5%B9%B6%E5%85%A8%E5%B1%80%E5%A2%9E%E5%8A%A0%E5%A4%A7%E5%9B%BE%E9%A2%84%E8%A7%88)
2. [OG 元信息生成以及 Twitter 卡片](https://justin3go.com/posts/2023/09/28vitepress%E4%B8%AD%E5%A2%9E%E5%8A%A0twitter%E5%8D%A1%E7%89%87)
3. [主题样式美化（也可能是丑化）](https://github.com/Justin3go/justin3go.com/blob/release/docs/.vitepress/theme/style.css)

好，接下来容我慢慢道来，也可以直接跳转到你感兴趣的目录。

## Vitepress 的国际化

这里简单了解一下 Vitepress 相关的知识，以便后续使用。当然，这些在[官方文档](https://vitepress.dev/zh/guide/i18n)中也有更为详细的介绍。

vitepress 根据目录及文件生成对应路劲的静态内容，比如`/posts/blog-1.md`则会生成`/posts/blog-1.html`，然后部署后就可以通过`your-domain/posts.blog-1.html`访问。

在 Vitepress 国际化时，你需要按照如下的目录配置：

```
docs/
├─ en/
│  ├─ foo.md
├─ foo.md
```

对应刚才的例子，如果你需要英文的国际化，则是`/en/posts/blog-1.md`这个目录下添加对应的英文博客内容。

之后，在 config 目录下，创建不同语言的不同配置即可，这里以中文为主要语言，更多配置[查看仓库](https://github.com/Justin3go/justin3go.com/tree/release/docs/.vitepress/config)：

```ts
import { defineConfig } from 'vitepress'

import shared from './shared'
import en from './en'
import zh from './zh'

export default defineConfig({
  ...shared,
  locales: {
    root: { label: '简体中文', ...zh },
    en: { label: 'English', ...en },
  }
})
```

## 首页博客分页列表实现

总体来说就分为如下两步：

1. 获取数据
2. 展示数据

### 1.获取数据

获取数据我们可以通过[Vitepress 提供的`createcontentloader`](https://vitepress.dev/zh/guide/data-loading#createcontentloader)来快捷获取某个目录下的所有文章。

> 该辅助函数接受一个相对于[源目录](https://vitepress.dev/zh/guide/routing#source-directory)的 glob 模式，并返回一个 `{ watch, load }` 数据加载对象，该对象可以用作数据加载文件中的默认导出。
> 
> 加载的数据将作为 JSON 内联在客户端 bundle 中。

我们创建一个`posts.data.mts`文件作为数据加载文件，然后将`createcontentloader`返回的对象作为默认导出，里面做一些文章数据的提取和转换，有这些：

- 摘要自定义提取函数`excerptFn`，后续会讲到
- 获取 frontmatter 中的 title、date、tags 等所需数据
- 将 date 转换，并按 date 排序文章

代码如下（省略了类型文件）：

```ts
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/**/*.md', {
  excerpt: excerptFn,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        url,
        excerpt,
        date: formatDate(frontmatter.date),
        tags: frontmatter.tags
      }))
      .sort((a, b) => b.date.time - a.date.time)
  }
})

function excerptFn(file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) {
  file.excerpt = file.content.split('<!-- DESC SEP -->')[1];
}

function formatDate(raw: string): Post['date'] {
  const date = new Date(raw)
  date.setUTCHours(12)
  return {
    time: +date,
    string: date.toLocaleDateString('zh-Hans', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
}
```

其中`excerptFn`是我自定义的摘要提取函数，用于识别被两个`<!-- DESC SEP -->`符号包裹的内容，最终提取出来并保存在数组中，需要的格式是这样：

```
# 标题

<!-- DESC SEP -->
这是一段摘要
<!-- DESC SEP -->

一些正文内容
```

同时，为了国际化，不同的首页需要不同文件夹下的数据，所以继续创建一个`posts-en.data.mts`文件，大致内容和上方一样，改了读取的目录以及时间格式化的参数为`en-US`。

### 2. 展示数据

接下来就是展示数据，我们将代码写在`index.md`中，英文的首页则是在`/en/index.md`中，当然，如果你设置的国际化 root 路径不是中文，则目录将有所不同。

之所以将代码写在`index.md`中，是因为如果全部封装到一个 Vue 组件里，再导入到`index.md`中，会导致 Aside 在页面换页时不刷新，具体可以查看这个[Iusse #2686](https://github.com/vuejs/vitepress/issues/2686)

代码具体内容较简单，一个循环渲染当页的文章列表+一个分页器搞定（省略了样式文件）：

```vue
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
    :showPageNumber="!isMobile()"
    :showJumper="isMobile()"
    @current-change="onCurrentChange"
  />
</div>

<script lang="ts" setup>
import { ref, computed } from "vue";
// 非 Vue 组件需要手动引入
import {
	MessagePlugin,
	PaginationProps,
	Pagination as TPagination,
  Tag as TTag,
} from "tdesign-vue-next";

import { data as posts } from "./.vitepress/theme/posts.data.mts";
import { isMobile } from "./.vitepress/theme/utils/mobile.ts";

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
```

这里使用的是`<h2>`来渲染标题而非`## title`，以及直接写的`<a>`来增加锚点，是因为直接使用 markdown 语法是有问题的，会导致锚点无法正确提取，所以使用 html 手动实现。

具体可以看这个[Iusse #3133](https://github.com/vuejs/vitepress/issues/3133)

除此之外，这里还做了一些细节上的优化，如：

- 移动端时分页器简化显示
- 将分页参数同步到浏览器 url 之中
- 分页后滚动到页面顶部

`/en/index.md`的内容也差不多，只是导入的是刚才创建的`posts-en.data.mts`，然后 TDesgin 使用对应的英文语言包，像这样：

```ts
import enConfig from 'tdesign-vue-next/es/locale/en_US';
```

```html
<t-config-provider :global-config="enConfig">
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
</t-config-provider>
```

## 域名 DNS 的迁移及部署方式改变

由于之后打算写英文博客，面向全球用户，所以将我的域名`justin3go.com`交给了 Cloudflare 来管理。同时，也方便后续直接在 Cloudflare Pages 部署及绑定域名。

至于为什么要从 Github Pages 更换到 Cloudflare Pages，主要原因是 Github Pages 没有分支在线预览的功能，这点挺关键的，经常会在线验证一些东西。

迁移过程非常简单，以阿里云迁移 Cloudflare 为例，位置在`域名控制台 -> 域名列表 -> 点击管理按钮`，然后就进入如下这个页面，将 DNS 服务器修改为 Cloudflare 提供的服务器即可：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240730092930.png)

至于 Cloudflare 哪里，直接点击右上角的添加站点即可，然后跟随指导一步步来就能拿到对应的 DNS 服务器地址：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240730093159.png)


## 兼容以前的中文路径

这次，为了国际化（英文的时候不显示中文的路径）我将基础路径`/博客/`与`/笔记/`更改为了`/posts/`与`/notes/`。

但这回导致一个问题，即几乎丢失了所有的外链，别人从其他地方点击链接进入几乎必然 404，所以我们需要做重定向处理，这里使用了[Vitepress 提供的`onBeforeRouteChange`](https://vitepress.dev/zh/reference/runtime-api#userouter)

代码如下（省略不相关代码）：

```ts
export default {
	enhanceApp({ app, router }) {
		router.onAfterRouteChanged = (to: string) => {
			// 兼容旧博客的中文路径，重定向到新路径，避免外链失效
			if (to.startsWith(encodeURI('/博客/'))) {
				const newUrl = to.replace(encodeURI('/博客/'), '/posts/')
				window.location.href = newUrl
			}

			if (to.startsWith(encodeURI('/笔记/'))) {
				const newUrl = to.replace(encodeURI('/笔记/'), '/notes/')
				window.location.href = newUrl
			}
		}
	},
};
```

这里需要注意中文路径需要做 url 编码，否者匹配不到就执行不到对应的逻辑了。

## Giscus 国际化

这里，我需要实现两个功能：

1. Giscus 中的组件文本需要跟随国际化
2. 不同语言还是使用一个评论

### 1. 组件文本国际化

1. 我们通过当前页面的路劲是否是`/en`开头来判断是否为英文
2. 如果是英文，则传递 Giscus 对应英文的参数

关键代码如下：

```ts
const lang = computed(() => route.path.startsWith("/en") ? 'en' : 'zh-Hans');
```

```html{14}
<Giscus
	v-if="showComment"
	repo="Justin3go/justin3go.com"
	repo-id="R_kgDOJq6kjw"
	category="Announcements"
	category-id="DIC_kwDOJq6kj84CW7-L"
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
```

### 2. 不同语言共享评论

这里我们使用 Giscus 映射模式中的特定字符串模式，以达到定制需求。

```html{7,8}
<Giscus
	v-if="showComment"
	repo="Justin3go/justin3go.com"
	repo-id="R_kgDOJq6kjw"
	category="Announcements"
	category-id="DIC_kwDOJq6kj84CW7-L"
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
```

为了共享同一个评论，不同国际化页面需要有相同的唯一表示，其中 term 字符串需要传递这个唯一标识，这个标识我们通过截取路径获得：

```ts
const term = computed(() => route.path.startsWith("/en") ? route.path.slice(3) : route.path);
```

## RSS 国际化

这里需要实现的功能是，读者在不同国际化页面中时，订阅链接是不同的，对应的`feed.xml`文件也是提取的相应语言下的博客列表。

基本思路如下：

1. 为不同的国际化语言生成不同的`feed.xml`文件，比如英文的叫做`feed-en.xml`
2. nav 上的 rss 链接跟随语言变化指向不同的文件

如下，是我的中文 RSS 生成方法：

```ts
import path from "node:path";
import { writeFileSync } from "node:fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

const hostname = "https://justin3go.com";

export async function createRssFileZH(config: SiteConfig) {
  const feed = new Feed({
    title: 'Justin3go',
    description: '坚持深耕技术领域的 T 型前端程序员, 关注独立开发，喜欢 Vuejs、Nestjs, 还会点 Python、搜索引擎、NLP、Web3、后端',
    id: hostname,
    link: hostname,
    language: "zh-Hans",
    image: "https://justin3go.com/ava.jpg",
    favicon: `https://oss.justin3go.com/justin3goAvatar.ico`,
    copyright: "Copyright© 2021-present Justin3go",
  });

  const posts = await createContentLoader("posts/**/*.md", {
    excerpt: true,
    render: true,
  }).load();

  posts.sort((a, b) => Number(+new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)));

  for (const { url, excerpt, html, frontmatter } of posts) {
    // 仅保留最近 5 篇文章
    if (feed.items.length >= 5) {
      break;
    }

    feed.addItem({
      title: frontmatter.title,
      id: `${hostname}${url}`,
      link: `${hostname}${url}`,
      description: excerpt,
      content: html,
      author: [
        {
          name: "Justin3go",
          email: "just@justin3go.com",
          link: "https://justin3go.com",
        },
      ],
      date: frontmatter.date,
    });
  }

  writeFileSync(path.join(config.outDir, "feed.xml"), feed.rss2(), "utf-8");
}
```

英文的基本一致，网站信息、提取目录和生成文件名变化了：

```ts
export async function createRssFileEN(config: SiteConfig) {
  const feed = new Feed({
    title: "Justin3go",
    description: "A T-shaped front-end developer who is committed to deepening expertise in the technical field, focuses on independent development, enjoys working with Vue.js and Nest.js, and has some knowledge of Python, search engines, NLP, Web3, and back-end development.",
    id: hostname,
    link: hostname,
    language: "en-US",
    image: "https://justin3go.com/ava.jpg",
    favicon: `https://oss.justin3go.com/justin3goAvatar.ico`,
    copyright: "Copyright© 2021-present Justin3go",
  });

  const posts = await createContentLoader("en/posts/**/*.md", {
    excerpt: true,
    render: true,
  }).load();

  posts.sort((a, b) => Number(+new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)));

  for (const { url, excerpt, html, frontmatter } of posts) {
    // 仅保留最近 5 篇文章
    if (feed.items.length >= 5) {
      break;
    }

    feed.addItem({
      title: frontmatter.title,
      id: `${hostname}${url}`,
      link: `${hostname}${url}`,
      description: excerpt,
      content: html,
      author: [
        {
          name: "Justin3go",
          email: "just@justin3go.com",
          link: "https://justin3go.com",
        },
      ],
      date: frontmatter.date,
    });
  }

  writeFileSync(path.join(config.outDir, "feed-en.xml"), feed.rss2(), "utf-8");
}
```

然后我们在[buildEnd](https://vitepress.dev/zh/reference/site-config#buildend)钩子中执行这两个函数以生成对应的文件。

```ts
buildEnd: (config: SiteConfig) => {
	createRssFileZH(config);
	createRssFileEN(config);
},
```

最后，不同的 config，如`zh.ts`和`en.ts`中的`socialLinks`配置不同的路径即可：

```ts
// zh.ts
socialLinks: [
// ...
	{
	icon: {
	  svg: '...',
	},
	link: "/feed.xml",
	},
],
```

```ts
// en.ts
socialLinks: [
// ...
	{
	icon: {
	  svg: '...',
	},
	link: "/feed-en.xml",
	},
],
```

## 自定义字体

这里其实[官方指南](https://vitepress.dev/zh/guide/extending-default-theme#using-different-fonts)也有较为详细的教程。

> 为了避免在生成后的输出中包含 Inter 字体，我们从 `vitepress/theme-without-fonts` 中导入主题。

`theme/index.ts`

```ts
import Theme from 'vitepress/theme-without-fonts'
```

然后，我们将自定义字体文件下载到`docs/assets/`目录下。

注意：

1. 我们可以下载`VF`后缀的变体，而不是粗细下载不同的字体文件，那样就太大了；
2. 其次，我们可以下载`woff2`后缀的经过压缩的，且现代浏览器广泛支持的字体格式。

之后，我们在样式文件通过`@font-face`引入，像这样：

```css
@font-face {
	font-family: "SourceHanSerifCN";
	src: local("SourceHanSerifCN"), url("/assets/fonts/SourceHanSerifCN-VF.woff2");
}
```

现在，你就可以像平常一样愉快地使用改字体了...

最后，我们为了提高用户体验，即加载速度，我们使用预加载字体文件的手段进行优化，这里使用[transformHead](https://vitepress.dev/zh/reference/site-config#transformhead) 构建钩子来添加对应的 head 信息：

处理 head 的函数，使用正则匹配是因为 assets 目录下的文件名会有哈希后缀。

```ts
import { type HeadConfig, type TransformContext } from "vitepress";

export function handleHeadMeta(context: TransformContext) {
  // 预加载字体
  const preloadHead: HeadConfig[] = handleFontsPreload(context)

  return [ ...preloadHead ]
}

export function handleFontsPreload({ assets }: TransformContext) {
  const SourceHanSerifCN = assets.find(file => /SourceHanSerifCN-VF\.\w+\.woff2/)
  
  if (SourceHanSerifCN) {
    return [
      [
        'link',
        {
          rel: 'preload',
          href: SourceHanSerifCN,
          as: 'font',
          type: 'font/woff2',
          crossorigin: ''
        }
      ]
    ] as HeadConfig[]
  }

  return []
}
```

在[transformHead](https://vitepress.dev/zh/reference/site-config#transformhead) 构建钩子执行这个函数：

```ts
async transformHead(context) {
	return handleHeadMeta(context)
},
```

## 最后

这次其实代码没写多少，大多数是从我以前的周刊网站、博客网站复制过来的，但博客内容的迁移及整理花费了不少的时间，比如，为每一篇文章生成摘要、标签等信息。

以前总是想着博客网站可以将就一下，要以内容为主！但后面越看越不顺眼，内容就生产不出来了。就像房间需要打扫、桌面需要整理一下一样，心情都会不一样的。