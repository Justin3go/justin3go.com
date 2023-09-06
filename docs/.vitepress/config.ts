import { defineConfig, type SiteConfig } from "vitepress";
import { createSidebar } from "./utils/createSidebar";
import { createRssFile } from "./utils/rss";

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
		// [
		// 	"script",
		// 	{},
		// 	`(adsbygoogle = window.adsbygoogle || []).push({});`
		// ],
		// 改变title的图标
		[
			"link",
			{
				rel: "icon",
				href: "https://oss.justin3go.com/justin3goAvatar.ico",
			},
		],
	],
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
					{ text: "😁 笑友-MiniProgram", link: "https://oss.justin3go.com/blogs/xiaoyou-mp-code.png" },
					{ text: "🔍 阿里云盘搜索引擎", link: "https://pan.justin3go.com" },
					{ text: "💬 ChatGPT-Next-Web", link: "https://chat.justin3go.com/" },
				],
			},
			{ text: "📢公告", items: [
				{ text: "阿里云盘搜索神器", link: "/公告/阿里云盘搜索神器" },
			] },
		],
		// @ts-ignore
		sidebar: createSidebar(),

		socialLinks: [
			{ icon: "github", link: "https://github.com/Justin3go/justin3go.github.io" },
			{
				icon: {
					svg: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="zhuzhan-icon"><title>B站</title><path fill-rule="evenodd" clip-rule="evenodd" d="M3.73252 2.67094C3.33229 2.28484 3.33229 1.64373 3.73252 1.25764C4.11291 0.890684 4.71552 0.890684 5.09591 1.25764L7.21723 3.30403C7.27749 3.36218 7.32869 3.4261 7.37081 3.49407H10.5789C10.6211 3.4261 10.6723 3.36218 10.7325 3.30403L12.8538 1.25764C13.2342 0.890684 13.8368 0.890684 14.2172 1.25764C14.6175 1.64373 14.6175 2.28484 14.2172 2.67094L13.364 3.49407H14C16.2091 3.49407 18 5.28493 18 7.49407V12.9996C18 15.2087 16.2091 16.9996 14 16.9996H4C1.79086 16.9996 0 15.2087 0 12.9996V7.49406C0 5.28492 1.79086 3.49407 4 3.49407H4.58579L3.73252 2.67094ZM4 5.42343C2.89543 5.42343 2 6.31886 2 7.42343V13.0702C2 14.1748 2.89543 15.0702 4 15.0702H14C15.1046 15.0702 16 14.1748 16 13.0702V7.42343C16 6.31886 15.1046 5.42343 14 5.42343H4ZM5 9.31747C5 8.76519 5.44772 8.31747 6 8.31747C6.55228 8.31747 7 8.76519 7 9.31747V10.2115C7 10.7638 6.55228 11.2115 6 11.2115C5.44772 11.2115 5 10.7638 5 10.2115V9.31747ZM12 8.31747C11.4477 8.31747 11 8.76519 11 9.31747V10.2115C11 10.7638 11.4477 11.2115 12 11.2115C12.5523 11.2115 13 10.7638 13 10.2115V9.31747C13 8.76519 12.5523 8.31747 12 8.31747Z" fill="currentColor"></path></svg>',
				},
				link: "https://space.bilibili.com/434542518",
			},
			{
				icon: {
					svg: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="28" viewBox="0 0 36 28" fill="none"><title>掘金</title><path fill-rule="evenodd" clip-rule="evenodd" d="M17.5875 6.77268L21.8232 3.40505L17.5875 0.00748237L17.5837 0L13.3555 3.39757L17.5837 6.76894L17.5875 6.77268ZM17.5863 17.3955H17.59L28.5161 8.77432L25.5526 6.39453L17.59 12.6808H17.5863L17.5825 12.6845L9.61993 6.40201L6.66016 8.78181L17.5825 17.3992L17.5863 17.3955ZM17.5828 23.2891L17.5865 23.2854L32.2133 11.7456L35.1768 14.1254L28.5238 19.3752L17.5865 28L0.284376 14.3574L0 14.1291L2.95977 11.7531L17.5828 23.2891Z" fill="currentColor"/></svg>',
				},
				link: "https://juejin.cn/user/220366354020749/posts",
			},
			{ icon: "twitter", link: "https://twitter.com/_Justin3go" },
			{
				icon: {
					svg: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>RSS订阅</title><path d="M108.56,342.78a60.34,60.34,0,1,0,60.56,60.44A60.63,60.63,0,0,0,108.56,342.78Z"/><path d="M48,186.67v86.55c52,0,101.94,15.39,138.67,52.11s52,86.56,52,138.67h86.66C325.33,312.44,199.67,186.67,48,186.67Z"/><path d="M48,48v86.56c185.25,0,329.22,144.08,329.22,329.44H464C464,234.66,277.67,48,48,48Z"/></svg>',
				},
				link: "/feed.xml",
			},
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
