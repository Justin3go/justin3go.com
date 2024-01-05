import { defineConfig, type SiteConfig } from "vitepress";
import { createSidebar } from "./utils/createSidebar";
import { createRssFile } from "./utils/rss";
import { handleHeadMeta } from './utils/handleHeadMeta';
// 自动导入TDesign 
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Justin3go's Blog-🖊",
	titleTemplate: ":title-Justin3go's Blog",
	description: "坚持深耕技术领域的T型前端程序员, 喜欢Vuejs、Nestjs, 还会点python、nlp、web3、后端",
	lang: "zh-CH", //语言
	lastUpdated: true,
	cleanUrls: true,
	ignoreDeadLinks: true,
	sitemap: {
    hostname: 'https://justin3go.com'
  },
	markdown: {
    image: {
      lazyLoading: true
    }
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
		// 百度统计平台
		[
			"script",
			{},
			`var _hmt = _hmt || [];
			(function() {
				var hm = document.createElement("script");
				hm.src = "https://hm.baidu.com/hm.js?ea8a4869f485978692f89cd908f6906a";
				var s = document.getElementsByTagName("script")[0]; 
				s.parentNode.insertBefore(hm, s);
			})();`,
		],
		// 广告
		[
			"script",
			{
				async: "",
				src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9529899862680155",
				crossorigin: "anonymous",
			},
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
		createRssFile(config);
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		outline: [2, 4],
		outlineTitle: "大纲",
		lastUpdatedText: "最近更新时间",
		//   头部导航
		nav: [
			{ text: "首页", link: "/" },
			{ text: "博客", link: "/博客/", activeMatch: '/博客/' },
			{ text: "笔记", link: "/笔记/", activeMatch: '/笔记/' },
			{
				text: "线上",
				activeMatch: '/线上/',
				items: [
					{
						text: '自建项目', items: [
							{ text: "笑友小程序", link: "https://oss.justin3go.com/blogs/xiaoyou-mp-code.png" },
							{ text: "阿里云盘搜索", link: "https://pan.justin3go.com" },
						]
					},
					{
						text: '开源部署', items: [
							{ text: "ChatGPT-Web", link: "https://chat.justin3go.com/" },
							{ text: "LobeHub", link: "https://gpt.justin3go.com/" },
							{ text: "Plane-TodoList", link: "https://plane.justin3go.com/" },
						]
					}
				],
			}
		],
		// @ts-ignore
		sidebar: createSidebar(),

		socialLinks: [
			{
				icon: {
					svg: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>RSS订阅</title><path d="M108.56,342.78a60.34,60.34,0,1,0,60.56,60.44A60.63,60.63,0,0,0,108.56,342.78Z"/><path d="M48,186.67v86.55c52,0,101.94,15.39,138.67,52.11s52,86.56,52,138.67h86.66C325.33,312.44,199.67,186.67,48,186.67Z"/><path d="M48,48v86.56c185.25,0,329.22,144.08,329.22,329.44H464C464,234.66,277.67,48,48,48Z"/></svg>',
				},
				link: "/feed.xml",
			},
		],

		footer: {
			message: '<a href="https://github.com/Justin3go/justin3go.github.io" target="_blank">网站已开源，每周末如有更新release一次，欢迎star</a>',
			copyright:
				'<a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">Copyright© 2021-present 渝ICP备2021006879号</a>',
		},
		search: {
			provider: "local",
		},
		editLink: {
			pattern: "https://github.com/Justin3go/justin3go.github.io/edit/master/docs/:path",
			text: "在GitHub上编辑此页",
		},
		returnToTopLabel: "👆Code is building the world.",
		sidebarMenuLabel: "目录",
		darkModeSwitchLabel: "深色模式",
    docFooter: {
      prev: false,
      next: false,
    },
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
	locales: {
		root: {
      label: '简体中文',
    },
    en: {
      label: 'English',
      link: 'https://en.justin3go.com'
    }
  }
});
