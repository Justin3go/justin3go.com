---
name: blog-post-processor
description: "Process Chinese blog posts for the justin3go.com VitePress blog: rename to English slug, add frontmatter and AI summary, and translate to English. Triggers when the user mentions processing a blog post, translating an article, adding summaries, renaming post files, or says things like 'process this post', 'translate this article to English', 'add AI summary', 'rename this blog post'. Also triggers when the user provides a Chinese markdown post file and wants it prepared for publishing in both Chinese and English versions."
---

# Blog Post Processor

Automate the full publishing pipeline for Chinese blog posts on this VitePress blog: rename → summarize → translate.

## When This Skill Activates

| Signal | Action |
|--------|--------|
| User provides a Chinese `.md` post | Full pipeline: rename + frontmatter + summary + translate |
| User asks to translate a post | Translation only (with summary if missing) |
| User asks to add AI summary | Add summary to existing post(s) |
| User asks to rename a post | Rename with English slug |

## Project Structure Context

This blog uses VitePress with i18n (Chinese + English):

```
docs/
├── posts/YYYY/MM/DD-english-slug.md        ← Chinese posts
├── en/posts/YYYY/MM/DD-english-slug.md      ← English posts (same filename)
└── .vitepress/theme/
    ├── posts.data.mts                       ← Auto-discovers posts/**/*.md
    └── posts-en.data.mts                    ← Auto-discovers en/posts/**/*.md
```

Posts are auto-discovered by `createContentLoader` — no sidebar or config file references individual posts. Renaming only affects URLs (requires rebuild/deploy).

## Full Pipeline

When processing a Chinese post, follow these steps in order:

### Step 1: Analyze the Input

Read the source file. Determine:
- Does it already have frontmatter (title, date, tags)?
- Does it already have an AI summary (`<!-- DESC SEP -->` markers)?
- What is the article about? (needed for slug generation and translation)

### Step 2: Generate English Slug

Convert the Chinese title to a concise, descriptive English slug:
- Format: `DD-lowercase-words-separated-by-hyphens.md`
- The `DD` comes from the article's date (day of month)
- Keep it short but descriptive (3-7 words after the DD prefix)
- Use only lowercase letters, numbers, and hyphens

**Examples:**
- "我把 Harness Engineering 也提炼成了 SKILL" → `03-harness-engineering-distilled-into-a-skill.md`
- "GPT4o生图风格小全" → `11-gpt-4o-image-generation-guide.md`
- "HUNT0 上线了——尽早发布，尽早发现" → `01-hunt0-is-live-ship-early-hunt-early.md`

### Step 3: Add/Fix Frontmatter

Ensure the Chinese post has proper YAML frontmatter:

```yaml
---
title: <Chinese title — keep as-is from the H1 heading>
date: YYYY-MM-DD
tags:
  - Tag1
  - Tag2
---
```

Rules:
- `title` = the original Chinese title (exact match with the `# H1` heading)
- `date` = must be consistent with the file path (YYYY/MM/DD)
- `tags` = 5-8 relevant tags, can be in English or Chinese (prefer English for consistency with existing posts)

### Step 4: Add AI Summary

Insert an AI summary block between the frontmatter and the article body. This is critical — the site's excerpt system depends on the `<!-- DESC SEP -->` markers.

**Chinese post format:**

```markdown
# <Title>

> ✨文章摘要（AI生成）
>
<!-- DESC SEP -->
>
<2-4 sentence summary of the article in Chinese>
>
<!-- DESC SEP -->
```

**English post format:**

```markdown
# <Title>

> ✨Article Summary (AI Generated)
>
<!-- DESC SEP -->
>
<2-4 sentence summary of the article in English>
>
<!-- DESC SEP -->
```

The summary should:
- Capture the core topic and key takeaways
- Be 2-4 sentences, concise but informative
- Use `>` blockquote prefix for lines between the markers (matching existing post style)
- Highlight key terms in **bold** where appropriate

**Critical**: The `<!-- DESC SEP -->` markers must appear exactly twice. The site's `posts.data.mts` uses `file.content.split('<!-- DESC SEP -->')[1]` to extract the excerpt. Missing or extra markers will break excerpt display.

### Step 5: Rename the Chinese Post

Rename the file from its current name to the new slug format:

```
docs/posts/YYYY/MM/<old-name>.md → docs/posts/YYYY/MM/DD-english-slug.md
```

### Step 6: Create English Translation

Create the English version at the mirrored path:

```
docs/en/posts/YYYY/MM/DD-english-slug.md
```

Translation guidelines:
- **Frontmatter**: Translate `title` to English, keep same `date` and `tags`
- **H1 heading**: Translate to English (must match frontmatter `title`)
- **AI summary**: Write in English (not a literal translation — write naturally)
- **Body**: Translate the full article naturally, not word-by-word
- **Images**: Keep all image URLs unchanged (same `![](url)` references)
- **Code blocks**: Keep code unchanged, translate comments if present
- **Tables**: Translate cell content
- **Blockquotes**: Translate content
- Ensure the `docs/en/posts/YYYY/MM/` directory exists before writing (create if needed)

### Step 7: Verify

After all changes, verify:
1. Chinese file exists at new path with correct frontmatter and two `<!-- DESC SEP -->` markers
2. English file exists at mirrored path with correct frontmatter and two `<!-- DESC SEP -->` markers
3. Both files have matching filenames (same slug)
4. `date` in frontmatter matches the directory structure (YYYY/MM) and filename prefix (DD)
5. Old filename no longer exists (was renamed, not copied)

## Partial Operations

Not every invocation needs the full pipeline. Handle partial requests:

- **"Translate this post"** → Steps 5-6 only (add summary if missing)
- **"Add AI summary"** → Step 4 only (to one or both language versions)
- **"Rename this post"** → Steps 2, 5 only (rename both CN and EN if both exist)

## Edge Cases

- If the post has no date in the filename or frontmatter, ask the user
- If the `docs/en/posts/YYYY/MM/` directory doesn't exist, create it
- If an English version already exists, ask before overwriting
- If the post already has a proper English slug filename, skip rename
- If frontmatter already exists and is correct, preserve it (don't duplicate)
