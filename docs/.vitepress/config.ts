import { defineConfig } from "vitepress";
import { createSidebar } from "./utils/createSidebar";
import { createRssFile } from "./utils/rss";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Justin3go's Blog-🖊",
	description: "坚持深耕技术领域的T型前端程序员, 喜欢Vuejs、Nestjs, 还会点python、nlp、web3、后端",
	lang: "zh-CH", //语言
	lastUpdated: true,
	ignoreDeadLinks: true,
	head: [
		// 改变title的图标
		[
			"link",
			{
				rel: "icon",
				href: "https://oss.justin3go.com/justin3goAvatar.ico",
			},
		],
	],
	buildEnd: createRssFile,
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
				text: "相关",
				items: [
					{
						items: [
							{ text: "掘金", link: "https://juejin.cn/user/220366354020749/posts" },
							{ text: "B站", link: "https://space.bilibili.com/434542518" },
						],
					},
					{
						items: [
							{ text: "ChatGPT", link: "https://chat.justin3go.com/" },
							{ text: "笑友mp", link: "https://oss.justin3go.com/blogs/xiaoyou-mp-code.png" },
						],
					},
				],
			},
		],
		// @ts-ignore
		sidebar: createSidebar(),

		socialLinks: [
			{ icon: "github", link: "https://github.com/Justin3go/justin3go.github.io" },
			{ icon: "twitter", link: "https://twitter.com/_Justin3go" },
			{
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>RSS订阅</title><path d="M108.56,342.78a60.34,60.34,0,1,0,60.56,60.44A60.63,60.63,0,0,0,108.56,342.78Z"/><path d="M48,186.67v86.55c52,0,101.94,15.39,138.67,52.11s52,86.56,52,138.67h86.66C325.33,312.44,199.67,186.67,48,186.67Z"/><path d="M48,48v86.56c185.25,0,329.22,144.08,329.22,329.44H464C464,234.66,277.67,48,48,48Z"/></svg>'
        },
        link: '/feed.xml'
      }
		],

		footer: {
			message:
				'<a href="mailto:justin3go@qq.com?subject=请表明您的来意"> 给笔者发送邮件 </a>' +
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
		darkModeSwitchLabel: "白/夜",
	},
});
