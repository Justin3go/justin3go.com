import { defineConfig, type SiteConfig } from 'vitepress'
// 自动导入 TDesign 
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';

import { createRssFileZH, createRssFileEN } from "../theme/utils/rss";
import { handleHeadMeta } from "../theme/utils/handleHeadMeta";
import { search as zhSearch } from './zh'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  sitemap: {
    hostname: 'https://justin3go.com'
  },
  head: [
		["script", { async: "", src: "https://www.googletagmanager.com/gtag/js?id=G-MB7XVBG1TQ" }],
		[
			"script",
			{},
			`window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MB7XVBG1TQ');`,
		],

    [
      "link",
      {
        rel: "icon",
        href: "https://oss.justin3go.com/justin3goAvatar.ico",
      },
    ],
  ],
  // https://vitepress.dev/reference/site-config#transformhead
  async transformHead(context) {
    return handleHeadMeta(context)
  },
  buildEnd: (config: SiteConfig) => {
    createRssFileZH(config);
    createRssFileEN(config);
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: [2, 4],

    search: {
      provider: "local",
      options: {
        locales: { ...zhSearch }
      }
    },

    externalLinkIcon: true,
  },

  markdown: {
    math: true
  },

  vite: {
    plugins: [
      // ...
      AutoImport({
        resolvers: [TDesignResolver({
          library: 'vue-next'
        })],
      }),
      Components({
        resolvers: [TDesignResolver({
          library: 'vue-next'
        })],
      }),
    ],
  },
})
