---
title: Third Reconstruction of Personal Blog (Based on Vitepress)
date: 2024-07-30
tags: 
  - Blog
  - Vitepress
  - Cloudflare
  - Giscus
  - RSS
  - TDesign
---
# Third Reconstruction of Personal Blog (Based on Vitepress)

> ✨ Article Summary (AI Generated) 

<!-- DESC SEP -->

In this article, the author documents the process of the third reconstruction of their personal blog, which involves a series of improvements and optimizations based on Vitepress. Since starting to build the blog with Vitepress in early 2022, the author has gradually felt uncomfortable with the original style due to version updates and decided to redesign it. The main contents of this reconstruction include:

1. **Homepage Design**: Implementing a simple blog pagination list, utilizing `createContentLoader` to extract article summaries and other information.
2. **Deployment and Domain Management**: Migrating the blog from GitHub Pages to Cloudflare Pages and changing the DNS server.
3. **Internationalization Support**: Achieving internationalization for Vitepress and the commenting system Giscus, supporting both Chinese and English.
4. **Content Migration**: Migrating blog articles, generating summaries and tags, and ensuring compatibility with old paths to avoid broken external links.
5. **Optimizing User Experience**: Customizing fonts and preloading them to improve page loading speed.

Through these adjustments, the author hopes that the blog will not only be rich in content but also provide readers with a better visual and user experience. Ultimately, the author emphasizes the importance of blog design on writing mood, believing that organizing the environment can promote the flow of creative inspiration.

<!-- DESC SEP -->

## Preface

Welcome to the author's record of the third blog overhaul! Life goes on, and so does the tinkering!

Since starting to build my blog site with Vitepress in January 2022, at that time Vitepress was still in version 0.XX and had not been officially released. There was very little information about Vitepress available, with most online resources focused on Vuepress, and the official documentation was also incomplete.

Later, when Vitepress released the 1.0 beta version, I almost completely rebuilt my personal blog, redesigning the homepage, the section for recently published articles, and switching the comments from Gitalk to Giscus, using Vitepress's built-in local search instead of third-party search plugins, etc.

Recently, I found myself increasingly dissatisfied with my blog; it was both expensive and ugly, possibly due to a shift in my personal aesthetic preferences, which even affected my desire to write.

So, let's continue tinkering, focusing on simplicity and aesthetics.

## Overview

