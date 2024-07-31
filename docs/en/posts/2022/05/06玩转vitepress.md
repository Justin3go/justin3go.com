---
title: 玩转 vitepress
date: 2022-05-06
tags: 
  - vitepress
  - vue
  - markdown
  - gitalk
---

# 玩转 vitepress

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在文章中分享了使用`vitepress`搭建个人网站的经历和技巧。最初在`0.22.x`版本时，笔者遇到了一些功能缺失的问题，但在发现`vitepress`正式版本发布后，兴奋地进行了升级，解决了之前的不满。

文章详细介绍了从`0.xx`版本迁移的步骤，以及如何快速启动站点。笔者强调了`markdown`文件与`HTML`文件的对应关系，并指出了避免死链接的重要性。此外，笔者分享了如何自定义站点的导航、侧边栏和主页布局，提供了相应的代码示例和配置选项。最后，笔者提到可以使用`vue`组件并介绍了自己开发的`many-pictures`组件及`gitalk`评论系统的集成，鼓励读者访问自己的个人博客以获取更多内容。

<!-- DESC SEP -->

---

当初 1 月份的时候为了后续春招求职，就使用`vitepress`搭建了一个个人网站，然后把自己本地的一些 md 文件整理了发布在了上面，不过当时 vitepress 还未发布正式版本，还是`0.22.x`这样的版本，

所以其实有很多不满意的地方，比如侧边栏折叠之前没有，明暗模式之前没有，单篇文章的大纲好像也没有，侧边栏在不同 tab 下有问题，这些我不太确定，可能功能是有的，但是官方文档上没更新罢了

但现在我偶然发现不知不觉`vitepress`也发布了正式版本了，虽然目前仍然是`alpha`版本，但是之前诟病的地方全都没有了，文档上也清晰了非常多，我瞬间就兴奋起来了，赶紧拿之前那个旧网站试试，花了几天时间，将其升级到`1.xx`版本了

## 迁移

如果你和我一样，是从`0.xx`版本过来的，可以看这个[这里](https://vitepress.vuejs.org/guide/migration-from-vitepress-0)

## 开始

你可以看[这里](https://vitepress.vuejs.org/guide/getting-started)了解最详细的开始操作，这里对于快速启动一个站点就不过多赘述，官方已经讲得很详细了，这边只讲讲我觉得重要的部分（在此之前你应该至少根据官方文档启动你的站点）。
其中最重要的就是你需要理解文件中的`markdown`文件对应的是什么，官方文档中也有解释：每个`markdown`文件都会解析成一`Html`文件，同时文件目录对应的就是你该文件在站点上的访问路径，比如你的项目根目录就是对应根路径。

如：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221031092013.png)

这是该文件在我项目中的位置，对应的它会被渲染为这样：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221031092136.png)

