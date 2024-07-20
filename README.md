<h4 align="right"><strong>English</strong> | <a href="./README.zh.md">简体中文</a> | <a href="./README.ja.md">日本語</a></h4>

<div align="center">

<a href="https://fav0.com" target="blank">
  <img src="https://fav0.com/favicon-512x512.png" height="100px" alt="logo" style="border-radius: 20px"/>
</a>

# FAV0 Weekly

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![VitePress](https://img.shields.io/badge/VitePress-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vue-3](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TDesign](https://img.shields.io/badge/TDesign-0052CC?style=for-the-badge&logo=tdesign&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Giscus](https://img.shields.io/badge/Giscus-181717?style=for-the-badge&logo=github&logoColor=white)
![Support RSS](https://img.shields.io/badge/Support%20RSS-FFA500?style=for-the-badge&logo=rss&logoColor=white)
![Support I18N](https://img.shields.io/badge/Support%20I18N-0078D4?style=for-the-badge&logo=google-translate&logoColor=white)
![SEO](https://img.shields.io/badge/SEO-4285F4?style=for-the-badge&logo=google&logoColor=white)

Record what I see and hear every week, mainly focusing on front-end, AI, and computer-related content.

Updated every Saturday/weekend, with updates synchronized with releases. Feel free to star/watch releases in custom to stay updated with the latest weekly releases.

[![changelog](https://img.shields.io/badge/changelog-→-0052CC?style=for-the-badge&logo=ReSharper&logoColor=white)](./CHANGELOG.md)


[![PR Welcome](https://img.shields.io/badge/PR-Welcome-EA4AAA?style=for-the-badge&logo=git&logoColor=white)](https://github.com/Justin3go/FAV0/pulls)
[![Request-Feature](https://img.shields.io/badge/Request-Feature-007BFF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Justin3go/FAV0/issues/new/choose)
[![Report-Bug](https://img.shields.io/badge/Report-Bug-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Justin3go/FAV0/issues/new/choose)

![demo](./images/demo.png)

</div>

## Features


1. 🌓 Provides light and dark mode switching to adapt to different reading environments.
2. 🌍 Supports bilingual interface in Chinese and English for the convenience of users of different languages.
3. 📡 Provides RSS subscription function, supporting updates in both Chinese and English.
4. 💬 Integrated Giscus comment system for user communication and feedback.
5. 🖼️ Supports high-definition image preview for optimized visual experience.
6. 📜 Allows customization of font settings for improved reading comfort.
7. 🔍 Performs SEO optimization, including Sitemap generation, Twitter Card, and Open Graph tag support to improve search engine visibility.


## Development

```bash
git clone git@github.com:Justin3go/FAV0.git
cd FAV0

npm i -g pnpm # if needed
pnpm i
pnpm docs:dev
```
1. Modify the giscus comment configuration in `.vitepress/theme/components/Comments.vue`, specifically the `giscus` configuration;
2. Modify the sidebar configuration, RSS configuration, metadata configuration, etc., in the `utils` folder;
3. Modify the related configurations in the `config` folder, mainly title, description, etc.;
4. Change the content of the articles in the `posts/**` and `en/posts/**` directories to your own content;

## License

This repository is dual-licensed under the MIT License and CC-BY-4.0 License:

- All `.md` files are licensed under the CC-BY-4.0 License, you need to retain attribution.
- Other code files are licensed under the MIT License, you may use them freely.

For more details, please see the [LICENSE](./LICENSE) file.
