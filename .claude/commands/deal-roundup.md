<!-- Scrapes ranked Shopee deals for a category, generates the weekly deal-roundup post (superseding the prior week's), writes real Vietnamese prose, verifies, then commits and pushes directly to main. -->

# Task: Generate, supersede, write, and publish the weekly deal-roundup post

You are running the F0015 weekly deal-roundup flow for this affiliate storefront: scrape ranked Shopee deals for one category, generate the roundup post + sidecar (`npm run generate:deal-post`, which also supersedes the prior week's roundup in the same category), replace the generated `TODO` prose with real Vietnamese copy grounded in the deals' own numbers, verify, and publish. This is a repeatable **content** operation, not a code user story — it commits and pushes straight to `main` (see `## Working conventions` in `CLAUDE.md`: "Publishing flow: add file → push to main → Vercel rebuilds"). Do not create a feature branch or PR for this.

**The user's raw argument is appended below your instructions**, as `$ARGUMENTS`. Expected shape (everything but the category is optional):

```
<category-slug> [--query="<từ khoá>"] [--top=5]
```

## 1. Resolve the category

Take the first whitespace-separated token of `$ARGUMENTS` as the category slug.

If it's missing, **do not guess**. Read `lib/categories.ts` for the registered category list, then for each one count products (`content/products/*.json`), posts (`content/posts/*.mdx` frontmatter `category`), and existing roundups (`content/deals/*.json` sidecars whose post's `category` matches). Present this as an `AskUserQuestion` (category name, product count, post count, roundup count per option) and let the user pick.

If the given slug is not registered in `lib/categories.ts`, stop and list the registered category slugs — never guess a close match.

## 2. Resolve the keyword

Use `--query="<...>"` if given. Otherwise use the resolved category's registered Vietnamese display `name` from `lib/categories.ts` (exact string, trimmed — never fuzzy-matched).

**Use this one resolved string for both the MCP call and `--query` below.** The generated snapshot groups deals by the exact keyword the scrape tool was called with; passing a different string to `--query` silently yields an empty roundup even when the scrape found deals.

## 3. Scrape

Call `mcp__shopee-affiliate__scrape_products` **once**, with `keywords` set to `[<resolved keyword>]` and `top_n` set to `--top` (default 5). This writes `data/deals/<today>.json` itself — this command never writes that file by hand, and the CLI in the next step only reads it.

## 4. Generate (dry run, then real)

```bash
npm run generate:deal-post -- --category=<slug> --query="<keyword>" --top=<n> --dry-run
npm run generate:deal-post -- --category=<slug> --query="<keyword>" --top=<n>
```

Print both summaries and read them carefully — there are three distinct outcomes, not one:

- **Zero usable deals** ⇒ the CLI exits `0` having written nothing. **Stop here.** Report this plainly to the user and explain that the prior week's roundup deliberately stays framed as "tuần này" — this is a normal quiet week, not a failure. Do not widen `--query` or drop `--top` to manufacture a post, and do not commit anything.
- **Shortfall** (e.g. "requested 5, usable 3") ⇒ proceed with what came back. Never re-run with a padded `--top` to hit a round number, and never fabricate an entry to fill the gap.
- **Dropped deals** (bad host, null affiliate URL) ⇒ mention them in your report to the user; the roundup is still valid with the deals that passed.

The real (non-dry-run) run also supersedes the prior week's roundup post in this category (US00153), but only *after* writing the current post — so a run that fails before this point never leaves the prior post relabeled with no current post to back it up.

## 5. Write the prose

Edit the generated `.mdx` file directly (`Edit`/`Write`, never the CLI). Replace every `{/* TODO … */}` marker with real Vietnamese copy:

- An intro paragraph under the first `h2`, framing the week's picks.
- A short, honest paragraph per deal under its own `h3`, grounded in that deal's own sidecar numbers (`content/deals/<slug>.json` — price, discount, rating, sold count). Run one `WebSearch` per distinct brand+model where one is identifiable (e.g. `"<brand> <model> review specs"`), exactly as `/write-post` does, for supplementary verifiable detail. Never fabricate a spec, price, rating, or sold count that isn't grounded in the sidecar or a search result.
- A closing "Lưu ý khi săn deal" section covering stock/variant caveats, checking the seller before buying, and that the price shown was captured at publish time and may have changed.
- The final post must clear **800 words** (`MIN_POST_WORDS`) with no `TODO` left anywhere.

Four things must survive completely untouched:

1. Every `<DealCard id>` embed — do not add, remove, or reorder any.
2. The `{/* roundup-lead:… */}` markers — `supersedePriorRoundup()` depends on them and throws if they're gone.
3. `publishedAt`, `category`, and `coverImage` in the frontmatter.
4. The "tuần này" framing in `title` and the lead paragraph.

`summary` and `tags` may be refined — the generator writes real (non-placeholder) values, but a human sentence is usually clearer. Keep `summary` within 50–160 characters.

## 6. Verify

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

All four must exit `0`. `npm test` is where the 800-word floor, the embed-count check, the cover-image floor, and the duplicate-cover-image check actually bite.

Then verify in a real browser per the project's UI-verification rule: start `npm run dev` in the background, open `/bai-viet/<new-slug>/` (via `mcp__next-devtools__browser_eval`), screenshot it, and check the console (a `/favicon.ico` 404 is fine, anything else must be investigated and fixed). Confirm the deal cards render, both disclosures appear (affiliate disclosure + price-change disclaimer), and TOC/breadcrumbs are correct. Then also open the **superseded** post and confirm its H1 and first paragraph now name its own archived date. Stop the dev server afterward, and revert `next-env.d.ts` if `next dev`/`build` touched it (`git checkout -- next-env.d.ts`) — it's auto-generated noise, not a real change.

**If anything in this step fails, stop before committing.** Leave the working tree as-is — both the new post and the rewritten prior post will be sitting uncommitted, so the operator can fix and retry, or run `git checkout -- content/ public/` to discard both cleanly.

## 7. Commit

`git status --porcelain` should show exactly these paths — nothing else:

```
content/posts/deal-<category>-<date>.mdx        (new)
content/posts/deal-<category>-<prior-date>.mdx  (modified — the superseded post)
content/deals/deal-<category>-<date>.json       (new)
public/static/images/deals/deal-<category>-<date>-*.{jpg,png,webp}  (new)
data/deals/<today>.json                          (new — the scrape audit trail)
```

If a prior roundup didn't exist in this category, the second path is simply absent — that's fine. Stage exactly the paths above (nothing else) and commit:

```
content: weekly <category> deal roundup (<date>)

<n> deals · superseded <prior-slug-or-"none">

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

## 8. Push

```bash
git push origin main
```

Report the pushed commit hash, the new post's path, and remind the user this triggers a Vercel auto-deploy.

## Rules

- Never fabricate a deal, a price, a rating, or a sold count — the sidecar and web-search results are the only sources.
- Never hand-edit `content/deals/*.json` — it is CLI output. A wrong deal means re-running the CLI, not patching the sidecar.
- Never remove, reorder, or invent `<DealCard>` embeds beyond what `generate:deal-post` wrote.
- Never delete the `{/* roundup-lead:… */}` markers — the supersede step depends on them.
- Never commit anything outside the paths listed in step 7.
- Never push to any branch other than `main` — this command has no feature-branch/PR step by design.
- Never skip `npm run build` or the browser check before committing.
- If the category is ambiguous or unregistered, ask the user or stop — never guess.
- Zero qualifying deals is a valid, normal outcome. Report it and stop — do not widen `--query` or drop `--top` to manufacture a post.