所以你只需要将你本地的`markdown`文件整理上传即可，然后你就可以根据路径访问对应的文件了，不过需要注意的是，你的 md 文件中不能包含`dead link`就是你的链接指向的文件根本不存在，这样会导致渲染失败，通常的方法就是根据提示去删除该路径，但如果你不想一一去删除，也可以直接在构建时忽略（不推荐）[方法](https://vitepress.vuejs.org/config/app-configs#ignoredeadlinks)

然后使用`vitepress`一个最重要的优势就是`vitepress`可以无缝编写 vue 组件使用，简单说说它的渲染过程，vitepress 首先会将`markdown`文件渲染为 html 文件，然后再交给 vue 编译器渲染，所以目前如果你在 vue 里面使用`markdown`的语法是不会被渲染的，只会被渲染为纯文本（不知道未来会不会支持），目前的解决方法就是 vue 组件里面放置选然后的 html 即可，可能这样说有点晦涩，举个例子：

如果我们使用`v-for`去批量生成某一字段时，下面这样是不可以的：

```html
// xxx.md
---
sidebar: false
---
<script setup>
import { beijing } from '../const/imgLink.ts'
</script>
# 图集 in 北京
<div v-for='item in beijing'>
   ## {{item[0].title}}
  <many-pictures :srcImgs='item' :lazy='true' />
</div>
```

上面的`## { {item[0].title} }`只会经过 vue 编译器的渲染，并不会经过`markdown`解析器的渲染，所以最终渲染结果相信你也猜到了，就是`## text`，而并不是对应的标题样式，解决方法如下：

```html
// xxx.md
---
sidebar: false
---
<script setup>
import { beijing } from '../const/imgLink.ts'
</script>
# 图集 in 北京
<div v-for='item in beijing'>
  <h2 :id="item[0].title" tabindex="-1">
    {{item[0].title}}
    <a class="header-anchor" :href="`#${item[0].title}`" aria-hidden="true">#</a>
  </h2>
  <many-pictures :srcImgs='item' :lazy='true' />
</div>
```

希望以后能加个比如`v-markdown`这样的包裹标签让里面的内容再经过一次 markdown 渲染...

## 生成主页
![](https://oss.justin3go.com/blogs/Pasted%20image%2020221031095921.png)
给你的站点来一个漂亮的主页，你可以直接使用`vitepress`给的主页模板

[详细配置](https://vitepress.vuejs.org/guide/theme-home-page)

[layout 的三种情况](https://vitepress.vuejs.org/guide/theme-layout)

## 简单配置

上述的`markdown`文件渲染都是`vitepress`自动识别渲染的，并不需要额外的配置，所以站点的`nav`、`sidebar`、`aside`这些需要我们自己配置一下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221031094018.png)

接下来的配置都是在`/.vitepress/config.js`中操作的，这也是我们最重要的一个文件

### base 

```ts
module.exports = {
    title: "XXXX",// 网站标题
    description: 'XXXX', //网站描述
    // base: '/',
    lang: 'zh-CH', //语言
    repo: 'vuejs/vitepress',
    head: [
        // 改变 title 的图标
        [
            'link',
            {
                rel: 'icon',
                href: 'https://oss.justin3go.com/justin3goAvatar.ico',
            },
        ]
    ],
}
```
### nav

```ts
module.exports = {
	// ... other config
    // 主题配置
    themeConfig: {
        //   头部导航
        nav: [
            { text: '首页', link: '/' },
            { text: '知识库', link: '/知识库/' },
            { text: '博客', link: '/博客/' },
            {
                text: '图集', items: [
                    { text: '重庆', link: '/图集/重庆' },
                    { text: '北京', link: '/图集/北京' },
                    { text: '校园', link: '/图集/校园' },
                ]
            }
        ],
	}
}
```
![](https://oss.justin3go.com/blogs/Pasted%20image%2020221031095315.png)
### aside

```ts
module.exports = {
	// ... other config
    // 主题配置
    themeConfig: {
        outline: [2, 4],  // 识别<h2>-<h4>的标题
        outlineTitle: '大纲', // aside 第一行显示的文本
	}
}
```
![](https://oss.justin3go.com/blogs/Pasted%20image%2020221031095332.png)
### sidebar

```ts
module.exports = {
	// ... other config
    // 主题配置
    themeConfig: {
                //   侧边导航

        sidebar: {

            '/知识库/': [], // 根据不同的路径前缀显示不同的侧边栏

            '/博客/': [
                {
                    text: '2022',
                    link: '/博客/2022/',
                    collapsible: true,  // 可折叠
                    items: [
                        { text: '都 2022 年了，还是得学圣杯布局与双飞翼布局', link: '/博客/2022/01 都 2022 年了，还是得学圣杯布局与双飞翼布局' },
                        { text: 'TypeScript 入门', link: '/博客/2022/02TypeScript 入门' },
                        { text: '这道题原来可以用到 JS 这么多知识点！', link: '/博客/2022/03 这道题原来可以用到 JS 这么多知识点！' },
                        { text: 'git 常用操作', link: '/博客/2022/04git 常用操作' },
                        { text: '前端程序员搭建自己的 CodeIDE（code-server 教程）', link: '/博客/2022/05 前端程序员搭建自己的 CodeIDE（code-server 教程）' },
                    ]
                },
                {
                    text: '2021',
                    link: '/博客/2021/',
                    collapsible: true,
                    items: [
                        { text: 'scrapy 爬虫详解', link: '/博客/2021/01scrapy 爬虫详解' },
                        { text: 'TFIDF 计算的学习', link: '/博客/2021/02TFIDF 计算的学习' },
                        { text: '操作系统内存分配模拟程序', link: '/博客/2021/03 操作系统内存分配模拟程序' },
                        { text: '散列表实现查找', link: '/博客/2021/04 散列表实现查找' },
                    ]
                },
                {
                    text: '2020',
                    link: '/博客/2020/',
                    collapsible: true,
                    items: [
                        { text: 'Java 迷宫', link: '/博客/2020/01Java 迷宫' },
                        { text: '使用 anaconda 中的 Prompt 配置虚拟环境的常用命令', link: '/博客/2020/02 使用 anaconda 中的 Prompt 配置虚拟环境的常用命令' },
                    ]
                },
            ],
        },
	}
}
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221031095345.png)
### 其他
配置项有很多，大家可以直接参考官方文档选择自己需要的配置项

