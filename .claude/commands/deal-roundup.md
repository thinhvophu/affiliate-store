<!-- Scrapes ranked Shopee deals for a category, generates the weekly deal-roundup post (overwriting the category's one evergreen post), writes real Vietnamese prose, verifies, then commits and pushes directly to main. -->

# Task: Generate, write, and publish the weekly deal-roundup post

You are running the F0015 weekly deal-roundup flow for this affiliate storefront: scrape ranked Shopee deals for one category, generate the roundup post + sidecar (`npm run generate:deal-post`, which overwrites the category's one evergreen `deal-<category>` post in place, keeping its original `publishedAt` and setting `updatedAt` to today), replace the generated `TODO` prose with real Vietnamese copy grounded in the deals' own numbers, verify, and publish. This is a repeatable **content** operation, not a code user story — it commits and pushes straight to `main` (see `## Working conventions` in `CLAUDE.md`: "Publishing flow: add file → push to main → Vercel rebuilds"). Do not create a feature branch or PR for this.

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

- **Zero usable deals** ⇒ the CLI exits `0` having written nothing. **Stop here.** Report this plainly to the user and explain that the existing roundup stays live with its older "Cập nhật ngày …" date — this is a normal quiet week, not a failure. Do not widen `--query` or drop `--top` to manufacture a post, and do not commit anything.
- **Shortfall** (e.g. "requested 5, usable 3") ⇒ proceed with what came back. Never re-run with a padded `--top` to hit a round number, and never fabricate an entry to fill the gap.
- **Dropped deals** (bad host, null affiliate URL) ⇒ mention them in your report to the user; the roundup is still valid with the deals that passed.

The real run overwrites `content/posts/deal-<category>.mdx` and its sidecar, stages images as `deal-<category>-<date>-<n>.<ext>`, and then prunes staged images nothing references any more (last week's).

## 5. Write the prose

Edit the generated `.mdx` file directly (`Edit`/`Write`, never the CLI). Replace every `{/* TODO … */}` marker with real Vietnamese copy:

- An intro paragraph under the first `h2`, framing the week's picks.
- A short, honest paragraph per deal under its own `h3`, grounded in that deal's own sidecar numbers (`content/deals/<slug>.json` — price, discount, rating, sold count). Run one `WebSearch` per distinct brand+model where one is identifiable (e.g. `"<brand> <model> review specs"`), exactly as `/write-post` does, for supplementary verifiable detail. Never fabricate a spec, price, rating, or sold count that isn't grounded in the sidecar or a search result.
- A closing "Lưu ý khi săn deal" section covering stock/variant caveats, checking the seller before buying, and that the price shown was captured at publish time and may have changed.
- You may shorten or refine a deal name (for example drop the category prefix). If you do, edit the sidecar `name` **and** the matching `### n.` heading together. `npm test` checks both the seller-boilerplate rules and that the two match.
- The final post must clear **800 words** (`MIN_POST_WORDS`) with no `TODO` left anywhere.

Three things must survive completely untouched:

1. Every `<DealCard id>` embed — do not add, remove, or reorder any.
2. `publishedAt`, `updatedAt`, `category`, and `coverImage` in the frontmatter.
3. The "tuần này" framing in `title` and the lead paragraph.

`summary` and `tags` may be refined — the generator writes real (non-placeholder) values, but a human sentence is usually clearer. Keep `summary` within 50–160 characters.

## 6. Verify

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

All four must exit `0`. `npm test` is where the 800-word floor, the embed-count check, the cover-image floor, and the duplicate-cover-image check actually bite.

Then verify in a real browser per the project's UI-verification rule: start `npm run dev` in the background, open `/bai-viet/deal-<category>` (via `mcp__next-devtools__browser_eval`), screenshot it, and check the console (a `/favicon.ico` 404 is fine, anything else must be investigated and fixed). Confirm the deal cards render, both disclosures appear (affiliate disclosure + price-change disclaimer), the header shows both the publish date and "Cập nhật ngày …", and TOC/breadcrumbs are correct. Stop the dev server afterward, and revert `next-env.d.ts` if `next dev`/`build` touched it (`git checkout -- next-env.d.ts`) — it's auto-generated noise, not a real change.

**If anything in this step fails, stop before committing.** Leave the working tree as-is — the overwritten post, sidecar and pruned images will be sitting uncommitted, so the operator can fix and retry, or discard both cleanly with:

```bash
git checkout -- content/ public/   # restores the previous post, sidecar and any pruned images
git clean -fd content/ public/     # removes newly staged images — checkout alone leaves untracked files behind
```

Both commands are needed — `git checkout --` only restores already-tracked files (the previous post, sidecar and pruned images) to their last-committed state; it does nothing for the brand-new, still-untracked staged images, which `git clean -fd` removes. Running `checkout` alone leaves a false impression of a clean tree while stray files remain (confirmed during US00154's failure rehearsal).

## 7. Commit

`git status --porcelain` should show exactly these paths — nothing else:

```
content/posts/deal-<category>.mdx                (new or modified)
content/deals/deal-<category>.json               (new or modified)
public/static/images/deals/deal-<category>-<date>-*.{jpg,png,webp}  (new)
public/static/images/deals/<prior images>        (deleted)
data/deals/<today>.json                          (new — the scrape audit trail)
```

On a category's first run nothing is modified or deleted — that's fine. Stage exactly the paths above (nothing else) and commit:

```
content: weekly <category> deal roundup (<date>)

<n> deals · pruned <k> prior image(s)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

## 8. Push

```bash
git push origin main
```

Report the pushed commit hash, the new post's path, and remind the user this triggers a Vercel auto-deploy.

## Rules

- Never fabricate a deal, a price, a rating, or a sold count — the sidecar and web-search results are the only sources.
- Never hand-edit `content/deals/*.json` — it is CLI output — except the `name` field, per step 5. A wrong deal means re-running the CLI, not patching the sidecar.
- Never remove, reorder, or invent `<DealCard>` embeds beyond what `generate:deal-post` wrote.
- Never commit anything outside the paths listed in step 7.
- Never push to any branch other than `main` — this command has no feature-branch/PR step by design.
- Never skip `npm run build` or the browser check before committing.
- If the category is ambiguous or unregistered, ask the user or stop — never guess.
- Zero qualifying deals is a valid, normal outcome. Report it and stop — do not widen `--query` or drop `--top` to manufacture a post.
