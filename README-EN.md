<p align="center">
  <a href="https://justin3go.com" target="blank">
    <img src="/images/ava.png" height="200px" alt="logo" />
    <h1 align="center">&lt; Welcome to justin3go.com /&gt;</h1>
  </a>
</p>



[![](https://img.shields.io/badge/vitepress-1.0.0.rc35-brightgreen)](https://github.com/vuejs/vitepress) ![](https://oss.justin3go.com/blogs/typescript-typescript-blue.svg) [![](https://img.shields.io/badge/comment-giscus-orange)](https://github.com/giscus/giscus)

A fully-featured, modern, and elegant [static blog](https://justin3go.com), based on vitepress, integrated with giscus comments, and a simple home page design; primarily records ✍️ my blogs and notes.

> Updates will be released every weekend if there are any, and article publications and website modifications will be recorded in the release. Welcome to star⭐/watch for the latest updates~

## Features

- Switch between white/night using different theme colors (blue/yellow)
- Integrated with giscus comments
- Automatically generates [RSS subscription file](https://justin3go.com/feed.xml)
- Short link generation, generating social-sharing-friendly links for semantic Chinese URLs, such as [justin3go.com/s?u=590f2bc50aa](justin3go.com/s?u=590f2bc50aa)
- Automatically generates recent article directory on the home page
- Home page video playback and mobile downgrade display as pictures
- [github action](https://github.com/Justin3go/justin3go.github.io/blob/master/.github/workflows/deploy.yml) monitors push operations, automatically deploys to github page
- [github action](https://github.com/Justin3go/justin3go.github.io/blob/master/.github/workflows/release.yml) automatically generates [Changelog](https://github.com/Justin3go/justin3go.github.io/blob/master/CHANGELOG.md)
- Integrated with google analytic and google adsense
- Social sharing optimization: generates twitter cards
- Global image large-scale preview

## Branch Introduction

- The master branch is the official branch for releasing versions, automatically monitoring Push releases
- The online branch is the online branch for deployment, automatically monitoring Push deployment
- Other branches are feature branches for development

## Demonstration Screenshots

![image](/images/HomePreview.png)

![image](/images/BlogArchivePreview.png)

![image](/images/StudyNotesPreview.png)

## Recommended Related Reading

> The following links are some blog records during the author's site building process, which may be helpful to you

- [Introducing Tdesign into vitepress and globally adding large image preview](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/09/29vitepress%E4%B8%AD%E5%BC%95%E5%85%A5Tdesign%E5%B9%B6%E5%85%A8%E5%B1%80%E5%A2%9E%E5%8A%A0%E5%A4%A7%E5%9B%BE%E9%A2%84%E8%A7%88.html)
- [Adding twitter/x card in vitepress](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/09/28vitepress%E4%B8%AD%E5%A2%9E%E5%8A%A0twitter%E5%8D%A1%E7%89%87.html)
- [Adding short link generation function to vitepress](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/08/18%E7%BB%99vitepress%E5%A2%9E%E5%8A%A0%E7%9F%AD%E9%93%BE%E6%8E%A5%E7%94%9F%E6%88%90%E5%8A%9F%E8%83%BD.html)
- [Adding an RSS subscription to the vitepress blog](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/06/18vitepress%E5%8D%9A%E5%AE%A2%E9%87%8C%E5%A2%9E%E5%8A%A0%E4%B8%80%E4%B8%AARSS%E8%AE%A2%E9%98%85.html)
- [Simply optimizing the personal blog homepage (migrating to vitepress-beta version)](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/06/06%E7%AE%80%E5%8D%95%E4%BC%98%E5%8C%96%E4%B8%8B%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E9%A6%96%E9%A1%B5(%E8%BF%81%E7%A7%BBvitepress-beta%E7%89%88).html)
- [Simply adding a subscription function to a personal blog](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/03/31%E6%9E%81%E7%AE%80%E5%9C%B0%E7%BB%99%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E6%B7%BB%E5%8A%A0%E8%AE%A2%E9%98%85%E5%8A%9F%E8%83%BD.html)
- [Playing with vitepress](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2022/06%E7%8E%A9%E8%BD%ACvitepress.html)

## Home Page Design Philosophy

**The Running Wolf**

The author's pen name is `Justin3go`, where `Justin` is my English name, and `3go` represents `go go go`, which can also be seen as `just in go go go`. The wolf is my favorite animal, and running corresponds to `go go go`.

**About the Author**

1. Relevant social links are placed in this section of the homepage. In the author's opinion, this is more intuitive and does not affect the reading experience. Only the RSS subscription is placed in the global upper right corner of the website, because the RSS subscription is more strongly related to the site, and too many link `icons` placed in the upper right corner appear cluttered;
2. Added the usage proportion of the author's tech stack, after all, as a tech blog website, readers can understand the author's tech stack through this section, thereby better understanding the type of blog articles of the author, to judge whether this blog website is suitable for them;
3. react seems to be classified as ts/js due to the tsx\jsx suffix, this is automatically classified by wakatime, let it be.

**Recently Released**

1. Why not make pagination to display all articles, the author understands that readers will only look at the most recent few articles, just like 80% of people will not click on the second page of google search results;
2. As for wanting to view the author's previous articles, just click on the author's blog archive directly, the sidebar plus content plus outline is a very good reading page setting in the author's understanding;
3. Why not make a summary, only the title: lazy🤣.

**Message Board**

Why is there a message board on the main page, isn't every article can be commented on? The message board is more about leaving messages for the entire website or the author, not for specific content.

## Local Development

```shell
npm i -g pnpm
# Install dependencies
pnpm install
pnpm docs:dev
```

> It is worth noting that the parameters in the gitcus comment component need to be generated by yourself, otherwise the comments will appear in this repository instead of your repository, [click the link for details](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/comment.vue)

## ChangeLog

For detailed information, see [here](https://github.com/Justin3go/justin3go.github.io/blob/master/CHANGELOG.md)

## License

All files with the suffix `.md` in this repository are licensed under the following agreement:

> Creative Commons Attribution 4.0 International License, this work is licensed under a Creative Commons Attribution 4.0 International License.
> 
> You are free to share and adapt this work, but must follow the following conditions: Attribution: You must give appropriate attribution, provide a link to this license, and indicate if modifications were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
> 
> [Detailed license terms and conditions can be seen at this link](https://creativecommons.org/licenses/by/4.0/legalcode.zh-Hans)

Other files are under the MIT license, [detailed license terms and conditions can be seen at this link](https://zh.wikipedia.org/zh-cn/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)
