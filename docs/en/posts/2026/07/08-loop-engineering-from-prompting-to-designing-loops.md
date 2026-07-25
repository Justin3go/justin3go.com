---
title: 'From "You Prompt the Agent" to "The System Prompts the Agent": A Complete Guide to Loop Engineering'
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

# From "You Prompt the Agent" to "The System Prompts the Agent": A Complete Guide to Loop Engineering

> ✨Article Summary (AI Generated)
>
<!-- DESC SEP -->
>
Following the evolution from **Prompt → Context → Harness → Loop**, this article unpacks the origins of Loop Engineering, its six-stage control flow, verifiers, stopping conditions, and three essential guardrails. Through Ralph Loop, Claude Code's `/goal` and `/loop`, Codex Automations, and Karpathy's autoresearch, it shows that the new idea is not the `while` statement itself, but an engineering system that combines verification, budgets, external state, and feedback. It concludes with a task-selection matrix and adoption path, arguing that a loop's value is capped by a verifier the agent cannot game.
>
<!-- DESC SEP -->

## Introduction: You Are the Slowest Part of the Chain

Consider a scene that plays out every day in 2026.

An engineer opens a terminal and tells a coding agent, “Fix the failing CI test.” The agent works for three minutes and reports back. The engineer reads the result: “No, you changed the wrong file; look at the auth module.” Three more minutes pass. “The test passes, but you broke another case.” After five rounds, the issue is fixed in forty minutes. The agent worked for fifteen of them. During the other twenty-five, it was **waiting for a human to read output, make a decision, and type the next prompt**.

Models reason faster and tools execute faster. The person at the keyboard has not. The bottleneck has moved from the model to the human.

At an Acquired Unplugged event hosted by WorkOS on June 2, 2026, Claude Code creator Boris Cherny described his response:

> “I don't prompt Claude anymore. I have loops that are running. They're the ones that are prompting Claude and figuring out what to do. My job is to write loops.”

Five days later, OpenClaw creator Peter Steinberger, now at OpenAI, posted the viral line: “You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents.” The following day, Google engineering leader Addy Osmani published *Loop Engineering* and gave the practice a name.

Rather than follow a research-report sequence of definition, timeline, and critique, this article traces the evolution of the developer-agent collaboration chain: how each layer emerged, what actually lives inside a loop, which parts are old ideas in new packaging, what is genuinely new, and whether your own work should use one.

## 1. Four Delegations: Prompt → Context → Harness → Loop

Loop engineering did not appear from nowhere. It is the fourth delegation of work along the same collaboration chain. At every layer, a human hands one more piece of manual work to the system and moves up a level.

