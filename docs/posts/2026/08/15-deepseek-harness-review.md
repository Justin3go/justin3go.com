---
title: 'DeepSeek Harness 深度评测：两天 9 万 star 的「一切皆插件」，是未来还是过度设计？'
date: 2026-08-15
tags:
  - DeepSeek
  - deepseek-harness
  - AI Agent
  - Coding Agent
  - Agent Harness
  - Claude Code
  - Codex
  - Pi
---

# DeepSeek Harness 深度评测：两天 9 万 star 的「一切皆插件」，是未来还是过度设计？

> ✨文章摘要（AI生成）
>
<!-- DESC SEP -->
>
DeepSeek 于 2026-08-13 开源的 agent 运行时框架 deepseek-harness（dsh）两天内狂揽 9 万+ star。本文基于对仓库源码的完整探索、与 Pi / Codex CLI / Claude Code / OpenCode 的横向对比，以及对 X、Hacker News 与中文社区数十条真实评价的交叉验证，拆解它「一切皆插件」的 Cordis 内核、Turn/Step 事件化主循环、append-only 会话日志与自我修改工具集等核心原理，并逐条核实社区的好评与质疑：它对日常写代码的人确实「重得没必要」，但为自进化 agent 与多智能体运行时铺设了目前独一份的底层骨架。文末给出明确的选型建议。
>
<!-- DESC SEP -->

## 引子：28 小时，9 万 star

2026 年 8 月 13 日，DeepSeek 开源了一个叫 **deepseek-harness**（命令行名 `dsh`）的项目。约 12 小时破 5 万 star，28 小时约 9.2 万——作为参照，此前的增速纪录保持者 OpenClaw 花了 84 天才到 20 万。

热度是真的，争议也是真的。我的时间线上同时出现了两种声音：

- 一边说这是「Agent OS 的雏形」「其他方案完全没有的底层骨架」；
- 另一边说它「重得毫无必要」「为了自进化，这盘醋包了一整盘饺子」。

这两种说法居然都有仔细读过源码的人在背书。所以这篇文章我做了三件事：把仓库完整翻了一遍、把它和 Pi / Codex CLI / Claude Code / OpenCode 逐项对比、再把 X（Twitter）、Hacker News 和中文社区里有实质内容的评价收集起来，逐条对照代码验证——看看大家说得到底有没有道理。

先给一句话结论：**dsh 不太像「DeepSeek 版 Claude Code」，更像一场关于「agent 运行时应该长什么样」的激进实验。它今天不适合大多数只想写代码的人，但它赌的方向值得所有做 agent 基础设施的人认真看一眼。**

## 一、它到底是什么

### 1.1 基本档案

- **定位**：开源 agent 运行时框架（harness / runtime），CLI、Web UI、自动化 server 都只是搭在它上面的「组合形态」
- **发布**：2026-08-13，当前版本 `0.1.0-rc.5`，明确标注 developer preview，README 原话是「THERE WILL BE COMPATIBILITY-BREAKING CHANGES」（一定会有破坏兼容性的变更）
- **协议**：MIT，完全开源
- **技术栈**：TypeScript monorepo（57 个包组，约 50 万行 TS 代码），Linux 沙箱底层有约 300 行 C11
- **模型支持**：不锁定 DeepSeek 自家模型，通过插件适配器支持约 40 个 provider——OpenAI、Anthropic、Google、Kimi 以及任意 OpenAI 兼容端点，写几行 YAML 配置就能接入
- **规模**（发布两天后，GitHub API 实测）：92,700+ star / 8,400+ fork

一个容易被忽略的背景：DeepSeek 此前发布模型跑分（如 DeepSWE）时曾被质疑「厂商自报、无法复现」，官方当时承诺「即将开源评测用的 harness」。多方信息显示，dsh 很可能就是在兑现这个承诺——它是 DeepSeek 内部给自家模型跑 agentic benchmark 的那套框架。这解释了仓库为什么一发布就如此完整：22 位贡献者、头部贡献者数千次提交，显然内部已经迭代了很久。

### 1.2 核心理念：一切皆插件

