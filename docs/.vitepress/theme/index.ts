// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import comment from "./components/comment.vue";
import docFooterBefore from "./components/docFooterBefore.vue"
import asideTop from "./components/asideTop.vue"
import imageViewer from "./components/imageViewer.vue"
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';

export default {
	...Theme,
	Layout: () => {
		return h(Theme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
			"doc-after": () => h(comment),
			"doc-footer-before": () => h(docFooterBefore),
			"aside-top": () => h(asideTop),
			"doc-bottom": () => h(imageViewer),
		});
	},
	// @ts-ignore
	enhanceApp({ app, router, siteData }) {
		app.component("Comment", comment);
	},
};

