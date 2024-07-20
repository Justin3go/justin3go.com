<h4 align="right"><a href="./README.md">English</a> | <strong>简体中文</strong> | <a href="./README.ja.md">日本語</a></h4>

<div align="center">

<a href="https://fav0.com" target="blank">
  <img src="https://fav0.com/favicon-512x512.png" height="100px" alt="logo" style="border-radius: 20px"/>
</a>

# 《FAV0周刊》

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![VitePress](https://img.shields.io/badge/VitePress-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vue-3](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TDesign](https://img.shields.io/badge/TDesign-0052CC?style=for-the-badge&logo=tdesign&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Giscus](https://img.shields.io/badge/Giscus-181717?style=for-the-badge&logo=github&logoColor=white)
![Support RSS](https://img.shields.io/badge/Support%20RSS-FFA500?style=for-the-badge&logo=rss&logoColor=white)
![Support I18N](https://img.shields.io/badge/Support%20I18N-0078D4?style=for-the-badge&logo=google-translate&logoColor=white)
![SEO](https://img.shields.io/badge/SEO-4285F4?style=for-the-badge&logo=google&logoColor=white)

记录每周所见所闻，主要关注前端、AI领域以及计算机相关内容

每周六/周末更新，更新同步release一次，欢迎star/watch releases in custom关注最新周刊发布

[![changelog](https://img.shields.io/badge/changelog-→-0052CC?style=for-the-badge&logo=ReSharper&logoColor=white)](./CHANGELOG.md)


[![PR Welcome](https://img.shields.io/badge/PR-Welcome-EA4AAA?style=for-the-badge&logo=git&logoColor=white)](https://github.com/Justin3go/FAV0/pulls)
[![Request-Feature](https://img.shields.io/badge/Request-Feature-007BFF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Justin3go/FAV0/issues/new/choose)
[![Report-Bug](https://img.shields.io/badge/Report-Bug-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Justin3go/FAV0/issues/new/choose)

![demo](./images/demo.png)

</div>

## 功能特性


1. 🌓 提供明暗模式切换功能，适应不同的阅读环境。
2. 🌍 支持中英双语界面，方便不同语言用户的使用。
3. 📡 提供RSS订阅功能，支持中英文内容更新推送。
4. 💬 集成Giscus评论系统，便于用户交流和反馈。
5. 🖼️ 支持高清大图预览，优化视觉体验。
6. 📜 允许自定义字体设置，提升阅读舒适度。
7. 🔍 进行SEO优化，包括Sitemap生成、Twitter Card和Open Graph标签支持，提高搜索引擎可见性。


## 开发

```bash
git clone git@github.com:Justin3go/FAV0.git
cd FAV0

npm i -g pnpm # 如果需要
pnpm i
pnpm docs:dev
```
1. 修改giscus评论配置，`.vitepress/theme/components/Comments.vue`中的`giscus`配置项;
2. 修改`utils`文件夹下的中的侧边栏配置、RSS配置、元信息配置等;
3. 修改`config`文件夹下的相关配置，主要是title、description等;
4. 修改`posts/**`与`en/posts/**`目录中的文章内容为自己的内容;

## 协议

本仓库采用双协议授权，即MIT协议和CC-BY-4.0协议：

- 所有`.md`文件采用CC-BY-4.0协议协议，你需要保留署名权
- 其他代码文件采用MIT协议，你可以自由使用

具体内容请查看[LICENSE](./LICENSE)文件。
