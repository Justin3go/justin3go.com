---
title: 原来 Vue.js 还有这么多好用的 UI 组件库
date: 2023-08-31
tags: 
  - Vue.js
  - UI 组件库
  - PrimeVue
  - Headless UI
  - Vuetify
  - Quasar
  - Radix-Vue
  - DaisyUI
---

# 原来 Vue.js 还有这么多好用的 UI 组件库

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇博客中，笔者通过对一段推文的探讨，深入研究了多个优秀的 Vue.js UI 组件库，并分享了自己的发现。笔者认为，尽管 Vue.js 的组件库数量可能不如 React 丰富，但仍有不少值得关注的选项。以下是一些推荐的库：

- **PrimeVue**：提供超过 90 个高质量组件，易于定制和使用。
- **Headless UI**：无样式组件，完美集成 Tailwind CSS。
- **Vuetify**：基于 Material Design 规范，灵活且社区活跃。
- **Quasar**：一站式解决方案，支持多平台开发。
- **Radix-Vue**：兼容 Vue 和 Nuxt，注重可访问性和开发者体验。
- **DaisyUI**：为 Tailwind CSS 提供组件类名，简化开发。

最后，笔者提到国内也有诸多优秀组件库，如 element-plus 和 vant 等，最终决定在 Vuetify 和 Quasar 之间进行选择。

<!-- DESC SEP -->

## 前言

