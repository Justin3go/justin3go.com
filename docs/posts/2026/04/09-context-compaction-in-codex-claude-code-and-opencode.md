---
title: 丢掉沉重的记忆：Codex、Claude Code 与 OpenCode 的上下文压缩术
date: 2026-04-09
tags:
  - Context Compression
  - AI Agent
  - Codex CLI
  - Claude Code
  - OpenCode
  - LLM
  - Context Window
---

# 丢掉沉重的记忆：Codex、Claude Code 与 OpenCode 的上下文压缩术

> ✨文章摘要（AI生成）
>
<!-- DESC SEP -->
>
本文以一个 15,400 tokens 的登录 Bug 修复场景为切入点，深入拆解了三款主流 CLI Agent（**Codex CLI**、**Claude Code**、**OpenCode**）的上下文压缩策略。Codex CLI 采用"工作交接单"式的单层摘要替换；Claude Code 设计了三层递进机制——工具结果修剪、**Prompt Cache 友好策略**和 9 部分结构化 LLM 总结；OpenCode 则以非物理删除的时间戳标记隐藏配合 5 标题 LLM 摘要实现"阶梯治理"。文章揭示了一个核心洞察：最好的上下文管理不是无限扩大记忆容量，而是学会**精密地遗忘**。
>
<!-- DESC SEP -->

在使用 AI Agent 深度参与编程任务时，你一定遇到过这种窘境：起初 AI 反应敏捷，指哪打哪；但随着对话轮次增加，它似乎开始变得越来越笨。

上下文快用完的时候，AI会着急完成导致效果不佳，社区中称作 Context Anxiety (上下文焦虑)，和我们人一样，着急就容易出错。为了维持对话，Agent 必须丢掉一部分记忆（压缩 - Compact）。但怎么丢、丢掉谁、丢掉后怎么补救，成了衡量一个 Agent 运行时（Runtime）是否成熟的分水岭之一。

今天笔者就带大家拆解三款主流 CLI Agent——**Codex CLI**、**Claude Code** 和 **OpenCode**。看看它们在面对同一个登录 Bug 时，是如何施展各自的"压缩大法"的。

> 注：本文分析基于 Codex CLI 与 OpenCode 的开源仓库逻辑，以及社区逆向研究与泄露源码对 Claude Code 运行时的验证。

## 场景回放：一场价值 15,400 Tokens 的登录修复

假设你正在修复一个登录接口报 401 Unauthorized 的 Bug。你召唤了 AI Agent，并经历了一番激烈的排查。

下面是这段对话的完整记录：

| 编号 | 角色 | 内容摘要 | 预估 Token |
| :--- | :--- | :--- | :--- |
| #1 | System | 系统提示词（含 40+ 工具定义） | ~800 |
| #2 | User | "登录页面报 401，帮我排查下" | ~100 |
| #3 | Assistant | "我先搜一下认证相关的逻辑" | ~150 |
| #4 | Tool Call | `grep "auth" --include="*.ts"` | ~50 |
| #5 | **Tool Result** | **(返回 50 处搜索结果)** | **~2,000** |
| #6 | Assistant | "搜到几处，我看看 auth.ts" | ~150 |
| #7 | Tool Call | `read_file "src/auth.ts"` | ~50 |
| #8 | **Tool Result** | **(完整文件内容，约 300 行)** | **~3,500** |
| #9 | Assistant | "找到了，token 校验没处理过期" | ~300 |
| #10 | User | "好，但要兼容旧的 Session 方式" | ~80 |
| #11 | Assistant | "明白，我再看看 middleware" | ~150 |
| #12 | Tool Call | `read_file "src/middleware.ts"` | ~50 |
| #13 | **Tool Result** | **(middleware 完整内容)** | **~2,500** |
| #14 | Assistant | "middleware 也要改，我来处理" | ~200 |
| #15 | Tool Call | `edit_file "src/auth.ts" (patch)` | ~100 |
| #16 | Tool Result | "Successfully applied." | ~30 |
| #17 | Tool Call | `edit_file "src/middleware.ts" (patch)` | ~100 |
| #18 | Tool Result | "Successfully applied." | ~30 |
| #19 | Assistant | "代码改好了，跑个测试看看" | ~100 |
| #20 | Tool Call | `bash "npm test"` | ~50 |
| #21 | **Tool Result** | **(3 个测试失败，含堆栈)** | **~3,000** |
| #22 | Assistant | "有 3 个测试挂了，我修一下测试用例" | ~200 |
| #23 | Tool Call | `edit_file "src/auth.test.ts" (patch)` | ~150 |
| #24 | Tool Result | "Successfully applied." | ~30 |
| #25 | Tool Call | `bash "npm test"` | ~50 |
| #26 | **Tool Result** | **(测试全部通过，含完整输出)** | **~1,500** |

