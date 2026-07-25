---
title: "Agent Memory: From Stateless Models to Persistent Minds"
date: 2026-06-04
tags:
  - AI Agent
  - Agent Memory
  - Context Engineering
  - Memory Architecture
  - LLM
  - Codex
  - Claude Code
---

# Agent Memory: From Stateless Models to Persistent Minds

> ✨Article Summary (AI Generated)
>
<!-- DESC SEP -->
>
Starting from the fundamental constraint that large language models are stateless, this article breaks agent memory into a four-stage lifecycle: **extraction, storage, retrieval, and update/forgetting**. It compares vector stores, temporal knowledge graphs, and file-based memory through systems such as Mem0, Letta, Graphiti, Codex, and Claude Code. The central conclusion is that long-running memory depends less on a fashionable retrieval backend than on auditable maintenance, merge-before-add discipline, and forgetting driven by real usage.
>
<!-- DESC SEP -->

## TL;DR

- **Memory is an engineering workaround for a finite context window.** An LLM is stateless; an external system must put the right part of the past back into the current context. Every memory system can be understood through four stages: **extraction → storage → retrieval → update/forgetting**.
- Three trade-offs appear repeatedly: passive extraction versus active self-editing, vectors versus graphs versus files, and database-backed memory middleware versus human-readable memory for personal and coding agents.
- Mainstream products are converging on the same shape: **a compressed long-term profile plus raw recent working memory**.
- Update and forgetting separate a demo from a system that can operate for years. The emerging principles are “merge before adding” and “keep raw records separate from compressed views.”
- Do not put too much faith in benchmarks. Letta's plain filesystem setup with GPT-4o-mini scored 74.0% on LoCoMo, above the 68.5% reported for Mem0's best graph variant. Evaluate with your own data.

Let us begin with a fact that is easy to overlook but shapes this entire field: **a large language model is stateless**.

An LLM call is essentially a tokens-in, tokens-out function. Anything you teach it in one conversation—your name, your preference for pnpm over npm, or the pitfall you hit last week—disappears from the next call unless an external system puts that information back into the context window. “An agent has memory” therefore does not mean that the model truly remembers. It means that **a surrounding system feeds the right part of the past back at the right time**.

A larger context window does not remove the problem. Mem0 reported a full-context baseline with a p95 latency of **17.12 seconds** and roughly **26K tokens** per request. A memory-based approach used about **1,764 tokens** of selected facts with roughly **0.2 seconds** of search latency, saving around **90% of the tokens** and **91% of the latency**.

> A memory system is fundamentally an **engineering workaround for a finite context window**. It exchanges roughly 1.8K tokens of selected facts for 26K tokens of raw history and balances capacity, cost, and latency.

