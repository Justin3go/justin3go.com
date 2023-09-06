// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import comment from "./components/comment.vue";
import docFooterBefore from "./components/docFooterBefore.vue"
import share from "./components/share.vue"
import ad from "./components/ad.vue"

export default {
	...Theme,
	Layout: () => {
		return h(Theme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
			"doc-after": () => h(comment),
			"doc-footer-before": () => h(docFooterBefore),
			"aside-top": () => h(share),
			"aside-outline-after": () => h(ad),
		});
	},
	// @ts-ignore
	enhanceApp({ app, router, siteData }) {
		app.component("Comment", comment);
	},
};