前几天笔者在逛推的时候关注到[这样一篇帖子](https://twitter.com/marcelpociot/status/1695446928257896886)：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230830215053.png)

翻译下来就是这个：

> 相对于 React，我更喜欢 Vue，但是该死的 - Radix UI、shadcn、Tremor 等看起来都很棒。 Vue 肯定缺少一些顶级的 UI 组件库（特别是考虑到 Tailwind CSS）。或者至少我不知道有什么可比的

此话一出，大家都在评论区中分享出了自己认为的比较优秀的 Vue.js 相关的 UI 组件库了。正好，最近可能会使用 Vue 做一个 Web 项目，于是笔者大致翻了翻评论区，并做了一个简单的技术调研，想着就分享出来，可能对大家也有一定的参考价值。

衡量一个 UI 组件库是否优秀，肯定不止笔者下面提到的这些指标，比如还有文档的易读性，示例的完整，组件的美观，质量等等，但这些指标要么太过主观，要么很难用数据量化，所以这里仅给出一些直观的指标，具体可点击链接自行体验。

同时数据统计在 2023-08-31，注意数据的时效性。
## [primevue](https://primevue.org/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|4.3K|102,064|411|90+|[链接](https://primevue.org/)|

亮点简介：

1. PrimeTek 库在 npm 上的下载量已超过 1.1 亿！加入 PrimeLand 社区，亲身体验其中的差异。
2. 超过 90 个具有一流品质的 Vue UI 组件可帮助您以时尚的方式实现所有 UI 要求。
3. 在与设计无关的基础架构上制作，可以从大量主题中进行选择，例如材料、引导、顺风、primone 或开发自己的主题。
4. 400 多个可复制粘贴的 UI 块可立即构建精彩的应用程序。
5. Designer 是创建您自己的 PrimeVue 体验的终极工具，由基于 SASS 的主题引擎（具有 500 多个变量）和可视化设计器提供支持。
6. 专业设计的高度可定制的应用程序模板，以时尚的方式开始使用。
7. PrimeVue 是满足您的 UI 要求的最完整的解决方案。

文档预览：

![](https://oss.justin3go.com/blogs/primevue.gif)

## [headlessui](https://headlessui.com/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|22K|157,614|9|10|[链接](https://headlessui.com/vue/menu)|

亮点简介：

1. 完全无样式、完全可访问的 UI 组件，旨在与 Tailwind CSS 完美集成。
2. NuxtLabs UI 基于此构建

文档预览：

![](https://oss.justin3go.com/blogs/headlessui.gif)

## [vuetify](https://vuetifyjs.com/zh-Hans/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|37.9K|468,380|1K|80+|[链接](https://vuetifyjs.com/zh-Hans/)|

亮点简介：

1. Vuetify 是一个功能强大的 Vue 组件框架，从底层开始构建，易学易用。我们的 UI 组件集合可在您的应用程序中保持一致的风格，并提供足够的自定义选项以满足任何使用情况。
2. **免费**：Vuetify 是一个开源项目，根据 [MIT licensed](http://opensource.org/licenses/MIT) 授权免费提供。此外，Vuetify 的源代码可在 GitHub 上获取，开发人员可根据自己的选择进行修改并为其开发做出贡献。
3. **灵活**：Vuetify 中的每个组件都是根据 Google 的 [Material Design 规范](https://material.io/) 手工制作的，并提供数百个自定义选项，适合任何风格或设计。即使不是 Material Design 也是如此。只需使用**props**、**slots（插槽）** 和 **components（组件）**，或将它们结合使用，就能随心所欲地编写简洁或冗长的 Vue 模板。
4. **社区活跃**：自 2016 年以来，Vuetify 一直在积极开发中，并不断以极快的速度响应社区问题和报告，让您能够更频繁地获得错误修复和增强功能

文档预览：

![](https://oss.justin3go.com/blogs/vuetify.gif)

## [quasar](https://quasar.dev/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|24.2K|112,505|422|70+|[链接](https://quasar.dev/)|

亮点简介：

1. **一站式所有平台**：同时适用于所有平台的一个权威代码源：响应式桌面/移动网站（SPA、SSR + SPA 客户端接管、SSR + PWA 客户端接管）、PWA（渐进式 Web 应用程序）、移动应用程序（看起来原生）和多平台桌面应用程序（通过 Electron）。
2. **最大的顶级、快速且响应迅速的 Web 组件集**：Quasar 中几乎有一个组件可以满足所有 Web 开发需求。 Quasar 的每个组件都经过精心设计，旨在为您的用户提供最佳的体验。 Quasar 的设计考虑到了性能和响应能力 - 因此使用 Quasar 的开销几乎不明显。这种对性能和良好设计的关注让我们感到特别自豪。
3. **默认集成的最佳实践**：Quasar 的建立也是为了鼓励开发人员遵循 Web 开发最佳实践。为此，Quasar 具有开箱即用的强大功能 - 无需配置。
4. **应用程序扩展支持**：Quasar 应用程序扩展是一种轻松地将复杂（或简单）设置​​注入您的网站/应用程序的方法。它们也是我们大社区做出贡献并帮助您更快上手的一种方式。开发模式实际上打​​开了闸门，使 Quasar 成为最具可扩展性和最强大的框架之一 - 仅受您的想象力和创新的限制。
5. **全面的 RTL 支持**：对 Quasar 组件和开发人员自己的代码的 RTL（从右到左）支持。如果使用 RTL 语言包，开发人员编写的网站/应用程序 CSS 代码会自动转换为 RTL。
6. **逐步迁移现有项目**：Quasar 提供 UMD（统一模块定义）版本，这意味着开发人员可以将 CSS 和 JS HTML 标签添加到现有项目中，然后就可以使用它了。不需要构建步骤。
7. **专注于你的功能，而不是样板**：使用 Quasar CLI 进行顶级项目初始化，使作为开发人员的您可以轻松上手。您可以在创纪录的时间内将您的想法变成现实。换句话说，Quasar 为您完成了繁重的工作，因此您可以自由地专注于您的功能而不是样板。
8. **自动化测试和审计**：Quasar 项目能够添加开箱即用的单元和端到端测试工具，以及不断增长的产品质量和安全审核工具套件。所有这些都是为了确保您的网站/应用程序具有尽可能高的质量。
9. **令人惊叹的不断发展的社区**：当开发人员遇到无法解决的问题时，他们可以访问 Quasar 论坛或我们的 Discord 聊天服务器。社区随时为您提供帮助。您还可以通过在 Twitter 上关注我们来获取新版本和功能的更新。您还可以获得作为支持者/赞助商的特殊服务，并帮助确保 Quasar 在未来与您保持相关性！
10. **广泛的平台支持**：Google Chrome、Firefox、Edge、Safari、Opera、iOS、Android、MacOS、Linux、Windows。
11. **语言包**：Quasar 配备了 40 多种开箱即用的语言包。最重要的是，如果您的语言包丢失，只需 5 分钟即可添加。
12. **很棒的文档**：最后，值得一提的是，我们花费了大量的时间来编写出色的、简洁的、重点突出且完整的文档，以便开发人员可以快速掌握 Quasar。我们在文档中付出了特别的努力，以确保不会出现混淆。

文档预览：

![](https://oss.justin3go.com/blogs/quasar.gif)

## [radix-vue](https://www.radix-vue.com/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|882|1336|7|约 30|[链接](https://www.radix-vue.com/)|

亮点简介：

1. **支持 Vue、Nuxt**：为 Vue 框架构建，它与构建在 Vue 之上的任何元框架兼容。
2. **省时**：基于顶级 Radix 组件构建将为您节省时间和金钱，因此您可以更快地交付更好的产品。
3. **开箱即用的可访问性**：符合 WAI-ARIA 标准。支持键盘导航和焦点管理。
4. **开发者体验第一**：无风格、易于定制，非常适合构建设计系统和网络应用程序。

文档预览：

![](https://oss.justin3go.com/blogs/radix-vue.gif)

## [nuxtui](https://ui.nuxtlabs.com/getting-started)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|1.6K|4068|98|30+|[链接](https://ui.nuxtlabs.com/getting-started)|

亮点简介：

1. 使用 Headless UI 和 Tailwind CSS 构建
2. 通过 Nuxt App Config 提供 HMR 支持
3. 深色模式支持
4. 支持 LTR 和 RTL 语言
5. 键盘快捷键
6. 捆绑的图标
7. 类型支持

文档预览：

![](https://oss.justin3go.com/blogs/nuxtui.gif)

## [anu-vue](https://anu-vue.netlify.app/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|922|217|19|20+|[链接](https://anu-vue.netlify.app/guide)|

亮点简介：

1. Anu 在构建时就考虑到了 DX。在整个文档中，您将注意到只需最少的代码即可呈现出色的 UI。
2. 借助 UnoCSS 的任意值和组件自定义，您可以立即构建所需的 UI。
3. 这是 Anu 最令人兴奋和喜爱的功能。通过可配置数组自定义渲染的 UI。
4. Anu 提供整洁且精心制作的 UI 组件来构建令人惊叹且专业的 UI。
5. Anu 构建在 UnoCSS、VueUse 等强大工具之上 - 为您节省大量开发时间。
6. Anu 可通过 UnoCSS 快捷方式进行配置。根据您的喜好自定义组件的各个方面。

文档预览：

![](https://oss.justin3go.com/blogs/anu-vue.gif)
## [vuestic](https://ui.vuestic.dev/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|3K|5214|376|60+|[链接](https://ui.vuestic.dev/)|

亮点简介：

1. 无障碍：专为所有用户设计
2. 响应式：适应各种屏幕和设备
3. 全局配置：轻松定制组件
4. 深色主题：时尚的内置深色模式
5. i18n 集成：简化应用程序本地化
6. 可定制：根据您的设计调整组件
7. 专业支持：核心团队快速可靠的协助
8. 有一个基于该 UI 的 Admin 在[github](https://github.com/epicmaxco/vuestic-admin)非常受欢迎

文档预览：

![](https://oss.justin3go.com/blogs/vuestic.gif)
## [daisyui](https://daisyui.com/)

|github stars|npm 周下载量|Issues 数|组件数量|官网地址|
|-|-|-|-|-|
|24.3K|169,653|48|50+|[链接](https://daisyui.com/)|

亮点简介：

1. daisyUI 将组件类名添加到 Tailwind CSS ，这样您就可以比以往更快地制作精美的网站。
2. 在 Tailwind CSS 项目中，您需要为每个元素编写实用程序类名称。数千个类名只是为了设计最基本的元素。
3. 它具有描述性、更快、更干净且更易于维护。
4. 使用 daisyUI，您编写的类名减少了 80% ，您的 HTML 大小将减小约 70%。
5. daisyUI 是 Tailwind CSS 的插件。它适用于所有 JS 框架，并且不需要 JS 捆绑文件。
6. daisyUI 向 Tailwind CSS 添加了一组可自定义的颜色名称，这些新颜色使用 CSS 变量作为值。使用 daisyUI 颜色名称，您无需添加新的类名称即可获得深色模式甚至更多主题。
7. 您的网站应该是独一无二的。使用 daisyUI 主题生成器为自己创建自定义主题。您选择的颜色将应用于所有 daisyUI 组件。

文档预览：

![](https://oss.justin3go.com/blogs/daisyui.gif)

## 最后

当然，除了上述 UI 组件库是那篇帖子中提到的一些推荐，国内也有非常多背靠大厂或者社区驱动的优秀组件库，这些大家可能非常熟悉，比如：

- element-plus
- tdesign
- varlet（这个名字好记）
- arco.design
- vant
- naiveUI
- ...暂时只想起这么多......

这次想体验一下没使用过的组件库，综上应该会在 vuetify、quasar 之间选择使用，或者也可以考虑 daisyUI