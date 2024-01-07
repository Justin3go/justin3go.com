<p align="center">
  <a href="https://justin3go.com" target="blank">
    <img src="/images/ava.png" height="200px" alt="logo" />
    <h1 align="center">&lt; Welcome to justin3go.com /&gt;</h1>
  </a>
</p>



[![](https://img.shields.io/badge/vitepress-1.0.0.rc35-brightgreen)](https://github.com/vuejs/vitepress) ![](https://oss.justin3go.com/blogs/typescript-typescript-blue.svg) [![](https://img.shields.io/badge/comment-giscus-orange)](https://github.com/giscus/giscus)

一款功能齐全的、现代化的、简洁优雅的[静态博客](https://justin3go.com)，基于vitepress，集成giscus评论，简单设计了一下首页；主要记录✍️我的博客、笔记。

> 每周末如有更新release一次，文章发布以及网站修改会记录在release中，欢迎star⭐/watch关注最新动态~

[English Docs](./README-EN.md)

## 功能特点

- 白/夜切换使用不同主题色(蓝/黄)
- 集成giscus评论
- 自动生成[RSS订阅文件](https://justin3go.com/feed.xml)
- 短链接生成，为语义化中文URL生成易于社交分享的链接，如[justin3go.com/s?u=590f2bc50aa](justin3go.com/s?u=590f2bc50aa)
- 首页自动生成最近文章目录
- 首页视频播放以及移动端降级显示为图片
- [github action](https://github.com/Justin3go/justin3go.github.io/blob/master/.github/workflows/deploy.yml) 监听push操作，自动部署至github page
- [github action](https://github.com/Justin3go/justin3go.github.io/blob/master/.github/workflows/release.yml) 自动生成[Changelog](https://github.com/Justin3go/justin3go.github.io/blob/master/CHANGELOG.md)
- 集成google analytic 与 google adsense
- 社交分享优化：生成twitter卡片
- 全局图片大图预览

## 分支介绍

- master分支为正式分支，用于发布版本，自动监听Push发版
- online分支为线上分支，用于部署，自动监听Push部署
- 其他分支为功能分支，用于开发

## 演示截图

![image](/images/HomePreview.png)

![image](/images/BlogArchivePreview.png)

![image](/images/StudyNotesPreview.png)

## 相关阅读推荐

> 以下链接为笔者建站过程中的一些博客记录，也许对您有所帮助

- [vitepress中引入Tdesign并全局增加大图预览](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/09/29vitepress%E4%B8%AD%E5%BC%95%E5%85%A5Tdesign%E5%B9%B6%E5%85%A8%E5%B1%80%E5%A2%9E%E5%8A%A0%E5%A4%A7%E5%9B%BE%E9%A2%84%E8%A7%88.html)
- [vitepress中增加twitter/x卡片](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/09/28vitepress%E4%B8%AD%E5%A2%9E%E5%8A%A0twitter%E5%8D%A1%E7%89%87.html)
- [给vitepress增加短链接生成功能](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/08/18%E7%BB%99vitepress%E5%A2%9E%E5%8A%A0%E7%9F%AD%E9%93%BE%E6%8E%A5%E7%94%9F%E6%88%90%E5%8A%9F%E8%83%BD.html)
- [vitepress博客里增加一个RSS订阅](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/06/18vitepress%E5%8D%9A%E5%AE%A2%E9%87%8C%E5%A2%9E%E5%8A%A0%E4%B8%80%E4%B8%AARSS%E8%AE%A2%E9%98%85.html)
- [简单优化下个人博客首页(迁移vitepress-beta版)](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/06/06%E7%AE%80%E5%8D%95%E4%BC%98%E5%8C%96%E4%B8%8B%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E9%A6%96%E9%A1%B5(%E8%BF%81%E7%A7%BBvitepress-beta%E7%89%88).html)
- [极简地给个人博客添加订阅功能](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/03/31%E6%9E%81%E7%AE%80%E5%9C%B0%E7%BB%99%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E6%B7%BB%E5%8A%A0%E8%AE%A2%E9%98%85%E5%8A%9F%E8%83%BD.html)
- [玩转vitepress](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2022/06%E7%8E%A9%E8%BD%ACvitepress.html)

## 首页设计理念

**奔跑的狼**

笔者的笔名为`Justin3go`，`Justin`为我的英文名，`3go`代表的`go go go`，同时也可以看作`just in go go go`。狼是我喜欢的动物，奔跑则与`go go go`相对应。

**关于笔者**

1. 相关社交链接放在了首页这个部分，笔者认为这样更加直观，而且也不会影响阅读体验。只有RSS订阅放在了网站的全局右上角，因为RSS订阅更多的是与站点强相关的，过多的链接`icon`放在右上角显得杂乱；
2. 增加了笔者技术栈的使用占比，毕竟作为一个技术博客网站，读者可以通过这个部分了解笔者的技术栈，从而更好的了解笔者的博客文章类型，以判断该博客网站是否适合自己；
3. react由于是tsx\jsx后缀，好像分类为了ts/js，这是wakatime自动分类的，就这样吧；

**最近发布**

1. 为什么不做分页以展示全部的文章，笔者理解读者更多只会查看最近几篇文章，就和google搜索出来的结果80%的人都不会点击第二页一样；
2. 至于想要查看笔者以前的文章，则直接点击笔者的博客归档就可以了，侧边栏加内容加大纲的方式是笔者理解的一种非常好的阅读页面设置；
3. 为什么不做摘要，只有题目：懒🤣；

**留言板**

为什么主页还有增加留言板，不是每篇文章都可以评论吗？留言板更多是对整个网站或者笔者进行留言，而非针对具体内容。

## 本地开发

```shell
npm i -g pnpm
# 安装依赖
pnpm install
pnpm docs:dev
```

> 值得注意的是，gitcus评论组件中的参数需要你自己生成，否则评论会出现在该仓库而非你的仓库，[点击链接查看详情](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/comment.vue)

## ChangeLog

详细信息查看[这里](https://github.com/Justin3go/justin3go.github.io/blob/master/CHANGELOG.md)

## 协议

本仓库中所有后缀为`.md`的文件均采用以下协议进行许可：

> Creative Commons Attribution 4.0 International License,本作品采用知识共享署名 4.0 国际许可协议进行许可。
> 
> 您可以自由地共享和演绎本作品，但需遵循以下条件：署名：您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否作出了修改。您可以用任何合理的方式来署名，但不得以任何方式暗示许可人为您或您的使用背书。
> 
> [详细的许可证条款和条件可参见此链接](https://creativecommons.org/licenses/by/4.0/legalcode.zh-Hans)

其余文件均为 MIT 协议，[详细的许可证条款和条件可参见此链接](https://zh.wikipedia.org/zh-cn/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)