大多数 coding agent 的做法是：先写一个核心的 agent 循环（收输入 → 调模型 → 执行工具 → 循环），再在外围留一些扩展点（比如 MCP、skills）。核心是特权代码，扩展是二等公民。

dsh 把这个结构倒了过来。它的地基是一个叫 **Cordis** 的通用插件框架（设计源自论文《A Programming Paradigm for Spatiotemporal Composability》，此前已在聊天机器人框架 Koishi 中用了四年），然后——

**模型适配器是插件，工具注册表是插件，会话存储是插件，沙箱是插件，UI 是插件，连 agent 主循环本身也是插件。**

这不是宣传话术，源码里 agent loop 就是一个普通的包（`packages/core/agent-loop`），和其他插件一样可以被配置替换。一个插件的最小形态就是一个导出 `apply(ctx)` 函数的文件，在 YAML 里声明一行就能挂载：

```ts
import type { Context } from '@deepseek-ai/cordis'
export const name = 'hello'
export function apply(ctx: Context) {
  console.log('hello from my first plugin')
}
```

官方提供四种预设的运行模式：**标准模式**（全功能编码 agent）、**代码模式**（TypeScript SDK 编排）、**最小模式**（只有 shell + 文件编辑器，用于跑 benchmark）、**创意模式**（运行时检查与插件实验）。但这四种只是官方给的四种「拼法」——内测开发者 Jiayuan Zhang 的比喻很贴切：dsh 像一套**乐高汽车玩具**，官方预置只是说明书上的推荐拼法之一。

## 二、核心原理拆解

### 2.1 事件化的主循环：Turn 与 Step

dsh 的主循环是标准的 ReAct 风格（模型思考 → 调工具 → 看结果 → 再思考），但它被拆成了一组事件而不是一个硬编码的 while 循环：

```
turn/start → agent/pre-step → step/start
  → system-prompt/assemble（拼装提示词与工具 schema）
  → agent/request → llm/stream → assistant/message
  → tools/pre-execute → tools/execute → tools/post-execute
  → step/end → agent/turn-stopping → turn/end
```

一个 **step** 是「一次模型请求 + 它触发的工具调用」，一个 **turn** 是从接收输入到所有事情做完为止的零到多个 step。关键在于：几乎每个环节都是可拦截的事件——插件可以在 `agent/pre-step` 改写消息甚至拒绝执行，可以在 `tools/post-execute` 替换工具结果。循环不是框架的私有财产，而是一个所有插件都能参与的公共协议。

这个设计的直接后果是：**想把单 agent 换成多 agent 协作架构，只需要换掉 loop 插件，不用 fork 整个项目**。对比一下，想给 Codex CLI 换主循环，你得去改它的 Rust 核心代码。

### 2.2 Append-only 会话日志：模型看到的一切都有账

dsh 有一条运行时强制的不变量：「**Model-visible means logged**」——任何进入模型请求的内容，都必须能从会话日志中重建。会话日志是仅追加（append-only）的事件流，模型可见的对话历史是从日志「投影」出来的，支持恢复、分叉（fork）、搜索和重放。

这在 Hacker News 上被一些人称为 killer feature：当美国厂商越来越倾向于加密推理过程、让 trace 难以审计时，dsh 把「完整可追溯」做成了架构级保证。极客公园的实测也证实了体验：系统提示词、思维链、每次工具调用与返回结果全程留痕。

上下文压缩（compaction）也不是循环内置的黑盒，而是独立插件：先对超预算的工具结果做裁剪，撑不住了再生成摘要节点替换一段历史，整个过程用三个日志事件加锁，崩溃了都能从日志里看出来。

### 2.3 三个「别家没有」的设计

**① Code Mode（`run_code`）**：让模型直接写一段 TypeScript，用 `await tools.name(args)` 的方式批量调用工具，只有 `print`/`return` 的内容才回传给模型。这是对「零散 tool call 疯狂消耗上下文」问题的一种解法——十几次工具往返变成一段代码一次执行。

