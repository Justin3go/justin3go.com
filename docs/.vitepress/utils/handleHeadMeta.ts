import { type HeadConfig, type TransformContext } from "vitepress";

// 处理每个页面的元数据
export function handleHeadMeta(context: TransformContext) {
  const { description, title, relativePath } = context.pageData;
  // 增加Twitter卡片
  const twitterCard: HeadConfig = ["meta", { name: "twitter:card", content: "summary" }]
  const twitterSite: HeadConfig = ["meta", { name: "twitter:site", content: "@_Justin3go" }]
  const twitterCreator: HeadConfig = ["meta", { name: "twitter:creator", content: "@_Justin3go" }]
  const ogUrl: HeadConfig = ["meta", { property: "og:url", content: addBase(relativePath.slice(0, -3)) }]
  const ogTitle: HeadConfig = ["meta", { property: "og:title", content: title }]
  const ogDescription: HeadConfig = ["meta", { property: "og:description", content: description || '' }]
  const ogImage: HeadConfig = ["meta", { property: "og:image", content: "https://oss.justin3go.com/justin3goAvatar.png" }]

  const twitterHead: HeadConfig[] = [twitterCard, twitterSite, twitterCreator, ogUrl, ogTitle, ogDescription, ogImage]

  return twitterHead
}

function addBase(relativePath: string) {
  return 'https://justin3go.com/' + relativePath
}