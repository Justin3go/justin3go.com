# 统一人物素材生成记录

使用内置 imagegen；所有动作直接引用 `https://oss.justin3go.com/paper-journey/paper-journey/character-reference.png`，不以前一个动作作为身份主参考。人物设定为约 180cm、26 岁成年男性，固定脸型、黑色卷发、细框眼镜、黄帽、蓝色卫衣、深灰裤、米白鞋及撕纸边缘。

## 动作规范

六组各四帧：欢迎、写代码、摄影、羽毛球、走路、聊天。源文件保留纯洋红背景，由现有 `keyMagenta` 在浏览器抠图；不额外加载人物设定图。

羽毛球参考 [BWF Shuttle Time 教师手册，第 73 页](https://www.badminton.org.au/wp-content/uploads/2022/11/1.-BWF-ST-Teachers-Manual_Inclusivity_ENGLISH.pdf)：侧身准备，后腿与髋部带动转体，在持拍肩上方稍前击球，再自然随挥。这里是四帧定格插画表现，不是动作捕捉或训练演示。击球顺序不受鼠标横坐标打断，准备 0.8 秒、引拍 0.35 秒、击球 0.15 秒、随挥恢复 1.1 秒。

## 提示词

### intro

Use case: identity-preserve. Create a square 2x2 animation sprite sheet with exactly FOUR full-body cutouts, ONE per equal quadrant, same identity as the supplied MASTER CHARACTER MODEL SHEET. Keep EXACT face shape, eyes nose jaw thin dark rounded glasses, short wavy black hair mustard beanie, cobalt blue hoodie white undershirt charcoal trousers ivory sneakers. 180cm tall adult 26yo handsome Chinese man, slim long-legged 7.5-head proportions. Same watercolor/gouache paper grain and warm ivory fibrous torn-paper border around each cutout. TRANSPARENT background with genuine alpha, no background paper, no labels, no text, no panel borders, no scenery, no extra faces. Fixed camera, consistent body scale and feet baseline in all four equal cells, 8% empty padding all around EACH cell; absolutely no crossing center seams or cropped equipment. Reading order top-left, top-right, bottom-left, bottom-right. Action: welcoming intro, standing relaxed facing camera in all four frames. 0 neutral friendly smile right arm relaxed left hand pocket; 1 turn head slightly toward viewer left; 2 raise right open palm at shoulder to greet; 3 relaxed small friendly wave same palm shoulder height. Subtle changes only, feet and hips stable. Do not sit, no laptop.

### intro-background

Edit this sprite sheet ONLY its background: replace the entire gray white checkerboard with perfectly uniform solid pure #ff00ff magenta. Preserve all four characters, face, body, poses, clothes and ivory torn paper outline EXACTLY, no redraw, do not change placement or dimensions. Remove small drawn waving motion lines. The magenta must fill the empty spaces including between legs. No checkerboard remains. Asset for chroma key.

### code

Use case: identity-preserve. Create a square 2x2 animation sprite sheet with exactly FOUR full-body cutouts, ONE per equal quadrant, same identity as the supplied MASTER CHARACTER MODEL SHEET. Keep EXACT face shape, eyes nose jaw thin dark rounded glasses, short wavy black hair mustard beanie, cobalt blue hoodie white undershirt charcoal trousers ivory sneakers. 180cm tall adult 26yo handsome Chinese man, slim long-legged 7.5-head proportions. Same watercolor/gouache paper grain and warm ivory fibrous torn-paper border around each cutout. Perfectly flat SOLID PURE MAGENTA #ff00ff background for runtime chroma key, no checkerboard, no white or gray background, no background paper, no labels, no text, no panel borders, no scenery, no extra faces. Fixed camera, consistent body scale and feet baseline in all four equal cells, 8% empty padding all around EACH cell; absolutely no crossing center seams or cropped equipment. Reading order top-left, top-right, bottom-left, bottom-right. Action: seated coding on a simple wooden stool with laptop resting on lap. Same three-quarter seated angle and same stool laptop and body scale in every frame. 0 fingers poised at keys eyes on screen; 1 small right hand typing movement; 2 small left hand typing movement slight focused head tilt; 3 glance up toward viewer small friendly smile hands remain keyboard. Whole head feet stool and laptop fully visible in each quadrant. Adult tall body correctly folded at hips knees, natural anatomy. No extra desks.

### photo

Use case: identity-preserve. Create a square 2x2 animation sprite sheet with exactly FOUR full-body cutouts, ONE per equal quadrant, same identity as the supplied MASTER CHARACTER MODEL SHEET. Keep EXACT face shape, eyes nose jaw thin dark rounded glasses, short wavy black hair mustard beanie, cobalt blue hoodie white undershirt charcoal trousers ivory sneakers. 180cm tall adult 26yo handsome Chinese man, slim long-legged 7.5-head proportions. Same watercolor/gouache paper grain and warm ivory fibrous torn-paper border around each cutout. Perfectly flat SOLID PURE MAGENTA #ff00ff background for runtime chroma key, no checkerboard, no white or gray background, no background paper, no labels, no text, no panel borders, no scenery, no extra faces. Fixed camera, consistent body scale and feet baseline in all four equal cells, 8% empty padding all around EACH cell; absolutely no crossing center seams or cropped equipment. Reading order top-left, top-right, bottom-left, bottom-right. Action: casual photography, standing at fixed three-quarter angle, body proportions exactly master. Small black mirrorless camera on short neck strap in ALL frames. 0 camera at chest held by both hands looking toward viewer; 1 looks slightly left framing scene hands adjusting camera; 2 lifts viewfinder to right eye right index on shutter left hand supporting lens; 3 lowers camera back to chest satisfied smile. Feet stay planted, full body, no extra props.

### badminton

Use case: identity-preserve. Create a square 2x2 animation sprite sheet with exactly FOUR full-body cutouts, ONE per equal quadrant, same identity as the supplied MASTER CHARACTER MODEL SHEET. Keep EXACT face shape, eyes nose jaw thin dark rounded glasses, short wavy black hair mustard beanie, cobalt blue hoodie white undershirt charcoal trousers ivory sneakers. 180cm tall adult 26yo handsome Chinese man, slim long-legged 7.5-head proportions. Same watercolor/gouache paper grain and warm ivory fibrous torn-paper border around each cutout. TRANSPARENT background with genuine alpha, no background paper, no labels, no text, no panel borders, no scenery, no extra faces. Fixed camera, consistent body scale and feet baseline in all four equal cells, 8% empty padding all around EACH cell; absolutely no crossing center seams or cropped equipment. Reading order top-left, top-right, bottom-left, bottom-right. Action: Four chronological keyframes of ONE RIGHT-HANDED badminton forehand overhead clear, seen fixed three-quarter camera. Exact SAME racket right hand all frames. Reserve ample headroom so raised racket fits wholly inside EACH quadrant. Frame0 top-left: side-on preparation, left shoulder points toward shot to viewer-left, weight on bent rear RIGHT leg, left non-racket arm pointing up, right elbow bent behind at shoulder height racket prepared. Frame1 top-right: loaded throwing position, chest rotates open, hips drive from rear foot, right elbow leads upward with racket head lagging BEHIND head, non-racket left arm begins tucking in. Frame2 bottom-left: contact HIGH ABOVE AND SLIGHTLY IN FRONT of RIGHT shoulder, right arm extended upward, thin oval badminton racket above hand, rear hip rotated forward and weight transferring, left arm folded near chest. Frame3 bottom-right: relaxed follow-through after strike, right racket arm travels forward DOWN diagonally across torso toward LEFT hip, right rear foot has stepped through to become front foot, knees soften. Show correct shoulder/hip rotation and hand grip. No shuttlecock and no speed lines. Do NOT turn this into tennis or baseball swing, do not hold racket with two hands, no backwards wrist, no extra limbs. Same clothing as master for identity.

### badminton-background

Edit this badminton sprite sheet. Preserve exact character identity, four poses, clothing, equipment and torn paper style. Replace ALL checkerboard with uniform pure solid #ff00ff magenta for chroma-key. Re-layout into STRICT equal 2x2 quadrants: all pixels belonging to top left stay x0-49% y0-49%, top right x51-100% y0-49%, bottom left x0-49% y51-100%, bottom right x51-100% y51-100%. CRITICAL the bottom-left raised racket currently crosses into the top quadrant: shrink/reposition all four cutouts consistently to give each entire figure INCLUDING RACKET 8% clear magenta margin inside its own quadrant. Bottom row rackets must start below 54% overall image height. Same physical body scale all four, aligned foot baseline within row. Retain right-handed racket throughout, overhead contact, side-on load and diagonal follow-through. No checkerboard and no text.

### walk

Use case: identity-preserve. Create a square 2x2 animation sprite sheet with exactly FOUR full-body cutouts, ONE per equal quadrant, same identity as the supplied MASTER CHARACTER MODEL SHEET. Keep EXACT face shape, eyes nose jaw thin dark rounded glasses, short wavy black hair mustard beanie, cobalt blue hoodie white undershirt charcoal trousers ivory sneakers. 180cm tall adult 26yo handsome Chinese man, slim long-legged 7.5-head proportions. Same watercolor/gouache paper grain and warm ivory fibrous torn-paper border around each cutout. Perfectly flat SOLID PURE MAGENTA #ff00ff background for runtime chroma key, no checkerboard, no white or gray background, no background paper, no labels, no text, no panel borders, no scenery, no extra faces. Fixed camera, consistent body scale and feet baseline in all four equal cells, 8% empty padding all around EACH cell; absolutely no crossing center seams or cropped equipment. Reading order top-left, top-right, bottom-left, bottom-right. Action: four keyframes walking naturally toward screen LEFT, fixed three-quarter LEFT profile, same master face visible. 0 left foot forward right foot back opposing right arm forward; 1 passing pose right foot swings through under hips left leg supporting; 2 right foot forward left foot back left arm forward; 3 passing pose left foot swings through right leg supporting. Hands empty, no bag, no tools. Natural alternating gait, shoulders counter-rotate gently hips, no marching, no running. Every frame head identical size and baseline feet matching, no camera rotation. Master adult height proportions essential.

### walk-correction

undefined

### chat

Use case: identity-preserve. Create a square 2x2 animation sprite sheet with exactly FOUR full-body cutouts, ONE per equal quadrant, same identity as the supplied MASTER CHARACTER MODEL SHEET. Keep EXACT face shape, eyes nose jaw thin dark rounded glasses, short wavy black hair mustard beanie, cobalt blue hoodie white undershirt charcoal trousers ivory sneakers. 180cm tall adult 26yo handsome Chinese man, slim long-legged 7.5-head proportions. Same watercolor/gouache paper grain and warm ivory fibrous torn-paper border around each cutout. Perfectly flat SOLID PURE MAGENTA #ff00ff background for runtime chroma key, no checkerboard, no white or gray background, no background paper, no labels, no text, no panel borders, no scenery, no extra faces. Fixed camera, consistent body scale and feet baseline in all four equal cells, 8% empty padding all around EACH cell; absolutely no crossing center seams or cropped equipment. Reading order top-left, top-right, bottom-left, bottom-right. Action: friendly face-to-face conversation, STANDING full body front three-quarter facing viewer, one person only no props. 0 welcoming smile hands loosely together at waist; 1 right hand open palm up at waist explaining an idea; 2 subtle nod left hand relaxed at waist right palm near chest; 3 gently open both hands conversational gesture elbows close body. Fixed feet and body silhouette, subtle mouth/smile changes. No waving above shoulder, no chair, no text or speech bubbles. Exact SAME master head and handsome face in all four.


## 验证

- `node --test tests/*.test.mjs`：25 项通过，含羽毛球顺序不受鼠标跳帧影响、减少动态时固定第 0 帧。
- `npm run docs:build`：通过；保留既有 500KB 分块体积提示。
- 实际浏览器逐屏查看六个场景，检查浅色/深色抠图、步行到聊天的碎片转场；390px 手机无横向溢出，作品区人物层隐藏。
- 设定图仅供创作参考，不进入首页预加载。所有图片为内置 imagegen 生成，六组最终 PNG 均位于 `https://oss.justin3go.com/paper-journey/paper-journey/`。
- 欢迎图与羽毛球图的初次透明请求产生了棋盘背景，已用 imagegen 改为纯洋红后接入；未将棋盘背景版本提交。
## 2026-09-05：按视频重做高远球八帧

- 动作来源：[Badminton Insight — Forehand Clear Tutorial](https://www.youtube.com/watch?v=xRv1JLg4NMM&t=163s)，实际浏览器查看约 2:43–2:48 的同机位慢动作，依次核对准备、转髋、肘部带拍、伸臂击球和随挥。约 2:49 已进入重复讲解，没有当成回位帧。
- 使用内置 imagegen，将人物主设定与四张实际视频姿势截图作为参考生成；截图仅供动作分析，不随网站发布。最后两帧为衔接循环补充的收拍、分腿准备姿势，并非视频逐帧复制。
- 新素材 `https://oss.justin3go.com/paper-journey/paper-journey/badminton.png`：4 列 2 行，共八帧；生成的两行间隙在高度 47.4% 处，按此分割以避免下排球拍串入上排。
- 播放为 2.4 秒完整动作：准备 .6s、推动 .22s、引拍 .18s、出拍 .1s、击球 .1s、随挥 .18s、收拍 .28s、回位 .74s。仅末尾最多 55ms 混合；按脚底中线注册，避免球拍外伸导致整个人物平移。
- 验证：26 项单元测试通过；Vue SFC 编译通过；实际页面截图检查准备、回位与素材裁切。仍为八帧剪纸定格动画，不是视频级运动捕捉。

生成提示词（参考图实际输入：主设定、准备、引拍、击球、随挥）：

Create an animation production sprite sheet: EXACTLY 8 full body cutouts in a strict 4 COLUMN by 2 ROW equal grid, row major chronological. First attached image is the ONLY character identity / clothing / art style authority: handsome 26 year old 180cm lean adult man, black wavy hair, mustard beanie, black glasses, blue hoodie, charcoal trousers, cream shoes, watercolor torn paper thin cream fibrous outline. Remaining four attached video screenshots are ACTUAL consecutive forehand overhead clear biomechanics references: use only the central athlete's pose and joint movement, do not reproduce face, clothes, text, video UI or background. All 8 cells are the SAME character at identical scale, camera and fixed floor baseline; full racket must fit each cell with generous margin. Solid pure #ff00ff background everywhere, including gaps between legs and arms. No text or cell dividers. Build ONE connected overhead forehand clear motion: 1 side-on loaded ready, left arm aiming up, right elbow back and racket raised; 2 legs drive and hips turn as the loading reference; 3 torso rotates right elbow leads racket drops behind as the elbow reference; 4 shoulder rotates, elbow rises, forearm begins extending as the elbow and contact references; 5 full high contact above right shoulder with racket overhead as the contact reference; 6 natural forward downward follow through as the follow-through reference; 7 racket decelerates across front at waist with feet parallel apart, knees soft; 8 balanced athletic ready stance feet shoulder width apart and racket in front, prepared to lift into pose1. Feet never cross or make X shapes; no catwalk or twisted knees. Maintain left/right handedness exactly throughout: right racket hand. Do not randomly invent different poses; trace the reference joint relationships through one stroke. Proportions and head size identical, no exaggerated jumping, no smear or ghost arms. Separate clean paper cutouts, not whole rectangular cream panels. Output landscape high resolution sprite sheet.

## 2026-09-21：羽毛球高清独立帧

- 沿用人物主设定及 `66fe524` 的视频参考八帧分镜作为身份和姿势依据，本轮没有重新提取视频。用内置 imagegen 分别重绘八张 1024×1536 PNG，保持黄帽、眼镜、蓝卫衣、右手持拍与撕纸风格。完整输入提示词及生成来源见 [badminton-hd-prompts.json](./badminton-hd-prompts.json)。
- 成品位于 `docs/public/paper-journey/badminton-hd/frame-{1..8}.png`，直接保留生成的原生 RGBA，没有对旧小图插值放大、锐化或后期重绘。生成提示中要求洋红背景，实际输出为真实透明 alpha，经浏览器白底检查后直接保留。
- 依次为准备、蹬转、引拍、出拍、击球、随挥、收拍、回位，沿用 2.4 秒顺序播放。取消姿势交叉淡化，避免双脸、双臂和球拍重影；仍为八关键帧剪纸定格动画，不是视频级连续插帧。
- 独立帧按原生分辨率加载和缓存，最终绘制时一次缩放；不重新拼成低清图集。`paperBadminton.ts` 记录逐帧头顶位置和目标身体跨度，以身体而非球拍外框注册比例，保留击球伸展与随挥下沉。脚底中心统一，整体沿用已确认的羽毛球视觉占比修正 .88。
- 首页使用本站新版素材路径；既有远端低清文件与其余场景资源保持原样。本轮未上传 CDN、推送或部署。
- 原始 PNG 和同目录无损 WebP 留在仓库作为源文件。无损转换命令：`cwebp -quiet -lossless -exact -m 6 frame-N.png -o frame-N.webp`；八对图片解码后的 RGBA 字节逐一完全相等，合计 16,558,547 → 10,417,438 字节。

## 2026-09-22：压缩并迁移羽毛球帧至 R2

- 网页使用 Zipic「Q3·均衡」压缩后的 WebP，已上传到 `https://oss.justin3go.com/paper-journey/paper-journey/badminton-hd/frame-{1..8}.webp`。八帧共 1,072,680 字节，比无损 WebP 减少约 89.7%；尺寸仍为 1024×1536，透明通道逐像素一致，颜色为有损压缩。上传后逐一核对了 R2 对象长度、MIME、MD5 和公开地址，首页代码已切换到 R2；本站尚未推送或部署。

## 2026-09-22：羽毛球动作合并为 4×2 精灵图

- 以仓库中的八张原始 PNG 为输入，按帧序逐行拼为 4096×3072 的 4×2 网格；先用 `ffmpeg -framerate 1 -start_number 1 -i frame-%d.png -vf 'tile=4x2:margin=0:padding=0' -frames:v 1 -pix_fmt rgba sprite-4x2.png` 合成，再用 `cwebp -lossless -exact -m 6` 得到无损 WebP，最后用 Zipic「Q3·均衡」压缩。无损合成图的八个格子与原始 PNG 的 RGBA 逐像素一致，Zipic 输出的透明通道也逐像素一致。
- 成品 `https://oss.justin3go.com/paper-journey/paper-journey/badminton-hd/sprite-4x2.webp` 为 1,046,714 字节，较八张独立压缩 WebP 合计少 25,966 字节；每个动画实例只需加载一张精灵图。R2 对象的长度、MIME、MD5、公开 URL 和生产站点 CORS 均已核对；原始 PNG 与独立 WebP 留在仓库作为源文件和回退素材。
