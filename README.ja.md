<h4 align="right"><a href="./README.md">英語</a> | <strong>日本語</strong></h4>

<div align="center">

<a href="https://fav0.com" target="blank">
  <img src="https://fav0.com/favicon-512x512.png" height="100px" alt="logo" style="border-radius: 20px"/>
</a>

# 《FAV0週刊》

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![VitePress](https://img.shields.io/badge/VitePress-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vue-3](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TDesign](https://img.shields.io/badge/TDesign-0052CC?style=for-the-badge&logo=tdesign&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Giscus](https://img.shields.io/badge/Giscus-181717?style=for-the-badge&logo=github&logoColor=white)
![Support RSS](https://img.shields.io/badge/Support%20RSS-FFA500?style=for-the-badge&logo=rss&logoColor=white)
![Support I18N](https://img.shields.io/badge/Support%20I18N-0078D4?style=for-the-badge&logo=google-translate&logoColor=white)
![SEO](https://img.shields.io/badge/SEO-4285F4?style=for-the-badge&logo=google&logoColor=white)

毎週見たり聞いたりしたことを記録し、主にフロントエンド、AI、コンピュータ関連の内容に焦点を当てています。

毎週土曜日/週末に更新され、更新はリリースと同期されます。最新の週刊リリースについては、スターをつけたりリリースをカスタムでウォッチしたりしてください。

[![changelog](https://img.shields.io/badge/changelog-→-0052CC?style=for-the-badge&logo=ReSharper&logoColor=white)](./CHANGELOG.md)


[![PR Welcome](https://img.shields.io/badge/PR-Welcome-EA4AAA?style=for-the-badge&logo=git&logoColor=white)](https://github.com/Justin3go/FAV0/pulls)
[![Request-Feature](https://img.shields.io/badge/Request-Feature-007BFF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Justin3go/FAV0/issues/new/choose)
[![Report-Bug](https://img.shields.io/badge/Report-Bug-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Justin3go/FAV0/issues/new/choose)

![demo](./images/demo.png)

</div>

## 機能特性


1. 🌓 明るいモードと暗いモードの切り替えを提供し、異なる読書環境に適応します。
2. 🌍 中国語と英語のバイリンガルインターフェースをサポートし、異なる言語のユーザーの利便性を高めます。
3. 📡 RSS購読機能を提供し、中国語と英語の両方の更新をサポートします。
4. 💬 Giscusコメントシステムを統合し、ユーザーのコミュニケーションとフィードバックを容易にします。
5. 🖼️ 高解像度の画像プレビューをサポートし、視覚体験を最適化します。
6. 📜 フォント設定のカスタマイズを許可し、読書の快適さを向上させます。
7. 🔍 SEO最適化を実施し、Sitemapの生成、Twitter CardとOpen Graphタグのサポートを含む、検索エンジンの可視性を向上させます。


## 開発

```bash
git clone git@github.com:Justin3go/FAV0.git
cd FAV0

npm i -g pnpm # 必要な場合
pnpm i
pnpm docs:dev
```
1. giscusコメント設定を変更します。`.vitepress/theme/components/Comments.vue`内の`giscus`設定を変更してください。
2. `utils`フォルダ内のサイドバー設定、RSS設定、メタ情報設定などを変更します。
3. `config`フォルダ内の関連設定を変更します。主にタイトル、説明などです。
4. `posts/**`および`en/posts/**`ディレクトリ内の記事の内容を自分の内容に変更します。

## ライセンス

このリポジトリは、MITライセンスとCC-BY-4.0ライセンスの下でデュアルライセンスされています：

- すべての`.md`ファイルはCC-BY-4.0ライセンスの下でライセンスされており、著作権表示を保持する必要があります。
- その他のコードファイルはMITライセンスの下でライセンスされており、自由に使用できます。

詳細については、[LICENSE](./LICENSE)ファイルをご覧ください。