**② 子 agent 可以委托给竞争对手**：dsh 的子 agent 后端（`ctx.subagents`）支持多种 provider，其中赫然包括 `claude-code` 和 `codex`——也就是说你可以在 dsh 里派一个子任务，实际执行者是 Claude Code 或 Codex CLI。这种「harness 中立」的姿态在竞品里没有先例。

**③ 自我修改工具集（`cordis_*`）**：agent 可以在运行时检查自己的插件树、现场写一个新插件并挂载使用。这就是「自进化 agent」的雏形——不过要泼两盆冷水：它默认**不在任何官方组合中**，需要显式开启；而且现场写的插件只存在于内存，重启就没了，还不能永久沉淀。

### 2.4 沙箱与权限：该严的地方是严的

安全设计上 dsh 并不含糊：Linux 用 bwrap + Landlock（配自研的 C 语言启动器，fail-closed），macOS 用 Seatbelt，Windows 用 ACL 受限令牌；审批模型是封闭枚举，任何异常一律按「不可用」拒绝处理，不会静默放行。它甚至诚实地区分了沙箱的「完整」和「部分」两种强制力状态——老内核的 Landlock 只能算 partial，不会谎报成 full。

但要注意一个层面的错位：**沙箱管的是工具执行，插件本身是跑在 harness 进程内的**。36氪的实测明确指出，任意插件可以访问 shell 和文件系统——装第三方插件的信任模型，目前基本靠自觉。

### 2.5 一个彩蛋：用 harness 构建 harness

仓库里最让我震撼的不是代码，是 `.agents/` 目录下的 **1,386 篇 Agent Notes**——按「已实现/已否决/已归档/提议中」分类的架构决策记录，加上公开的事后复盘文档。文档总量约 17 万行，几乎和主代码同一数量级，且文档中的类型片段会被 CI 自动与源码比对防止漂移，单文件 100% 测试覆盖率是硬性门禁。

这些痕迹强烈暗示：这个仓库本身就是大量由 AI agent 参与设计、审查、复盘构建出来的。dsh 是它自己理念的第一个用户。

## 三、横向对比：四条路线

当下的 coding agent harness 生态，大致是四条路线（star 数为 2026-08-15 GitHub API 实测）：

| 项目 | 路线 | 协议 | Star | 一句话 |
|---|---|---|---|---|
| **Claude Code** | 分层可扩展生态 | 源码可见，非标准开源协议 | 141k | Skills/Hooks/Subagents/MCP/Plugins 五件套，生态最全，也最「重」 |
| **OpenAI Codex CLI** | Rust + 内核级沙箱 | Apache 2.0 | 106k | 安全性公认领先，声明式扩展（文件夹即插件） |
| **Pi**（Earendil） | 极简主义 | MIT | 90k | 默认只给模型 4 个工具，系统提示词不到 1000 token，OpenClaw 的底层引擎 |
| **deepseek-harness** | 运行时插件化 | MIT | 93k | 一切皆插件，连 loop 都能换 |

（另有完全开源的 OpenCode 197k star、Gemini CLI 107k、Aider 48k，路线上分别接近 Claude Code、Codex 和结对编程工具，不展开。）

### 3.1 与 Codex：声明式 vs 命令式

这是社区里质量最高的一场技术辩论，来自逐行对照过两边源码的开发者 grapeot：

- **Codex 走声明式**：插件就是磁盘上的文件夹（Markdown skill、MCP 配置、shell 脚本），不进 harness 进程。改配置重启进程只要 2-3 秒，门槛接近零。
- **dsh 走命令式**：插件带着状态直接跑在 harness 进程内，互相注册调用。运行时热替换插件要处理悬空引用、后台任务终止、依赖链协同、崩溃回滚——为此引入了 Cordis 这个重型运行时，仅管理插件生命周期的核心模块就有 750 行。

用装修打个比方：Codex 给你的是精装房加一面可以随便挂东西的洞洞板，挂错了摘下来重挂就行；dsh 给你的是可以在**不断水断电的情况下改承重结构**的房子。问题是——你多久需要改一次承重结构？

### 3.2 与 Pi：两个极端

