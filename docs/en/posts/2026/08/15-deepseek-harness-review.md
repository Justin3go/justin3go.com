---
title: 'DeepSeek Harness In Depth: 90K Stars in Two Days for "Everything Is a Plugin" — the Future, or Over-Engineering?'
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

# DeepSeek Harness In Depth: 90K Stars in Two Days for "Everything Is a Plugin" — the Future, or Over-Engineering?

> ✨Article Summary (AI Generated)
>
<!-- DESC SEP -->
>
DeepSeek open-sourced its agent runtime framework deepseek-harness (dsh) on 2026-08-13, and it crossed 90,000+ stars within two days. This article draws on a full read of the source, a side-by-side comparison with Pi, Codex CLI, Claude Code, and OpenCode, and cross-checks against dozens of real reviews from X, Hacker News, and Chinese-language communities to unpack its "everything is a plugin" Cordis core, its event-driven Turn/Step main loop, its append-only session log, and its self-modifying toolset — verifying, claim by claim, what the praise and the criticism actually get right. It closes with a clear recommendation on who should (and shouldn't) adopt it.
>
<!-- DESC SEP -->

## Prologue: 28 Hours, 90,000 Stars

On August 13, 2026, DeepSeek open-sourced a project called **deepseek-harness** (CLI name `dsh`). It crossed 50,000 stars in about 12 hours and roughly 92,000 by hour 28 — for reference, the previous velocity record holder, OpenClaw, took 84 days to reach 200,000.

The buzz is real, and so is the controversy. My timeline showed two opposing takes at once:

- One side: this is "the seed of an Agent OS," "the low-level skeleton no other framework has."
- The other: "needlessly heavy," "wrapping an entire plate of dumplings' worth of vinegar just to chase self-evolution."

Oddly, both camps included people who had genuinely read the source. So for this piece I did three things: read the whole repo cover to cover, compared it point by point against Pi, Codex CLI, Claude Code, and OpenCode, and pulled together the substantive commentary from X (Twitter), Hacker News, and Chinese-language communities, checking each claim against the actual code — to see how much of what people are saying actually holds up.

The one-line verdict up front: **dsh isn't really "DeepSeek's version of Claude Code" — it's closer to a radical experiment in what an agent runtime *should* look like. It's not the right tool today for most people who just want to write code, but the bet it's making is worth a serious look from anyone building agent infrastructure.**

## Part One: What It Actually Is

### 1.1 The Basics

- **Positioning**: an open-source agent runtime framework (harness/runtime) — the CLI, the web UI, and the automation server are all just "assembled shapes" sitting on top of it.
- **Release**: 2026-08-13, currently at version `0.1.0-rc.5`, explicitly labeled a developer preview. The README states plainly: "THERE WILL BE COMPATIBILITY-BREAKING CHANGES."
- **License**: MIT, fully open source.
- **Stack**: a TypeScript monorepo (57 package groups, roughly 500K lines of TypeScript), with about 300 lines of C11 underneath the Linux sandbox.
- **Model support**: not locked to DeepSeek's own models — a plugin adapter layer supports roughly 40 providers, including OpenAI, Anthropic, Google, Kimi, and any OpenAI-compatible endpoint; wiring one up takes a few lines of YAML.
- **Scale** (two days after launch, per the GitHub API): 92,700+ stars / 8,400+ forks.

An easy-to-miss piece of backstory: when DeepSeek previously published model benchmark numbers (for DeepSWE, for instance), it drew criticism for "vendor-reported, unreproducible" scores, and the team promised at the time to "open-source the harness used for evaluation." Multiple signals now point to dsh being exactly that promise kept — it's the internal framework DeepSeek uses to run agentic benchmarks against its own models. That explains why the repo shipped so mature on day one: 22 contributors, with the top contributors sitting at thousands of commits each — clearly this had been iterating internally for a long time.

### 1.2 Core Idea: Everything Is a Plugin

Most coding agents work like this: write a core agent loop (take input → call the model → run tools → repeat), then leave a few extension points around the edges (MCP, skills, and so on). The core is privileged code; extensions are second-class citizens.

dsh flips that structure. Its foundation is a general-purpose plugin framework called **Cordis** (its design traces back to the paper *A Programming Paradigm for Spatiotemporal Composability*, and it has already spent four years in production inside the Koishi chatbot framework). From there —

**the model adapter is a plugin, the tool registry is a plugin, session storage is a plugin, the sandbox is a plugin, the UI is a plugin, and even the agent's main loop itself is a plugin.**

This isn't marketing copy. In the source, the agent loop is literally just an ordinary package (`packages/core/agent-loop`) that can be swapped out via config like any other plugin. The minimal shape of a plugin is a file that exports an `apply(ctx)` function, mounted with a single line of YAML:

```ts
import type { Context } from '@deepseek-ai/cordis'
export const name = 'hello'
export function apply(ctx: Context) {
  console.log('hello from my first plugin')
}
```

The official release ships four preset run modes: **standard mode** (a full-featured coding agent), **code mode** (TypeScript SDK orchestration), **minimal mode** (just a shell and a file editor, for running benchmarks), and **creative mode** (runtime inspection and plugin experimentation). But these four are just four of the official "build patterns" — as beta tester Jiayuan Zhang put it in an apt comparison: dsh is like a **Lego car kit**, and the official presets are just one recommended way to assemble it, printed on the box.

## Part Two: Core Design, Unpacked

### 2.1 An Event-Driven Main Loop: Turn and Step

dsh's main loop is a standard ReAct pattern (the model thinks → calls a tool → reads the result → thinks again), but instead of a hard-coded `while` loop, it's decomposed into a set of events:

```
turn/start → agent/pre-step → step/start
  → system-prompt/assemble (assembles the prompt and tool schema)
  → agent/request → llm/stream → assistant/message
  → tools/pre-execute → tools/execute → tools/post-execute
  → step/end → agent/turn-stopping → turn/end
```

A **step** is "one model request plus whatever tool calls it triggers"; a **turn** is zero or more steps, from receiving input through to everything being done. The key point: almost every stage is an interceptable event — a plugin can rewrite messages or refuse execution at `agent/pre-step`, or swap out a tool's result at `tools/post-execute`. The loop isn't the framework's private property; it's a public protocol every plugin gets to participate in.

The direct consequence: **turning a single agent into a multi-agent collaboration architecture just means swapping out the loop plugin — no need to fork the whole project.** Compare that to Codex CLI, where changing the main loop means editing its Rust core.

### 2.2 Append-Only Session Logs: Everything the Model Sees Is on the Record

dsh enforces a runtime invariant: "**Model-visible means logged**" — anything that goes into a model request must be reconstructible from the session log. The session log is an append-only event stream, and the conversation history the model sees is *projected* from that log, which supports resume, fork, search, and replay.

Some on Hacker News have called this a killer feature: at a moment when U.S. vendors are increasingly encrypting reasoning traces and making them hard to audit, dsh made "fully traceable" an architectural guarantee rather than a nice-to-have. GeekPark's hands-on testing confirmed the experience in practice: the system prompt, the chain of thought, and every tool call and result are preserved in full.

Context compaction isn't a black box baked into the loop either — it's an independent plugin: over-budget tool results get trimmed first, and if that's not enough, a summary node is generated to replace a chunk of history. The whole process is locked with three log events, so even a crash mid-compaction is reconstructible from the log.

### 2.3 Three Things "Nobody Else Has"

**① Code Mode (`run_code`)**: the model writes a chunk of TypeScript that batch-calls tools via `await tools.name(args)`, and only whatever gets `print`ed or `return`ed goes back to the model. This is a solution to the "a dozen scattered tool calls burn through the context window" problem — a dozen round-trips collapse into a single execution of one code block.

**② A subagent can be delegated to a competitor**: dsh's subagent backend (`ctx.subagents`) supports multiple providers, and startlingly, that list includes `claude-code` and `codex` — meaning you can dispatch a subtask from inside dsh whose actual executor is Claude Code or Codex CLI. This "harness-agnostic" stance has no precedent among competing products.

**③ A self-modifying toolset (`cordis_*`)**: the agent can inspect its own plugin tree at runtime, write a new plugin on the fly, and mount it for use. This is the seed of a "self-evolving agent" — though two caveats are worth stating plainly: it's **not enabled in any official preset by default** and has to be turned on explicitly, and a plugin written on the fly lives only in memory — it's gone on restart, with no way to persist it yet.

### 2.4 Sandboxing and Permissions: Strict Where It Should Be

The security design here isn't sloppy: Linux uses bwrap + Landlock (paired with a custom-built C launcher that's fail-closed), macOS uses Seatbelt, and Windows uses restricted ACL tokens. The approval model is a closed enumeration, and anything anomalous is rejected as "unavailable" by default rather than silently allowed. It's even honest about distinguishing "full" versus "partial" sandbox enforcement — Landlock on older kernels only qualifies as partial, and it doesn't misreport itself as full.

