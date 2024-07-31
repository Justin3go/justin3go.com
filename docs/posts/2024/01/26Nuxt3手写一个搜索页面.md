---
title: Nuxt3 手写一个搜索页面
date: 2024-01-26
tags:
  - Nuxt
  - Vuetify
  - SSR
  - SEO
  - API
  - Analytics
  - Elasticsearch
---

# Nuxt3 手写一个搜索页面

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中分享了对之前开发的小型搜索引擎的前端重构过程，主要使用了`Nuxt`和`Vuetify`技术栈。重写的动机包括代码结构混乱、后端服务冗余以及希望通过 SSR（服务器端渲染）优化 SEO。通过重构，用户在搜索时，URL 会根据查询更新，从而提升搜索引擎的抓取效果，增加应用的曝光率。

页面布局上，笔者注重移动端优化，同时保持搜索框和结果在同一页面，简化用户体验。后端使用了两个 API 接口，分别处理搜索请求和搜索建议。笔者强调了使用`Nuxt`时开发体验的优越性，特别是在快速搭建 API 方面。

代码结构上，笔者通过组件封装简化了主页面的复杂性，并动态生成 SEO 相关的元信息，以便于分享时的展示效果。此外，文章提到集成了 Google 和百度的分析工具，便于后续的数据追踪。

总的来说，笔者对`Nuxt`的使用体验表示满意，并鼓励读者尝试这款技术。

<!-- DESC SEP -->

## 前言

前面做了一个[小型搜索引擎](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/08/29%E4%BD%A0%E6%9D%A5%E4%BD%A0%E4%B9%9F%E5%8F%AF%E4%BB%A5%E5%81%9A%E4%B8%80%E4%B8%AA%E7%BD%91%E7%9B%98%E6%90%9C%E7%B4%A2%E5%BC%95%E6%93%8E)，虽然上线了，但总体来说还略显粗糙。所以最近花了点时间打磨了一下这个搜索引擎的前端部分，使用的技术是`Nuxt`，UI 组件库使用的是`Vuetify`，关于 UI 组件库的选择，你也可以查看我之前写的[这篇对比](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/08/31%E5%8E%9F%E6%9D%A5Vue%E8%BF%98%E6%9C%89%E8%BF%99%E4%B9%88%E5%A4%9A%E5%A5%BD%E7%94%A8%E7%9A%84UI%E5%BA%93)。

本文不会介绍搜索引擎的其余部分，算是一篇前端技术文...