Pi 是光谱的另一端：libGDX 作者 Mario Zechner 因为受不了 Claude Code 的复杂度膨胀而做的极简 agent，4 个默认工具，哲学是「留白比添加更重要」。有意思的是两者并非对立——dsh 的多 provider 模型适配层直接用了 Pi 生态的 `@earendil-works/pi-ai` 库，某种意义上 dsh 是「在 Pi 的模型层上盖了一座插件大厦」。

而 token 效率的对比很残酷：有开发者初步实测，同模型下 Pi 的未缓存输入约 4.5K token，dsh 约 47.6K，差距十倍量级（测试者自己也标注了存在干扰因素、dsh 还是预览版）。极简与全插件化的代价差异，在账单上是肉眼可见的。

### 3.3 与 Claude Code：打的不是产品，是商业模式

论今天的产品完成度，dsh 和 Claude Code 不在一个量级——连提前一个月内测的开发者都直说「作为 Coding Agent 用，体验确实不如 Claude Code / Codex 完善」。但 36氪的分析点出了更本质的一层：dsh 以 MIT 协议免费开放全部能力，等于**直接宣布 harness 层不应该收费**，试图把竞争拉回模型能力与定价本身。这一枪打的不是 Claude Code 的功能列表，而是「harness 作为付费壁垒」的商业模式。

## 四、社区怎么说，以及他们说得对不对

我把收集到的评价按「是否有代码/实测支撑」过滤后，逐条与仓库实际情况对照。

### 4.1 好评：基本属实

- **「插件化架构的工程巧思」「Agent OS 雏形」**——属实。loop 即插件、能力面三角色设计、事务回滚，代码层面都能验证。
- **「完整可追溯性是 killer feature」**——属实。「Model-visible means logged」是运行时强制的不变量，不是文档修辞。
- **「自进化雏形」**——属实但被夸大了。`cordis_*` 工具真实存在，但默认关闭、产物不能持久化，离「自我进化的 agent」还有相当距离。
- **「生成质量不错」**——爱范儿、极客公园的独立实测都完成得不错（Three.js 小游戏、官网重构，成本约 3 美元）。可信，但样本还少。

### 4.2 差评：大部分也属实

- **「对日常开发过度设计」**——我认为这是**成立的**。yage.ai 那篇《为了自进化，这盘醋包了一整盘饺子》逐项反驳得很扎实：搜索服务只需简短交互、MCP server 重启只要 2-3 秒、skill 是纯文本不需要框架支持热重载。dsh 解决的「运行时不停机换组件」是真实能力，但对绝大多数场景是罕见需求。甚至有内测者观察到，连 DeepSeek 自家的模型都经常搞不清 plugin 该怎么用，直接改自己代码了事——「毕竟更快、效果也差不多」。
- **「token 消耗偏高」**——初步实测支持（对 Pi 十倍差距、对其他框架约 3 倍），且有一个已被确认的具体 bug：dsh 会同时读取项目里的 `CLAUDE.md` 和 `AGENTS.md`，如果两个文件内容相同（很多项目为了兼容多工具就是这么做的），指令集会被重复注入两遍，system prompt 直接翻倍。截至写稿未见官方修复。
- **「兼容性差、生态早期」**——属实。官方兼容性列表 41 个兼容 / 219 个待关注或待调研；36氪实测 5 个第三方工具全部失败。插件仓库两天冲到 2000+ 个，但数量不等于质量。
- **「文档是 word salad」**——部分成立。面向用户的上手文档确实薄，但仓库内部的架构文档有约 17 万行且与代码同步校验——问题不是没文档，是「写给 agent 看的文档」和「写给新手看的文档」完全是两种东西，后者目前缺位。

### 4.3 Benchmark 争议：透明度问题，而非造假实锤

这部分需要最谨慎地陈述：

