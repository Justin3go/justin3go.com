export enum TAB {
	BLOG = "/博客/",
	NOTE = "/笔记/",
}

export interface IItems {
	text: string;
	link: string;
	collapsed?: boolean;
	items?: IItems[];
}

export interface ISideBar {
	[TAB.BLOG]: IItems[];
	[TAB.NOTE]: IItems[];
}

export function createSidebar() {
	const res: ISideBar = {
		"/博客/": [
			{
				text: "2023年",
				link: "/博客/2023/",
				collapsed: false,
				items: [
					{
						text: "5月",
						link: "/博客/2023/05/",
						items: [
							{ text: "11该给系统加哪一个权限控制模型呢", link: "/博客/2023/05/11该给系统加哪一个权限控制模型呢" },
							{ text: "09PIXIJS快速一览", link: "/博客/2023/05/09PIXIJS快速一览" },
							{ text: "07两个多月捣鼓了一个健康类小程序", link: "/博客/2023/05/07两个多月捣鼓了一个健康类小程序" },
							{ text: "01Nest的test中的best是Jest框架", link: "/博客/2023/05/01Nest的test中的best是Jest框架" },
						],
					},
					{
						text: "4月",
						link: "/博客/2023/04/",
						items: [
							{
								text: "26试下微调GPT-3做一个心理问答机器人",
								link: "/博客/2023/04/26试下微调GPT-3做一个心理问答机器人",
							},
							{
								text: "23Nest如何实现带身份验证的GraphQL订阅Subscription",
								link: "/博客/2023/04/23Nest如何实现带身份验证的GraphQL订阅Subscription",
							},
							{ text: "20Vue3+TS(uniapp)手撸一个聊天页面", link: "/博客/2023/04/20Vue3+TS(uniapp)手撸一个聊天页面" },
							{
								text: "17我终于会用Docker了(nest+prisma+psotgresql+nginx+https)",
								link: "/博客/2023/04/17我终于会用Docker了(nest+prisma+psotgresql+nginx+https)",
							},
							{
								text: "05实现微信小程序(uniapp)上传头像至阿里云oss",
								link: "/博客/2023/04/05实现微信小程序(uniapp)上传头像至阿里云oss",
							},
						],
					},
					{
						text: "3月",
						link: "/博客/2023/03/",
						items: [
							{ text: "31极简地给个人博客添加订阅功能", link: "/博客/2023/03/31极简地给个人博客添加订阅功能" },
							{ text: "29前端自给自足UI设计稿", link: "/博客/2023/03/29前端自给自足UI设计稿" },
							{
								text: "22聊聊前后端分离(历史、职责划分、未来发展)",
								link: "/博客/2023/03/22聊聊前后端分离(历史、职责划分、未来发展)",
							},
							{ text: "06三个经典的TypeScript易混淆点", link: "/博客/2023/03/06三个经典的TypeScript易混淆点" },
						],
					},
					{
						text: "2月",
						link: "/博客/2023/02/",
						items: [
							{
								text: "23你可能忽略的10种JavaScript快乐写法",
								link: "/博客/2023/02/23你可能忽略的10种JavaScript快乐写法",
							},
							{ text: "19放弃Cookie-Session，拥抱JWT？", link: "/博客/2023/02/19放弃Cookie-Session，拥抱JWT？" },
							{ text: "17聊聊源策略限制AJAX请求", link: "/博客/2023/02/17聊聊源策略限制AJAX请求" },
							{ text: "04Vue3相关原理梳理", link: "/博客/2023/02/04Vue3相关原理梳理" },
						],
					},
					{
						text: "1月",
						link: "/博客/2023/01/",
						items: [
							{
								text: "28了解API相关范式(RPC、REST、GraphQL)",
								link: "/博客/2023/01/28了解API相关范式(RPC、REST、GraphQL)",
							},
							{ text: "25浅谈NestJS设计思想", link: "/博客/2023/01/25浅谈NestJS设计思想" },
							{ text: "08JavaScript专题-继承", link: "/博客/2023/01/08JavaScript专题-继承" },
							{ text: "02JavaScript专题-原型链", link: "/博客/2023/01/02JavaScript专题-原型链" },
						],
					},
				],
			},
			{
				text: "2022",
				link: "/博客/2022/",
				collapsed: false,
				items: [
					{ text: "获取Object的第一个元素", link: "/博客/2022/16获取Object的第一个元素" },
					{
						text: "JavaScript基础-replace方法的第二个参数",
						link: "/博客/2022/15JavaScript基础-replace方法的第二个参数",
					},
					{ text: "超详细的前端程序员git指北", link: "/博客/2022/14超详细的前端程序员git指北" },
					{ text: "CDN实践配置+原理篇", link: "/博客/2022/13CDN实践配置+原理篇" },
					{ text: "Node进程及集群相关", link: "/博客/2022/12Node进程及集群相关" },
					{ text: "Node内存控制", link: "/博客/2022/11Node内存控制" },
					{ text: "Node异步实现与事件驱动", link: "/博客/2022/10Node异步实现与事件驱动" },
					{ text: "Node模块规范及模块加载机制", link: "/博客/2022/09Node模块规范及模块加载机制" },
					{ text: "前端构建的学习(偏向vite)", link: "/博客/2022/08前端构建的学习(偏向vite)" },
					{
						text: "IntersectionObserver实现横竖滚动自适应懒加载",
						link: "/博客/2022/07IntersectionObserver实现横竖滚动自适应懒加载",
					},
					{ text: "玩转vitepress", link: "/博客/2022/06玩转vitepress" },
					{
						text: "前端程序员搭建自己的CodeIDE（code-server教程）",
						link: "/博客/2022/05前端程序员搭建自己的CodeIDE（code-server教程）",
					},
					{ text: "git常用操作", link: "/博客/2022/04git常用操作" },
					{ text: "这道题原来可以用到JS这么多知识点！", link: "/博客/2022/03这道题原来可以用到JS这么多知识点！" },
					{ text: "TypeScript入门", link: "/博客/2022/02TypeScript入门" },
					{
						text: "都2022年了，还是得学圣杯布局与双飞翼布局",
						link: "/博客/2022/01都2022年了，还是得学圣杯布局与双飞翼布局",
					},
					


					
				],
			},
			{
				text: "2021",
				link: "/博客/2021/",
				collapsed: false,
				items: [
					{ text: "散列表实现查找", link: "/博客/2021/04散列表实现查找" },
					{ text: "操作系统内存分配模拟程序", link: "/博客/2021/03操作系统内存分配模拟程序" },
					{ text: "TFIDF计算的学习", link: "/博客/2021/02TFIDF计算的学习" },
					{ text: "scrapy爬虫详解", link: "/博客/2021/01scrapy爬虫详解" },
				],
			},
			{
				text: "2020",
				link: "/博客/2020/",
				collapsed: false,
				items: [
					{
						text: "使用anaconda中的Prompt配置虚拟环境的常用命令",
						link: "/博客/2020/02使用anaconda中的Prompt配置虚拟环境的常用命令",
					},
					{ text: "Java迷宫", link: "/博客/2020/01Java迷宫" },
				],
			},
		].map((item, i) => (!i ? item : { ...item, collapsed: true })),
		"/笔记/": [
			{
				text: "ChatGPT提示学习笔记",
				link: "/笔记/ChatGPT提示学习/",
				collapsed: false,
				items: [
					{ text: "1_2引言—指示", link: "/笔记/ChatGPT提示学习/ChatGPT提示学习笔记1_2" },
					{ text: "3迭代", link: "/笔记/ChatGPT提示学习/ChatGPT提示学习笔记3" },
					{ text: "4摘要", link: "/笔记/ChatGPT提示学习/ChatGPT提示学习笔记4" },
					{ text: "5推理", link: "/笔记/ChatGPT提示学习/ChatGPT提示学习笔记5" },
					{ text: "6转换", link: "/笔记/ChatGPT提示学习/ChatGPT提示学习笔记6" },
					{ text: "7扩展", link: "/笔记/ChatGPT提示学习/ChatGPT提示学习笔记7" },
					{ text: "8聊天机器人", link: "/笔记/ChatGPT提示学习/ChatGPT提示学习笔记8" },
				],
			},
			{
				text: "算法与数据结构",
				link: "/笔记/算法与数据结构/",
				collapsed: false,
				items: [
					{ text: "基础概念", link: "/笔记/算法与数据结构/01基础概念" },
					{ text: "线性表", link: "/笔记/算法与数据结构/02线性表" },
					{ text: "栈和队列", link: "/笔记/算法与数据结构/03栈和队列" },
					{ text: "数组", link: "/笔记/算法与数据结构/04数组" },
					{ text: "树", link: "/笔记/算法与数据结构/05树" },
					{ text: "图", link: "/笔记/算法与数据结构/06图" },
					{ text: "查找", link: "/笔记/算法与数据结构/07查找" },
					{ text: "排序", link: "/笔记/算法与数据结构/08排序" },
					{ text: "算法概述", link: "/笔记/算法与数据结构/10算法概述" },
					{ text: "递归与分治", link: "/笔记/算法与数据结构/11递归与分治" },
					{ text: "动态规划", link: "/笔记/算法与数据结构/12动态规划" },
					{ text: "贪心算法", link: "/笔记/算法与数据结构/13贪心算法" },
					{ text: "回溯与分支极限", link: "/笔记/算法与数据结构/14回溯与分支界限" },
					{ text: "经典算法实现", link: "/笔记/算法与数据结构/15经典算法实现" },
					{ text: "剑指Offer", link: "/笔记/算法与数据结构/16剑指Offer" },
				],
			},
			{
				text: "计算机基础知识",
				link: "/笔记/计算机基础知识/",
				collapsed: false,
				items: [{ text: "操作系统基础", link: "/笔记/计算机基础知识/01操作系统基础" }],
			},
			{
				text: "数据库一期",
				link: "/笔记/数据库01/",
				collapsed: false,
				items: [
					{ text: "数据库系统概述", link: "/笔记/数据库01/01数据库系统概述" },
					{ text: "关系数据库", link: "/笔记/数据库01/02关系数据库" },
					{ text: "SQL(重点)", link: "/笔记/数据库01/03SQL(重点)" },
					{ text: "数据库管理与维护(重点)", link: "/笔记/数据库01/05数据库管理与维护(重点)" },
					{ text: "关系数据理论(重点)", link: "/笔记/数据库01/06关系数据理论(重点)" },
					{ text: "数据库设计", link: "/笔记/数据库01/07数据库设计" },
				],
			},
			{
				text: "JavaScript[待更新]",
				link: "/笔记/JavaScript/",
				collapsed: false,
				items: [{ text: "JS常见手写面试题", link: "/笔记/JavaScript/01JS常见手写面试题" }],
			},
			{
				text: "CSS相关[待更新]",
				link: "/笔记/CSS相关/",
				collapsed: false,
				items: [],
			},
			{
				text: "Vue相关",
				link: "/笔记/Vue相关/",
				collapsed: false,
				items: [
					{ text: "Vue3是如何运行的", link: "/笔记/Vue相关/01Vue3是如何运行的" },
					{ text: "Vue3编译器", link: "/笔记/Vue相关/02Vue3编译器" },
					{ text: "虚拟DOM", link: "/笔记/Vue相关/03虚拟DOM" },
					{ text: "Vue3-Reactivity", link: "/笔记/Vue相关/04Vue3-Reactivity" },
					{ text: "Mini-Vue", link: "/笔记/Vue相关/05Mini-Vue" },
					{ text: "Vue3其他", link: "/笔记/Vue相关/06Vue3其他" },
				],
			},
			{
				text: "NestJS",
				link: "/笔记/NestJS/",
				collapsed: false,
				items: [
					{ text: "controller", link: "/笔记/NestJS/01controller" },
					{ text: "service", link: "/笔记/NestJS/02service" },
					{ text: "module", link: "/笔记/NestJS/03module" },
					{ text: "DTO", link: "/笔记/NestJS/04DTO" },
					{ text: "postgreSQL", link: "/笔记/NestJS/05postgreSQL" },
					{ text: "原理细节", link: "/笔记/NestJS/06原理细节" },
					{ text: "应用配置", link: "/笔记/NestJS/07应用配置" },
					{ text: "更多模块", link: "/笔记/NestJS/08更多模块" },
					{ text: "openAPI", link: "/笔记/NestJS/09openAPI" },
					{ text: "测试", link: "/笔记/NestJS/10测试" },
				],
			},
			{
				text: "前端八股文",
				link: "/笔记/前端八股文/",
				collapsed: false,
				items: [
					{ text: "HTML", link: "/笔记/前端八股文/01HTML" },
					{ text: "CSS", link: "/笔记/前端八股文/02CSS" },
					{ text: "JavaScript", link: "/笔记/前端八股文/03JavaScript" },
					{ text: "Vue", link: "/笔记/前端八股文/04Vue" },
					{ text: "计算机网络", link: "/笔记/前端八股文/05计算机网络" },
					{ text: "浏览器原理", link: "/笔记/前端八股文/06浏览器原理" },
					{ text: "性能优化", link: "/笔记/前端八股文/07性能优化" },
				],
			},
			{
				text: "后端储备",
				link: "/笔记/后端储备/",
				collapsed: false,
				items: [
					{ text: "Django进阶学习笔记", link: "/笔记/后端储备/01Django进阶学习笔记" },
					{ text: "DRF学习笔记", link: "/笔记/后端储备/02DRF学习笔记" },
					{ text: "Redis学习笔记", link: "/笔记/后端储备/03Redis学习笔记" },
				],
			},
			{
				text: "Web3.0",
				link: "/笔记/Web3.0/",
				collapsed: false,
				items: [
					{ text: "Solidity8新特性", link: "/笔记/Web3.0/00Solidity8新特性" },
					{ text: "Solidity8基本语法", link: "/笔记/Web3.0/01Solidity8基本语法" },
					{ text: "Solidity8高级", link: "/笔记/Web3.0/02Solidity8高级" },
					{ text: "Solidity8进阶", link: "/笔记/Web3.0/03Solidity8进阶" },
				],
			},
			{
				text: "AI相关[待更新]",
				link: "/笔记/AI相关/",
				collapsed: false,
				items: [],
			},
		],
	};
	return res;
}
// TODO 可以只做2023目录之后的自动生成脚本
/*import { readdir } from "fs/promises";

interface IItem {
	text: string;
	link: string;
}

export async function createSidebar(path: string, prefix: string) {
	const result = [];
	// 只会有两级,三级目录
	// 有目录的地方就不需要管md文件
	try {
		const firstLevelDir = await readdir(path);
		for (const firstItem of firstLevelDir) {
			// const firstItemDir = `${prefix}${firstItem}/`;
      if(!firstItem.endsWith('.md')) {
        const secondLevelDir = await readdir(`${path}${firstItem}/`)
        const resultItem = {
          text: firstItemText,
          link: firstItemDir,
          collapsed: false,
          items: [] as IItem[],
        };
        for(const secondItem of secondLevelDir) {

        }
      }


			const firstItemText = firstItem.substring(0, firstItem.length - 3); // 去除.md后缀
			const resultItem = {
				text: firstItemText,
				link: firstItemDir,
				collapsed: false,
				items: [] as IItem[],
			};
			// 简易地判断是否有三级目录
			if (firstItem.endsWith(".md")) {
				if (firstItem !== "index.md") {
					resultItem.items.push({
						text: firstItemText,
						link: firstItemDir + firstItem,
					});
				}
			} else {
			}
		}
	} catch (err) {
		console.error(err);
	}
}

createSidebar("./docs/博客/", "/博客/");
*/
