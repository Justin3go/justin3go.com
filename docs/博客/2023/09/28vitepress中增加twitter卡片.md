# vitepress中增加twitter/x卡片

## 前言

最近看到[这样一篇博客](https://www.toobug.net/article/web/2022/add-twitter-card-for-blog.html)，做的功能就是在将博客链接分享到twitter/x，比如像下图这样：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230928160327.png)

下面分享一下如何实现该功能

## twitter/x要求的

要开始实施卡片标记，只需将以下HTML标记添加到页面的HEAD部分，以指定内容的卡片类型：

```html
<meta name="twitter:card" content="summary"></meta>
```

卡片属性是简单的键值对，每个属性在HTML的meta标签中定义，如上所示。属性的组合定义了Twitter上的整体卡片体验，每种卡片类型都支持并需要一组特定的属性。

所有卡片都有一个共同的基本属性 - 卡片类型值：

|卡片属性|描述|
|---|---|
|`twitter:card`|卡片类型将是“summary”、“summary_large_image”、“app”或“player”之一。|

每页只支持一种卡片类型。如果页面中存在多个 `twitter:card` 值，则按顺序排列的“最后一个”将优先考虑。

详细信息可以查看[twitter的开发者文档](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)

此时你检查我的网站，你可以查看到我添加了这些`meta`标签

```html
<meta property="og:url" content="https://justin3go.com/博客/2023/02/04Vue3相关原理梳理.html">
<meta property="og:title" content="一文梳理Vue3核心原理">
<meta property="og:description" content="坚持深耕技术领域的T型前端程序员, 喜欢Vuejs、Nestjs, 还会点python、nlp、web3、后端">
<meta property="og:image" content="https://justin3go.com/ava.jpg">
<meta name="twitter:card" content="summary">
<meta name="twitter:description" content="坚持深耕技术领域的T型前端程序员, 喜欢Vuejs、Nestjs, 还会点python、nlp、web3、后端">
<meta name="twitter:image:src" content="https://justin3go.com/ava.jpg">
```

其中由于笔者自己原因(懒)，每篇博客中都没有摘要和封面图，所以这里封面图就固定使用的头像，description固定使用整个站点的description

需要注意的是，每篇文章的meta信息并不是相同的，就像上述的`og:title`一样，需要动态的添加。

此时我们就来到`vitepress`这边

## vitepress提供的

翻看这两个issue：[#504](https://github.com/vuejs/vitepress/issues/504)，[#551](https://github.com/vuejs/vitepress/issues/551)

我们可以发现这个需求很早就有人做过了，其中关键信息就是vitepress提供了这样一个钩子[transformhead](https://vitepress.dev/reference/site-config#transformhead)供我们自定义页面级别（而非站点级别）的`meta`信息

> `transformHead` 是一个构建钩子，在生成每个页面之前对头部进行转换。它允许您添加无法静态添加到VitePress配置中的头部条目。**您只需要返回额外的条目，它们将自动与现有条目合并**。

```ts
export default {
  async transformHead(context) {
    // ...
  }
}
```

其中context的关键类型如下：

```ts
interface TransformContext {
    page: string;
    siteConfig: SiteConfig;
    siteData: SiteData;
    pageData: PageData;
    title: string;
    description: string;
    head: HeadConfig[];
    content: string;
    assets: string[];
}

export interface PageData {
  relativePath: string
  filePath: string // differs from relativePath in case of path rewrites
  title: string
  titleTemplate?: string | boolean
  description: string
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## 我们要做的

所以，现在我们要做的事就十分清楚了：

1. 在config中添加这个钩子
2. 在这个钩子中获取相应的页面信息：title、url等
3. 将这些信息组装成`HeadConfig[]`，然后返回即可

1）在config中添加这个钩子

`.vitepress/config.ts`，[点击查看详细代码](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/config.ts#L46)

```ts
import { handleHeadMeta } from './utils/handleHeadMeta';

export default defineConfig({
    // ...
	async transformHead(context) {
        return handleHeadMeta(context)
    },
    // ...
})
```

2&3）handleHeadMeta函数

`.vitepress/utils/handleHeadMeta.ts`，[点击查看详细代码](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/utils/handleHeadMeta.ts)

```ts
import { type HeadConfig, type TransformContext } from "vitepress";

// 处理每个页面的元数据
export function handleHeadMeta(context: TransformContext) {
  const { description, title, relativePath } = context.pageData;
  // 增加Twitter卡片
  const ogUrl: HeadConfig = ["meta", { property: "og:url", content: addBase(relativePath.slice(0, -3)) + '.html' }]
  const ogTitle: HeadConfig = ["meta", { property: "og:title", content: title }]
  const ogDescription: HeadConfig = ["meta", { property: "og:description", content: description || context.description }]
  const ogImage: HeadConfig = ["meta", { property: "og:image", content: "https://justin3go.com/ava.jpg" }]
  const twitterCard: HeadConfig = ["meta", { name: "twitter:card", content: "summary" }]
  const twitterImage: HeadConfig = ["meta", { name: "twitter:image:src", content: "https://justin3go.com/ava.jpg" }]
  const twitterDescription: HeadConfig = ["meta", { name: "twitter:description", content: description || context.description }]

  const twitterHead: HeadConfig[] = [
    ogUrl, ogTitle, ogDescription, ogImage,
    twitterCard, twitterDescription, twitterImage,
  ]

  return twitterHead
}

export function addBase(relativePath: string) {
  const host = 'https://justin3go.com'
  if (relativePath.startsWith('/')) {
    return host + relativePath
  } else {
    return host + '/' + relativePath
  }
}
```

好了，大功告成，是不是非常的简单，快去给你的博客网站也加上吧~

## 最后

如果复制链接twitter中仍然不显示卡片，请清空缓存刷新一下你的网站，具体可以[参考twitter的开发者文档](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started#crawling)进行排查