![Four nested layers: Prompt, Context, Harness, and Loop](https://oss.justin3go.com/blogs/four-layer-stack.png)

Each layer contains the previous one rather than replacing it. Loop authors still write prompts; those prompts have simply moved from words typed on the spot to templates assembled automatically during every iteration.

A popular Chinese-language analogy puts the four layers plainly:

> Prompt is how you ask it. Context is what you let it see. Harness is the environment you place it in. Loop is how you make that system turn by itself.

| Layer | Rise | Authoritative source | Core idea |
|---|---|---|---|
| Prompt engineering | 2022–2024 | Industry-wide practice, no single originator | How to state the task correctly |
| Context engineering | 2024–2025 | Tobi Lütke's June 18, 2025 post, amplified by Karpathy on June 25; Anthropic's *Effective context engineering for AI agents* (September 29, 2025) | “The art of providing all the context for the task to be plausibly solvable by the LLM” |
| Harness engineering | Late 2025 | Anthropic's *Effective harnesses for long-running agents* (November 26, 2025; Justin Young et al.) | The model is the brain; the harness is the body |
| Loop engineering | June 2026 | Addy Osmani's *Loop Engineering* (June 7, 2026) | Replace yourself as the person prompting the agent by designing the system that does it |

The timing closely matches Anthropic's engineering publications, although “loop engineering” itself is still not an official Anthropic term. Osmani's definition is the anchor for everything that follows:

> “A loop here can be thought of a recursive goal where you define a purpose and the AI iterates until complete.”

## 2. Anatomy of a Loop: Six Stages and One Exit

Anthropic's *Building agents with the Claude Agent SDK* (Thariq Shihipar, September 29, 2025) gives the minimal version: “gather context → take action → verify work → repeat.” The complete Loop Engineering control flow has six stages:

![Six-stage control flow: DISCOVER → ASSEMBLE → ACT → VERIFY → PERSIST → DECIDE, ending in another iteration or STOP](https://oss.justin3go.com/blogs/six-stage-loop-control-flow.png)

The human's position has changed. Instead of standing inside ASSEMBLE and typing every turn, the engineer stands outside the graph, designs how the six stages connect and what qualifies as STOP, and then reviews the delivered result. Geoffrey Huntley puts it this way:

> “Your job is to sit on the loop, not in it.”

### Routine, Workflow, and Loop

Not everything that runs automatically is a loop. There is one dividing line: **does it inspect its own work and use that result to decide whether to continue?**

| | Routine | Workflow | Loop |
|---|---|---|---|
| Steps | Fixed | Branch on discoveries | Dynamically iterative |
| Stop condition | All steps ran | A path ended | A verifier says the goal is met |
| Self-check | None | None or weak | Core mechanism |
| Example | Run lint on a timer and send a report | CI fails → classify → assign | Continue until every `test/auth` test and lint check passes |

This echoes Anthropic's classic distinction in *Building Effective AI Agents* (Erik Schluntz and Barry Zhang, December 19, 2024): workflows orchestrate LLMs and tools through predefined code paths, whereas agents dynamically direct their own process based on environmental feedback—in other words, they use tools inside a loop.

## 3. Prehistory: Loops Were Not Invented in 2026

The control-flow diagram should look familiar. It is a cybernetic feedback loop, a thermostat, or a Kubernetes reconciliation loop. Academia and the community spent four years building it before “loop engineering” received a name.

![Timeline from ReAct to Reflexion, AutoGPT, Ralph Loop, and the Loop Engineering name](https://oss.justin3go.com/blogs/agent-loop-prehistory-timeline.png)

ReAct, submitted on October 6, 2022 and later published at ICLR 2023, established the inner Thought → Action → Observation loop. Reflexion (Shinn et al., 2023) added self-critique and memory. AutoGPT showed the public both the appeal of “give it a goal and let it run” and the failure mode of disappearing down a rabbit hole.

### Ralph Loop: Proving the Pattern Before It Had a Name

Geoffrey Huntley's **Ralph loop**, or Ralph Wiggum technique, first demonstrated publicly in June 2025 and published in July in *Ralph Wiggum as a “software engineer”*, proved the pattern before it had a label. Its entire implementation is one line of Bash:

```bash
while :; do cat PROMPT.md | claude-code ; done
```

That is all: an infinite loop feeding the same prompt file to a coding agent. Huntley's own definition was, “Ralph is a technique. In its purest form, Ralph is a Bash loop.”

The apparently foolish design contains one very smart decision: **every iteration starts with a fresh context**.

![A decaying long conversation compared with Ralph's fresh context and externalized state on every iteration](https://oss.justin3go.com/blogs/ralph-context-comparison.png)

Progress is not something the model remembers; it is something the repository contains. Each agent wakes up, reads the spec, inspects the repository, analyzes the gap, completes one item, commits, and dies. Its successor sees everything through Git. Huntley's self-deprecating summary is perfect:

> “The technique is deterministically bad in an undeterministic world.”

Ralph has impressive but qualified claims. A YC hackathon team reportedly ported six repositories overnight for about $600 in API usage and more than 1,000 commits. Huntley says three months of continuous operation produced CURSED, a programming language with a self-hosting compiler. Both reports come from advocates and lack independent reproduction. Huntley also drew a hard boundary: “There's no way in heck would I use Ralph in an existing code base.” It was for greenfield work.

Anthropic released an official Ralph Wiggum plugin in December 2025. The productization of a playful community hack marked the loop's transition into a platform primitive.

## 4. The Naming Event: Ten Days in June 2026

Why did a four-year-old pattern suddenly acquire a name and dominate discussion in June 2026? A short chain of public statements created the immediate spark.

![The ten-day Loop Engineering naming timeline in June 2026](https://oss.justin3go.com/blogs/loop-engineering-naming-event-timeline.png)

Three deeper conditions were all necessary:

1. **Models became strong enough.** Opus 4.5+ and GPT-5.x-Codex-class models can operate autonomously for long periods and verify themselves through tests and compilers.
2. **Primitives became products.** Claude Code's `/goal` and `/loop`, and Codex Automations, replaced much of the custom Bash required a year earlier.
3. **Leading practitioners spoke at once.** Cherny, Steinberger, Karpathy, and Ng described loop-centered workflows during the same two weeks, giving a diffuse practice a name and credible faces.

One widely repeated quote needs a warning label: Jensen Huang's alleged “Nobody writes prompts anymore. The new job is to write and handle loops.” No clean NVIDIA transcript verifies it, and reposts disagree even about whether the source video was 23 or 53 minutes long. Treat it as a paraphrase of a real direction, not an authenticated quotation.

## 5. Method: Five Building Blocks, One Memory Layer, Four Nested Loops

### Osmani's Building Blocks

Osmani describes five components plus an external-state layer. The structure maps almost directly onto both Claude Code and OpenAI Codex, evidence that loop shape is becoming tool-independent.

![Osmani's loop anatomy: an AUTOMATIONS heartbeat, four building blocks, and EXTERNAL STATE](https://oss.justin3go.com/blogs/osmani-five-building-blocks.png)

His explanation for using sub-agents is memorable: “The model that wrote the code is too nice grading its own homework.”

### LangChain's Four-Layer Loop Stack

Sydney Runkle at LangChain described four nested loops on June 16, 2026, each operating at a different order of time scale.

![LangChain's four nested layers: agent loop, validation loop, event-driven loop, and hill-climbing loop](https://oss.justin3go.com/blogs/langchain-four-loop-stack.png)

Loops 1 and 2 complete the immediate work. **Compounding happens in Loops 3 and 4**: systems learn from production traces and improve their own configuration. Andrew Ng's three loops express the same idea at different granularity: coding in minutes, developer feedback in hours, and external feedback in days or weeks.

## 6. The Load-Bearing Wall: The Verifier

If you remember one sentence from Loop Engineering, make it this: **a loop's value is capped by its verifier, not its model**.

Without a reliable test for completion, a loop either never stops or stops in the wrong place and confidently reports success. Serious 2026 writing converges completely on this point.

### Separate the Maker From the Checker

![The MAKER and CHECKER iterate until the work is ready for human review](https://oss.justin3go.com/blogs/maker-checker-separation.png)

The community's rule is uncompromising: “The checker is never the same agent as the maker.” It follows the same separation of powers as the initializer and coding agents in Anthropic's harness work.

### Good and Bad Stopping Conditions

| | Bad loop goal | Good loop goal |
|---|---|---|
| Example | “Improve this code” | “All tests under `test/auth` pass and lint is clean” |
| Checkability | Subjective | Machine-verifiable |
| Loop behavior | Never knows when to stop | Has an explicit exit |
| Gameability | Undefined | Must defend against reward hacking |

### Four Failure Modes

| Failure mode | Typical case | Countermeasure |
|---|---|---|
| Reward hacking | Delete the failing test to make CI green | Also verify that test count did not decrease; Anthropic's harness rule says, “It is unacceptable to remove or edit tests.” |
| Hallucinated success | Agent says “done” without a working result | Trust deterministic verification, never self-reporting |
| Error compounding along the trajectory | A small error in iteration 3 becomes a disaster in iteration 15 | Small commits and independent verification on every iteration |
| Runaway cost | The loop spins overnight and produces a four-figure bill | Install the three guardrails in the next section |

### How `/goal` Builds the Verifier Into STOP

Claude Code's `/goal`, released in v2.1.139 on May 11, 2026 and checked against official documentation, is a useful specimen: maker and checker are built directly into the stopping condition.

![The `/goal` Stop hook uses a smaller evaluator model to decide NO or YES](https://oss.justin3go.com/blogs/goal-stop-hook-mechanism.png)

The worker and evaluator are different models with different perspectives—the product form of maker/checker separation.

## 7. Three Guardrails to Install on Day One

The second consensus among serious writers is that guardrails are mandatory. A loop without guardrails is a liability, not an asset.

![Guardrail flow: iteration cap → progress detection → budget cap → verifier](https://oss.justin3go.com/blogs/three-guardrails-flowchart.png)

The budget guardrail has a repeatedly cited real-world footnote. According to secondary reporting, Uber exhausted its annual AI budget in four months and then capped agent tooling at $1,500 per engineer per month. A budget ceiling is not paranoia; someone has already paid the tuition.

## 8. The Primitives Have Been Productized

The table explains another part of “why now.” What required hand-maintained Bash in 2025 became a product feature in 2026.

| Loop primitive | Claude Code | OpenAI Codex |
|---|---|---|
| Scheduled heartbeat | `/loop` (v2.1.72+, dynamic 1 minute–1 hour or fixed, e.g. `/loop 15m`), `/schedule`, cron, hooks, GitHub Actions | Automations tab plus Triage inbox |
| Goal-driven stopping | `/goal` | Corresponding `/goal` |
| Parallel isolation | `git worktree`, `--worktree`, `isolation: worktree` | Worktrees |
| Knowledge capture | `SKILL.md` | `SKILL.md` |
| Sub-agents | Subagent mechanism | TOML definitions under `.codex/agents/` |
| External connections | MCP | MCP connectors |
| Batch dispatch | `/batch` with parallel worktree agents; based on a secondary source, not verified against official docs | Historically, one-shot `codex exec` wrapped by Bash, such as codex-autoresearch-harness |

Boris Cherny's example of how a typical day begins is Loop Engineering's hello world:

```text
/loop babysit all my PRs. Auto-fix build issues, and when comments
come in, use a worktree agent to fix them.
```

His own record is the strongest first-hand evidence in the field. In the 30 days ending in late December 2025—not June 2026, as later retellings often claim—he landed **259 PRs, 497 commits, +40K/−38K lines**, all written by Claude Code with Opus 4.5. He had uninstalled his IDE in November 2025.

The same shape appears outside coding. Andrej Karpathy's autoresearch, released March 7, 2026, gained roughly 25,000 GitHub stars in five days and more than 66,000 by early April. It loops through propose change → train → evaluate, retaining only changes that lower validation loss and using Git revert for failed experiments. The first demonstration reportedly ran about 700 experiments in two days. Fortune called it “The Karpathy Loop.” Loop, mechanical verifier, and externalized Git state are all present.

## 9. A Cooler Look: Three Critiques and What Each Gets Right

Popular concepts attract a backlash. All three major critiques deserve attention because each contains something true.

| Critique | Representative | Argument | What it gets right | Response |
|---|---|---|---|---|
| “It is just a while loop” | A roughly 1,800-comment Hacker News thread; extra-steps.dev | Strip away the vocabulary and this is an LLM call inside `while`; CI, autoscalers, and Kubernetes have used loops for years | Technically correct: the primitive is not new | The new content is discipline—timer, verifier, and budget. An infinite loop is a missing stop condition, not an indictment of `for` loops. |
| Economic critique | Ed Zitron | “Does OpenAI invoice itself for token use?” Vendors encourage autonomous token consumption; Cherny is mocked as someone allowed to burn $130K per month, a dubious secondary figure | Advocates often sell tokens or receive heavy subsidies | Budget guardrails are the engineering response; constrained loops can still have positive ROI for selected tasks |
| Preconditions critique | Gergely Orosz, *The Pragmatic Engineer* | Most people lack a loop use case unless they have unlimited tokens and find turn-by-turn prompting too slow | Loops are excessive for one-off, exploratory work | The task matrix in the next section exists because loops were never a universal solution |

Osmani himself warns about **comprehension debt**: the faster a loop produces code, the wider the gap between the code that exists and the code you understand. Two people can build the same loop and obtain opposite results. *The Register* argued on June 24, 2026 that his conclusion undercut the concept because loops change the work without removing the engineer.

Osmani's closing line sets the right tone:

> “Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go.”

## 10. Decision: Which Tasks Belong in a Loop?

The decision matrix compresses the argument into two axes: can “done” be mechanically verified, and what is the cost of failure?

![Loop decision matrix: mechanical verifiability of completion versus cost of failure](https://oss.justin3go.com/blogs/loop-decision-matrix.png)

The five task types in the lower-right share three traits: they are repeatable, machine-verifiable, and inexpensive to get wrong. Start there. A concrete graduation criterion from the research is: **run one loop unattended for a full week, exceed the budget zero times, and have more than 90% of its PRs mergeable after your review**. Only then expand its authority.

The adoption order matters: build the verifier before the loop.

![Five-step adoption sequence with the verifier before the loop itself](https://oss.justin3go.com/blogs/loop-adoption-sequence.png)

## Epilogue: The Scarce Skill Has Moved

Return to the engineer in the introduction. Of forty minutes spent fixing tests, the human occupied twenty-five. Loop Engineering does not answer with “type faster.” It removes the person from the chain and replaces each intervention with a verifier plus three guardrails.

The scarce skill is no longer phrasing—the prompt layer addressed that. It is no longer supplying material—the context layer addressed that. It is not even building the environment, which harness products are increasingly solving. It is **writing a stopping condition the loop cannot fool**.

Someone who can write that condition can let 259 PRs grow in 30 days. Someone who cannot gets a loop that deletes tests to turn CI green and a four-figure bill.

They may have built exactly the same loop.
