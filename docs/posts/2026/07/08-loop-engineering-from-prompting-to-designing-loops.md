---
title: '从"你提示 Agent"到"系统提示 Agent"：Loop Engineering 完整拆解'
date: 2026-07-08
tags:
  - Loop Engineering
  - AI Agent
  - Coding Agent
  - Harness Engineering
  - Claude Code
  - Codex
  - Agent Workflow
---

# 从"你提示 Agent"到"系统提示 Agent"：Loop Engineering 完整拆解

> ✨文章摘要（AI生成）
>
<!-- DESC SEP -->
>
本文沿着 **Prompt → Context → Harness → Loop** 的协作演进，完整拆解 Loop Engineering 的来源、六段控制流、验证器、停止条件与三类护栏。文章结合 Ralph Loop、Claude Code `/goal` 与 `/loop`、Codex Automations、Karpathy autoresearch 等实践，说明循环真正的新意并非 `while` 语句，而是把验证、预算、状态与反馈组织成可持续运行的工程系统。最后给出任务决策矩阵和上线路径，强调循环的价值上限取决于一个无法被 Agent 欺骗的验证器。
>
<!-- DESC SEP -->

## 引子：这条链路上，最慢的环节是你

先看一个 2026 年每天都在发生的场景。

一位工程师打开终端，给 coding agent 发了一条指令："修一下 CI 上挂掉的测试。" Agent 跑了三分钟，回来汇报。工程师看了一眼，说"不对，你改错文件了，应该看 auth 模块"。Agent 又跑三分钟。工程师再看一眼，"测试过了，但你把另一个用例改坏了"。如此往复五轮，问题修完，前后四十分钟——其中 agent 实际工作十五分钟，剩下二十五分钟，是 agent 在**等这个人读输出、做判断、敲下一条 prompt**。

模型的推理速度在涨，工具的执行速度在涨，唯一没涨的是坐在键盘前的那个人。链路上最慢的环节从模型变成了人。

Claude Code 的创建者 Boris Cherny 在 2026 年 6 月 2 日的 Acquired Unplugged（WorkOS 承办）活动上是这么描述自己的应对方式的：

> "I don't prompt Claude anymore. I have loops that are running. They're the ones that are prompting Claude and figuring out what to do. My job is to write loops."
> （我已经不再给 Claude 写 prompt 了。我有一批循环在跑，是它们在给 Claude 写 prompt、决定下一步做什么。我的工作是写循环。）

五天后，OpenClaw 作者 Peter Steinberger（现就职 OpenAI）发了那条viral推文："You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."（你不该再给 coding agent 写 prompt 了，你该设计能给 agent 写 prompt 的循环。）再一天后，Google 工程负责人 Addy Osmani 发表《Loop Engineering》一文，给这套实践正式命了名。

这篇文章不按调研报告的顺序（定义→时间线→批评）走，而是沿着**开发者与 agent 协作链路的演进**这条主线，把 Loop Engineering 拆开讲清楚：这条链路是怎么一层层长出来的、一个循环里面到底有什么、哪些是旧东西的重新包装、哪些是真正的新增量，以及——你该不该在自己的工作里上循环。

## 一、链路的四次让渡：Prompt → Context → Harness → Loop

Loop engineering 不是凭空出现的新学科，它是同一条协作链路上的第四次"工作让渡"。每一层的本质，都是人把链路上的一段手工活交给系统，自己往上挪一层。

