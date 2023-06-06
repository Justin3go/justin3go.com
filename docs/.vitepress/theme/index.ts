// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import comment from "./components/comment.vue";
import copyright from "./components/copyright.vue"

export default {
	...Theme,
	Layout: () => {
		return h(Theme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
			"doc-after": () => h(comment),
			"doc-footer-before": () => h(copyright),
		});
	},
	// @ts-ignore
	enhanceApp({ app, router, siteData }) {
		app.component("Comment", comment);
	},
};