But there's a layering gap worth flagging: **the sandbox governs tool execution, while plugins themselves run inside the harness process.** 36Kr's hands-on testing pointed out explicitly that any plugin can reach the shell and the filesystem — right now, the trust model for installing third-party plugins basically comes down to good faith.

### 2.5 An Easter Egg: Building a Harness With a Harness

What struck me most in this repo wasn't the code — it was the **1,386 Agent Notes** under `.agents/`: architectural decision records classified as "implemented / rejected / archived / proposed," plus published post-mortems. The documentation runs to roughly 170,000 lines, nearly on par with the main codebase, and type snippets embedded in the docs are automatically diffed against the source in CI to prevent drift; 100% test coverage per file is a hard gate.

These traces strongly suggest that the repo itself was built with heavy AI-agent involvement — designing, reviewing, and writing post-mortems. dsh is the first user of its own philosophy.

## Part Three: Side by Side — Four Different Roads

The coding-agent harness landscape right now roughly splits into four camps (star counts per the GitHub API as of 2026-08-15):

| Project | Approach | License | Stars | One-liner |
|---|---|---|---|---|
| **Claude Code** | Layered extensible ecosystem | Source-available, non-standard open license | 141k | Skills/Hooks/Subagents/MCP/Plugins — the fullest ecosystem, and the "heaviest" |
| **OpenAI Codex CLI** | Rust + kernel-level sandbox | Apache 2.0 | 106k | Widely regarded as the safety leader; declarative extensions (a folder is a plugin) |
| **Pi** (Earendil) | Minimalist | MIT | 90k | Ships only 4 tools by default, a system prompt under 1,000 tokens; the engine under OpenClaw |
| **deepseek-harness** | Runtime-pluggable | MIT | 93k | Everything is a plugin, even the loop can be swapped |

