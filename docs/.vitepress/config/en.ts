import { defineConfig} from 'vitepress'

import { createSideBarEN } from "../theme/utils/createSideBar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Justin3go",
  description: "A T-shaped front-end developer who is committed to deepening expertise in the technical field, focuses on independent development and AI, enjoys working with Vue.js and Nest.js, and has some knowledge of Python, search engines, NLP, Web3, and back-end development.",
  lang: "en-US", //语言

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
			{ text: "Blog", link: "/en/" },
      { text: "Archive", link: "/en/archive/", activeMatch: '/en/archive/' },
			{ text: "Notes", link: "/en/notes/", activeMatch: '/en/notes/' },
			{ text: "About", link: "/en/about", activeMatch: '/en/about' },
    ],

    sidebar: createSideBarEN(),

    socialLinks: [
      { icon: 'x', link: 'https://x.com/Justin1024go' },
      { icon: 'github', link: 'https://github.com/Justin3go/justin3go.com' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>RSS</title><path d="M108.56,342.78a60.34,60.34,0,1,0,60.56,60.44A60.63,60.63,0,0,0,108.56,342.78Z"/><path d="M48,186.67v86.55c52,0,101.94,15.39,138.67,52.11s52,86.56,52,138.67h86.66C325.33,312.44,199.67,186.67,48,186.67Z"/><path d="M48,48v86.56c185.25,0,329.22,144.08,329.22,329.44H464C464,234.66,277.67,48,48,48Z"/></svg>',
        },
        link: "/feed-en.xml",
      },
    ],

    editLink: {
      pattern: "https://github.com/Justin3go/justin3go.com/edit/master/docs/:path"
    },
  },
})