Online address: [justin3go.com](https://justin3go.com/)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240730212505.png)

This blog overhaul involved the following tasks, summarized briefly:

1. The homepage adopts a simple and direct blog pagination list, using `createContentLoader` to extract summaries, tags, dates, etc., while also resolving the issue of the aside not updating after page changes.
2. The deployment method was changed from GitHub Pages to Cloudflare Pages.
3. The domain's DNS server was migrated from Alibaba Cloud to Cloudflare.
4. Compatibility with previous Chinese paths was ensured, automatically redirecting `/博客/**` and `/笔记/**` to `/posts/**` and `/notes/**`, avoiding the loss of external links.
5. Internationalization of Vitepress.
6. Internationalization and theme switching for Giscus, allowing the same comment box for both Chinese and English.
7. Internationalization of RSS.
8. Internationalization and theme switching for TDesign.
9. Customization of the main font and preloading of the font, importing non-default font themes to reduce size.
10. Migration of blog articles, summary and tag generation, and Giscus comment migration, among other tasks.

There were also some previously existing features that were brought over, such as:

1. [Large Image Preview](https://justin3go.com/posts/2023/09/29vitepress%E4%B8%AD%E5%BC%95%E5%85%A5Tdesign%E5%B9%B6%E5%85%A8%E5%B1%80%E5%A2%9E%E5%8A%A0%E5%A4%A7%E5%9B%BE%E9%A2%84%E8%A7%88)
2. [OG Metadata Generation and Twitter Cards](https://justin3go.com/posts/2023/09/28vitepress%E4%B8%AD%E5%A2%9E%E5%8A%A0twitter%E5%8D%A1%E7%89%87)
3. [Theme Style Beautification (or possibly uglification)](https://github.com/Justin3go/justin3go.com/blob/release/docs/.vitepress/theme/style.css)

Alright, let me slowly elaborate on these points, or you can jump directly to the section that interests you.

## Internationalization of Vitepress

Here, we will briefly understand some relevant knowledge about Vitepress for subsequent use. Of course, more detailed introductions can be found in the [official documentation](https://vitepress.dev/zh/guide/i18n).

Vitepress generates static content corresponding to paths based on directories and files. For example, `posts/blog-1.md` will generate `posts/blog-1.html`, which can then be accessed via `your-domain/posts/blog-1.html`.

When internationalizing Vitepress, you need to configure the directories as follows:

```
docs/
├─ en/
│  ├─ foo.md
├─ foo.md
```

Corresponding to the earlier example, if you need English internationalization, you should add the corresponding English blog content under the directory `/en/posts/blog-1.md`.

After that, in the config directory, create different configurations for different languages. Here, Chinese is set as the primary language; for more configurations, [check the repository](https://github.com/Justin3go/justin3go.com/tree/release/docs/.vitepress/config):

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

## Implementation of Homepage Blog Pagination List

Overall, it can be divided into the following two steps:

1. Data Retrieval
2. Data Display

### 1. Data Retrieval

We can quickly retrieve all articles from a certain directory using Vitepress's `createContentLoader` function.

> This helper function takes a glob pattern relative to the [source directory](https://vitepress.dev/zh/guide/routing#source-directory) and returns a `{ watch, load }` data loading object that can be used as the default export in data loading files.
> 
> The loaded data will be inlined as JSON in the client bundle.

We create a `posts.data.mts` file as a data loading file, then export the object returned by `createContentLoader` as the default export. This includes some data extraction and transformation for the articles:

- A custom excerpt extraction function `excerptFn`, which will be discussed later.
- Retrieving the necessary data such as title, date, tags, etc. from the frontmatter.
- Converting the date and sorting the articles by date.

The code is as follows (type files omitted):

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

Here, `excerptFn` is my custom excerpt extraction function that identifies content wrapped between the two `<!-- DESC SEP -->` symbols, ultimately extracting it and storing it in an array. The required format is as follows:

```
# Title

<!-- DESC SEP -->
This is a summary
<!-- DESC SEP -->

Some main content
```

Additionally, for internationalization, different homepages require data from different folders, so we create another `posts-en.data.mts` file with similar content, changing the reading directory and date formatting parameters to `en-US`.

### 2. Data Display

Next is data display, where we write the code in `index.md`, while the English homepage will be in `/en/index.md`. Of course, if you set a different root path for internationalization, the directories will vary.

The reason for writing the code in `index.md` is that if everything is encapsulated in a Vue component and then imported into `index.md`, it would cause the aside not to refresh when changing pages. You can check this [Issue #2686](https://github.com/vuejs/vitepress/issues/2686) for specifics.

The specific code is quite simple, rendering the list of articles on the current page in a loop, along with a paginator (style files omitted):

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
// Non-Vue components require manual imports
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
	MessagePlugin.success(`Navigated to page ${index}`);

	const url = new URL(window.location as any);
	url.searchParams.set("page", index.toString());
	window.history.replaceState({}, "", url);

	window.scrollTo({
		top: 0,
	});
};
</script>
```

Here, I used `<h2>` to render the titles instead of `## title`, and directly wrote the `<a>` tag to add anchors. This is because using markdown syntax directly has issues that prevent anchors from being correctly extracted, so I implemented it manually using HTML.

For specifics, you can refer to this [Issue #3133](https://github.com/vuejs/vitepress/issues/3133).

Additionally, some detail optimizations were made, such as:

- Simplifying the paginator display on mobile.
- Synchronizing pagination parameters to the browser URL.
- Scrolling to the top of the page after pagination.

The content of `/en/index.md` is quite similar, just importing the `posts-en.data.mts` we created earlier, and using the corresponding English language pack for TDesign, like this:

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

## Migration of Domain DNS and Change of Deployment Method

Since I plan to write English blogs aimed at a global audience, I handed over my domain `justin3go.com` to Cloudflare for management. This also facilitates direct deployment and domain binding on Cloudflare Pages in the future.

As for why I switched from GitHub Pages to Cloudflare Pages, the main reason is that GitHub Pages does not have the functionality for online preview of branches, which is quite crucial for frequently validating things online.

The migration process was very simple. Taking the migration from Alibaba Cloud to Cloudflare as an example, go to `Domain Control Panel -> Domain List -> Click on the Manage Button`, then you will enter the following page where you can change the DNS server to the one provided by Cloudflare:

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240730092930.png)

As for Cloudflare, you can directly click the "Add Site" button in the upper right corner, and then follow the instructions step by step to get the corresponding DNS server addresses:

![](https://oss.justin3go.com/blogs/Pasted%20image%2020240730093159.png)

## Compatibility with Previous Chinese Paths

This time, for internationalization (so that the Chinese paths do not show during English), I changed the base paths `/博客/` and `/笔记/` to `/posts/` and `/notes/`.

However, this led to an issue where almost all external links were lost, as clicking links from other places would almost inevitably result in a 404 error. Therefore, we need to implement a redirection process using Vitepress's `onBeforeRouteChange` feature.

The code is as follows (omitting unrelated code):

```ts
export default {
	enhanceApp({ app, router }) {
		router.onAfterRouteChanged = (to: string) => {
			// Compatible with old blog Chinese paths, redirecting to new paths to avoid broken external links
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

Note that the Chinese paths need to be URL-encoded; otherwise, the logic will not be executed if it does not match.

## Giscus Internationalization

Here, I need to achieve two functionalities:

1. The component texts in Giscus need to follow the internationalization.
2. Different languages should still use one comment system.

### 1. Component Text Internationalization

1. We determine if the current page path starts with `/en` to check if it's English.
2. If it's English, we pass the corresponding English parameters to Giscus.

Key code is as follows:

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

### 2. Sharing Comments Across Different Languages

Here, we use the specific string pattern in the Giscus mapping mode to achieve the customization.

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

To share the same comment, different internationalized pages need the same unique identifier, which is passed through the `term` string. We obtain this unique identifier by slicing the path:

```ts
const term = computed(() => route.path.startsWith("/en") ? route.path.slice(3) : route.path);
```

## RSS Internationalization

The functionality needed here is that when readers are on different internationalized pages, the subscription links should be different, and the corresponding `feed.xml` files should extract the blog list in the respective languages.

The basic idea is as follows:

1. Generate different `feed.xml` files for different internationalization languages, such as naming the English one `feed-en.xml`.
2. The RSS link on the nav should change according to the language to point to different files.

Here's my method for generating Chinese RSS:

```ts
import path from "node:path";
import { writeFileSync } from "node:fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

const hostname = "https://justin3go.com";

export async function createRssFileZH(config: SiteConfig) {
  const feed = new Feed({
    title: 'Justin3go',
    description: 'A T-shaped front-end developer who is committed to deepening expertise in the technical field, focuses on independent development, enjoys working with Vue.js and Nest.js, and has some knowledge of Python, search engines, NLP, Web3, and back-end development.',
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
    // Only keep the latest 5 articles
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

The English version is basically the same, with changes to the site information, extraction directory, and generated filename:

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
    // Only keep the latest 5 articles
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

Then, we execute these two functions in the [buildEnd](https://vitepress.dev/zh/reference/site-config#buildend) hook to generate the corresponding files.

```ts
buildEnd: (config: SiteConfig) => {
	createRssFileZH(config);
	createRssFileEN(config);
},
```

Finally, in different configs, such as `zh.ts` and `en.ts`, we configure different paths for the `socialLinks`:

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

## Custom Fonts

Here, the [official guide](https://vitepress.dev/zh/guide/extending-default-theme#using-different-fonts) also provides a more detailed tutorial.

> To avoid including the Inter font in the generated output, we import the theme from `vitepress/theme-without-fonts`.

`theme/index.ts`

```ts
import Theme from 'vitepress/theme-without-fonts'
```

Next, we download the custom font files to the `docs/assets/` directory.

Note:

1. We can download the `VF` variant instead of different font files for thickness, as that would be too large.
2. Additionally, we can download fonts in the `woff2` format, which is compressed and widely supported by modern browsers.

After that, we introduce the font in the stylesheet using `@font-face`, like this:

```css
@font-face {
	font-family: "SourceHanSerifCN";
	src: local("SourceHanSerifCN"), url("/assets/fonts/SourceHanSerifCN-VF.woff2");
}
```

Now, you can happily use the modified font as usual...

Finally, to enhance user experience, specifically loading speed, we optimize by preloading the font files. We use the [transformHead](https://vitepress.dev/zh/reference/site-config#transformhead) build hook to add the corresponding head information:

The function to handle the head uses regex matching because the filenames in the assets directory will have hash suffixes.

```ts
import { type HeadConfig, type TransformContext } from "vitepress";

export function handleHeadMeta(context: TransformContext) {
  // Preload fonts
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

In the [transformHead](https://vitepress.dev/zh/reference/site-config#transformhead) build hook, we execute this function:

```ts
async transformHead(context) {
	return handleHeadMeta(context)
},
```

## Conclusion

This time, I actually didn't write much code; most of it was copied from my previous weekly websites and blog sites. However, migrating and organizing the blog content took a considerable amount of time, such as generating summaries and tags for each article.

I used to think that a blog site could be a bit rough around the edges, focusing mainly on content! But over time, the more I looked at it, the more dissatisfied I became, leading to a lack of content production. Just like how a room needs cleaning and a desktop needs organizing, the mood can be quite different.

--- 

This translation captures the essence and details of your original text. If you need any further adjustments or have other requests, feel free to ask!