---
title: 给 vitepress 博客里增加一个 RSS 订阅
date: 2023-06-18
tags: 
  - VitePress
  - RSS
  - Fluent Reader
  - feed
  - buildEnd
---

# 给 vitepress 博客里增加一个 RSS 订阅

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者最近在优化自己的 VitePress 博客时，增加了一个 RSS 订阅功能，以便更好地满足日益增长的阅读需求。为此，我选择了开源的 RSS 阅读软件 Fluent Reader，并鼓励读者分享他们的推荐软件。文章详细介绍了如何使用 RSS，强调其主动获取信息的优势，并提供了在 VitePress 中创建 RSS 的具体步骤。

通过使用`feed` npm 包，笔者展示了如何生成符合 RSS 标准的 XML 文件。具体步骤包括读取所有文章列表、生成 RSS 条目，并在`buildEnd`钩子中调用生成函数。示例代码中展示了如何提取日期、标题及内容，确保仅保留最近三篇文章。最后，笔者邀请读者访问其开源仓库，期待大家的关注与反馈。

<!-- DESC SEP -->

## 前言

最近花了点时间优化了自己的之前做的 vitepress，主要就是增加了一个 RSS 订阅的功能，以及针对移动端不能显示视频的降级处理。感觉可能是最近的阅读需求增加，光逛社区似乎已经不能满足我的阅读需求了，所以就去找了一些优质的个人博客并加入了 RSS 订阅，然后就顺便给自己的博客也加了个 RSS 订阅链接。

> 我使用的 RSS 阅读软件是[fluent-reader](https://hyliu.me/fluent-reader/)，看网上挺推荐的，并且也是开源的，所以先拿来用用。当然，我也才开始使用 RSS 这种阅读方式，如果大家有更推荐的 RSS 软件，希望不要保留！

## 如何使用

本小章节主要针对没有使用过 RSS 的读者，RSS 的使用非常简单，优点也很明显，信息是主动获取，而非算法推荐。我也没去找什么 RSS 订阅源推荐，而是遇到自己喜欢的个人博客就将其加入订阅，讲究一个细水长流...

比如在[我的博客](https://justin3go.com/)中右上角有一个 RSS 的图标，点击进去就是对应的 RSS 订阅 URL：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230618105116.png)

然后复制这个链接，进入任意一个 RSS 阅读器导入即可，这里以 Fluent Reader 为例：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230618105231.png)

导入之后就可以在该阅读器的阅读列表中找到对应的文章，比如我的博客设置的是最近三篇的文章：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230618105340.png)

## Vitepress 中增加 RSS

接下来就进入正题，如何在 vitepress 中增加 RSS。首先认识一下 RSS，RSS 通常是一个 XML 文档，其中包含一系列项目或条目，每个条目都有标题、摘要、发布日期和链接等元数据：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230618105847.png)

所以我们要做的就是在 vitepress 中读取所有文章列表，然后根据对应的文章数据生成该结构的 XML 文件就可以了，得益于 vitepress 的 buildEnd 钩子以及 feed 的 npm 包，我们可以非常方便的实现这个功能。

```shell
pnpm add -D feed
```

值得注意的是，笔者并没有对每篇文章设置单独的[Frontmatter](https://vitepress.dev/guide/frontmatter#accessing-frontmatter-data)，但笔者的 URL 中包含了日期，标题等数据，所以你可能需要根据自己的实际情况进行调整，应该也非常简单，改改变量就可以了。

在合适的位置创建一个`rss.ts`文件，比如`.vitepress/utils/rss.ts`，然后这是笔者的一个 RSS 文件创建逻辑：

```ts
import path from "path";
import { writeFileSync } from "fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

const hostname = "https://justin3go.com";

export async function createRssFile(config: SiteConfig) {
	const feed = new Feed({
		title: "Justin3go's Blog-🖊",
		description: "坚持深耕技术领域的 T 型前端程序员, 喜欢 Vuejs、Nestjs, 还会点 python、nlp、web3、后端",
		id: hostname,
		link: hostname,
		language: "zh-CH",
		image: "https://oss.justin3go.com/justin3goAvatar.png",
		favicon: `https://oss.justin3go.com/justin3goAvatar.ico`,
		copyright: "Copyright© 2021-present 渝 ICP 备 2021006879 号",
	});

	const posts = await createContentLoader("博客/**/*.md", {
		excerpt: true,
		render: true,
	}).load();

	posts.sort((a, b) => Number(+getDate(b.url) - +getDate(a.url)));

	for (const { url, excerpt, html } of posts) {
    // 排除 index.md 与 2022|2021|2020 发布的文章
    if(url.search(/index|202[0-2]/) >= 0) {
      continue;
    }
    // 仅保留最近 3 篇文章
    if(feed.items.length >= 3) {
      break;
    }
		const lastStr = url.split('/').pop();
		const title = lastStr?.substring(2, lastStr.length - 5) || ''
		feed.addItem({
			title,
			id: `${hostname}${url}`,
			link: `${hostname}${url}`,
			description: excerpt,
			content: html,
			author: [
				{
					name: "Justin3go",
					email: "justin3go@qq.com",
					link: "https://justin3go.com",
				},
			],
			date: getDate(url),
		});
	}

	writeFileSync(path.join(config.outDir, "feed.xml"), feed.rss2(), "utf-8");
}

export function getDate(url: string) {
	return new Date(url.substring(4, 14));
}

```

其中`getDate`是根据 url 获取日期，因为我的 url 中包含了我写文章的日期，你可以自行修改，比如上述代码中的`posts item`还包含`frontmatter`属性，如果你在文章内部设置了日期，就可以通过这个属性获取。

最后，我们再在 biuldEnd 钩子里面调用这个函数就可以了：

`config.ts`里:

```ts
import { defineConfig } from "vitepress";
import { createRssFile } from "./utils/rss";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	// ...
	buildEnd: createRssFile,
```

## 最后

本博客源码已开源，可以在[这个仓库](https://github.com/Justin3go/justin3go.github.io)中找到，欢迎⭐star⭐，后续我也会持续维护该仓库，增加一些可能有意思的功能...

也欢迎大家订阅我的[RSS 源](https://justin3go.com/feed.xml)



