<!-- Scrapes Shopee deals for given keywords, ingests the ones that validate, then commits and pushes directly to main. -->

# Task: Scrape Shopee deals, ingest, commit, and push

You are running the recurring content-refresh flow for this affiliate storefront: pull fresh Shopee deals, run them through the ingestion pipeline, and publish whatever passes validation. This is a repeatable **data** operation, not a code user story — it commits and pushes straight to `main` (see `## Working conventions` in `CLAUDE.md`: "Publishing flow: add file → push to main → Vercel rebuilds"). Do not create a feature branch or PR for this.

**The user's raw argument is appended below your instructions**, as `$ARGUMENTS` — an optional comma-separated list of Vietnamese search keywords.

## 1. Resolve keywords

Split `$ARGUMENTS` on `,`, trim whitespace from each entry, drop empty entries.

If the result is empty (no argument given), default to:

```
chuột gaming,bàn phím gaming,tai nghe gaming
```

## 2. Resolve each keyword to a registered category

Read `lib/categories.ts`. For each keyword, find the category whose `name` field matches the keyword case-insensitively (trimmed comparison — do not fuzzy-match or guess). Build a `keyword → category slug` map this way; never hardcode the three example slugs — new categories registered later must resolve automatically the same way.

- Any keyword with **no** matching category name is **not** scraped or ingested. Collect it under a "Skipped (no registered category)" note for the final report — this mirrors the project rule that every `product.category` must be pre-registered in `lib/categories.ts` before ingestion.
- If **zero** keywords resolve to a category, stop here and tell the user which keywords they gave and that none match a registered category (list the registered category names so they can adjust).

## 3. Scrape

Call `mcp__shopee-affiliate__scrape_products` **once** with `keywords` set to the full list of resolved keywords (default `top_n`, i.e. 10 per keyword). This writes `data/deals/<today>.json` itself.

## 4. Ingest, per resolved keyword

For each `(keyword, category slug)` pair, run a dry-run first to preview, then the real run:

```bash
npm run ingest:products -- --category=<slug> --source=scrape --query="<keyword>" --count=10 --dry-run
npm run ingest:products -- --category=<slug> --source=scrape --query="<keyword>" --count=10
```

Print both summaries. A candidate rejected for a missing field (commonly `brand`/`specs` — a known gap in the scrape source, see `scripts/ingest/README.md`) is expected and not an error; a category with 0 accepted candidates is fine, the real run simply writes nothing for it. Never hand-edit a rejected candidate or a written fixture to force it through — the pipeline's validation is the source of truth.

**Before running the real (non-dry-run) command for a keyword**, check the dry-run's "Disambiguated - needs review" group. A slug collision there commonly means the same product was re-scraped under a new affiliate URL (Shopee affiliate links aren't stable across scrapes, so URL-based dedupe misses this — only the slug collision catches it). Compare the flagged candidate's name against existing `content/products/*.json` fixtures:

- If it's genuinely the same product re-surfaced, exclude it from the real run rather than publishing a near-duplicate listing. There's no CLI flag to exclude a single item from a batch — run the real ingest for the full `--count`, then delete the unwanted disambiguated fixture (`content/products/<slug>-N.json`) and its staged image (`public/static/images/products/<slug>-N-*.<ext>`) before the build/commit steps. This is a deletion of an unwanted pipeline *output*, not a hand-edit of one that stays published — it doesn't conflict with the no-hand-edit rule above.
- If it's a genuinely distinct product that happens to share a slug base, leave it — that's what disambiguation is for.
- If unsure, ask the user before deciding.

## 5. Verify

Run `npm run build`. It must exit 0. If it fails, stop, report the failure, and do **not** commit or push — leave the working tree as-is for the user to inspect.

## 6. Commit

Check `git status --porcelain` scoped to `content/products/`, `public/static/images/products/`, and `data/deals/`. If nothing changed (every candidate was rejected across all keywords), tell the user and stop — do not create an empty commit.

Otherwise stage exactly the new/changed files under those three paths (nothing else) and commit:

```
content: add <N> scraped products via ingest --source=scrape

<one line per category: "<slug>: <n> added">

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

## 7. Push

```bash
git push origin main
```

Report the pushed commit hash and remind the user this triggers a Vercel auto-deploy.

## Rules

- Never fabricate `brand`, `specs`, or any other field to get a rejected candidate to pass — rejections are expected pipeline output, not a bug to route around.
- Never hand-edit a `content/products/*.json` fixture written by the ingest CLI.
- Never commit files outside the `content/products/`, `public/static/images/products/`, `data/deals/` scope from this run.
- Never push to any branch other than `main` — this command has no feature-branch/PR step by design.
- If `npm run build` fails, stop before commit/push.
