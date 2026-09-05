# 首页连续镜头设计与素材

## 参考与职责

- [ThreeUI / Sylva](https://threeui.com/hero/sylva)：主视觉参考，场景占据首屏、轻量大字、空间中的文字层级。原创蓝灰色漂浮人物场景承接本站头像，不复制森林内容。
- [ThreeUI 源码](https://github.com/MengTo/threeui)：核对公开目录与 Sylva 的 Full HTML + DOM/CSS + Three.js 结构，未引入 React 组件或复制第三方素材。
- [oscarqjh/threejs-portfolio](https://github.com/oscarqjh/threejs-portfolio)：参考同一场景的滚动时间线与相机位移概念。
- [dayinji/sen-3d-resume](https://github.com/dayinji/sen-3d-resume)：参考固定人物场景与可滚动 HTML 内容分离。

## 镜头

建立人物与空间 → 推近人物 → 前景光环掠过并转换视角 → 侧后方拉远 → 接入原有个人介绍。全部由原生滚动位置决定，可反向滚动，不锁定滚轮。使用透明二维人物图片、多层视差与遮挡模拟 3D，不声称它们是精确的三维模型或连续摄影序列。

## 素材

使用内置 image_gen，源身份为 docs/public/ava.png，直接生成参考为仓库既有人物探索图 tmp/hero-character-exploration/05-zero-gravity-objects-3d.png。原头像及探索目录均不改动。最终站点资源自包含：

- docs/public/hero/creator-front.webp：正面三分之四视角，1254 × 1254，带真实 alpha。
- docs/public/hero/creator-orbit.webp：侧后方视角，1536 × 1024，带真实 alpha。

仅做 WebP 格式压缩，人物图像由内置工具生成。两张是 AI 推测视角，以遮挡过渡衔接，不当作严格匹配的旋转帧。

### 正面提示词

Use case: identity-preserve. Asset type: transparent CGI character cutout for a cinematic personal website. Input is the exact character identity, outfit, pose and rendering quality reference. Create this SAME adult man, brown tousled hair, mustard yellow knitted beanie, round dark thin-frame glasses, blue oversized hoodie, charcoal trousers, ivory chunky sneakers. Preserve the reference relaxed floating zero-gravity pose, one arm holding a silver laptop and two notebooks to the ribs, other palm raised holding a small floating turquoise glass sphere. Full body visible with generous margins. Camera front three-quarter angle as reference. High-end polished volumetric CGI with detailed knit and cloth, sculpted hair, appealing expressive adult face. Neutral soft studio lighting with subtle cool edge light. Isolate ONLY character and held objects on a genuinely TRANSPARENT alpha background, no gray backdrop, no floor, no shadows on background, no scenery, no letters or text or watermark. Wide square composition. Consistent body proportions and pose for later alternate camera view.

### 侧后方提示词

Use case: identity-preserve. Asset type: alternate CAMERA view of a transparent CGI character cutout for a cinematic scroll website. The reference shows the exact character and pose. Render the SAME adult man and identical outfit, mustard knit beanie with brown tousled hair, round glasses, blue fabric hoodie, charcoal trousers, ivory chunky sneakers. Identical relaxed floating seated zero-gravity pose, legs bent and weightless, left arm clutches silver laptop and notebooks, right hand lifts turquoise sphere. Change ONLY camera: orbit 100 degrees around the character to a side-rear three-quarter view, seeing broad back of blue hoodie, side of beanie and cheek, extended palm and sphere visible beyond shoulder. Keep same detailed realistic CGI materials, lighting and adult body proportions. Do NOT draw a new pose or new person. Entire body and shoes visible with 10 percent empty margin, square composition. Isolated on genuinely transparent alpha background. No floor, no backdrop color, no contact shadow, no text, no watermark.

### 透明背景修正

Background extraction only. Remove the fake gray and white checkerboard background completely and produce a TRUE TRANSPARENT ALPHA CHANNEL PNG cutout. Preserve every detail of the adult male floating character and all held objects exactly as-is. No new pattern, no background, no changes in pose, face, outfit, perspective or lighting. All background pixels outside character and objects must have alpha 0, including between legs and under arms. This must be actual transparency, NOT a rendered checkerboard.

## 验收记录（2026-09-05）

- `pnpm docs:build`：通过，最终一次耗时 44.64 秒；构建报告部分 bundle 超过 500 KB 的提示，没有构建错误。本工作项不增加运行时依赖。
- `node --experimental-strip-types --test tests/hero-camera.test.mjs`：4 项通过。覆盖桌面/手机相机连续性、双向滚动相同状态、视角切换的全遮挡保护与越界钳制。需 Node 22.6+ 支持的实验性 TypeScript 去类型参数；仓库未声明 ESM，会出现模块类型提示。
- 静态产物：中英文首页各 1 个 main、1 个 h1、8 张项目卡，头像资源地址及 about/projects/contact 锚点完整。
- 浏览器实测：1280×720、1280×800 桌面，390×844、375×667 手机。中英文首屏、浅/深主题、向下推进与向上恢复正面、第二/第三段落、跳过到介绍、减少动态收起长轨道均检查。
- 手机人物不遮住底部入口；375×667 的底部控制区位于 y=652，首屏内可见；未发现横向滚动溢出。
- 英文博客按钮进入 `/en/blog`，返回后只有一个场景实例且镜头恢复到开场；博客页没有首页场景，原有 8 个项目仍存在。浏览器记录中未发现 warn/error。
- `prefers-reduced-motion` 有 CSS 与客户端双重处理；浏览器实测覆盖手动“减少动态”，未修改操作系统的动态效果设置。图片失败时正面回退到本站头像，副视角未加载则保持正面。
- 人物素材合计 355,172 字节（约 347 KiB），保留真实透明通道，未加载原探索目录中的 GLB 模型。

本次只在 `codex/cinematic-home-hero` 本地分支提交，未推送或部署。