1. **分数口径混乱**：V4-Pro 的 SWE-bench Verified 有厂商自报 80.6% 与第三方 Vals 评测 96.4% 两个版本，相差 16 个百分点，很可能是不同变体/方法论所致，目前无权威解释。
2. **minimal 模式跑分**：官方 agent benchmark 分数是在 dsh 的最小模式下跑的，「高分反映模型能力还是框架加成」的疑问合理——但换个角度，开源 harness 本身恰恰让「自己复现验证」第一次成为可能。
3. **内部榜单不透明**：官方成绩表里混入了两套非公开的内部 benchmark（DSBench-FullStack 和 DSBench-Hard），且两榜排序互相矛盾。评论者 MaxForAI 的态度值得借鉴：「一个实验室自己造什么 benchmark，其实暴露了它在优化什么。」
4. **尚无人公开复现并证伪任何官方数字**。质疑集中在透明度，不在造假。

另外要如实记录：伴随发布的还有 V4-Pro API 涨价（多个独立信源印证），加上部分用户「Pro 写代码不如 Flash」的体感吐槽，构成了一批与 harness 本身无关、但影响舆论的负面情绪。这类「失望三连」式发言普遍缺乏具体使用细节，参考价值有限。

## 五、结论

### 它好在哪

1. **架构上真正的新东西**：loop 即插件、运行时整体可替换、子 agent 可委托给竞品——这些能力在 Claude Code / Codex / Pi 里都不存在。
2. **可追溯性做成了架构保证**：对需要审计、回放、研究 agent 行为的团队，这是独一份。
3. **彻底的开放姿态**：MIT 协议、不锁模型、兼容对手的 MCP 命名习惯、冲击 harness 收费模式。
4. **罕见的工程文化展示**：1,386 篇决策笔记、文档与代码同步门禁、「用 harness 构建 harness」的自证，本身就是一份珍贵的 AI 原生工程样本。

### 它差在哪

1. **现在就是个预览版**：官方自己承诺会有破坏性变更，接口剧变、不建议生产使用。
2. **为小众需求让所有人买单**：重型运行时带来的复杂度与 token 开销由每个用户承担，而「运行时换 loop」的收益只属于少数探索者。
3. **效率与质量瑕疵**：上下文重复注入 bug、十倍量级的 token 差距、第三方兼容性几乎为零。
4. **信任建设未完成**：benchmark 口径与内部榜单的透明度问题，需要时间和第三方复现来消化。

### 你该不该用它

- **你只是想要一个好用的 coding agent 写代码**：不推荐，至少现在不。Claude Code（要生态）、Codex CLI（要安全与稳定）、Pi（要极简与省钱）都是更成熟的选择。
- **你在做 agent 基础设施、多智能体系统或自进化 agent 研究**：强烈建议花一个周末读它的源码和 `.agents/` 目录——那套「能力面」设计和事件化 loop，目前没有第二个可运行的参照物。
- **你的组织需要可审计的 agent 执行记录**：值得关注，append-only 日志是它最没有争议的优点。
- **你在观望**：给它三到六个月。插件生态会洗牌，接口会稳定，benchmark 会有人复现。届时再看「一切皆插件」是长成了 Agent OS，还是像 HN 上那位评论者担心的那样陷入「插件疲劳」。

最后说点感受。看完这个仓库，我想起的不是某个竞品，而是操作系统史：dsh 赌的是「agent 会长成需要一个 OS 的复杂系统」，Pi 赌的是「agent 应该保持一把锋利的小刀」。这两个赌注很可能都对——只是对应的用户不同、时间点不同。而一家模型公司愿意把自己的评测 harness 以 MIT 协议完整摊开、连内部决策记录一起公开，无论最终成败，这件事本身已经改变了行业对「透明」二字的基线。

---

*本文基于 2026-08-15 的仓库快照（v0.1.0-rc.5）与公开社区讨论写成。dsh 处于快速迭代期，文中具体细节可能很快过时；涉及的 benchmark 数据均标注了来源性质，其中厂商自报与第三方口径的差异尚无定论，请自行判断。主要信源：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)、[DeepSeek Harness 官网](https://deepseek.com/harness/en/)、Hacker News 讨论、X 平台多位开发者的源码分析长文，以及爱范儿、极客公园、36氪的独立实测。*
