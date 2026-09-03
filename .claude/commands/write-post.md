<!-- Scaffolds a blog post for a category via scaffold:post, researches the picked products online, writes real Vietnamese copy, verifies, then commits and pushes directly to main. -->

# Task: Scaffold, research, and write a blog post, then publish

You are closing a blog-content gap for this affiliate storefront: generate an MDX stub for a category via `npm run scaffold:post` (F0012/US00126), replace its placeholder frontmatter and empty body with a real, well-researched Vietnamese article, verify it, and publish. This is a repeatable **content** operation, not a code user story — it commits and pushes straight to `main` (see `## Working conventions` in `CLAUDE.md`: "Publishing flow: add file → push to main → Vercel rebuilds"). Do not create a feature branch or PR for this.

**The user's raw argument is appended below your instructions**, as `$ARGUMENTS`. Expected shape (all but the category are optional):

```
<category-slug> [product-slug-a,product-slug-b] [--slug=<output-slug>]
```

## 1. Resolve the category

Take the first whitespace-separated token of `$ARGUMENTS` as the category slug.

If it's missing, **do not guess**. Read `lib/categories.ts` for the registered category list, then for each one count products (`content/products/*.json`) and existing posts (`content/posts/*.mdx` frontmatter `category`). Present this as an `AskUserQuestion` (category name, product count, post count per option) and let the user pick — mirror the check this command was born from: categories with 0 products can't be scaffolded via auto-pick.

## 2. Preflight

If the resolved category has zero products in `content/products/*.json`, stop and tell the user — they need to ingest products for it first (`npm run ingest:products` or `/scrape-ingest`). Do not proceed.

## 3. Scaffold

Parse the rest of `$ARGUMENTS` for an optional comma-separated product-slug list (second token, 1–2 slugs) and an optional `--slug=<output-slug>`. Run:

```bash
npm run scaffold:post -- --category=<slug> [--products=<a,b>] [--slug=<output-slug>]
```

If no product slugs were given, the command auto-picks up to 2 (featured first) and prints them — note which ones for the next step. If the CLI exits non-zero (unknown category, unknown product slug, or refusing to overwrite an existing file), stop and report the error; do not retry with fabricated slugs.

## 4. Gather real product info

For every product slug in the written stub, read `content/products/<slug>.json` — this is the primary source of truth (`name`, `brand`, `price`, `description`, `specs`). Then run a `WebSearch` per distinct brand+model (e.g. `"<brand> <model> review specs"`) to pull supplementary, verifiable detail (sensor/build specs, independent review consensus) that isn't already in the local description.

If a product is generic/unbranded and no useful search results come back, write from the local JSON's `description`/`specs` alone — never invent specs, benchmarks, or review quotes that aren't grounded in the JSON or a search result.

## 5. Write the post

Edit the scaffolded `.mdx` file directly (`Edit`/`Write`, not the CLI) to replace:

- `title` — a real, specific Vietnamese title.
- `summary` — ≤ ~160 chars, Vietnamese, one sentence.
- `tags` — 3–5 relevant free-form Vietnamese tags (see existing posts in `content/posts/` for tone/format).
- The body: an intro paragraph, then one `## <tên sản phẩm>` section per product blending the researched facts, each immediately followed by that product's `<ProductCard slug="…" />` (keep every embed the scaffold wrote — do not remove, reorder, or add new ones). If there are 2 products, add a short Markdown comparison table. Close with a short "Nên chọn …" verdict paragraph.

Match the structure/tone of existing posts in `content/posts/*.mdx` (see any file there for reference) — this is a review/buying-guide site, not a press release.

Leave `category`, `publishedAt`, and `coverImage` as the scaffold set them.

Content should be optimized for SEO. A post length must be at least 800 words.

## 6. Verify

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

All must pass/exit 0. If anything fails, fix it and re-run — do not commit a broken build.

Then verify in a real browser per the project's UI-verification rule: start `npm run dev` in the background, open `/bai-viet/<slug>` (via `agent-browser` or `mcp__next-devtools__browser_eval`), screenshot it, and check the console for errors (a `/favicon.ico` 404 is fine, anything else must be investigated). Confirm the title, cover image, both `<ProductCard>` embeds, and TOC/breadcrumbs render. Stop the dev server afterward, and revert `next-env.d.ts` if `next dev`/`build` touched it (`git checkout -- next-env.d.ts`) — it's auto-generated noise, not a real change.

## 7. Commit

`git status --porcelain` should show exactly the one new `content/posts/<slug>.mdx` file (nothing else — no stray test artifacts). Stage and commit:

```
content: add <category> post — <short description>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

## 8. Push

```bash
git push origin main
```

Report the pushed commit hash, the post's path, and remind the user this triggers a Vercel auto-deploy.

## Rules

- Never leave a `"TODO: …"` placeholder in what gets committed — the entire point of this command is to ship real copy, not another stub.
- Never fabricate specs, benchmarks, or review claims not grounded in the product's own JSON or a web-search result.
- Never remove, reorder, or invent `<ProductCard>` embeds beyond what `scaffold:post` wrote.
- Never hand-edit `content/products/*.json` or re-run `scaffold:post` over an already-written post file.
- Never skip `npm run build` or the browser check before committing.
- Never push to any branch other than `main` — this command has no feature-branch/PR step by design.
- If the category is ambiguous or has zero products, ask the user or stop — never guess.