看起来不过 26 条消息，但已经吃掉了约 **15,400 tokens**。其中加粗的五条工具结果（#5, #8, #13, #21, #26）合计约 **12,500 tokens**，占了 **81%**。这些数据在排查时至关重要，但 Bug 修好后，它们就变成了上下文里沉重的负担。如果不处理，下一轮对话可能因为窗口溢出而丢掉系统提示词或用户的核心需求。

## Codex CLI：写一份干练的"工作交接单"

OpenAI 的 Codex CLI（[源码](https://github.com/openai/codex)，Rust 实现）走的是一种非常符合人类直觉的路线：**总结与替换**。

它的核心思想可以用一句话概括：**把之前的全部对话交给 LLM 写一份"工作交接摘要"，然后用这份摘要替换掉原始历史。**

### 双路径设计

Codex 提供了两条压缩路径：

1. **本地路径**（`compact.rs`）：在客户端调用 LLM 生成摘要，适用于所有模型提供商。
2. **远程路径**（`compact_remote.rs`）：直接调用 OpenAI 的内部 API 端点 `responses/compact`，让服务器完成压缩。仅限 OpenAI 自家模型。

注意，这里的"本地"和"远程"指的**不是**是否需要调用 LLM——两条路径都需要 LLM 参与，区别在于**"生成摘要"这个核心步骤跑在哪里**。本地路径下，客户端自己构造摘要 Prompt（从内置模板 `templates/compact/prompt.md` 加载）、通过 `ModelClientSession` 流式调用 LLM API、再处理返回结果，整个编排流程都在你的机器上完成，所以它能对接任意模型提供商。远程路径下，客户端把准备好的对话历史和工具定义发给 OpenAI 的 `compact_conversation_history` 端点，由服务器完成摘要生成——但客户端并非"甩手掌柜"，它在调用前后仍然承担了大量工作：调用前要修剪过长的函数调用历史、构建包含工具规范和系统指令的完整 Prompt 对象；调用后要过滤返回结果（比如丢弃过时的 `developer` 角色消息、只保留真实的用户和助手内容）、恢复用于 `/undo` 功能的 ghost snapshots、以及重新计算 token 用量。

简单说，远程路径只是把**"压缩"这一步**外包给了 OpenAI 服务器，前处理和后处理仍由客户端完成。这种设计的优势在于：OpenAI 服务端很可能对这个端点做了专门优化（比如使用更经济的模型或内部缓存），这些是客户端走通用 API 做不到的。这体现了 OpenAI 对自家基础设施的垂直整合。

### 压缩的具体流程

当走本地路径时，Codex 会先提取最近的用户消息（硬上限约 20,000 tokens），然后发送一段简短的 Summarization Prompt 给 LLM。这段 Prompt 只有 4 个核心要点：

> 你正在执行一次"上下文检查点压缩"。请为另一个将接续任务的 LLM 生成一份交接摘要，包含：当前进展和关键决策、重要的约束和用户偏好、剩余待办事项、继续工作所需的关键数据。

关键词是**"交接"（Handoff）**——它不是在写会议纪要，而是在写一份让下一个人（模型）能直接上手的工作简报。

用我们的登录 Bug 场景来看：

![Codex CLI 压缩前后对比](https://oss.justin3go.com/blogs/codex-compression.png)

**思路拆解：**

注意看压缩前后的变化——所有消息变成了 4 条。Codex 极其尊重"用户意图"，它会物理删除所有的 Assistant 回复和 Tool 相关消息，但会**原封不动地保留所有 User 消息**（#2 和 #10）。

随后，它插入一条伪造的 Assistant 消息，内容是一份结构化的交接总结。这份总结包含了任务目标、已完成项、关键架构决策和剩余待办。对于新模型来说，它不需要看那些大段的文件内容和测试堆栈，它只需要知道"测试已经修好了"就足够了。

### 自动触发与兜底

当 Token 用量接近模型上下文窗口上限时，Codex 会自动触发压缩（不需要用户手动执行 `/compact`）。如果压缩后空间还是不够，它会退而采取更激进的"头部修剪"——直接从最早的消息开始砍，确保对话能继续下去。

笔者觉得 Codex 的方案最大的优点是**直觉性**：交接摘要这个概念每个职场人都能理解。缺点是它比较"一刀切"——所有 AI 回复和工具结果都被替换成一段摘要，如果那段摘要遗漏了某个关键细节，就真的找不回来了。

## Claude Code：三层递进的"精密遗忘"

Anthropic 出品的 Claude Code 逻辑更为细腻。它不追求一步到位的物理删除，而是设计了**三层逐级加强的清理机制**——从轻到重，能不动 LLM 就不动 LLM。

> 注：Claude Code 非开源项目，以下分析基于社区逆向工程和公开资料，具体实现可能随版本变化。

### 第一层：工具结果修剪（无 LLM 开销）

这是最频繁、也最轻量的一层。**不需要调用 LLM**，纯粹是本地的规则引擎。它在每次请求前都会自动执行。

它的逻辑很简单：
- 始终保护最近若干个工具调用的结果（正在用的东西不能删）
- 超出保护范围的旧工具结果 → 替换为 `[Old tool result content cleared]` 占位符

用我们的场景来看：

![Claude Code 第一层压缩](https://oss.justin3go.com/blogs/claude-layer1.png)

这种做法极其聪明：它维护了 AI 的"心流"。AI 记得自己搜过代码（#4 的 tool_call 还在），也记得自己读过文件（#7 的 tool_call 还在），只是不记得搜到了什么、文件内容是什么。如果它之后真的需要再次查看，它会自己重新发起 `read_file`。

笔者认为这一层的设计极为精妙——它实现了**"选择性失忆"而非"全面遗忘"**。就像你记得去年读过一本好书，但忘了具体内容，需要的时候再翻就好。

### 第二层：缓存友好策略（Prompt Cache）

这是 Claude Code 的看家本领，也是三者中**独有的差异化优势**。

Anthropic 的 API 支持 Prompt Cache——如果你发给 API 的消息前缀和上一次请求相同，服务器可以复用之前的计算结果，大幅降低成本和延迟。

这意味着什么？在清理消息时，Claude Code 会尽量避免修改消息序列的前半部分。它采用"手术式"方案：只在尾部进行修整，确保消息开头部分保持绝对一致。这样做的代价是清理效率略低，但换来的是**缓存命中率的最大化**。

用我们的场景来看。假设经过第一层清理后，消息序列是 #1-#26（工具结果已替换为占位符）。现在上下文仍然超标，需要进一步裁剪。一个"朴素"的做法是从最早的消息开始删——但 Claude Code **不这么干**：

![缓存策略对比](https://oss.justin3go.com/blogs/claude-cache-strategy.png)

左边的朴素策略虽然删掉了最旧的消息，看起来很合理，但代价是**整个前缀都变了**——API 缓存全部失效，下次请求要从头计算。右边的 Claude Code 策略则相反：它宁可少删一些，也要保证消息序列的**前缀部分和上一次请求完全相同**，让 Anthropic API 的 Prompt Cache 能够命中。

在长时间运行的任务中（比如你连续让 AI 帮你重构一整个模块），这种策略能带来可观的成本节省——因为每次 API 请求的大部分内容都能命中缓存，只需要为新增的尾部内容付费。

### 第三层：9 部分结构化 LLM 总结（最后手段）

当前两层都无法阻止上下文继续膨胀时，系统触发最终的全量总结。根据源码，自动压缩的触发阈值为 `有效上下文窗口 - 13,000 tokens`（其中有效窗口 = 模型上下文窗口 - min(最大输出 tokens, 20,000)）。

不过，即使达到了阈值，系统也不会直接跳到 LLM 总结。自动压缩触发时，系统会**优先尝试 Session Memory Compact**——利用 session memory（会话记忆）中已有的结构化信息来替代完整的 LLM 调用。这意味着大多数自动压缩甚至不需要 LLM 调用。只有当 session memory 路径不可用或不够时，系统才会回退到传统的 LLM 总结流程，生成一份**包含 9 个固定部分的结构化摘要**：

1. 用户的原始意图
2. 核心技术概念
3. 关注的文件和代码
4. 遇到的错误及修复方式
5. 解决问题的逻辑链
6. 所有用户消息的摘要
7. 待办事项
8. 当前正在做什么
9. 建议的下一步

这份摘要的要求极其严格——Prompt 中会要求模型**直接引用原文关键短语**，而不是全部用自己的话改写。这是为了防止"语境漂移"（模型在复述过程中微妙地偏离原意）。

用我们的场景来看：

![Claude Code 第三层压缩](https://oss.justin3go.com/blogs/claude-layer3.png)

压缩完成后，Claude Code 还会做一系列善后工作，笔者把它叫做**"状态重构"**：

- 在新对话开头注入引导语（"本次会话延续自上一段对话..."）
- **自动重新读取**最近编辑过的文件（最多 5 个文件，总预算 50,000 tokens，单文件上限 5,000 tokens），确保 AI 手里有最新代码
- 重新声明工具和技能定义
- `CLAUDE.md` 中的项目规范作为系统提示语的一部分，始终常驻，不受压缩影响

用户还可以在手动压缩时附加自定义指令，比如 `/compact Focus on API changes`，引导压缩侧重于特定方向。

此外，系统还有一条**被动兜底路径**：当 API 返回 `prompt_too_long` 错误时，系统会自动启动一次反应式压缩并重试请求，确保用户不会因为上下文溢出而直接遇到错误中断。同时，为防止压缩反复失败导致的死循环，连续 3 次自动压缩失败后系统会暂停自动压缩功能。

Claude Code 的方案是三者中最复杂的，但也是最"省钱"的——大多数时候它只需要执行第一层的规则引擎清理，或者通过 Session Memory 路径完成压缩，根本不需要额外的 LLM 调用。

## OpenCode：先修剪，再摘要的"阶梯治理"

开源界的新秀 OpenCode（[源码](https://github.com/anomalyco/opencode)，TypeScript + Effect-TS 实现）则提供了一种更为平衡的策略。它在 `session/compaction.ts` 中实现了一套阶梯式的治理流程：**先用低成本手段尽可能腾空间，实在不够再动用 LLM。**

### 第一步：Prune（标记隐藏，非物理删除）

OpenCode 的第一个动作不是删除，而是"标记"。它的规则非常清晰：

- 只有当修剪能释放超过 20,000 tokens 时才执行（小修小补不值得折腾）
- 始终保留最近的 40,000 tokens 作为"安全垫"（正在进行的工作不能动）
- `skill` 类型的工具输出永远不修剪（因为里面包含操作指令）
- 保护最近 2 个用户回合的完整内容

**关键设计**：和 Claude Code 的占位符替换不同，OpenCode 的修剪**不是物理删除**，而是给旧消息打上一个 `compacted = Date.now()` 的时间戳标记，让它们在后续请求中"不可见"。数据其实还在数据库里，只是被隐藏了。

![OpenCode Prune](https://oss.justin3go.com/blogs/opencode-prune.png)

**关键点：** 数据并没有真正丢掉。这为未来可能的历史回溯功能留下了空间——如果开发者需要审计，或者 Agent 触发了某种回溯逻辑，这些数据是可以被重新拉回上下文的。这是一个很有前瞻性的设计。

### 第二步：LLM 5 标题摘要

如果 Prune 之后还是太臃肿，OpenCode 会用一个隐藏的、专门的 Agent（不干扰用户当前的交互）来调用 LLM 生成一份摘要。这份摘要有一个固定的 5 标题结构：

![OpenCode LLM 摘要](https://oss.justin3go.com/blogs/opencode-summary.png)

OpenCode 在摘要后有一个非常温馨的设计：它会自动**重放最后一条用户消息**。这能确保 Agent 的最后记忆点始终停留在用户的最新指令上，而不是停留在一段冷冰冰的摘要总结里。用户完全感知不到压缩的发生——你说的最后一句话会被重新发送，AI 继续回答，好像什么都没发生过。

另一个亮点：**OpenCode 会跟随用户的语言**。如果你一直用中文交流，它的摘要也会是中文的。这对非英语母语的开发者来说，是一个很友好的设计。

笔者觉得 OpenCode 的方案在三者中最"开发者友好"——代码全开源（TypeScript），架构现代（Effect-TS），非物理删除的设计为扩展留足空间。如果你想深度定制压缩行为，OpenCode 是最容易上手的。

## 三剑客同台竞技

我们将三者的方案放在一起并排观察：

输入：26 条消息, ~15,400 tokens（同一个"修登录 bug"场景）

![三剑客对比](https://oss.justin3go.com/blogs/three-comparison.png)

| 维度 | Codex CLI | Claude Code | OpenCode |
| :--- | :--- | :--- | :--- |
| **压缩层次** | 单层（摘要） | 三层（修剪/缓存/摘要） | 两层（隐藏/摘要） |
| **LLM 调用** | 必须 | 仅在第三层 | 仅在第二步 |
| **用户消息** | 永久保留原始内容 | 摘要化（第三层） | 摘要化 + 重放最后一条 |
| **工具结果处理** | 物理删除 | 占位符替换 | 时间戳标记隐藏 |
| **缓存优化** | 无特殊设计 | 深度集成 Prompt Cache | 侧重减少重复读取 |
| **压缩后行为** | 被动等待 | 主动重读相关文件 | 自动重放最后指令 |

### 一些值得展开说的差异

**关于"要不要保留用户原话"**：Codex 选择保留用户消息、只压缩模型回复，这样做的好处是 AI 永远能回看你说过什么，但代价是当用户消息本身很长时，压缩效率会打折扣。Claude Code 和 OpenCode 则选择全部压缩为摘要，更激进但更节省空间。

**关于缓存**：这是 Claude Code 最独特的优势。其他两家在压缩后，API 请求的内容会发生很大变化，之前的缓存基本作废。而 Claude Code 刻意维持消息前缀的稳定性，使得压缩后的请求依然能复用之前的缓存。在长时间运行的任务中，这意味着可观的成本节省。

**关于"非物理删除"**：OpenCode 的时间戳标记方式是个很有前瞻性的设计。虽然当前版本并没有实现历史回溯功能，但数据没有真正丢失，为未来留下了可能性。而 Codex 和 Claude Code 的压缩都是不可逆的。

## 最后

如果用一个类比来形容这三位：

*   **Codex CLI** 像是一个写**交接单**的资深员工。他直接撕掉之前的草稿纸，给你一张写的清清楚楚的现状说明，虽然简单粗暴，但非常有效。
*   **Claude Code** 像是一个拥有**精密遗忘**能力的学者。他优先划掉书上的细碎批注，只有在书架实在堆不下时，才会把整本书浓缩成一页大纲。他非常在意翻书的效率（缓存）。
*   **OpenCode** 像是一个务实的**阶梯治理**者。他先给旧文件打包贴上标签（隐藏），实在不行才做总结。他最贴心的地方在于，总结完后还会提醒你："你刚才最后说的是这件事对吧？"

归根结底，在 2026 年，最好的上下文管理并不是无止境地扩大 LLM 的记忆容量，而是学会如何**精密地遗忘**。毕竟，一个什么都记得住的 Agent，往往也最容易被噪音干扰。

---

**参考来源：**

- Codex CLI: [openai/codex](https://github.com/openai/codex) (参考 `codex-rs/core/src/compact.rs`)
- Claude Code 社区资料：
    - [Claude Code System Prompts](https://github.com/Piebald-AI/claude-code-system-prompts)
    - [Sam Saffron's Gist](https://gist.github.com/sam-saffron-jarvis/9d8e291c4e696ac7948702d6c4884448)
    - [Claude Code's Compaction Engine](https://barazany.dev/blog/claude-codes-compaction-engine)
    - [泄露源码仓库](https://github.com/yasasbanukaofficial/claude-code)（非官方泄露，用于验证修订）
- OpenCode: [anomalyco/opencode](https://github.com/anomalyco/opencode) (参考 `packages/opencode/src/session/compaction.ts`)