![Prompt→Context→Harness→Loop 四层同心嵌套图](https://oss.justin3go.com/blogs/four-layer-stack.png)

每一层包住前一层，而不是取代前一层——写循环的人依然要写 prompt，只是 prompt 从"你现场敲的话"变成了"循环每一轮自动组装的模板"。

中文社区流传的一个类比把这四层说得很直白：

> "Prompt 是你怎么问他，Context 是你让他看见什么，Harness 是你把他放在什么环境里，Loop 是你让这个系统怎么自己转起来。"

四层各自的权威出处如下。值得注意的是，这个演进节奏与 Anthropic 工程博客的发布节奏高度吻合——虽然 "loop engineering" 这个词本身至今不是 Anthropic 官方术语：

| 层 | 兴起时间 | 权威出处 | 关键表述 |
|---|---|---|---|
| Prompt engineering | 2022–2024 | 行业共识，无单一提出者 | 怎么把任务说对 |
| Context engineering | 2024–2025 | Tobi Lütke 推文（2025-06-18，Karpathy 6-25 转发背书）；Anthropic《Effective context engineering for AI agents》（2025-09-29） | "the art of providing all the context for the task to be plausibly solvable by the LLM" |
| Harness engineering | 2025 年末 | Anthropic《Effective harnesses for long-running agents》（2025-11-26，Justin Young 等） | "模型是大脑，挽具是身体" |
| Loop engineering | 2026-06 | Addy Osmani《Loop Engineering》（addyosmani.com/blog/loop-engineering，2026-06-07） | "Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead." |

Osmani 对 loop 的定义值得原文抄录，因为它是后续所有讨论的锚点：

> "A loop here can be thought of a recursive goal where you define a purpose and the AI iterates until complete."
> （这里的循环可以理解为一个递归目标——你定义一个目的，AI 反复迭代直到完成。）

## 二、解剖一个循环：六个环节，一个出口

把"循环"两个字拆开，里面是一套完整的控制流。Anthropic 在《Building agents with the Claude Agent SDK》（2025-09-29，Thariq Shihipar）里给过官方最简版本："gather context → take action → verify work → repeat"。Loop engineering 语境下的完整版是六个环节：

![循环六环节控制流：DISCOVER→ASSEMBLE→ACT→VERIFY→PERSIST→DECIDE，出口为循环或STOP](https://oss.justin3go.com/blogs/six-stage-loop-control-flow.png)

人类在这张图里的位置变了：不再站在 ASSEMBLE 环节里逐轮敲字，而是站在图的外面——设计这六个环节怎么接、STOP 的条件是什么，然后审查 STOP 之后交出来的东西。Geoffrey Huntley（下一节的主角）的说法是：

> "Your job is to sit on the loop, not in it."
> （你的工作是坐在循环之上，而不是循环之中。）

### 例程、工作流、循环：三个容易混淆的东西

不是所有"自动跑的东西"都叫循环。区分标准只有一条：**它会不会检查自己的工作，并据此决定是否继续**。

| | Routine 例程 | Workflow 工作流 | Loop 循环 |
|---|---|---|---|
| 步骤 | 固定不变 | 按发现分支 | 动态迭代 |
| 停止条件 | 步骤走完 | 路径走完 | 验证器判定"目标达成" |
| 自我检查 | 无 | 无或很弱 | 核心机制 |
| 例子 | 定时跑 lint 并发报告 | CI 失败→分类→派单 | 修到 test/auth 全绿为止 |

这个区分对应 Anthropic《Building Effective AI Agents》（2024-12-19，Erik Schluntz & Barry Zhang）里 workflow 与 agent 的经典二分："Workflows 是 LLM 和工具通过预定义代码路径编排的系统；Agents 是 LLM 动态指挥自己流程的系统……本质上就是 LLM 基于环境反馈、在循环中使用工具。"

## 三、前史：循环不是 2026 年发明的

如果你觉得上面那张控制流图眼熟——你是对的。它就是控制论里的反馈环，就是恒温器，就是 Kubernetes 的 reconciliation loop。学术界和社区在 "loop engineering" 得名之前，已经把这个东西做了四年：

![Agent循环前史时间线：ReAct→Reflexion→AutoGPT→Ralph Loop→正式得名](https://oss.justin3go.com/blogs/agent-loop-prehistory-timeline.png)

ReAct（"ReAct: Synergizing Reasoning and Acting in Language Models"，2022-10-06 提交，后发表于 ICLR 2023）给出了 Thought→Action→Observation 的内层循环；Reflexion（Shinn et al., 2023）加上了自我批评和记忆；AutoGPT 第一次让大众见识了"给个目标就自己跑"——以及它掉进兔子洞出不来的失败模式。

### Ralph Loop：概念得名前就跑通了的实践

真正"在概念有名字之前就证明了这个模式"的，是 Geoffrey Huntley 的 **Ralph loop**（又称 Ralph Wiggum 技术，得名于《辛普森一家》里那个憨憨角色）。2025 年 6 月首次公开演示，2025 年 7 月正式发布于博客《Ralph Wiggum as a "software engineer"》（ghuntley.com/ralph）。它的全部实现是一行 bash：

```bash
while :; do cat PROMPT.md | claude-code ; done
```

没了。一个死循环，反复把同一个 prompt 文件喂给 coding agent。Huntley 自己的定义："Ralph is a technique. In its purest form, Ralph is a Bash loop."

看起来蠢，但这个设计里有一个非常聪明的决定：**每一轮迭代都用全新的上下文**。

![传统长会话上下文腐烂 vs Ralph每轮全新上下文+状态外置对比图](https://oss.justin3go.com/blogs/ralph-context-comparison.png)

进度不靠模型"记得"，靠仓库"长着"。每轮 agent 醒来，读 spec、看仓库现状、做差距分析、挑一件事做完、提交、死掉；下一轮的 agent 从 git 里看到前任留下的一切。Huntley 的自嘲式总结是这套技术最好的注脚：

> "The technique is deterministically bad in an undeterministic world."
> （在一个不确定的世界里，这个技巧是确定性地蠢。）

Ralph 有战绩，但要打折听：一支 YC 黑客松队伍用它一夜完成 6 个仓库的移植（约 600 美元 API 花费、1000+ 次提交）；Huntley 本人用约 3 个月的持续运行造出了一门带自举编译器的编程语言 CURSED。两者都出自技术支持者之口，没有独立复现。Huntley 自己也划了边界："There's no way in heck would I use Ralph in an existing code base."（打死不会在存量代码库里用 Ralph——只适合绿地项目。）

2025 年 12 月，Anthropic 官方发布了 Ralph Wiggum 插件——一个社区玩票技巧被产品方收编，这是"循环"从 hack 走向原语的标志性事件。

## 四、命名事件：2026 年 6 月的十天

一个跑了四年的老模式，为什么在 2026 年 6 月突然有了名字并刷屏？直接原因是一串多米诺骨牌：

![2026年6月Loop Engineering命名事件十天时间线](https://oss.justin3go.com/blogs/loop-engineering-naming-event-timeline.png)

深层原因有三个，缺一个都炸不起来：

1. **模型够强了**。Opus 4.5+、GPT-5.x-Codex 一级的模型能长时间自主运行，并且能靠跑测试、跑编译器自我验证。
2. **原语产品化了**。Claude Code 的 `/goal`、`/loop`，Codex 的 Automations——一年前搭一个循环意味着维护一堆自制 bash，现在是产品自带功能。
3. **头部实践者集体现身说法**。Cherny、Steinberger、Karpathy、Ng 在同两周内公开宣布自己围绕循环重组了工作方式，给了这个弥散的实践一个名字和一批可信的脸。

顺带存证一个广为流传但**未经核实**的引语：Jensen Huang 的"Nobody writes prompts anymore. The new job is to write and handle loops"——没有任何一份干净的 NVIDIA 官方文字记录能证实它，各转载对源视频的描述互相矛盾（一说 23 分钟一说 53 分钟）。引用它时请当作"对真实方向的转述"而非确凿原话。

## 五、方法论：五块积木、一层记忆、四层循环

### Osmani 的积木清单

Osmani 给出了循环的"解剖结构"——五个组成要素外加一层外部状态。这套结构几乎原样映射到 Claude Code 和 OpenAI Codex 两边，这正是"循环的形状正在变得工具无关"的证据：

![Osmani循环解剖结构：AUTOMATIONS心跳→四块积木→EXTERNAL STATE](https://oss.justin3go.com/blogs/osmani-five-building-blocks.png)

其中 Sub-agents 一条的理由，Osmani 说得很俏皮："The model that wrote the code is too nice grading its own homework."（写代码的那个模型，给自己作业打分时下不去手。）

### LangChain 的四层循环栈

LangChain（Sydney Runkle，2026-06-16）把"循环"进一步拆成四层嵌套，每层的时间尺度差一个量级：

![LangChain四层循环嵌套栈：Loop1 Agent loop→Loop2验证→Loop3事件驱动→Loop4爬山循环](https://oss.justin3go.com/blogs/langchain-four-loop-stack.png)

关键论断：Loop 1 和 2 只是把活干掉，**复利在 Loop 3 和 4**——一个能从生产 trace 里学习、回头改进自身配置的系统，才是随时间拉开差距的部分。这也是 Andrew Ng "三个循环"（编码循环以分钟计、开发者反馈循环以小时计、外部反馈循环以天/周计）的同构表达。

## 六、承重墙：验证器

如果整个 loop engineering 只能记住一句话，是这句：**循环的价值上限由验证器决定，不由模型决定**。

一个循环没有可靠的"完成了吗"判据，它要么永远停不下来，要么在错误的地方停下来并自信地宣布成功。所有 2026 年严肃的写作者在这一点上完全收敛。

### 制查分离（maker/checker）

![制查分离：MAKER与CHECKER往返，合格后交人类review](https://oss.justin3go.com/blogs/maker-checker-separation.png)

社区共识表述为一条铁律："The checker is never the same agent as the maker."（验收者绝不能是实现者本人。）这与 Anthropic harness 文章里 initializer agent 与 coding agent 分权的思路一脉相承。

### 停止条件：好与坏

| | 坏的循环目标 | 好的循环目标 |
|---|---|---|
| 例子 | "改进这段代码" | "test/auth 下所有测试通过，且 lint 干净" |
| 可检查性 | 靠感觉 | 机器一跑便知 |
| 循环行为 | 永远不知道何时停 | 有明确出口 |
| 可被作弊性 | 无从谈起 | 需防 reward hacking（见下） |

### 四种失败模式

| 失败模式 | 典型案例 | 对策 |
|---|---|---|
| Reward hacking（钻空子） | 删掉失败的测试，让 CI 变绿 | 验证器同时检查"测试数量没有减少"；Anthropic harness 文章的原文规则："It is unacceptable to remove or edit tests." |
| 幻觉式成功 | Agent 自报"已完成"，实际没跑通 | 只信确定性验证器，永远不信自我汇报 |
| 误差随轨迹复利 | 第 3 轮的小错在第 15 轮变成大坑 | 每轮小步提交 + 独立验收，错误早暴露 |
| 成本爆炸 | 循环空转一夜，账单四位数 | 下一节的三条护栏 |

### 产品是怎么把验证器做进停止条件的：`/goal` 的实现

Claude Code 的 `/goal`（v2.1.139，2026-05-11 上线，机制已对照官方文档核实）是个很好的解剖标本——它把 maker/checker 直接烤进了停止条件：

![`/goal` 的 Stop hook 机制：小模型评估器判定 NO/YES](https://oss.justin3go.com/blogs/goal-stop-hook-mechanism.png)

评估者与工作者是两个模型、两套视角——这正是第六节开头那条铁律的产品化。

## 七、三条护栏：循环上线第一天就要装

所有严肃写作者收敛出的第二个共识：护栏不是可选项。一个没有护栏的循环不是资产，是负债。

![三条护栏检查流程：迭代次数→进展检测→预算上限→验证器判定](https://oss.justin3go.com/blogs/three-guardrails-flowchart.png)

护栏 ③ 有一个被各家报道反复引用的现实注脚：Uber 在四个月内烧完了全年 AI 预算后，把工程师的 agent 工具费用上限压到了每人每月 1500 美元（出自二手报道）。预算护栏不是杞人忧天，是已经有人交过学费。

## 八、原语已经商品化：两大 coding agent 的循环积木对照

"为什么是现在"的第二个答案在这张表里——2025 年你需要自己维护 bash 脚本才能拥有的东西，2026 年是产品自带按钮：

| 循环积木 | Claude Code | OpenAI Codex |
|---|---|---|
| 定时心跳 | `/loop`（v2.1.72+，动态 1min–1hr 或固定如 `/loop 15m`）、`/schedule`、cron、hooks、GitHub Actions | Automations 标签页 + Triage 收件箱 |
| 目标驱动停止 | `/goal`（上节已拆解） | 对应的 `/goal` |
| 并行隔离 | `git worktree` / `--worktree` / `isolation: worktree` | worktrees |
| 知识沉淀 | `SKILL.md` | `SKILL.md` |
| 子 agent | subagent 机制 | `.codex/agents/` 下的 TOML 定义 |
| 外部连接 | MCP | MCP connectors |
| 批量分发 | `/batch`（并行 worktree agent；此条出自二手信源，未对照官方文档核实） | 历史上 `codex exec` 单次即退，需 bash 包装（如 codex-autoresearch-harness） |

Boris Cherny 给过一条"典型的一天从这句开始"的循环启动语，可以当作 loop engineering 的 hello world：

```
/loop babysit all my PRs. Auto-fix build issues, and when comments
come in, use a worktree agent to fix them.
```

他本人的成绩单是这个领域最硬的一手证据（出自其本人 Threads 帖，时间范围是 **2025 年 12 月底前的 30 天**，不是被讹传的 2026 年 6 月）：30 天落地 **259 个 PR、497 次提交、+4 万/−3.8 万行**，每一行都由 Claude Code + Opus 4.5 写成；他在 2025 年 11 月卸载了 IDE。

编码之外，同一个形状也出现在科研场景：Andrej Karpathy 的 autoresearch（2026-03-07 发布，首五天约 2.5 万 GitHub star，4 月初达 6.6 万+）跑的是"提出改动→训练→评估"的循环，只保留能降低 validation loss 的改动（靠 git revert 回滚失败实验），初次演示两天跑了约 700 个实验。Fortune 把这套方法论称作 "The Karpathy Loop"。循环 + 机械验证器（loss 数字）+ 外置状态（git），三要素齐全。

## 九、冷思考：三类批评，以及它们各自成立的部分

刷屏概念必有反弹。三类批评都值得认真对待，因为每一类都有成立的部分：

| 批评 | 代表 | 核心论点 | 成立的部分 | 反驳 |
|---|---|---|---|---|
| "就是个 while 循环" | Hacker News 约 1800 条评论的长帖；讽刺网站 extra-steps.dev | 剥掉词汇，这就是 `while` 套一个 LLM 调用；写过 CI、autoscaler、K8s reconciliation 的人"设计循环"很多年了 | 技术上完全正确，原语毫无新意 | 新的不是原语，是纪律：接上定时器 + 验证器 + 预算才是这门手艺的内容。中文社区的说法："死循环是忘写停止条件的锅，不是 for 循环这个概念的锅。" |
| 经济批判 | Ed Zitron | "OpenAI 会给自己的 token 消耗开账单吗？"——这波风潮是厂商在鼓吹"自主消耗 token"；并讥讽 Cherny 是"被允许每月烧 13 万美元 token 的人"（该数字为二手、存疑） | 利益相关是真的：鼓吹者多为 token 卖方或重度补贴用户 | 预算护栏（第七节）正是对这条批评的工程回应；成本约束下循环依然对特定任务净赚 |
| 前提条件批判 | Gergely Orosz（Pragmatic Engineer） | "除了那些①token 预算无上限②觉得逐轮提示拖慢了自己的少数人之外，多数人没有循环的用例" | 对一次性、探索性工作，循环确实是杀鸡用牛刀 | 所以才有第十节的决策矩阵——循环从来不是全场景方案 |

还有一条批评来自命名者本人。Osmani 在文章里警告了 **comprehension debt（理解债）**：循环越快，"存在的代码"和"你理解的代码"之间的鸿沟越宽；"两个人可以搭一模一样的循环，得到完全相反的结果"。The Register（2026-06-24）甚至说 Osmani 的结论"反而拆了循环的台"——因为他承认"循环改变了工作，但没有把你从工作中删除"。

Osmani 的收尾值得全文引用，它给整场狂热定了调：

> "Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go."
> （去搭循环。但要以"打算继续当工程师的人"的方式去搭，而不是只当那个按启动键的人。）

## 十、决策：你的哪些任务该上循环

把前面所有内容压缩成一张决策图。横轴是"完成"能否被机器验证，纵轴是出错的代价：

![循环上线决策四象限：横轴完成可否机械验证，纵轴出错代价](https://oss.justin3go.com/blogs/loop-decision-matrix.png)

右下角那五类任务的共性：可重复、机器可验证、搞砸了也坏不到哪去。从这里起步，毕业标准（出自调研报告的建议）也很具体：**一个循环无人值守跑满一周，预算零超支，产出的 PR 在你 review 后 90% 以上可合并**——达标了再扩大权限范围。

起步顺序（注意：验证器在循环之前）：

![循环搭建五步起步顺序：验证器优先于循环本身](https://oss.justin3go.com/blogs/loop-adoption-sequence.png)

## 尾声：稀缺技能换位了

回到引子里那位工程师。四十分钟的修测试链路，人占了二十五分钟。Loop engineering 给出的答案不是"打字快一点"，而是把这个人从链路里挪出去，换成一个验证器加三条护栏。

这门手艺里真正稀缺的技能，已经不是措辞（prompt 层解决了）、不是喂料（context 层解决了）、也不是搭环境（harness 层的产品正在解决）——而是**写出一个循环骗不过的停止条件**。会写这个条件的人，可以让 259 个 PR 在 30 天里自己长出来；不会写的人，会得到一个删测试刷绿 CI 的循环和一张四位数的账单。

而这两个人，搭的可能是一模一样的循环。