![Agent memory works around a finite context window by replacing roughly 26K tokens of history with 1.8K tokens of selected facts](https://oss.justin3go.com/blogs/memory-vs-fullcontext.png)

All later design questions—what to save, where to save it, how to retrieve it, and how to forget it—reduce to one parent question: **with a limited context budget, how can an agent behave as if it remembered everything?**

## A Conceptual Map of Memory

### Short-Term vs. Long-Term Memory

**Short-term memory**, also called working memory, is the context inside the current conversation or thread: recent messages, tool results, intermediate reasoning, and unfinished plans. Its lifetime is normally the lifetime of that session.

**Long-term memory** persists across sessions and threads. It lives in a database, vector store, graph, or file and supports personalization and continued learning.

LangGraph makes this boundary explicit through two separate persistence mechanisms:

| | Checkpointer (short-term) | Store (long-term) |
|---|---|---|
| Scope | Thread or session | User or application, across threads |
| Contents | Graph state, `state["messages"]`, conversational context | Cross-session KV data, preferences, and profiles |
| Lifetime | Disappears with a new `thread_id` | Persists across sessions and threads |
| Analogy | Process memory | Disk outside the process |

> **Confusing short-term and long-term memory is one of the most common architecture mistakes in agent systems.** Put a user preference in a thread checkpointer and it vanishes when the user starts a new session. Put transient scratch work in a long-term store and that store quickly decays into noisy, misleading context.

Short-term memory preserves continuity **within** a conversation. Long-term memory preserves continuity **across** conversations. They need different storage media, write triggers, and cleanup policies.

### CoALA's Four Categories—and the Disagreement Around Them

The 2023 Princeton paper *Cognitive Architectures for Language Agents* (CoALA, arXiv:2309.02427) popularized a four-way classification:

| Category | What it stores | Intuition |
|---|---|---|
| **Working** | Current context, observations, reasoning, partial plans | A limited short-term scratchpad |
| **Episodic** | Specific past events and outcomes | Lets an agent learn from interaction history |
| **Semantic** | Facts about the world or user | The gap not already covered by pretraining |
| **Procedural** | Learned rules, skills, and how-to knowledge | The ability to do something |

This vocabulary draws on cognitive psychology, including Tulving's distinction between episodic and semantic memory, Squire's work on procedural memory, and Baddeley and Hitch's working-memory model. IBM, MongoDB, LangChain, Letta, and Mem0 all use variants of it.

By late 2025, however, the field had started to split. Letta's Sarah Wooders rejected the brain analogy: an LLM is a tokens-in, tokens-out function, not a brain, so memory should be designed around information entering and leaving the context window. A December 2025 survey, *Memory in the Age of AI Agents* (arXiv:2512.13564), proposed a simpler taxonomy: factual, experiential, and working memory.

There is no need to choose a camp. CoALA gives teams a shared vocabulary; the engineering view reminds us that the decisive question is not which label a memory receives, but whether the right information enters the context at the right moment.

## The Memory Lifecycle: A Unifying Framework

The most useful way to compare systems is through a memory's complete lifecycle:

> **Extraction → Storage → Retrieval → Update/Forgetting**

- **Extraction** decides what is worth remembering.
- **Storage** decides where it lives and in what representation: vector, graph, KV, relational database, or text file.
- **Retrieval** decides when and how it returns to the model: semantic search, keywords, graph traversal, or direct prompt injection.
- **Update/forgetting** resolves conflicts, merges duplicates, and expires or decays stale information.

![The four-stage memory lifecycle: extraction, storage, retrieval, and update or forgetting](https://oss.justin3go.com/blogs/lifecycle-four-stages.png)

Frameworks differ because they make different choices in these four stages. Mem0 extracts facts passively; Letta lets the agent edit memory through tools. Graphiti invests heavily in update and forgetting through a bi-temporal model. Once a product is placed into these four boxes, its real trade-offs become easier to see.

## Stage One: Extraction—What to Remember, and Who Writes It

Extraction answers two questions: **who writes memory**, and **what gets extracted**. Information lost here cannot be recovered by a stronger retriever later.

### Four Ways to Write Memory

| Mode | Writer | Examples | Characteristic |
|---|---|---|---|
| **Direct append** | The system | MetaGPT, Pi | Saves everything without distillation |
| **LLM extraction** | A separate LLM call | Mem0, crewAI, Codex, Graphiti | Distills facts, triples, or insights |
| **Agent self-editing** | The main model through tools | Letta, Claude Code auto memory | The model decides what to rewrite |
| **Manual maintenance** | A human | `CLAUDE.md`, `AGENTS.md` | Human-written instructions; agent reads only |

Direct append is cheap and loses no information, but raw logs eventually become too large to feed back into the model. LLM extraction is the database-oriented mainstream: a separate call distills a conversation into structured facts, triples, insights, or experience entries.

Agent self-editing gives the main model tools such as `core_memory_append`, `memory_replace`, `memory_insert`, and `memory_rethink`. It makes nuanced decisions with full context, but every memory operation spends inference tokens. Manual files offer the highest control and quality but do not scale.

Real systems combine modes. Codex layers human-authored `AGENTS.md`, LLM-distilled `~/.codex/memories/`, and append-only session logs. Claude Code combines `CLAUDE.md` with model-written auto memory.

![Fifteen projects mapped by file versus database storage and by who writes memory](https://oss.justin3go.com/blogs/classification-matrix.png)

The matrix has two revealing empty corners. File systems rarely use unfiltered append because files are meant for humans to read. Databases rarely rely entirely on human maintenance because people cannot fill machine-scale retrieval stores. Both sides therefore converge on **LLM extraction**.

### What Different Systems Extract

**Mem0 extracts general personal facts and preferences.** Its `FACT_RETRIEVAL_PROMPT` turns dialogue into short, self-contained statements such as `Name is John`. Newer defaults lean toward ADD-only extraction, retaining separate details instead of aggressively merging them.

**Codex extracts four high-signal categories:** user preferences, reusable knowledge, failure shields in the form `symptom → cause → fix`, and repository maps. It deliberately underindexes assistant claims and overindexes user statements and code evidence. Missing a fact is preferable to storing the agent's speculation as truth.

**AutoGen learns insights from failure.** Its task-centric memory repeats a task and, after an incorrect answer, asks an LLM to distill an insight from that failure. This resembles procedural memory more than a passive record.

### Passive Extraction vs. Active Self-Editing

| | Passive extraction | Active self-editing |
|---|---|---|
| Trigger | System, outside the dialogue | Main model, inside its reasoning loop |
| Token cost | Low | High |
| Nuance | Coarser, prompt-driven | High, because the main model has full context |
| Typical failure | A missed fact is lost forever | The model fails to choose to save it |
| Examples | Mem0, crewAI | Letta, Claude Code |

Neither approach is universally better. Passive extraction offers consistency and low cost for unattended consumer products. Active editing offers the nuance needed by autonomous agents that should understand a user better over time.

## Stage Two: Storage—Where Memory Lives

Storage is not merely a database choice. The representation determines how large memory can grow, who can inspect it, how errors are corrected, and how difficult migration becomes.

### Three Storage Families

| Family | Medium | Retrieval | Examples |
|---|---|---|---|
| **Vector store** | Embeddings and similarity indexes | Semantic search, often with BM25 | Mem0, LlamaIndex, Cursor/Turbopuffer |
| **Temporal knowledge graph** | Entity relationships plus time metadata | Graph, vector, and full-text search | Zep/Graphiti, cognee |
| **Files or KV** | Markdown, JSONL, key/value records | Prompt loading and grep | Claude memory tool, Letta filesystem, `CLAUDE.md` |

Vector stores excel at fuzzy semantic matching. Temporal graphs represent entities and their changing relationships; Graphiti uses episodic, semantic-entity, and community subgraphs, combining semantic search, BM25, and graph algorithms. Files are deceptively simple: the model edits Markdown and the runtime loads or searches it.

These families are not mutually exclusive. Mem0 can combine a vector database, an optional graph database, and a conventional metadata store. cognee feeds relational, vector, and graph layers through one pipeline.

### The More Fundamental Divide: Databases vs. Files

| Dimension | Database memory | File memory |
|---|---|---|
| Capacity | Nearly unlimited | Bound by context budget |
| Retrieval | Strong semantic or graph retrieval | Prompt loading and grep |
| Human-readable | No | Yes |
| Human-editable | Usually requires an API | Direct editing |
| Traceability | Difficult to diff manually | Git diff and blame |
| Infrastructure | Additional services | No external dependency |
| Migration | Backend-dependent | Plain text is portable |

Database memory makes humans pay the cost: vectors and graph nodes are difficult to inspect, review, and migrate. File memory makes capacity the constraint. It scales through **index-then-fetch**: keep a compact index resident and load detailed files only when needed.

This also explains a clear trend. Personal and coding agents increasingly choose files—Codex, Claude Code, OpenCode, Pi, Hermes, OpenClaw, Cursor rules, and Copilot instructions—because transparency, editability, Git history, and repo portability matter. Memory middleware such as Mem0, Zep, Graphiti, and cognee chooses databases because multi-user capacity and retrieval quality matter more than direct human inspection.

The reason is the audience. Developers want memory they can inspect, manage, version, review in a pull request, trace with `git blame`, and roll back. A `CLAUDE.md` or `AGENTS.md` fits the workflow they already use; a vector index does not. Memory middleware has the opposite priorities: large capacity, semantic retrieval, and tenant isolation are the product, while direct human readability is secondary.

### Backend Choices at a Glance

| Project | Primary backend | Notes |
|---|---|---|
| **Mem0** | Pinecone, Qdrant, Weaviate, Chroma, or pgvector; optional Neo4j or Memgraph; conventional metadata DB | Vectors for primary retrieval, graphs for relationships, and a DB for timestamps plus user/agent/session IDs |
| **Graphiti (Zep)** | Neo4j | A single graph backend with temporal metadata on every edge |
| **cognee** | LanceDB by default | One backend for relational, vector, and graph layers |
| **LangGraph** | PostgreSQL plus pgvector in production | Cosine similarity by default; SQLite and in-memory options are intended for demos |

Even inside the database camp, two styles emerge. Mem0 assigns responsibilities to specialized stores, gaining flexibility while operating several systems. cognee consolidates three layers into LanceDB to reduce dependencies. LangGraph pragmatically reuses PostgreSQL and pgvector, leaving memory design to the developer but introducing no unfamiliar infrastructure. The choice is between a higher capability ceiling from specialized backends and simpler operations from a general-purpose one.

## Stage Three: Retrieval—Putting Memory Back Into Context

Storage and retrieval are two sides of the same coin. Pick a vector store and the retrieval path will probably be semantic search; pick Markdown and it will probably be index-then-fetch.

### Database Memory: From One Semantic Path to Hybrid Retrieval

Database-backed systems begin by embedding the query and retrieving the top-K nearest memories. Pure semantic search is weak at exact entity names, rare proper nouns, numbers, and dates—an embedding may consider `pnpm` and `npm` nearly identical—and it does not know whether a fact is still current. The common direction is therefore **hybrid retrieval**.

| Implementation | Retrieval paths | Fusion and ranking | Distinctive feature |
|---|---|---|---|
| **Graphiti (Zep)** | Vector, BM25 full text, and graph BFS | Reciprocal Rank Fusion, then cross-encoder reranking | Graph traversal recovers multi-hop relationships |
| **Mem0's newer algorithm** | Vector, BM25, and entity boosting | Multi-signal score fusion | Time-aware retrieval chooses the right present, past, or planned instance |
| **crewAI RecallFlow** | Vector retrieval | Confidence-based routing | Low confidence triggers `explore_deeper` and a second, LLM-rewritten search |

Graphiti is the most complete: vectors capture semantic similarity, BM25 finds exact terms, and graph BFS follows entity relationships. RRF combines the three lists before a cross-encoder reranks them. Mem0 follows a similar design and adds temporal selection for questions such as whether a role belongs to last year or today. crewAI turns retrieval into a feedback loop: below a confidence threshold, it feeds the current results to an LLM, reformulates the query, and searches again.

Hybrid retrieval improves recall, but every additional path, fusion stage, and reranker adds latency and engineering complexity. Mem0's roughly 0.2-second memory-search p95 is dramatically cheaper than its 17.12-second full-context comparison, yet the trade-offs among hybrid paths still require engineering.

### File Memory: Layered Index-Then-Fetch Retrieval

File-backed systems load a compact index every session, search it, open the relevant detail file, and return to raw evidence only when verification is needed.

In Codex, the sequence is explicit:

1. Inject `memory_summary.md` into the system prompt as a resident index.
2. Search `MEMORY.md` with keywords to locate a relevant entry.
3. Follow its pointer and open the detailed topic file.
4. Return to the original rollout JSONL when the distilled claim needs evidence.
5. Keep the lookup within a four-to-six-step budget so the agent does not browse memory without limit.

Claude Code's auto memory uses the same pattern: the first 200 lines or 25 KB of `MEMORY.md` act as the per-session index, and topic files are loaded on demand.

![Index-then-fetch retrieval for file memory](https://oss.justin3go.com/blogs/index-then-fetch.png)

This is how file memory competes on capacity. The library may grow to hundreds of files while the resident context cost stays fixed; detailed content enters the window only after a relevant grep hit.

### A Useful Exception: Hermes Uses Full-Text Search

Hermes stores historical messages in SQLite and searches them with FTS5, including a trigram CJK index, rather than semantic embeddings. This deliberately gives up semantic similarity in exchange for zero LLM or embedding cost, the exact original message instead of a second-hand summary, and a retrieval path whose code explicitly says `no summary LLM path`. When the goal is to recover precisely what someone said, plain full-text search can be faster, cheaper, and more accurate than vectors.

### Retrieval May Matter Less Than We Think

Letta's filesystem experiment is a counterintuitive reminder: a GPT-4o-mini file agent with almost no prompt tuning scored 74.0% on LoCoMo, above specialized memory systems including Mem0's reported 68.5% graph result. The key may be how an agent manages context, not the retrieval primitive itself. What matters is **when it retrieves, how much it retrieves, and how it uses what it found**.

## Stage Four: Update and Forgetting—Keeping Memory From Rotting

If extraction, storage, and retrieval determine whether memory works at all, update and forgetting determine whether it keeps working. A store that only grows will eventually contain duplicate facts, conflicting preferences, and obsolete information. Many projects implement the first three stages and effectively leave this one blank, which is why **update and forgetting are the true boundary between a toy and a durable system**.

### Deduplication and Merging

Most systems do little meaningful deduplication. AutoGen assigns monotonically increasing IDs and appends; MetaGPT only detects exact object duplicates. They assume retrieval ranking can work around dirty data after it has already entered the store.

The systems that treat consolidation as a first-class concern follow three main strategies.

**1. Similarity gating plus an LLM decision at write time.** crewAI first performs vector search for similar memories. If the top similarity is at least its default `consolidation_threshold` of 0.85, an LLM produces a `ConsolidationPlan` with `keep`, `update`, and `delete` actions and decides whether `insert_new` is still necessary. Mem0's classic `DEFAULT_UPDATE_MEMORY_PROMPT` similarly retrieves the top ten memories and chooses ADD, UPDATE, DELETE, or NONE. Mem0 maps UUIDs to consecutive integers before showing them to the LLM to reduce identifier hallucinations.

![Similarity gating and LLM decisions at write time](https://oss.justin3go.com/blogs/write-time-gating.png)

The defining idea is simple: merge or reject bad data **before it enters the store**, not after retrieval has to route around it.

**2. Deduplication through graph identity.** cognee derives node IDs with `uuid5(NAMESPACE, normalized_name)`, so repeated mentions of the same normalized entity collapse into one node; an LLM then merges its accumulated descriptions. Graphiti first narrows candidates with MinHash, LSH, and Jaccard similarity, then lets an LLM decide. Its prompt explicitly forbids merging items whose numbers, dates, or critical qualifiers differ—“the 2024 budget” and “the 2025 budget” are similar text but different facts.

**3. Offline LLM reorganization.** Letta's sleep-time agent reads transcripts in the background and rewrites memory blocks with `memory_rethink` so they remain comprehensive, readable, and current. Codex hard-codes `no-op preferred` and `aggressively merge`, using the Git workspace diff to route memory that needs consolidation. Hermes performs “umbrella merging” under the maxim that **one skill per session is a failure**: session-specific fragments should be folded into reusable skills instead of becoming a log.

These approaches all refuse to rely on the main conversation agent to maintain memory while doing another task. They create a two-speed system: the conversation records evidence quickly; a dedicated process merges, promotes, rewrites, or archives it.

There is an important reversal in newer Mem0 snapshots. Its default V3 path has moved from aggressive LLM UPDATE decisions toward **ADD-only extraction, `linked_memory_ids`, and MD5 exact deduplication**. “Owns a dog named Max” and “went camping with Max” remain two linked memories rather than being crushed into one. Even Mem0 is recalibrating the trade-off: merge too aggressively and independently useful facts become impossible to recover. “Merge before adding” is a dial, not a command to erase detail.

### Forgetting Without Destroying History

Most memory systems do not truly forget. Mem0, cognee, and AutoGen generally grow monotonically; Letta's archival storage “persists indefinitely” unless an API call explicitly deletes something. Capacity management is pushed to retrieval and context truncation instead of the store itself. The projects that do forget use four distinct approaches.

**1. Soft invalidation and versioning.** Graphiti gives every fact edge four bi-temporal timestamps:

| Timeline | Fields | Meaning |
|---|---|---|
| System-record timeline | `created_at` / `expired_at` | When the system recorded and invalidated the edge |
| Real-world validity timeline | `valid_at` / `invalid_at` | When the fact became and ceased to be true in reality |

When a new fact contradicts an old one, the old edge is not deleted. It gets `expired_at=now` and `invalid_at` equal to the new fact's `valid_at`. This makes both current-state and point-in-time queries possible. If a user moved from npm to pnpm, the system can use pnpm now without erasing the history that npm was previously correct. AutoGPT's newer memory layer reuses Graphiti's model.

![Graphiti's bi-temporal invalidation keeps old edges for point-in-time queries](https://oss.justin3go.com/blogs/bi-temporal-timeline.png)

**2. Usage-count-driven retention.** Codex stores `usage_count` and `last_usage` in `stage1_outputs`; consolidation can ignore entries whose last use falls outside `max_unused_days`. OpenClaw likewise promotes and retains memory according to real retrieval traffic. This is more defensible than an “importance” score assigned when the memory was written: repeated use is evidence, while predicted importance is a guess.

**3. Time decay and state machines.** OpenClaw applies exponential decay with different half-lives, such as 30 and 14 days, for different layers. crewAI includes `decay = 0.5^(age_days/30)` in retrieval scoring. Hermes marks a skill STALE after 30 unused days and moves it into a recoverable `.archive/` after 90 days; it never physically deletes the skill.

**4. Tombstone-based logical forgetting.** OpenHands models conversation history as an append-only event log. When context must be compressed, its condenser writes a `Condensation` tombstone saying that a group of events has been replaced by a summary. A replayed View filters those events and shows the summary, but the original evidence remains physically present. One dataset supports both a compact model-facing view and a complete audit view.

| Strategy | Projects | Trigger | Physical deletion? |
|---|---|---|---|
| Soft invalidation/versioning | Graphiti; reused by AutoGPT | New fact contradicts old fact | No; invalidate and preserve time travel |
| Usage-count driven | Codex, OpenClaw | Retrieval frequency and `max_unused_days` | No; archive or filter by use |
| Time decay/state machine | OpenClaw, Hermes, crewAI | Time since last use | No; decay or STALE → archive |
| Tombstone forgetting | OpenHands | Context needs compaction | No; write a tombstone and filter on replay |

The common pattern is striking: mature systems prefer **logical forgetting over physical deletion**. Physical deletion permanently destroys evolution and audit history, which are often the only way to explain why an agent acted as it did. The scarce capability is not clean deletion; it is reversible forgetting.

Do not expect the main conversation agent to maintain memory casually between tasks. Reliable systems either gate writes or assign consolidation to a constrained, dedicated process. Memory maintenance must be a first-class workload.

## Four Memory-Writing Philosophies

| Dimension | Passive extraction (Mem0) | Active editing (Letta) | Temporal graph (Zep) | Files (Claude/Letta FS) |
|---|---|---|---|---|
| Write decision | LLM extraction | Agent tool call | Entity/relation extraction | Agent edits files |
| Predictability | High | Model-dependent | High | High |
| Token cost | Low | High | Medium | Medium |
| Conflict handling | ADD/UPDATE/DELETE decision | Agent rewrites memory | Bi-temporal invalidation | File overwrite/history |
| Auditability | Medium | High | High, point-in-time | Highest, plain-text Git history |
| Operations | Low to medium | Medium | High, often Neo4j | Lowest |
| Best fit | User memory for an existing app | Complex autonomous agents | Dynamic or regulated enterprise facts | Coding agents |

The table contains four core tensions.

**Cost versus control.** Passive extraction gives a separate, relatively cheap LLM call responsibility for deciding what matters. It is predictable and does not spend the main agent's tokens, but any signal outside the extraction prompt is lost. Letta's active editing makes the best-informed model decide, but every `core_memory_append` or `memory_replace` spends inference tokens and memory quality becomes model-dependent.

**When to resolve conflict.** Mem0 decides ADD, UPDATE, DELETE, or NOOP before data enters the store. Letta rewrites a core-memory block later. A plain file can simply overwrite the old value. Zep/Graphiti alone preserves both sides through bi-temporal invalidation. Historical fidelity increases along roughly overwrite < LLM decision < temporal invalidation, but so does mechanism weight.

**Auditability versus operations.** Files appear to offer both the best auditability and the lowest operations cost, but their hidden price is context-bound capacity. Index-then-fetch moves the scaling problem into layered retrieval. Zep pays for Neo4j operations to obtain temporal reasoning and point-in-time audits.

**There is no silver bullet, only scenario fit.** Mem0 suits unattended user memory for an existing agent; Letta suits autonomous agents built from scratch; Zep suits changing or regulated enterprise facts; files suit coding agents.

Letta's filesystem experiment reinforces the point: a plain filesystem with GPT-4o-mini reached **74.0%** on LoCoMo, above Mem0's reported **68.5%** best graph variant. How the agent manages context can matter more than whether retrieval uses vectors or graphs.

## Where Mainstream Products Are Converging

ChatGPT, Gemini, Claude, and coding agents are converging on **a compressed long-term profile plus raw recent working memory**. The profile is compact and persistent; recent conversation provides a delta because summaries are inevitably stale.

**ChatGPT optimizes for frictionless, always-on personalization.** Saved memories are explicit, user-editable facts such as names, preferences, and goals. They appear with timestamps in the system prompt's Model Set Context. Reference chat history, launched on April 10, 2025, maintains a rolling history and implicit profile rather than literally searching every old chat. It is not directly inspectable. The benefit is zero-wait personalization; the cost is less predictable provenance and auditability.

**Gemini optimizes for a single source of truth.** Personal Context, launched in August 2025, centers on one structured `user_context` document. Each short fact carries a Statement, Rationale, and timestamp, then recent raw turns provide the delta. Timestamps make conflict resolution straightforward: today's “I joined a new company” can replace a year-old current role, while “considered moving to San Francisco in June 2024” remains a time-bounded event rather than a permanent identity. Despite Google's enormous data advantage, the design is conservative about what becomes personalization.

**Claude optimizes for transparent, work-oriented control through two separate systems.** Search and reference chats, introduced in September 2025, performs on-demand RAG through `conversation_search` and `recent_chats`, linking results back to the original conversation. Generate memory from chat history synthesizes an editable profile refreshed every 24 hours; edits apply immediately, and the feature expanded to free users in March 2026. Project isolation gives each project its own memory and summary, while the cross-chat summary explicitly excludes project chats. Claude.ai chat memory, the API `/memories` tool with `create`/`str_replace`/`insert`, and Claude Code's cascaded `CLAUDE.md` files are three different systems and should not be conflated.

**Coding agents have converged even further:** codebase index, rules files, and automatic memories are becoming a standard stack. Cursor semantically splits code by function and class, stores embeddings in Turbopuffer, and uses a Merkle tree to check hashes every 5–10 minutes so only changed files are reprocessed; raw code is not uploaded with the embeddings. Its v1.0 Memories sidecar proposes project-scoped entries for developer approval. GitHub Copilot separates repository facts—with citations back to supporting code and validation against the current branch—from cross-repository user preferences. Unused facts can expire after 28 days, while successful use resets the timer. `CLAUDE.md`, `AGENTS.md`, `.windsurfrules`, and `copilot-instructions.md` tie the ecosystem together as a de facto file-based standard.

Three shared principles emerge: long-term profiles must be compressed, recent raw conversation must compensate for stale summaries, and conflict resolution increasingly depends on time—timestamps, validation-before-use, or refresh cycles.

## Do Not Trust Benchmarks Too Much

LoCoMo and similar benchmarks can be inflated by aggressive retrieval: provide enough likely answers in the candidate context and the score rises, even if the memory system has little real understanding.

> Letta used a **plain filesystem**, GPT-4o-mini, and minimal prompt tuning to score **74.0%** on LoCoMo—higher than the **68.5%** reported for Mem0's best graph variant.

Cross-vendor numbers are rarely comparable because evaluation models and retrieval settings differ. Even Mem0's own pages report LoCoMo/LongMemEval values of 92.5%/94.4% in one place and 91.6%/93.4% elsewhere, with the hosted version including proprietary optimizations unavailable to the open-source release. Treat public scores as hints. **Evaluate on your own real data.**

## Four Practical Routes—No Silver Bullet

| Scenario | Recommended route | References |
|---|---|---|
| Unattended memory for SaaS or consumer users | Database plus merge gating at write time | Mem0, crewAI |
| Rapidly changing facts and point-in-time queries | Bi-temporal knowledge graph | Graphiti, Zep |
| Coding or personal agent; human-readable and Git-managed | Files plus index-then-fetch | Codex, Claude Code |
| Long-running self-improvement | Files plus two-speed offline consolidation | Hermes, OpenClaw |

Whatever route you choose:

- **Do not adopt a graph database too early.** A vector store plus LLM extraction covers most cases; graphs pay off only when relationship reasoning is central.
- **Timestamp every memory.** Time is the foundation of conflict resolution and temporal queries. Early OpenAI memory entries lacked timestamps and performed poorly on LoCoMo temporal questions: Mem0's graph variant reported 58.13% versus OpenAI's 21.71%. A timestamp is nearly free; without one, “what was I doing last Wednesday?” cannot be answered reliably.
- **Separate user, session, and project scopes.** This is necessary for relevance and safety.
- **Use benchmarks as references, not truth.**

Codex's two-stage maintenance pipeline is a strong integrated example:

![Codex's two-stage memory maintenance pipeline](https://oss.justin3go.com/blogs/codex-two-phase-pipeline.png)

Phase one distills historical sessions into structured SQLite records. Phase two runs a dedicated consolidation agent inside a networkless, approval-free sandbox and uses the baseline-to-worktree diff in `~/.codex/memories/.git` as the signal for ingestion and forgetting. Memory maintenance becomes constrained, incremental, reversible, and informed by usage counts instead of being an unmanaged append operation.

## Conclusion: Converging Principles and Two Unsolved Gaps

Across open-source systems and mainstream products, two principles are converging.

First, **merge before adding**. Aggressive append slowly corrupts a memory store with duplicates, obsolete facts, and contradictions. Some systems gate at write time; others consolidate offline. Both recognize that the main conversation agent should not be expected to maintain memory casually.

Second, **separate raw records from compressed views**. OpenHands keeps events behind tombstones, Codex separates rollout logs from distilled summaries, and Graphiti invalidates edges without deleting them. Daily retrieval uses the compact view; audits and corrections can still return to original evidence.

Two gaps remain.

The first is **human review before writing**. None of the surveyed systems provides a complete confirmation gate before memory enters the store. AutoGPT uses a two-step confirmation for deletion—find candidates, ask the user, then execute—but writes remain automatic. Hermes can emit a curator dry-run `REPORT.md` for approval, but only for skill organization. The industry has chosen prompt constraints and automated safeguards over systematic human approval in order to preserve unattended operation.

The second—and more serious—gap is **security**. Memory systems are naturally vulnerable to indirect prompt injection. Malicious instructions hidden in ordinary-looking content can persuade an agent to read or write memory without the user's awareness. Once poisoned memory is stored, it can influence future behavior repeatedly and invisibly.

Memory can make an agent smarter the longer it is used, but it can also make one incident of poisoning persist. The field is converging on sound engineering principles, yet these gaps remain open—which is precisely why now is such an interesting time to build.
