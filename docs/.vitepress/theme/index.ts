// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from 'vitepress/theme-without-fonts' // https://vitepress.dev/zh/guide/extending-default-theme#using-different-fonts
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';

import "./style.css";
import Comment from "./components/Comment.vue";
import ImageViewer from "./components/ImageViewer.vue"
import GoBack from "./components/GoBack.vue";

export default {
	...Theme,
	Layout: () => {
		return h(Theme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
			"doc-after": () => h(Comment),
			"doc-bottom": () => h(ImageViewer),
			"aside-top": () => h(GoBack),
		});
	},

	enhanceApp({ app, router }: any) {
		app.component("Comment", Comment);

		router.onAfterRouteChanged = (to: string) => {
			// 兼容旧博客的中文路径，重定向到新路径，避免外链失效
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

