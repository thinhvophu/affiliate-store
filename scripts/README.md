# Content pipeline (F0012)

Dev tooling for growing the catalog and closing blog-content gaps without
hand-authoring every fixture. Runs via `tsx`, never imported by `app/`,
`components/`, or `lib/`. This file is the end-to-end overview; see
[`scripts/ingest/README.md`](ingest/README.md) for full flag reference on
every step below.

## The full flow

```
1. Scrape / curate  →  2. Ingest  →  3. Rename (editorial)  →  4. Scaffold a post  →  5. Write prose  →  6. Publish
```

Steps 4–6 together are also automated end-to-end by the `/write-post` slash
command (`.claude/commands/write-post.md`) — see "4–6 combined" below.

### 1. Get candidate products

Two sources, per category:

- **Commodity categories** (chuột, bàn phím, tai nghe — high volume, low
  per-item consideration): scrape Shopee. The `/scrape-ingest` slash command
  runs this + step 2 + step 5 together for the recurring content-refresh
  flow (keywords → resolved categories → scrape → ingest → build → commit →
  push straight to `main`; see `.claude/commands/scrape-ingest.md`). It
  writes `data/deals/<date>.json` via the `shopee-affiliate` scrape tool.
- **Higher-consideration categories** (màn hình, ghế — an operator
  hand-picks specific products): write a curated JSON file (see "Curated
  file source" in `scripts/ingest/README.md`) instead of scraping.

### 2. Ingest

```bash
npm run ingest:products -- --category=<slug> --source=scrape --query="<keyword>" --count=<n> [--dry-run]
# or
npm run ingest:products -- --category=<slug> --source=file --path=<curated-file.json> [--dry-run]
```

Validates each candidate (affiliate host allow-list, registered category,
required `Product` fields), stages images locally to
`public/static/images/products/`, dedupes against the existing catalog, and
writes `content/products/<slug>.json`. Always dry-run first to preview.
Full flag/behavior reference: `scripts/ingest/README.md`.

### 3. Rename (editorial pass)

Raw ingested slugs (auto-slugified from the scraped/curated product name) run
long and carry marketing boilerplate. Before scaffolding a post against a
newly-ingested product, clean up its slug — and everything that references
it — in one shot:

```bash
npm run rename:product -- --from=<old-slug> --to=<new-slug>
```

Format: `<brand>-<model>-<qualifier>`, lowercase kebab-case ASCII, ≤60 chars
(e.g. `logitech-g305-lightspeed-wireless`) — no category prefix, since the
category already lives in the URL path. The CLI moves all five touch-points
atomically: the fixture filename, its `slug` field, its `images[]` paths,
the staged image files on disk, and every `coverImage` /
`<ProductCard slug>` reference in `content/posts/*.mdx`. It validates
`--to` (free, ≤60 chars, kebab-case) and plans the full rename before
touching disk, so a bad rename fails with no partial write. Pair this step
with hand-editing `name`/`description`/`featured` in the fixture — `npm
test` (`lib/products.test.ts`) is the guard that catches boilerplate left
behind. Full details: `CLAUDE.md` → "Product slug format" convention.

### 3.5. Content queue (which products still need a post)

To work through "one post per product" one at a time, keep a tracked
checklist:

```bash
npm run sync:content-queue
```

Writes/merges `data/content-queue.md` — one row per product slug, with a
`status` column (`pending` -> `drafted` -> `reviewed` -> `published`). The
`slug`/`category` columns are always re-derived from `content/products/`
cross-referenced against every `<ProductCard slug="…">` embed in
`content/posts/*.mdx`, so they can never drift; only `status` persists by
hand across runs. Pick a `pending` row, run `/write-post <category> <slug>`
against it, review the result, then re-run the sync — a row auto-flips to
`published` once its `<ProductCard>` embed exists, so most of the time you
don't even need to edit the file yourself.

### 4. Scaffold a blog post

Once a category has products, close its post gap:

```bash
npm run scaffold:post -- --category=<slug> [--products=<slug-a[,slug-b]>] [--title=<title>] [--slug=<slug>]
```

Writes `content/posts/<slug>.mdx` with complete, build-passing frontmatter
(`title`/`summary` `"TODO: …"` placeholders, `category`, `publishedAt` =
today, `tags: []`, `coverImage` sourced from a named product's image) plus
one `<ProductCard slug="…" />` per product. Omit `--products` to auto-pick
1–2 products from the category (featured first); pass it explicitly when a
post needs a specific pairing. Full flag reference: `scripts/ingest/README.md`.

### 5. Write the article

Open the scaffolded `.mdx` file and fill in what the scaffold deliberately
leaves as a stub: the real `title`, `summary`, `tags`, and the article prose
around the `<ProductCard>` embeds (replace the
`{/* TODO: viết phần mở bài và nội dung đánh giá */}` marker). Article
generation itself is out of scope for the CLI — see "Out of scope" in
`docs/specs/F0012.md` — a human (or an agent, via `/write-post` below) has
to write it.

### 6. Publish

```bash
npm run build   # must exit 0 before committing anything
git add content/products/ public/static/images/products/ content/posts/ data/deals/ data/curated/
git commit -m "..."
git push origin main   # no feature branch/PR for routine content — see CLAUDE.md "Publishing flow"
```

Vercel auto-deploys on push to `main`.

### 4–6 combined: `/write-post`

For an already-ingested category, the `/write-post` slash command
(`.claude/commands/write-post.md`) runs steps 4–6 end-to-end in one go:

```
/write-post <category-slug> [product-slug-a,product-slug-b] [--slug=<output-slug>]
```

It runs `scaffold:post` (step 4), reads the picked products'
`content/products/*.json` plus a `WebSearch` per brand/model for
supplementary detail, replaces the `"TODO: …"` placeholders with real
Vietnamese title/summary/tags/prose around the scaffolded `<ProductCard>`
embeds (step 5), then runs `typecheck`/`lint`/`test`/`build`, a browser
check, and commits + pushes straight to `main` (step 6) — same direct-to-
`main` convention as `/scrape-ingest`, no feature branch/PR. It refuses to
proceed for a category with zero products (points back to step 1/2
instead) and never fabricates specs beyond the product JSON or search
results.

## Directory map

| Path                                         | Purpose                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/ingest-products.ts`                 | Ingestion CLI entry point (step 2).                                                                                                                                                                                                                        |
| `scripts/ingest/`                            | Candidate model, validation, slug generator, dedupe, image staging, arg parser, reporter, writer, scrape + curated-file source adapters. Detailed docs live in `scripts/ingest/README.md`.                                                                 |
| `scripts/rename-product.ts` + `.test.ts`     | Slug-rename CLI entry point (step 3) — see "Rename (editorial pass)" above.                                                                                                                                                                                |
| `scripts/sync-content-queue.ts` + `.test.ts` | Derives which products still lack a post and merges into `data/content-queue.md` — see "Content queue" below.                                                                                                                                              |
| `scripts/scaffold-post.ts`                   | Blog-post scaffold CLI entry point (step 4).                                                                                                                                                                                                               |
| `scripts/scaffold/`                          | `renderPostStub()` template builder + `selectProductsForCategory()` auto-pick helper, both pure and unit-tested.                                                                                                                                           |
| `scripts/verify-canonical.ts`                | Deployment canonical-URL verifier (`npm run verify:canonical -- --base=<url>`, F0013/US00135) — checks a **live** site, not the local build; run by hand after a domain/env-var change. See `docs/plans/US00135.md` § "Half B" for the swap-day checklist. |
| `.claude/commands/scrape-ingest.md`          | `/scrape-ingest` slash command — steps 1+2+6 (scrape → ingest → publish), no prose step.                                                                                                                                                                   |
| `.claude/commands/write-post.md`             | `/write-post` slash command — steps 4+5+6 (scaffold → research + write → publish) for an already-ingested category.                                                                                                                                        |

## Exit codes (both CLIs)

- `0` — the run completed. For `ingest:products`, individual rejected/duplicate
  candidates do **not** fail the run.
- non-zero — a fatal error (bad args, unregistered category, unknown product
  slug, refusing to overwrite an existing file, or a malformed input file).
