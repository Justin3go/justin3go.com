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
	ignoreDeadLinks: true,
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
			{ text: "博客", link: "/博客/" },
			{ text: "笔记", link: "/笔记/" },
			{
				text: "线上",
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
							{ text: "Plane-TodoList", link: "https://plane.justin3go.com/" },
						]
					}
				],
			}
		],
		// @ts-ignore
		sidebar: createSidebar(),

		socialLinks: [
			{ icon: "github", link: "https://github.com/Justin3go/justin3go.github.io" },
			{ icon: "twitter", link: "https://twitter.com/_Justin3go" },
			{
				icon: {
					svg: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><title>发送邮件</title><path d="M628.7 492.6l-171.1 84L64 393.4v317.1c0 59.7 48.4 108.1 108.1 108.1h567.7c59.7 0 108.1-48.4 108.1-108.1V554.3c-15.8 3.1-32 4.7-48.7 4.7-65.7 0-125.6-25.1-170.5-66.4z"></path><path d="M589.1 446.1c-26.5-39.9-41.9-87.7-41.9-139.2 0-9.8 0.6-19.4 1.7-28.9H172.1c-42.2 0-78.8 24.2-96.6 59.5l382.2 169.8 131.4-61.2zM952.1 214.5c-11.7-12.2-31.1-12.3-43.9-1-33.5 29.7-54 57.6-78 75.6-17.9 13.4-36.7 22.9-59.2 30.6-8.2-36-10.4-67.6-11.7-71.6-5.5-17.2-16.6-13.3-20.6-7.2-3.8 5.8-38 65.3-60 103.4-6.1 10.6-11.3 19.6-14.5 25.2-1.9 3.2-3.1 5.3-3.6 6.1 0 0-4 19.3 11 23.5 10.8 4.5 129.2 60.1 135.5 62.6 7.9 3.2 20.9-9.5 13.1-20.5-1.6-2.3-16.8-29.1-30.3-62.3 29.7-9.8 54.3-22.2 78.7-40.9 24.7-18.8 48.8-44.4 79.4-77.7 14.4-12.5 15.9-33.4 4.1-45.8z"></path></svg>',
				},
				link: "mailto:just@justin3go.com?subject=请表明您的来意",
			},
			{
				icon: {
					svg: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>RSS订阅</title><path d="M108.56,342.78a60.34,60.34,0,1,0,60.56,60.44A60.63,60.63,0,0,0,108.56,342.78Z"/><path d="M48,186.67v86.55c52,0,101.94,15.39,138.67,52.11s52,86.56,52,138.67h86.66C325.33,312.44,199.67,186.67,48,186.67Z"/><path d="M48,48v86.56c185.25,0,329.22,144.08,329.22,329.44H464C464,234.66,277.67,48,48,48Z"/></svg>',
				},
				link: "/feed.xml",
			},
		],

		footer: {
			message:
				'<a href="mailto:just@justin3go.com?subject=请表明您的来意"> 给笔者发送邮件 </a>' +
				"&nbsp &nbsp | &nbsp &nbsp" +
				'<a href="https://oss.justin3go.com/blogs/Justin3goWechat.jpg" target="_blank">联系笔者微信(注意备注来意)</a>',
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
});