**重要的**：[开源地址](https://github.com/Justin3go/SearchSearchGo)，应用部分的代码我也稍微整理了一下开源了，整体来说偏简单，毕竟只有一个页面，算是真正的“单页面应用”了🤣🤣🤣

## 演示

![](https://oss.justin3go.com/blogs/recording.gif)
## 为什么要重写

这次重写的目的如下：

1. 之前写的代码太乱了，基本一个页面就只写了一个文件，维护起来有点困难；
2. 之前的后端使用 nest 单独写的，其实就调调 API，单独起一个后端服务感觉有点重；
3. 最后一点也是最重要的：**使用 SSR 来优化一下 SEO**

具体如下：

1. 比如当用户输入搜索之后，对应的 url 路径也会发生变化，比如[https://ssgo.app/?page=1&query=AI](https://ssgo.app/?page=1&query=AI)，
2. 如果用户将该 url 分享到其他平台被搜索引擎抓取之后，搜索引擎得到的数据将不再是空白的搜索框，而是包含相关资源的结果页，
3. 这样有可能再下一次用户在其他搜索引擎搜索对应资源的时候，有可能会直接跳转到该应用的搜索结果页，这样就可以大大提高该应用的曝光率。

这样，用户之后不仅可以通过搜索“阿里云盘搜索引擎”能搜到这个网站，还有可能通过其他资源的关键词搜索到该网站
## 页面布局

首先必须支持移动端，因为从后台的访问数据看，移动端的用户更多，所以整体布局以竖屏为主，至于宽屏 PC，则增加一个类似于`max-width`的效果。

其次为了整体实现简单，采取的还是搜索框与搜索结果处在一个页面，而非 google\baidu 之类的搜索框主页与结果页分别是两个页面，笔者感觉主页也没啥存在的必要（单纯对于搜索功能而言）

页面除了搜索框、列表项，还应该有 logo，菜单，最终经过排版如下图所示：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240126140916.png)

左右两边为移动端的效果演示图，中间为 PC 端的效果演示。

## nitro 服务端部分

这里只需要实现两个 API:

1. 搜索接口，如`/api/search`
2. 搜索建议的接口，如`/api/search/suggest`

说到这里就不得不夸一下 nuxt 的开发者体验，新建一个 API 是如此的方便：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240126141529.png)

对比 nest-cli 中新建一个 service/controller 要好用不少，毕竟我在 nest-cli 中基本要`help`一下。

回到这里，我的 server 目录结构如下：

```
├─api
│  └─search            # 搜索接口相关
│          index.ts    # 搜索
│          suggest.ts  # 搜索建议
│
└─elasticsearch
        index.ts       # es 客户端
```

在`elasticsearch`目录中，我创建了一个 ES 的客户端，并在`search`中使用：

```ts
// elasticsearch/index.ts

import { Client } from '@elastic/elasticsearch';

export const client = new Client({
  node: process.env.ES_URL,
  auth: {
    username: process.env.ES_AUTH_USERNAME || '',
    password: process.env.ES_AUTH_PASSWORD || ''
  }
});
```

然后使用，使用部分基本上没有做任何的特殊逻辑，就是调用 ES client 提供的 api，然后组装了一下参数就 OK 了：

```ts
// api/search/index
import { client } from "~/server/elasticsearch";

interface ISearchQuery {
  pageNo: number;
  pageSize: number;
  query: string;
}

export default defineEventHandler(async (event) => {
  const { pageNo = 1, pageSize = 10, query }: ISearchQuery = getQuery(event);

  const esRes = await client.search({
    index: process.env.ES_INDEX,
    body: {
      from: (pageNo - 1) * pageSize, // 从哪里开始
      size: pageSize, // 查询条数
      query: {
        match: {
          title: query, // 搜索查询到的内容
        },
      },
      highlight: {
        pre_tags: ["<span class='highlight'>"],
        post_tags: ['</span>'],
        fields: {
          title: {},
        },
        fragment_size: 40,
      },
    },
  });

  const finalRes = {
    took: esRes.body.took,
    total: esRes.body.hits.total.value,
    data: esRes.body.hits?.hits.map((item: any) => ({
      title: item._source.title,
      pan_url: item._source.pan_url,
      extract_code: item._source.extract_code,
      highlight: item.highlight?.title?.[0] || '',
    })),
  };

  return finalRes;
});
```

```ts
// api/search/suggest
import { client } from "~/server/elasticsearch";

interface ISuggestQuery {
  input: string;
}

export default defineEventHandler(async (event) => {
  const { input }: ISuggestQuery = getQuery(event);

  const esRes = await client.search({
    index: process.env.ES_INDEX,
    body: {
      suggest: {
        suggest: {
          prefix: input,
          completion: {
            field: "suggest"
          }
        }
      }
    },
  });

  const finalRes = esRes.body.suggest.suggest[0]?.options.map((item: any) => item._source.suggest)

  return finalRes;
});

```

值得注意的是，客户端的 ES 版本需要与服务端的 ES 版本相互对应，比如我服务端使用的是 ES7，这路也当然得使用 ES7，如果你是 ES8，这里需要安装对应版本得 ES8，并且返回参数有些变化，ES8 中上述`esRes`就没有 body 属性，而是直接使用后面的属性

## page 界面部分

首先为了避免出现之前所有代码均写在一个文件中，这里稍微封装了几个组件以使得`page/index`这个组件看起来相对简单：

```
/components
    BaseEmpty.vue
    DataList.vue
    LoadingIndicator.vue
    MainMenu.vue
    PleaseInput.vue
    RunSvg.vue
    SearchBar.vue
```

具体啥意思就不赘述了，基本根据文件名就能猜得大差不差了...

然后下面就是我的主页面部分：

```vue
<template>
	<div
		class="d-flex justify-center bg-grey-lighten-5 overflow-hidden overflow-y-hidden"
	>
		<v-sheet
			class="px-md-16 px-2 pt-4"
			:elevation="2"
			height="100vh"
			:width="1024"
			border
			rounded
		>
			<v-data-iterator :items="curItems" :page="curPage" :items-per-page="10">
				<template #header>
					<div class="pb-4 d-flex justify-space-between">
						<span
							class="text-h4 font-italic font-weight-thin d-flex align-center"
						>
							<RunSvg style="height: 40px; width: 40px"></RunSvg>
							<span>Search Search Go...</span>
						</span>
						<MainMenu></MainMenu>
					</div>
					<SearchBar
						:input="curInput"
						@search="search"
						@clear="clear"
					></SearchBar>
				</template>
				<template #default="{ items }">
					<v-fade-transition>
						<DataList
							v-if="!pending"
							:items="items"
							:total="curTotal"
							:page="curPage"
							@page-change="pageChange"
						></DataList>
						<LoadingIndicator v-else></LoadingIndicator>
					</v-fade-transition>
				</template>
				<template #no-data>
					<template v-if="!curInput || !pending">
						<v-slide-x-reverse-transition>
							<BaseEmpty v-if="isInput"></BaseEmpty>
						</v-slide-x-reverse-transition>
						<v-slide-x-transition>
							<PleaseInput v-if="!isInput"></PleaseInput>
						</v-slide-x-transition>
					</template>
				</template>
			</v-data-iterator>
		</v-sheet>
	</div>
</template>

<script lang="ts" setup>
const route = useRoute();
const { query = "", page = 1 } = route.query;
const router = useRouter();
const defaultData = { data: [], total: 0 };

const descriptionPrefix = query ? `正在搜索“ ${query} ”... ，这是` : "";
useSeoMeta({
	ogTitle: "SearchSearchGo--新一代阿里云盘搜索引擎",
	ogDescription: `${descriptionPrefix}一款极简体验、优雅、现代化、资源丰富、免费、无需登录的新一代阿里云盘搜索引擎，来体验找寻资源的快乐吧~`,
	ogImage: "https://ssgo.app/logobg.png",
	twitterCard: "summary",
});

interface IResultItem {
	title: string;
	pan_url: string;
	extract_code: string;
	highlight: string;
}

interface IResult {
	data: IResultItem[];
	total: number;
}

const curPage = ref(+(page || 1));

const curInput = ref((query || "") as string);
const isInput = computed(() => !!curInput.value);

let { data, pending }: { data: Ref<IResult>; pending: Ref<boolean> } =
	await useFetch("/api/search", {
		query: { query: curInput, pageNo: curPage, pageSize: 10 },
		immediate: !!query,
	});
data.value = data.value || defaultData;

const curItems = computed(() => data.value.data);
const curTotal = computed(() => data.value.total);

function search(input: string) {
	curPage.value = 1;
	curInput.value = input;
	router.replace({ query: { ...route.query, query: input, page: 1 } });
}

function pageChange(page: number) {
	curPage.value = page;
	router.replace({ query: { ...route.query, page: page } });
}

function clear() {
	curInput.value = "";
	data.value = defaultData;
	// 这里就不替换参数了，保留上一次的感觉好一些
}
</script>
```

大部分代码都是调用相关的子组件，传递参数，监听事件之类的，这里也不多说了。比较关键的在于这两部分代码：

```ts
useSeoMeta({
	ogTitle: "SearchSearchGo--新一代阿里云盘搜索引擎",
	ogDescription: `${descriptionPrefix}一款极简体验、优雅、现代化、资源丰富、免费、无需登录的新一代阿里云盘搜索引擎，来体验找寻资源的快乐吧~`,
	ogImage: "https://ssgo.app/logobg.png",
	twitterCard: "summary",
});
```

这里的 SEO 显示的文字是动态的，比如当前用户正在搜索`AI`，那么 url 路径参数也会增加`AI`，分享出去的页面描述就会包含`AI`，在 twitter 中的显示效果如下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240126143423.png)

还有部分代码是这一部分：

```ts
let { data, pending }: { data: Ref<IResult>; pending: Ref<boolean> } =
	await useFetch("/api/search", {
		query: { query: curInput, pageNo: curPage, pageSize: 10 },
		immediate: !!query,
	});
```

其中`immediate: !!query`表示如果当前路径包含搜索词，则会请求数据，渲染结果页，否则不立即执行该请求，而是等一些响应式变量如`curInput`、 `curPage`发生变化后执行请求。

子组件部分这里就不详细解释了，具体可以[查看源码](https://github.com/Justin3go/SearchSearchGo)，整体来说并不是很复杂。

## 其他

除此之外，我还增加了 google analytics 和百度 analytics，代码都非常简单，在`plugins/`目录下，如果你需要使用该项目，记得将对应的 id 改为你自己的 id。
## 最后

这次也算是第一次使用 nuxt 来开发一个应用，总体来说安装了 nuxt 插件之后的开发体验非常不错，按照目录规范写代码也可以少掉很多导入导出的一串串丑代码。

> 关于笔者--[justin3go.com](https://justin3go.com/)