[参考 1](https://vitepress.vuejs.org/guide/theme-introduction)

[参考 2](https://vitepress.vuejs.org/config/introduction)

常用的有这些：

```ts
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Justin3go' },
            {
                icon: {
                    svg: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="zhuzhan-icon"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.73252 2.67094C3.33229 2.28484 3.33229 1.64373 3.73252 1.25764C4.11291 0.890684 4.71552 0.890684 5.09591 1.25764L7.21723 3.30403C7.27749 3.36218 7.32869 3.4261 7.37081 3.49407H10.5789C10.6211 3.4261 10.6723 3.36218 10.7325 3.30403L12.8538 1.25764C13.2342 0.890684 13.8368 0.890684 14.2172 1.25764C14.6175 1.64373 14.6175 2.28484 14.2172 2.67094L13.364 3.49407H14C16.2091 3.49407 18 5.28493 18 7.49407V12.9996C18 15.2087 16.2091 16.9996 14 16.9996H4C1.79086 16.9996 0 15.2087 0 12.9996V7.49406C0 5.28492 1.79086 3.49407 4 3.49407H4.58579L3.73252 2.67094ZM4 5.42343C2.89543 5.42343 2 6.31886 2 7.42343V13.0702C2 14.1748 2.89543 15.0702 4 15.0702H14C15.1046 15.0702 16 14.1748 16 13.0702V7.42343C16 6.31886 15.1046 5.42343 14 5.42343H4ZM5 9.31747C5 8.76519 5.44772 8.31747 6 8.31747C6.55228 8.31747 7 8.76519 7 9.31747V10.2115C7 10.7638 6.55228 11.2115 6 11.2115C5.44772 11.2115 5 10.7638 5 10.2115V9.31747ZM12 8.31747C11.4477 8.31747 11 8.76519 11 9.31747V10.2115C11 10.7638 11.4477 11.2115 12 11.2115C12.5523 11.2115 13 10.7638 13 10.2115V9.31747C13 8.76519 12.5523 8.31747 12 8.31747Z" fill="currentColor"></path></svg>'
                }, link: 'https://space.bilibili.com/434542518'
            },
        ],
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright© 2021-2022 Justin3go-渝 ICP 备 2021006879 号'
        },
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },
```
## 样式
细心的同学应该都能发现我站点的字体是不一样的，还有一些其他小细节的修改，那么我们该如何覆盖原有的样式呢？

`vitepress`同样也提供了相当丰富的可覆盖样式供我们自定义：

[参考链接](https://vitepress.vuejs.org/guide/theme-introduction#extending-the-default-theme)

## 使用 vue 组件
[参考链接](https://vitepress.vuejs.org/guide/using-vue)
### many-pictures
为了存放多张图片，我自己简单编写了一个 vue 组件在`vitepress`中使用，你可以在[github 链接](https://github.com/Justin3go/many-pictures)中看到如何在 vitepress 中使用 vue 组件的详细例子
### gitalk
具体用法可以参考[官方文档](https://github.com/gitalk/gitalk)
简单来说它就是先要获取你 github 的 key，即可操作你 github 的一些东西，然后它就是将评论数据存储你建立的某个仓库的 issue 里，下面是我使用`gitalk`在`vitepress`中的配置
```vue
// docs\.vitepress\theme\components\Comment.vue
<template>
  <div id="gitalk-container"></div>
</template>
<script lang="ts" setup>
import "gitalk/dist/gitalk.css";
import Gitalk from "gitalk";
import { onMounted } from "vue";
// import { useData } from "vitepress";
// const relativePath = useData().page.value.relativePath;
const gitalk = new Gitalk({...});
onMounted(() => {
  gitalk.render("gitalk-container");
});
</script>
<style scoped>
</style>
```

```js
// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import './custom.css';
import Comment from "./components/Comment.vue";
import 'many-pictures/es/style.css'
import manyPictures from 'many-pictures';
  
export default {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册组件
    app.component("Comment", Comment);
    app.use(manyPictures);
  },
};
```

## 其他
- 静态文件的处理同样重要，不过我都是上传了对象存储的，所以就没有对这一部分进行处理，大家如果有需要可以参考这个[链接](https://vitepress.vuejs.org/guide/asset-handling)
- vitepress 中使用的`markdown`渲染器是`markdown-it`，所以你可以使用其生态下的几乎所有插件，[参考链接](https://vitepress.vuejs.org/guide/markdown#advanced-configuration)
- 部署就老生常谈了，就没单独拿出来细说，可以参考[链接](https://vitepress.vuejs.org/guide/deploying)
## 最后
欢迎大家访问我的个人博客[jutin3go.com](https://justin3go.com/)
- 知识库：内容为整理所得，还未将本地的数据整理完，以及一些非 markdown 文件，如书籍笔记、手写笔记等整理工作量较大
- 博客：偶尔花一点时间写的一篇文章，如这篇文章就是这个类别
- 图集：满足自己拍照的爱好