(For completeness: the fully open-source OpenCode sits at 197k stars, Gemini CLI at 107k, and Aider at 48k — their approaches roughly track Claude Code, Codex, and pair-programming tools respectively, and I won't dig into them further here.)

### 3.1 Versus Codex: Declarative vs. Imperative

This is the highest-quality technical debate I found in the community, from developer grapeot, who read both codebases line by line:

- **Codex is declarative**: a plugin is just a folder on disk (a Markdown skill, an MCP config, a shell script) that never enters the harness process. Reloading a config change takes 2-3 seconds, and the barrier to entry is close to zero.
- **dsh is imperative**: plugins carry state and run directly inside the harness process, registering and calling into each other. Hot-swapping a plugin at runtime means handling dangling references, terminating background tasks, coordinating dependency chains, and rolling back cleanly from a crash — which is why it needed a heavyweight runtime like Cordis; the core module that just manages plugin lifecycles alone runs to 750 lines.

An apt renovation analogy: Codex hands you a finished apartment plus a pegboard wall you can hang anything on — hang the wrong thing, take it down, hang something else. dsh hands you a house where you can **rework a load-bearing wall without cutting the water or power**. The question is: how often do you actually need to rework a load-bearing wall?

### 3.2 Versus Pi: Two Extremes

Pi sits at the opposite end of the spectrum: it's the minimalist agent libGDX author Mario Zechner built because he couldn't stand Claude Code's complexity creep — four default tools, and a philosophy that "what you leave out matters more than what you add." Interestingly, the two aren't opposites in every sense — dsh's multi-provider model adapter layer actually uses Pi's own `@earendil-works/pi-ai` library, so in a sense dsh is "a plugin skyscraper built on top of Pi's model layer."

And the token-efficiency comparison is brutal: one developer's preliminary test found that, on the same model, Pi's uncached input runs around 4.5K tokens versus roughly 47.6K for dsh — a difference of an order of magnitude (the tester flagged confounding factors of their own, and noted dsh is still a preview). The cost gap between minimalism and full pluggability shows up plainly on the bill.

### 3.3 Versus Claude Code: Not a Fight Over Features, But Over Business Model

On product maturity today, dsh and Claude Code aren't in the same league — even a developer who had a month of early access before launch said flatly that "as a coding agent to actually use, the experience genuinely isn't as polished as Claude Code or Codex." But 36Kr's analysis pointed to something more fundamental: by opening the entire capability set under MIT for free, dsh is effectively **declaring that the harness layer shouldn't be a paid product at all**, trying to pull the competition back to model capability and pricing themselves. That's not a shot at Claude Code's feature list — it's a shot at "the harness as a paywall" as a business model.

## Part Four: What the Community Is Saying, and Whether It's Right

I filtered the commentary I collected down to claims backed by code or hands-on testing, then checked each one against the actual repo.

### 4.1 The Praise: Mostly Holds Up

- **"Clever engineering in the plugin architecture" / "the seed of an Agent OS"** — holds up. Loop-as-plugin, the three-role capability-surface design, transaction rollback — all verifiable in the code.
- **"Full traceability is the killer feature"** — holds up. "Model-visible means logged" is a runtime-enforced invariant, not documentation flourish.
- **"The seed of self-evolution"** — holds up, but is overstated. The `cordis_*` tools genuinely exist, but they're off by default and their output can't persist — still a real distance from "a self-evolving agent."
- **"Generation quality is solid"** — independent hands-on tests from ifanr and GeekPark both came out well (a Three.js mini-game, a site rebuild, at roughly $3 in cost). Credible, though the sample size is still small.

### 4.2 The Criticism: Also Mostly Holds Up

- **"Over-engineered for everyday development"** — I think this one **holds up**. The Chinese-language piece from yage.ai, titled roughly "wrapping an entire plate of dumplings' worth of vinegar just to chase self-evolution," makes a solid point-by-point rebuttal: search services only need brief interactions, restarting an MCP server takes 2-3 seconds anyway, and a skill is plain text that doesn't need framework-level hot reload. The "swap components without stopping the runtime" capability dsh solves for is real, but it's a rare requirement for the vast majority of use cases. One beta tester even observed that DeepSeek's own models frequently can't figure out how to use a plugin correctly and just edit their own code instead — "faster, and about as effective anyway."
- **"Token usage runs high"** — preliminary testing backs this up (roughly 10x versus Pi, roughly 3x versus other frameworks), and there's one confirmed, specific bug behind part of it: dsh reads both `CLAUDE.md` and `AGENTS.md` from a project, and if the two files have identical content (common, since many projects keep them in sync for cross-tool compatibility), the instruction set gets injected twice, doubling the system prompt outright. No official fix as of this writing.
- **"Poor compatibility, early-stage ecosystem"** — holds up. The official compatibility list shows 41 compatible integrations against 219 flagged as needing attention or further investigation; 36Kr's hands-on test found all 5 third-party tools it tried failed outright. The plugin repository crossed 2,000+ submissions in two days, but quantity isn't quality.
- **"Documentation reads like word salad"** — partially holds up. User-facing onboarding docs are genuinely thin, but the internal architecture documentation runs to roughly 170,000 lines and is checked against the code for drift — the problem isn't a lack of documentation, it's that "documentation written for agents to read" and "documentation written for newcomers to read" are two entirely different things, and the latter is currently missing.

### 4.3 The Benchmark Controversy: A Transparency Problem, Not a Proven Fabrication

This part needs the most careful phrasing:

1. **Inconsistent scoring**: V4-Pro's SWE-bench Verified score has two versions in circulation — 80.6% self-reported by the vendor versus 96.4% from third-party evaluator Vals — a 16-point gap most likely explained by different variants or methodologies, with no authoritative explanation available yet.
2. **Scores from minimal mode**: the official agent benchmark numbers were run in dsh's minimal mode, so the question of "does this score reflect the model's capability or the framework's boost" is a fair one — though, seen from another angle, an open-source harness is precisely what makes "reproduce it yourself" possible for the first time.
3. **Non-public internal leaderboards**: the official results table mixes in two non-public internal benchmarks (DSBench-FullStack and DSBench-Hard), and the two leaderboards rank things in contradictory order. Commentator MaxForAI's framing is worth keeping in mind: "what benchmarks a lab builds for itself tends to reveal exactly what it's optimizing for."
4. **No one has publicly reproduced and disproven any official number yet.** The skepticism is concentrated on transparency, not fabrication.

Worth noting honestly as well: the release coincided with a V4-Pro API price increase (corroborated by multiple independent sources), plus some users grumbling that "Pro writes worse code than Flash." That's a batch of negative sentiment unrelated to the harness itself but still coloring the discourse — and this kind of "triple disappointment" commentary generally comes without specific usage details, so it's of limited evidentiary value.

## Part Five: Conclusion

### What It Gets Right

1. **Genuinely new architecture**: loop-as-plugin, a fully swappable runtime, subagents delegable to competing tools — none of these exist in Claude Code, Codex, or Pi.
2. **Traceability made into an architectural guarantee**: for teams that need to audit, replay, or study agent behavior, this is currently unmatched.
3. **A thoroughly open posture**: MIT license, no model lock-in, compatibility with a rival's MCP naming conventions, and a direct challenge to the "pay for the harness" business model.
4. **A rare display of engineering culture**: 1,386 decision notes, docs gated against code drift, and the "built with its own harness" proof-of-concept — on its own, a valuable sample of AI-native engineering practice.

### Where It Falls Short

1. **It's a preview build right now**: the team itself has promised breaking changes; interfaces will shift dramatically, and production use isn't recommended.
2. **Niche needs, borne by everyone**: the complexity and token overhead that come with the heavyweight runtime are paid by every user, while the benefit of "hot-swap the loop at runtime" only accrues to a small slice of explorers.
3. **Rough edges in efficiency and quality**: a context-duplication bug, a roughly order-of-magnitude token gap, and near-zero third-party compatibility.
4. **Trust-building isn't finished**: the transparency questions around benchmark methodology and internal leaderboards will need time and third-party reproduction to settle.

### Should You Use It?

- **You just want a good coding agent to write code with**: not recommended, at least not yet. Claude Code (for the ecosystem), Codex CLI (for safety and stability), and Pi (for minimalism and cost) are all more mature choices today.
- **You work on agent infrastructure, multi-agent systems, or self-evolving agent research**: it's worth a weekend to read the source and the `.agents/` directory — the capability-surface design and event-driven loop currently have no other working reference implementation.
- **Your organization needs auditable agent execution records**: worth watching closely — the append-only log is its least controversial strength.
- **You're on the fence**: give it three to six months. The plugin ecosystem will shake out, the interfaces will stabilize, and someone will reproduce the benchmarks. By then we'll know whether "everything is a plugin" grew into an Agent OS, or fell into the "plugin fatigue" that one HN commenter worried about.

One closing thought. Reading through this repo, what came to mind wasn't a competing product — it was the history of operating systems: dsh is betting that "agents will grow into systems complex enough to need an OS," while Pi is betting that "an agent should stay a sharp, small knife." Both bets could very well pay off — they're just aimed at different users, on different timelines. And a model company choosing to lay its own evaluation harness fully open under MIT, decision records included, has already shifted the industry's baseline for what "transparent" means — regardless of how this particular bet turns out.

---

*This article is based on a snapshot of the repository (v0.1.0-rc.5) as of 2026-08-15, along with public community discussion. dsh is iterating quickly, and specific details here may age fast; all benchmark figures are labeled by source, and where vendor-reported and third-party numbers diverge, no conclusion has been reached — judge accordingly. Primary sources: [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness), the [DeepSeek Harness website](https://deepseek.com/harness/en/), Hacker News discussion, long-form source-code analyses from several developers on X, and independent hands-on testing from ifanr, GeekPark, and 36Kr.*
